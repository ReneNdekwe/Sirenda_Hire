import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Booking status enum
export const BookingStatus = {
  REQUESTED: 'requested',
  PENDING_APPROVAL: 'pending_approval',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

// Payment status enum
export const PaymentStatus = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// User schema (for both clients and rental companies)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  userType: text("user_type").notNull().default("client"), // 'client', 'company', or 'admin'
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  companyLogo: text("company_logo"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  // Subscription related fields
  createdAt: timestamp("created_at").defaultNow(),
  subscriptionStatus: text("subscription_status").default("trial"), // 'trial', 'active', 'expired'
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
  userType: true,
  companyName: true,
  companyDescription: true,
  companyLogo: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
});

// Vehicle categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  priceFrom: integer("price_from"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  imageUrl: true,
  priceFrom: true,
});

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // Reference to user (company) id
  categoryId: integer("category_id").notNull(), // Reference to category id
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  licensePlate: text("license_plate").notNull(),
  description: text("description"),
  seats: integer("seats").notNull(),
  bags: integer("bags"),
  transmission: text("transmission").notNull(), // 'automatic' or 'manual'
  fuel: text("fuel").notNull(), // 'petrol', 'diesel', 'electric'
  features: jsonb("features"), // Array of features
  imageUrls: jsonb("image_urls"), // Array of image URLs
  pricePerDay: integer("price_per_day").notNull(),
  location: text("location").notNull(),
  availability: boolean("availability").notNull().default(true),
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  isFeatured: boolean("is_featured").default(false),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  ownerId: true,
  categoryId: true,
  brand: true,
  model: true,
  year: true,
  licensePlate: true,
  description: true,
  seats: true,
  bags: true,
  transmission: true,
  fuel: true,
  features: true,
  imageUrls: true,
  pricePerDay: true,
  location: true,
  availability: true,
  isFeatured: true,
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  userId: integer("user_id").notNull(),
  pickupDate: date("pickup_date").notNull(),
  returnDate: date("return_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings);

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  bookingId: true,
  userId: true,
  vehicleId: true,
  rating: true,
  comment: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;


