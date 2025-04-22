import { pgTable, text, serial, integer, date, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  country: text("country"),
  role: text("role").notNull().default("guest"), // admin, staff, volunteer, donor, beneficiary, guest
  bio: text("bio"),
  uniqueId: text("unique_id"),
  organization: text("organization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const aidRequests = pgTable("aid_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  aidType: text("aid_type").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("pending"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const inventory = pgTable("inventory", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  category: text("category").notNull(),
  locationId: text("location_id"),
  expiryDate: timestamp("expiry_date"),
  unit: text("unit").notNull(),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

export const distributions = pgTable("distributions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  quantity: integer("quantity").notNull(),
  location: text("location").notNull(),
  aidType: text("aid_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
// Beneficiaries
export const beneficiaries = pgTable("beneficiaries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  aidHistory: text("aid_history"),
  futureNeeds: text("future_needs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const volunteerApplications = pgTable("volunteer_applications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  role: text("role"),
  country: text("country"),
  bio: text("bio"),
  applicationDate: timestamp("application_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  country: z.string().optional(),
  role: z.string().default("guest"),
  bio: z.string().optional(),
  uniqueId: z.string().optional(),
  organization: z.string().optional(),
});

export const insertAidRequestSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  aidType: z.string().min(1, "Aid type is required"),
  urgency: z.string().min(1, "Urgency is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    unit: z.string()
  })).optional()
});

export const insertInventorySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  quantity: z.number(),
  category: z.string(),
  locationId: z.string().optional(),
  expiryDate: z.date().optional(),
  unit: z.string(),
});

export const insertDistributionSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  quantity: z.number(),
  location: z.string(),
  aidType: z.string(),
});

export const insertBeneficiarySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  aidHistory: z.string().optional(),
  futureNeeds: z.string().optional(),
});

export const insertVolunteerApplicationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  organization: z.string().optional(),
  role: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AidRequest = typeof aidRequests.$inferSelect;
export type InsertAidRequest = typeof aidRequests.$inferInsert;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Distribution = typeof distributions.$inferSelect;
export type InsertDistribution = typeof distributions.$inferInsert;

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = typeof beneficiaries.$inferInsert;

export type VolunteerApplication = typeof volunteerApplications.$inferSelect;
export type InsertVolunteerApplication = typeof volunteerApplications.$inferInsert;
