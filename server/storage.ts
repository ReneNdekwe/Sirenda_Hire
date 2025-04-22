import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Vehicle, InsertVehicle, 
  Booking, InsertBooking, 
  Review, InsertReview,
  users, categories, vehicles, bookings, reviews,
  notifications,
  Notification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, or, sql, isNull, not } from "drizzle-orm";
import pkg from 'pg';
const { Pool } = pkg;

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(filters?: Partial<User>): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Vehicle methods
  getVehicles(filters?: Partial<Vehicle>): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByOwner(ownerId: number): Promise<Vehicle[]>;
  getFeaturedVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;

  // Booking methods
  getBookings(userId?: number): Promise<Booking[]>;
  getBookingsByVehicle(vehicleId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Review methods
  getReviews(vehicleId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  sessionStore: session.Store;

  updateVehicleAvailability(ownerId: number, availability: boolean): Promise<void>;

  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(data: {
    userId: number;
    message: string;
    type: 'booking_approved' | 'booking_rejected' | 'booking_cancelled';
  }): Promise<Notification>;
  markNotificationsAsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private vehicles: Map<number, Vehicle>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;

  sessionStore: session.Store;
  private currentId: {
    user: number;
    category: number;
    vehicle: number;
    booking: number;
    review: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.vehicles = new Map();
    this.bookings = new Map();
    this.reviews = new Map();

    this.currentId = {
      user: 1,
      category: 1,
      vehicle: 1,
      booking: 1,
      review: 1
    };

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      subscriptionStatus: 'trial',
      trialEndsAt: null,
      subscriptionEndsAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      phone: insertUser.phone ?? null,
      userType: insertUser.userType ?? 'client',
      companyName: insertUser.companyName ?? null,
      companyDescription: insertUser.companyDescription ?? null,
      companyLogo: insertUser.companyLogo ?? null,
      address: insertUser.address ?? null,
      city: insertUser.city ?? null,
      state: insertUser.state ?? null,
      zipCode: insertUser.zipCode ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(filters?: Partial<User>): Promise<User[]> {
    let userList = Array.from(this.users.values());

    if (filters) {
      userList = userList.filter(user => {
        for (const [key, value] of Object.entries(filters)) {
          if (user[key as keyof User] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return userList;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId.category++;
    const newCategory: Category = { 
      ...category, 
      id,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      priceFrom: category.priceFrom || null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Vehicle methods
  async getVehicles(filters?: Partial<Vehicle>): Promise<Vehicle[]> {
    let vehicles = Array.from(this.vehicles.values());

    if (filters) {
      vehicles = vehicles.filter(vehicle => {
        for (const [key, value] of Object.entries(filters)) {
          if (vehicle[key as keyof Vehicle] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return vehicles;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByOwner(ownerId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      vehicle => vehicle.ownerId === ownerId
    );
  }

  async getFeaturedVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      vehicle => vehicle.isFeatured
    );
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentId.vehicle++;
    const newVehicle: Vehicle = { 
      ...vehicle, 
      id, 
      rating: 0, 
      reviewCount: 0,
      description: vehicle.description ?? null,
      bags: vehicle.bags ?? null,
      features: vehicle.features ?? [],
      imageUrls: vehicle.imageUrls ?? [],
      isFeatured: vehicle.isFeatured ?? false,
      availability: true
    };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updatedVehicle = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning({ id: vehicles.id });
    return result.length > 0;
  }

  // Booking methods
  async getBookings(userId?: number): Promise<Booking[]> {
    const bookings = Array.from(this.bookings.values());

    if (userId) {
      return bookings.filter(booking => booking.userId === userId);
    }

    return bookings;
  }

  async getBookingsByVehicle(vehicleId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.vehicleId === vehicleId
    );
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentId.booking++;
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date(),
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      paymentIntentId: null,
      updatedAt: new Date()
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  // Review methods
  async getReviews(vehicleId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.vehicleId === vehicleId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentId.review++;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date(),
      comment: review.comment || null
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Initialize with sample data
  private async initSampleData() {
    // Create sample categories
    const luxurySedan: Category = await this.createCategory({
      name: "Luxury Sedans",
      description: "Comfort and elegance for any journey",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      priceFrom: 89
    });

    const sportCars: Category = await this.createCategory({
      name: "Sport Cars",
      description: "Performance and thrill for enthusiasts",
      imageUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      priceFrom: 129
    });

    const premiumSUVs: Category = await this.createCategory({
      name: "Premium SUVs",
      description: "Spacious and versatile for any terrain",
      imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      priceFrom: 99
    });

    const convertibles: Category = await this.createCategory({
      name: "Convertibles",
      description: "Open-air driving experience",
      imageUrl: "https://images.unsplash.com/photo-1554223241-226b0b6a9d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      priceFrom: 119
    });
  }

  async updateVehicleAvailability(ownerId: number, availability: boolean): Promise<void> {
    await db.update(vehicles)
      .set({ availability })
      .where(eq(vehicles.ownerId, ownerId));
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: {
    userId: number;
    message: string;
    type: 'booking_approved' | 'booking_rejected' | 'booking_cancelled';
  }): Promise<Notification> {
    const [notification] = await db.insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const defaultValues = {
      phone: null,
      userType: 'client',
      companyName: null,
      companyDescription: null,
      companyLogo: null,
      address: null,
      city: null,
      state: null,
      zipCode: null
    };

    // Ensure all required fields have values
    const userToInsert = { ...defaultValues, ...insertUser };

    const [user] = await db.insert(users)
      .values(userToInsert)
      .returning();

    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async getAllUsers(filters?: Partial<User>): Promise<User[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return db.select().from(users);
    }

    // Build dynamic query conditions
    const conditions: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      // Skip undefined values and ensure key is valid
      if (value !== undefined && key in users) {
        conditions.push(eq(users[key as keyof typeof users] as any, value));
      }
    }

    if (conditions.length > 0) {
      return db.select().from(users).where(and(...conditions));
    }

    return db.select().from(users);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const defaultValues = {
      description: null,
      imageUrl: null,
      priceFrom: null
    };

    // Ensure all required fields have values
    const categoryToInsert = { ...defaultValues, ...category };

    const [newCategory] = await db.insert(categories)
      .values(categoryToInsert)
      .returning();

    return newCategory;
  }

  // Vehicle methods
  async getVehicles(filters?: Partial<Vehicle>): Promise<Vehicle[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return db.select().from(vehicles);
    }

    // Build dynamic query conditions
    const conditions: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      // Skip undefined values and ensure key is valid
      if (value !== undefined && key in vehicles) {
        conditions.push(eq(vehicles[key as keyof typeof vehicles] as any, value));
      }
    }

    if (conditions.length > 0) {
      return db.select().from(vehicles).where(and(...conditions));
    }

    return db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehiclesByOwner(ownerId: number): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.ownerId, ownerId));
  }

  async getFeaturedVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.isFeatured, true));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const defaultValues = {
      description: null,
      bags: null,
      features: [],
      imageUrls: [],
      availability: true,
      rating: 0,
      reviewCount: 0,
      isFeatured: false
    };

    // Ensure all required fields have values
    const vehicleToInsert = { ...defaultValues, ...vehicle };

    const [newVehicle] = await db.insert(vehicles)
      .values(vehicleToInsert)
      .returning();

    return newVehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db.update(vehicles)
      .set(vehicleData)
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning({ id: vehicles.id });
    return result.length > 0;
  }

  // Booking methods
  async getBookings(userId?: number): Promise<Booking[]> {
    if (userId) {
      return db.select().from(bookings).where(eq(bookings.userId, userId));
    }

    return db.select().from(bookings);
  }

  async getBookingsByVehicle(vehicleId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.vehicleId, vehicleId));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Set default values with all required properties
    const bookingWithDefaults = {
      ...booking,
      status: "pending" as const,
      paymentStatus: "pending" as const,
      paymentIntentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the booking
    const [newBooking] = await db.insert(bookings)
      .values(bookingWithDefaults)
      .returning();

    return newBooking;
  }

  async updateBookingStatus(id: number, status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  // Review methods
  async getReviews(vehicleId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.vehicleId, vehicleId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    // Set default values for the review
    const reviewWithDefaults = {
      ...review,
      createdAt: new Date(),
      comment: review.comment || null
    };

    // Insert the review
    const [newReview] = await db.insert(reviews)
      .values(reviewWithDefaults)
      .returning();

    // Update the vehicle's rating and review count
    const vehicleReviews = await this.getReviews(review.vehicleId);
    const totalRating = vehicleReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round(totalRating / vehicleReviews.length);

    await db.update(vehicles)
      .set({ 
        rating: avgRating, 
        reviewCount: vehicleReviews.length 
      })
      .where(eq(vehicles.id, review.vehicleId));

    return newReview;
  }

  // Helper method to seed initial data if needed
  async seedInitialData() {
    // Check if we have categories
    const existingCategories = await this.getCategories();

    if (existingCategories.length === 0) {
      // Create sample categories
      await this.createCategory({
        name: "Luxury Sedans",
        description: "Comfort and elegance for any journey",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        priceFrom: 89
      });

      await this.createCategory({
        name: "Sport Cars",
        description: "Performance and thrill for enthusiasts",
        imageUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        priceFrom: 129
      });

      await this.createCategory({
        name: "Premium SUVs",
        description: "Spacious and versatile for any terrain",
        imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        priceFrom: 99
      });

      await this.createCategory({
        name: "Convertibles",
        description: "Open-air driving experience",
        imageUrl: "https://images.unsplash.com/photo-1554223241-226b0b6a9d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        priceFrom: 119
      });
    }
  }

  async updateVehicleAvailability(ownerId: number, availability: boolean): Promise<void> {
    await db.update(vehicles)
      .set({ availability })
      .where(eq(vehicles.ownerId, ownerId));
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    const result = await db.select()
      .from(bookings)
      .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .where(eq(vehicles.ownerId, ownerId))
      .orderBy(desc(bookings.createdAt));
    
    // Map the joined results to just the booking objects
    return result.map(item => item.bookings);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: {
    userId: number;
    message: string;
    type: 'booking_approved' | 'booking_rejected' | 'booking_cancelled';
  }): Promise<Notification> {
    const [notification] = await db.insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();