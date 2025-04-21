import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'staff', 'volunteer', 'donor', 'beneficiary', 'guest']),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Aid Request validation schemas
export const aidRequestSchema = z.object({
  id: z.string().optional(),
  beneficiaryId: z.string(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1')
  })),
  status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']).default('pending'),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Inventory validation schemas
export const inventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Distribution validation schemas
export const distributionSchema = z.object({
  id: z.string().optional(),
  requestId: z.string(),
  volunteerId: z.string(),
  distributionDate: z.date(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Feedback validation schemas
export const feedbackSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date().optional()
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AidRequest = z.infer<typeof aidRequestSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type Distribution = z.infer<typeof distributionSchema>;
export type Feedback = z.infer<typeof feedbackSchema>; 