import { pgTable, text, serial, integer, date, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  country: text("country"),
  role: text("role").notNull().default("user"), // user, admin, volunteer, ngo
  bio: text("bio"),
  uniqueId: text("unique_id"),
  organization: text("organization"),
});

// Aid Requests
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

// Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

// Distributions
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

// Volunteer Applications
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  phone: true,
  country: true,
  role: true,
  bio: true,
  organization: true,
});

export const insertAidRequestSchema = createInsertSchema(aidRequests).pick({
  userId: true,
  name: true,
  location: true,
  aidType: true,
  urgency: true,
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  itemId: true,
  itemName: true,
  category: true,
  quantity: true,
});

export const insertDistributionSchema = createInsertSchema(distributions).pick({
  date: true,
  location: true,
  aidType: true,
  quantity: true,
});

export const insertBeneficiarySchema = createInsertSchema(beneficiaries).pick({
  name: true,
  aidHistory: true,
  futureNeeds: true,
});

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplications).pick({
  name: true,
  email: true,
  organization: true,
  role: true,
  country: true,
  bio: true,
});

// Type definitions
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
