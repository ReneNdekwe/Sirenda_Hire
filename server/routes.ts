import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertVehicleSchema, 
  insertBookingSchema, 
  insertReviewSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateVehicleRecommendations } from "./ai/recommendations";
import { subscriptionService } from "./subscription-service";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data if it's empty
  if (storage instanceof DatabaseStorage) {
    await storage.seedInitialData();
  }

  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure storage for uploaded files
  const storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
    }
  });

  // Configure multer with file size limits and file types
  const upload = multer({
    storage: storage_config,
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
    const vehicle = await storage.getVehicle(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    if (vehicle.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Not authorized to delete this vehicle" });
    }
    
    await storage.deleteVehicle(id);
    res.status(204).send();
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
    
    // Return the file path that can be used to access the image
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      message: "File uploaded successfully",
      filePath
    });
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
      
      // Check if vehicle exists and is available
      const vehicle = await storage.getVehicle(bookingData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      if (!vehicle.availability) {
        return res.status(400).json({ message: "Vehicle is not available" });
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

      // Simple date validation - just check if dates overlap
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

  // AI Recommendations route
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Limit to client users only for now
      if (req.user.userType !== 'client') {
        return res.status(403).json({ message: "Recommendations are only available for clients" });
      }

      // Get all necessary data for generating recommendations
      const [availableVehicles, userBookings, categories] = await Promise.all([
        storage.getVehicles({ availability: true }),
        storage.getBookings(req.user.id),
        storage.getCategories()
      ]);

      // Generate personalized recommendations
      const recommendations = await generateVehicleRecommendations(
        req.user,
        availableVehicles,
        userBookings,
        categories,
        3 // Limit to top 3 recommendations
      );

      // If we have recommendations, fetch the full vehicle details
      const recommendedVehicles = await Promise.all(
        recommendations.map(async (rec) => {
          const vehicle = await storage.getVehicle(rec.vehicleId);
          if (!vehicle) return null;
          
          return {
            ...vehicle,
            recommendationScore: rec.score,
            recommendationReason: rec.reason
          };
        })
      );

      // Filter out any null values (in case a vehicle was deleted)
      const validRecommendations = recommendedVehicles.filter(v => v !== null);

      res.json(validRecommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        message: "Error generating recommendations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
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

  const httpServer = createServer(app);

  return httpServer;
}
