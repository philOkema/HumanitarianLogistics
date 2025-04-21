import { pgTable, text, serial, integer, date, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  country: text("country"),
  role: text("role").notNull().default("guest"), // admin, staff, volunteer, donor, beneficiary, guest
  bio: text("bio"),
  uniqueId: text("unique_id"),
  organization: text("organization"),
});

export const aidRequests = pgTable("aid_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  aidType: text("aid_type").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("pending"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  category: text("category").notNull(),
  locationId: integer("location_id"),
  expiryDate: timestamp("expiry_date"),
  unit: text("unit").notNull(),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

export const distributions = pgTable("distributions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  location: text("location").notNull(),
  aidType: text("aid_type").notNull(),
  quantity: integer("quantity").notNull(),
});
// Beneficiaries
export const beneficiaries = pgTable("beneficiaries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  aidHistory: text("aid_history"),
  futureNeeds: text("future_needs"),
});

export const volunteerApplications = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  role: text("role"),
  country: text("country"),
  bio: text("bio"),
  applicationDate: timestamp("application_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = z.object({
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
  userId: z.number().optional(),
  name: z.string(),
  location: z.string(),
  aidType: z.string(),
  urgency: z.string(),
});

export const insertInventorySchema = z.object({
  name: z.string(),
  quantity: z.number(),
  category: z.string(),
  locationId: z.number().optional(),
  expiryDate: z.date().optional(),
  unit: z.string(),
});

export const insertDistributionSchema = z.object({
  date: z.date(),
  location: z.string(),
  aidType: z.string(),
  quantity: z.number(),
});

export const insertBeneficiarySchema = z.object({
  name: z.string(),
  aidHistory: z.string().optional(),
  futureNeeds: z.string().optional(),
});

export const insertVolunteerApplicationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  organization: z.string().optional(),
  role: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AidRequest = typeof aidRequests.$inferSelect;
export type InsertAidRequest = z.infer<typeof insertAidRequestSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Distribution = typeof distributions.$inferSelect;
export type InsertDistribution = z.infer<typeof insertDistributionSchema>;

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;

export type VolunteerApplication = typeof volunteerApplications.$inferSelect;
export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
