import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertVehicleSchema, 
  insertBookingSchema, 
  insertReviewSchema,
  insertNotificationSchema,
  Booking
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { subscriptionService } from "./subscription-service";
import multer from "multer";
import path from "path";
import fs from "fs";
import { updateCompletedBookings } from "@shared/booking-utils";
import { MTNMoMoService } from "./mtn-momo-service";  
import { MTN_MOMO_CONFIG } from "./config/mtn-momo.config";
import { v4 as uuidv4 } from 'uuid';
import { azureStorageService } from './azure-storage-service';

// Helper function to generate UUID
const generateUUID = () => uuidv4();

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data if it's empty
  if (storage instanceof DatabaseStorage) {
    await storage.seedInitialData();
  }

  // Initialize Azure Storage
  await azureStorageService.initialize();

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage instead of disk storage
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: function (req, file, cb) {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(null, false);
      }
      cb(null, true);
    }
  });
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
  
  // Authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const category = await storage.getCategory(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });

  // Vehicles routes
  app.get("/api/vehicles", async (req, res) => {
    // Extract filter parameters
    const { categoryId, location, available } = req.query;
    
    const filters: any = {};
    
    if (categoryId) {
      filters.categoryId = parseInt(categoryId as string);
    }
    
    if (location) {
      filters.location = location;
    }
    
    if (available) {
      filters.availability = available === 'true';
    }
    
    const vehicles = await storage.getVehicles(filters);
    res.json(vehicles);
  });

  app.get("/api/vehicles/featured", async (req, res) => {
    const featuredVehicles = await storage.getFeaturedVehicles();
    res.json(featuredVehicles);
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const vehicle = await storage.getVehicle(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    res.json(vehicle);
  });

  app.post("/api/vehicles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can add vehicles" });
    }
    
    try {
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    const vehicle = await storage.getVehicle(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    if (vehicle.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized to update this vehicle" });
    }
    
    try {
      const updatedVehicle = await storage.updateVehicle(id, req.body);
      res.json(updatedVehicle);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    console.log('Attempting to delete vehicle:', id); // Debug log
    
    try {
    const vehicle = await storage.getVehicle(id);
      console.log('Found vehicle:', vehicle); // Debug log
    
    if (!vehicle) {
        console.log('Vehicle not found:', id); // Debug log
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    if (vehicle.ownerId !== req.user?.id) {
        console.log('Unauthorized deletion attempt:', { vehicleOwner: vehicle.ownerId, currentUser: req.user?.id }); // Debug log
      return res.status(403).json({ message: "Not authorized to delete this vehicle" });
    }
    
      // Delete associated images from Azure Storage
      if (vehicle.imageUrls && Array.isArray(vehicle.imageUrls)) {
        console.log('Deleting associated images:', vehicle.imageUrls); // Debug log
        await Promise.all(
          vehicle.imageUrls.map(async (imageUrl) => {
            try {
              await azureStorageService.deleteImage(imageUrl);
              console.log('Successfully deleted image:', imageUrl); // Debug log
            } catch (error) {
              console.error('Error deleting image:', error);
              // Continue with deletion even if image deletion fails
            }
          })
        );
      }
      
      // Delete the vehicle from the database
      console.log('Deleting vehicle from database:', id); // Debug log
      const deleted = await storage.deleteVehicle(id);
      console.log('Vehicle deletion result:', deleted); // Debug log
      
      if (!deleted) {
        throw new Error('Failed to delete vehicle from database');
      }
      
    res.status(204).send();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ 
        message: "Error deleting vehicle",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can upload images" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or invalid file type" });
    }
    
    try {
      // Upload to Azure Blob Storage
      const imageUrl = await azureStorageService.uploadImage(req.file);
      console.log('Uploaded image URL:', imageUrl); // Debug log
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from Azure Storage');
      }
      
    res.json({ 
      success: true, 
      message: "File uploaded successfully",
        url: imageUrl
      });
    } catch (error) {
      console.error('Error uploading to Azure:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload file to cloud storage"
      });
    }
  });

  // Static asset upload endpoint
  app.post("/api/upload/static", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.userType !== 'admin') {
      return res.status(403).json({ message: "Only admins can upload static assets" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or invalid file type" });
    }
    
    try {
      // Upload to Azure Blob Storage
      const assetUrl = await azureStorageService.uploadStaticAsset(req.file);
      console.log('Uploaded static asset URL:', assetUrl); // Debug log
      
      if (!assetUrl) {
        throw new Error('Failed to get asset URL from Azure Storage');
      }
      
      res.json({ 
        success: true, 
        message: "Static asset uploaded successfully",
        url: assetUrl
      });
    } catch (error) {
      console.error('Error uploading to Azure:', error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload static asset to cloud storage"
      });
    }
  });

  // Static assets endpoint
  app.get("/api/static-assets", async (req, res) => {
    try {
      // Get the static assets container
      const containerClient = azureStorageService.getStaticAssetsContainer();
      
      // List all blobs in the container
      const blobs = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        const sasToken = await azureStorageService.generateSasToken(blob.name, 'static-assets');
        const url = `${containerClient.url}/${blob.name}?${sasToken}`;
        
        // Map blob names to their URLs
        if (blob.name === 'favicon.png') {
          blobs.push({ favicon: url });
        } else if (blob.name === 'Logo.png') {
          blobs.push({ logo: url });
        }
      }
      
      // Combine all asset URLs
      const assets = blobs.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      res.json(assets);
    } catch (error) {
      console.error('Error getting static assets:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get static assets"
      });
    }
  });

  // Company vehicles
  app.get("/api/my-vehicles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can view their vehicles" });
    }
    
    const vehicles = await storage.getVehiclesByOwner(req.user.id);
    res.json(vehicles);
  });

  // Bookings routes
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if vehicle exists
      const vehicle = await storage.getVehicle(bookingData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Validate dates
      const newStart = new Date(bookingData.pickupDate);
      const newEnd = new Date(bookingData.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if dates are valid
      if (newStart < today) {
        return res.status(400).json({ message: "Pickup date cannot be in the past" });
      }

      if (newEnd <= newStart) {
        return res.status(400).json({ message: "Return date must be after pickup date" });
      }

      // Check for date conflicts
      const existingBookings = await storage.getBookingsByVehicle(bookingData.vehicleId);
      const activeBookings = existingBookings.filter(booking => 
        booking.status !== 'cancelled' && booking.status !== 'completed'
      );

      const isDateConflict = activeBookings.some(booking => {
        const bookingStart = new Date(booking.pickupDate);
        const bookingEnd = new Date(booking.returnDate);
        
        // Normalize all dates to start of day for comparison
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);
        newStart.setHours(0, 0, 0, 0);
        newEnd.setHours(0, 0, 0, 0);
        
        // Check if the new booking overlaps with existing booking
        return (
          bookingStart.getTime() <= newEnd.getTime() &&
          bookingEnd.getTime() > newStart.getTime()
        );
      });

      if (isDateConflict) {
        return res.status(400).json({ message: "Vehicle is not available for the selected dates" });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/my-bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const bookings = await storage.getBookings(req.user.id);
    res.json(bookings);
  });

  // Get vehicle availability
  app.get("/api/vehicles/:id/availability", async (req, res) => {
    const vehicleId = parseInt(req.params.id);
    
    try {
      const bookings = await storage.getBookingsByVehicle(vehicleId);
      // Only return non-cancelled bookings
      const bookedDates = bookings
        .filter(booking => booking.status !== 'cancelled')
        .map(booking => ({
          start: booking.pickupDate,
          end: booking.returnDate
        }));
      
      res.json(bookedDates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  app.get("/api/vehicle-bookings/:vehicleId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const vehicleId = parseInt(req.params.vehicleId);
    const vehicle = await storage.getVehicle(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    if (vehicle.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized to view bookings for this vehicle" });
    }
    
    const bookings = await storage.getBookingsByVehicle(vehicleId);
    res.json(bookings);
  });

  app.put("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const vehicle = await storage.getVehicle(booking.vehicleId);
    
    // Check if user is the owner of the vehicle or the booker
    if (req.user?.id !== booking.userId && req.user?.id !== vehicle?.ownerId) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }
    
    const updatedBooking = await storage.updateBookingStatus(id, status);
    res.json(updatedBooking);
  });

  // Reviews routes
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if booking exists and belongs to the user
      const booking = await storage.getBooking(reviewData.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to review this booking" });
      }
      
      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: "Can only review completed bookings" });
      }
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/:vehicleId", async (req, res) => {
    const vehicleId = parseInt(req.params.vehicleId);
    const reviews = await storage.getReviews(vehicleId);
    res.json(reviews);
  });

  // Subscription management routes
  // Setup subscription for new company
  app.post("/api/subscription/setup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can set up subscriptions" });
    }
    
    try {
      const user = await subscriptionService.setupNewCompanyTrial(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        message: "Free trial started successfully",
        user
      });
    } catch (error) {
      console.error("Error setting up subscription:", error);
      res.status(500).json({ 
        message: "Error setting up subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Process a subscription payment
  app.post("/api/subscription/payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can process subscription payments" });
    }
    
    try {
      // TODO: In a real app, we would process a payment with Stripe or another payment provider here
      // For now, we'll just update the subscription status directly
      
      const user = await subscriptionService.processSubscriptionPayment(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        message: "Payment processed successfully",
        user
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ 
        message: "Error processing payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Reset all vehicles availability
  app.post("/api/vehicles/reset-availability", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can reset availability" });
    }

    try {
      await storage.updateVehicleAvailability(req.user.id, true);
      res.json({ message: "Vehicle availability reset successfully" });
    } catch (error) {
      console.error("Error resetting availability:", error);
      res.status(500).json({ message: "Error resetting availability" });
    }
  });

  // Get subscription details
  app.get("/api/subscription/details", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: "Only rental companies can view subscription details" });
    }
    
    try {
      const subscriptionDetails = await subscriptionService.getSubscriptionDetails(req.user.id);
      res.json(subscriptionDetails);
    } catch (error) {
      console.error("Error getting subscription details:", error);
      res.status(500).json({ 
        message: "Error getting subscription details",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Admin routes to manage subscriptions
  app.get("/api/admin/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      // Get all companies
      const companies = await storage.getAllUsers({ userType: 'company' });
      
      // Get subscription details for each company
      const subscriptionDetails = await Promise.all(
        companies.map(async (company) => {
          const details = await subscriptionService.getSubscriptionDetails(company.id);
          return {
            ...company,
            subscription: details
          };
        })
      );
      
      res.json(subscriptionDetails);
    } catch (error) {
      console.error("Error getting all subscriptions:", error);
      res.status(500).json({ 
        message: "Error getting all subscriptions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Admin route to check all subscriptions and update expired ones
  app.post("/api/admin/subscriptions/check", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      const result = await subscriptionService.checkAllSubscriptions();
      res.json(result);
    } catch (error) {
      console.error("Error checking subscriptions:", error);
      res.status(500).json({ 
        message: "Error checking subscriptions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin route to get all companies
  app.get("/api/admin/companies", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      const companies = await storage.getAllUsers({ userType: 'company' });
      res.json(companies);
    } catch (error) {
      console.error("Error getting companies:", error);
      res.status(500).json({ 
        message: "Error getting companies",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin route to get all users
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ 
        message: "Error getting users",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin route to get all vehicles
  app.get("/api/admin/vehicles", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error getting vehicles:", error);
      res.status(500).json({ 
        message: "Error getting vehicles",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin route to get all bookings
  app.get("/api/admin/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only administrators can access this endpoint" });
    }
    
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error getting bookings:", error);
      res.status(500).json({ 
        message: "Error getting bookings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin analytics endpoint
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated() || req.user?.userType !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get current date and date 6 months ago
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      // Get total counts
      const totalUsers = await storage.getAllUsers({ userType: 'client' });
      const totalCompanies = await storage.getAllUsers({ userType: 'company' });
      const totalVehicles = await storage.getVehicles();
      const totalBookings = await storage.getBookings();
      const totalRevenue = await storage.getTotalRevenue();

      // Get monthly bookings and revenue for the last 6 months
      const monthlyStats = await storage.getMonthlyStats(sixMonthsAgo);

      // Get booking distribution by vehicle type
      const bookingDistribution = await storage.getBookingDistribution();

      // Get active listings (vehicles with bookings in the last 30 days)
      const activeListings = await storage.getActiveListings();

      // Calculate conversion rate (completed bookings / total bookings)
      const conversionStats = await storage.getConversionStats();

      const conversionRate = conversionStats.rows[0].total > 0 
        ? (conversionStats.rows[0].completed / conversionStats.rows[0].total * 100).toFixed(1)
        : 0;

      // Calculate average booking value
      const avgBookingValue = await storage.getAvgBookingValue();

      res.json({
        totalUsers: totalUsers.length,
        totalCompanies: totalCompanies.length,
        totalVehicles: totalVehicles.length,
        totalRevenue: totalRevenue.sum,
        monthlyBookings: monthlyStats.rows[0]?.bookings || 0,
        avgBookingValue: avgBookingValue.rows[0].avg,
        activeListings: activeListings.rows[0].count,
        conversionRate,
        monthlyStats: monthlyStats.rows,
        bookingDistribution: bookingDistribution.rows
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Rental company booking management routes
  app.get("/api/rental-company/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== 'company') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get all vehicles owned by the rental company
      const vehicles = await storage.getVehiclesByOwner(req.user.id);
      const vehicleIds = vehicles.map(v => v.id);

      // Get all bookings for these vehicles
      const bookings = await Promise.all(
        vehicleIds.map(vehicleId => storage.getBookingsByVehicle(vehicleId))
      );

      // Flatten and sort bookings
      const allBookings = bookings.flat().sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json(allBookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  app.put("/api/rental-company/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== 'company') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookingId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      // Get the booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify the rental company owns the vehicle
      const vehicle = await storage.getVehicle(booking.vehicleId);
      if (!vehicle || vehicle.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }

      // Update the booking status
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);

      // Create notification for the user
      const notificationType = status === 'confirmed' ? 'booking_approved' : 'booking_rejected';
      const message = status === 'confirmed' 
        ? `Your booking for ${vehicle.brand} ${vehicle.model} has been approved!` 
        : `Your booking for ${vehicle.brand} ${vehicle.model} has been rejected.`;

      // Create notification
      await storage.createNotification({
        userId: booking.userId,
        message,
        type: notificationType
      });

      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: "Error updating booking status" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      if (!req.user || req.user.userType !== "company") {
        return res.status(403).json({ error: "Only rental companies can access analytics" });
      }

      const bookings = await storage.getBookingsByOwner(req.user.id);
      const vehicles = await storage.getVehiclesByOwner(req.user.id);

      // Calculate analytics
      const totalRevenue = bookings.reduce((sum: number, booking: Booking) => {
        if (booking.status === "completed") {
          return sum + booking.totalPrice;
        }
        return sum;
      }, 0);

      // Calculate booking trend (percentage change from last month)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const previousMonth = new Date(lastMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const currentMonthBookings = bookings.filter((b: Booking) => {
        if (!b.createdAt) return false;
        const date = new Date(b.createdAt);
        return date >= lastMonth;
      }).length;

      const previousMonthBookings = bookings.filter((b: Booking) => {
        if (!b.createdAt) return false;
        const date = new Date(b.createdAt);
        return date < lastMonth && date >= previousMonth;
      }).length;

      const bookingTrend = previousMonthBookings > 0 
        ? Math.round(((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100)
        : 0;

      // Calculate revenue trend
      const currentMonthRevenue = bookings
        .filter((b: Booking) => {
          if (!b.createdAt) return false;
          const date = new Date(b.createdAt);
          return date >= lastMonth && b.status === "completed";
        })
        .reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0);

      const previousMonthRevenue = bookings
        .filter((b: Booking) => {
          if (!b.createdAt) return false;
          const date = new Date(b.createdAt);
          return date < lastMonth && date >= previousMonth && b.status === "completed";
        })
        .reduce((sum: number, booking: Booking) => sum + booking.totalPrice, 0);

      const revenueTrend = previousMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
        : 0;

      return res.json({
        totalRevenue,
        bookingTrend,
        revenueTrend,
        totalVehicles: vehicles.length,
        activeBookings: bookings.filter((b: Booking) => b.status === "confirmed").length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.post("/api/notifications/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.markNotificationsAsRead(req.user.id);
      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking notifications as read" });
    }
  });

  // Set up daily task to update completed bookings
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  async function runDailyUpdate() {
    try {
      const updatedCount = await updateCompletedBookings();
      console.log(`Updated ${updatedCount} bookings to completed status`);
    } catch (error) {
      console.error('Error updating completed bookings:', error);
    }
  }

  // Run immediately on startup
  await runDailyUpdate();
  
  // Then schedule to run daily
  setInterval(runDailyUpdate, ONE_DAY);

  // Initialize MTN MoMo service
  const mtnMoMoService = new MTNMoMoService();

  // MTN MoMo Payment Routes
  app.post('/api/payments/mtn-momo/initiate', async (req, res) => {
    try {
      const { bookingId, phoneNumber, amount } = req.body;

      // Get the booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Format phone number - ensure it's in the correct format
      let formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
      if (!formattedPhoneNumber.match(/^250[0-9]{9}$/)) {
        // Try to format the number if it's not in the correct format
        let formatted = formattedPhoneNumber;
        if (formatted.startsWith('0')) {
          formatted = '250' + formatted.slice(1);
        } else if (formatted.startsWith('7')) {
          formatted = '250' + formatted;
        } else if (!formatted.startsWith('250')) {
          formatted = '250' + formatted;
        }
        
        if (!formatted.match(/^250[0-9]{9}$/)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone number format. Must be a Rwanda number starting with 07 or 250.' 
          });
        }
        formattedPhoneNumber = formatted;
      }

      // Create payment request
      const paymentRequest = {
        amount: amount.toString(),
        currency: MTN_MOMO_CONFIG.currency,
        externalId: generateUUID(),
        payer: {
          partyIdType: "MSISDN",
          partyId: formattedPhoneNumber
        },
        payerMessage: "Test payment",
        payeeNote: "Test payment note"
      };

      console.log('Initiating MTN MoMo payment:', {
        amount,
        currency: MTN_MOMO_CONFIG.currency,
        phoneNumber: formattedPhoneNumber,
        paymentRequest
      });

      // Initiate payment
      const referenceId = await mtnMoMoService.initiatePayment(paymentRequest);

      // Update booking status
      await storage.updateBookingStatus(bookingId, 'pending');

      res.json({ success: true, referenceId });
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initiate payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/payments/mtn-momo/status/:referenceId', async (req, res) => {
    try {
      const { referenceId } = req.params;

      console.log('Checking MTN MoMo payment status:', { referenceId });

      // Check payment status
      const status = await mtnMoMoService.checkPaymentStatus(referenceId);

      // Map MTN MoMo status to our booking status
      let bookingStatus: 'pending' | 'confirmed' | 'rejected';
      switch (status) {
        case 'SUCCESSFUL':
          bookingStatus = 'confirmed';
          break;
        case 'FAILED':
          bookingStatus = 'rejected';
          break;
        default:
          bookingStatus = 'pending';
      }

      res.json({ success: true, status, bookingStatus });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to check payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user details by ID
  app.get("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Only return necessary user information
    const userDetails = {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email
    };
    
    res.json(userDetails);
  });

  const httpServer = createServer(app);

  return httpServer;
}
