import { 
  users, inventory, aidRequests, distributions, beneficiaries, volunteerApplications,
  type User, type InsertUser, 
  type Inventory, type InsertInventory,
  type AidRequest, type InsertAidRequest,
  type Distribution, type InsertDistribution,
  type Beneficiary, type InsertBeneficiary,
  type VolunteerApplication, type InsertVolunteerApplication
} from "@shared/schema";
import { eq, and } from 'drizzle-orm';
import { db } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import pkg from 'pg';
const { Pool } = pkg;

// Define the memory store
const MemoryStore = createMemoryStore(session);

// Define the connect-pg-simple session store
const PostgresStore = connectPgSimple(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
  // Inventory management
  getInventoryItems(): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  addInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  removeInventoryItem(id: number): Promise<boolean>;
  
  // Aid Requests
  getAidRequests(): Promise<AidRequest[]>;
  getAidRequestsByUser(userId: number): Promise<AidRequest[]>;
  getAidRequest(id: number): Promise<AidRequest | undefined>;
  createAidRequest(request: InsertAidRequest): Promise<AidRequest>;
  updateAidRequestStatus(id: number, status: string): Promise<AidRequest | undefined>;
  
  // Distributions
  getDistributions(): Promise<Distribution[]>;
  getDistribution(id: number): Promise<Distribution | undefined>;
  createDistribution(distribution: InsertDistribution): Promise<Distribution>;
  
  // Beneficiaries
  getBeneficiaries(): Promise<Beneficiary[]>;
  getBeneficiary(id: number): Promise<Beneficiary | undefined>;
  createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary>;
  
  // Volunteer Applications
  getVolunteerApplications(): Promise<VolunteerApplication[]>;
  getVolunteerApplication(id: number): Promise<VolunteerApplication | undefined>;
  createVolunteerApplication(application: InsertVolunteerApplication): Promise<VolunteerApplication>;
  updateVolunteerApplicationStatus(id: number, status: string): Promise<VolunteerApplication | undefined>;
  
  // Session store for authentication
  sessionStore: session.Store;
  
  // Database initialization
  initDb(): Promise<void>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, Inventory>;
  private aidRequestItems: Map<number, AidRequest>;
  private distributionItems: Map<number, Distribution>;
  private beneficiaryItems: Map<number, Beneficiary>;
  private volunteerApplicationItems: Map<number, VolunteerApplication>;
  
  private userCurrentId: number;
  private inventoryCurrentId: number;
  private aidRequestCurrentId: number;
  private distributionCurrentId: number;
  private beneficiaryCurrentId: number;
  private volunteerApplicationCurrentId: number;
  
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.aidRequestItems = new Map();
    this.distributionItems = new Map();
    this.beneficiaryItems = new Map();
    this.volunteerApplicationItems = new Map();
    
    this.userCurrentId = 1;
    this.inventoryCurrentId = 1;
    this.aidRequestCurrentId = 1;
    this.distributionCurrentId = 1;
    this.beneficiaryCurrentId = 1;
    this.volunteerApplicationCurrentId = 1;
    
    // Set up session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initDb();
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    // Use Array.from to convert Map values to an array to avoid TS errors
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.email === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    
    const user: User = { 
      id, 
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role || 'guest',
      phone: insertUser.phone || null,
      country: insertUser.country || null,
      bio: insertUser.bio || null,
      uniqueId: null,
      organization: insertUser.organization || null
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    // Use Array.from to convert Map values to an array to avoid TS errors
    const usersArray = Array.from(this.users.values());
    return usersArray.filter(user => user.role === role);
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, role };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getInventoryItems(): Promise<Inventory[]> {
    return Array.from(this.inventoryItems.values());
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async addInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = this.inventoryCurrentId++;
    
    const newItem: Inventory = { 
      id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      unit: item.unit,
      locationId: item.locationId || null,
      expiryDate: item.expiryDate || null,
      lastUpdate: new Date()
    };
    
    this.inventoryItems.set(id, newItem);
    return newItem;
  }
  
  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: Inventory = { 
      ...existingItem,
      ...item,
      lastUpdate: new Date()
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
  
  async getAidRequests(): Promise<AidRequest[]> {
    return Array.from(this.aidRequestItems.values());
  }
  
  async getAidRequestsByUser(userId: number): Promise<AidRequest[]> {
    // Use Array.from to convert Map values to an array to avoid TS errors
    const requestsArray = Array.from(this.aidRequestItems.values());
    return requestsArray.filter(request => request.userId === userId);
  }
  
  async getAidRequest(id: number): Promise<AidRequest | undefined> {
    return this.aidRequestItems.get(id);
  }
  
  async createAidRequest(request: InsertAidRequest): Promise<AidRequest> {
    const id = this.aidRequestCurrentId++;
    
    const newRequest: AidRequest = {
      id,
      userId: request.userId || null,
      name: request.name,
      location: request.location,
      aidType: request.aidType,
      urgency: request.urgency,
      status: "pending",
      requestDate: new Date()
    };
    
    this.aidRequestItems.set(id, newRequest);
    return newRequest;
  }
  
  async updateAidRequestStatus(id: number, status: string): Promise<AidRequest | undefined> {
    const request = this.aidRequestItems.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.aidRequestItems.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async getDistributions(): Promise<Distribution[]> {
    return Array.from(this.distributionItems.values());
  }
  
  async getDistribution(id: number): Promise<Distribution | undefined> {
    return this.distributionItems.get(id);
  }
  
  async createDistribution(distribution: InsertDistribution): Promise<Distribution> {
    const id = this.distributionCurrentId++;
    
    const newDistribution: Distribution = {
      id,
      date: typeof distribution.date === 'string' 
        ? distribution.date 
        : (distribution.date as Date).toISOString().split('T')[0],
      location: distribution.location,
      aidType: distribution.aidType,
      quantity: distribution.quantity
    };
    
    this.distributionItems.set(id, newDistribution);
    return newDistribution;
  }
  
  async getBeneficiaries(): Promise<Beneficiary[]> {
    return Array.from(this.beneficiaryItems.values());
  }
  
  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    return this.beneficiaryItems.get(id);
  }
  
  async createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const id = this.beneficiaryCurrentId++;
    
    const newBeneficiary: Beneficiary = {
      id,
      name: beneficiary.name,
      aidHistory: beneficiary.aidHistory || null,
      futureNeeds: beneficiary.futureNeeds || null
    };
    
    this.beneficiaryItems.set(id, newBeneficiary);
    return newBeneficiary;
  }
  
  async getVolunteerApplications(): Promise<VolunteerApplication[]> {
    return Array.from(this.volunteerApplicationItems.values());
  }
  
  async getVolunteerApplication(id: number): Promise<VolunteerApplication | undefined> {
    return this.volunteerApplicationItems.get(id);
  }
  
  async createVolunteerApplication(application: InsertVolunteerApplication): Promise<VolunteerApplication> {
    const id = this.volunteerApplicationCurrentId++;
    
    const newApplication: VolunteerApplication = {
      id,
      name: application.name,
      email: application.email,
      organization: application.organization || null,
      role: application.role || null,
      country: application.country || null,
      bio: application.bio || null,
      applicationDate: new Date(),
      status: "pending"
    };
    
    this.volunteerApplicationItems.set(id, newApplication);
    return newApplication;
  }
  
  async updateVolunteerApplicationStatus(id: number, status: string): Promise<VolunteerApplication | undefined> {
    const application = this.volunteerApplicationItems.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.volunteerApplicationItems.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async initDb(): Promise<void> {
    // Add demo users
    const admin = await this.createUser({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      phone: "+1234567890",
      country: "USA",
      organization: "HQ"
    });
    
    await this.createUser({
      name: "Staff Member",
      email: "staff@example.com",
      password: "password123",
      role: "staff",
      phone: "+1234567891",
      country: "USA",
      organization: "HQ"
    });
    
    await this.createUser({
      name: "Volunteer",
      email: "volunteer@example.com",
      password: "password123",
      role: "volunteer",
      phone: "+1234567892",
      country: "Canada",
      organization: "Volunteers Inc"
    });
    
    await this.createUser({
      name: "Donor",
      email: "donor@example.com",
      password: "password123",
      role: "donor",
      phone: "+1234567893",
      country: "UK",
      organization: "Generous Org"
    });
    
    const beneficiary = await this.createUser({
      name: "Beneficiary",
      email: "beneficiary@example.com",
      password: "password123",
      role: "beneficiary",
      phone: "+1234567894",
      country: "Kenya"
    });
    
    // Add sample inventory items
    await this.addInventoryItem({
      name: "Water Bottles",
      quantity: 500,
      category: "water",
      locationId: 1,
      expiryDate: new Date(2025, 11, 31),
      unit: "bottles"
    });
    
    await this.addInventoryItem({
      name: "Rice",
      quantity: 1000,
      category: "food",
      locationId: 1,
      expiryDate: new Date(2025, 5, 30),
      unit: "kg"
    });
    
    // Add sample aid requests
    await this.createAidRequest({
      userId: beneficiary.id,
      name: "Emergency Food Aid",
      location: "Nairobi",
      aidType: "food",
      urgency: "high"
    });
    
    // Add sample distributions
    await this.createDistribution({
      date: new Date(2025, 3, 15),
      location: "Nairobi",
      aidType: "food",
      quantity: 200
    });
    
    return Promise.resolve();
  }
}

// Database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Setup session store
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // Initialize database
  async initDb(): Promise<void> {
    try {
      // Check if we have any users
      const results = await db.select().from(users);
      
      // If no users exist, create sample data
      if (results.length === 0) {
        console.log("Initializing database with sample data...");
        
        // Create admin user
        const admin = await this.createUser({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          role: "admin",
          phone: "+1234567890",
          country: "USA",
          organization: "HQ"
        });
        
        // Create other sample users
        await this.createUser({
          name: "Staff Member",
          email: "staff@example.com",
          password: "password123",
          role: "staff",
          phone: "+1234567891",
          country: "USA",
          organization: "HQ"
        });
        
        await this.createUser({
          name: "Volunteer",
          email: "volunteer@example.com",
          password: "password123",
          role: "volunteer",
          phone: "+1234567892",
          country: "Canada",
          organization: "Volunteers Inc"
        });
        
        await this.createUser({
          name: "Donor",
          email: "donor@example.com",
          password: "password123",
          role: "donor",
          phone: "+1234567893",
          country: "UK",
          organization: "Generous Org"
        });
        
        const beneficiary = await this.createUser({
          name: "Beneficiary",
          email: "beneficiary@example.com",
          password: "password123",
          role: "beneficiary",
          phone: "+1234567894",
          country: "Kenya"
        });
        
        // Add sample inventory
        await this.addInventoryItem({
          name: "Water Bottles",
          quantity: 500,
          category: "water",
          locationId: 1,
          expiryDate: new Date(2025, 11, 31),
          unit: "bottles"
        });
        
        await this.addInventoryItem({
          name: "Rice",
          quantity: 1000,
          category: "food",
          locationId: 1,
          expiryDate: new Date(2025, 5, 30),
          unit: "kg"
        });
        
        // Add sample aid requests
        await this.createAidRequest({
          userId: beneficiary.id,
          name: "Emergency Food Aid",
          location: "Nairobi",
          aidType: "food",
          urgency: "high"
        });
        
        // Add sample distributions
        await this.createDistribution({
          date: new Date(2025, 3, 15),
          location: "Nairobi",
          aidType: "food",
          quantity: 200
        });
        
        console.log("Database initialized with sample data");
      } else {
        console.log("Database already contains data, skipping initialization");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, username));
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values({
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone || null,
        country: user.country || null,
        role: user.role || "guest",
        bio: user.bio || null,
        uniqueId: null,
        organization: user.organization || null
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.role, role));
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    }
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    try {
      const result = await db.update(users)
        .set({ role })
        .where(eq(users.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error updating user role:", error);
      return undefined;
    }
  }
  
  // Inventory Methods
  async getInventoryItems(): Promise<Inventory[]> {
    try {
      return await db.select().from(inventory);
    } catch (error) {
      console.error("Error getting inventory items:", error);
      return [];
    }
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    try {
      const result = await db.select().from(inventory).where(eq(inventory.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting inventory item:", error);
      return undefined;
    }
  }
  
  async addInventoryItem(item: InsertInventory): Promise<Inventory> {
    try {
      const result = await db.insert(inventory).values({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        unit: item.unit,
        locationId: item.locationId || null,
        expiryDate: item.expiryDate || null,
        lastUpdate: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error adding inventory item:", error);
      throw error;
    }
  }
  
  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    try {
      const updateData: any = { ...item, lastUpdate: new Date() };
      
      const result = await db.update(inventory)
        .set(updateData)
        .where(eq(inventory.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error updating inventory item:", error);
      return undefined;
    }
  }
  
  async removeInventoryItem(id: number): Promise<boolean> {
    try {
      const result = await db.delete(inventory).where(eq(inventory.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error removing inventory item:", error);
      return false;
    }
  }
  
  // Aid Request Methods
  async getAidRequests(): Promise<AidRequest[]> {
    try {
      return await db.select().from(aidRequests);
    } catch (error) {
      console.error("Error getting aid requests:", error);
      return [];
    }
  }
  
  async getAidRequestsByUser(userId: number): Promise<AidRequest[]> {
    try {
      return await db.select().from(aidRequests).where(eq(aidRequests.userId, userId));
    } catch (error) {
      console.error("Error getting aid requests by user:", error);
      return [];
    }
  }
  
  async getAidRequest(id: number): Promise<AidRequest | undefined> {
    try {
      const result = await db.select().from(aidRequests).where(eq(aidRequests.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting aid request:", error);
      return undefined;
    }
  }
  
  async createAidRequest(request: InsertAidRequest): Promise<AidRequest> {
    try {
      const result = await db.insert(aidRequests).values({
        userId: request.userId || null,
        name: request.name,
        location: request.location,
        aidType: request.aidType,
        urgency: request.urgency,
        status: "pending",
        requestDate: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating aid request:", error);
      throw error;
    }
  }
  
  async updateAidRequestStatus(id: number, status: string): Promise<AidRequest | undefined> {
    try {
      const result = await db.update(aidRequests)
        .set({ status })
        .where(eq(aidRequests.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error updating aid request status:", error);
      return undefined;
    }
  }
  
  // Distribution Methods
  async getDistributions(): Promise<Distribution[]> {
    try {
      return await db.select().from(distributions);
    } catch (error) {
      console.error("Error getting distributions:", error);
      return [];
    }
  }
  
  async getDistribution(id: number): Promise<Distribution | undefined> {
    try {
      const result = await db.select().from(distributions).where(eq(distributions.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting distribution:", error);
      return undefined;
    }
  }
  
  async createDistribution(item: InsertDistribution): Promise<Distribution> {
    try {
      // Format date as string if it's a Date object
      const dateStr = typeof item.date === 'string' 
        ? item.date 
        : (item.date as Date).toISOString().split('T')[0];
        
      const result = await db.insert(distributions).values({
        date: dateStr,
        location: item.location,
        aidType: item.aidType,
        quantity: item.quantity
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating distribution:", error);
      throw error;
    }
  }
  
  // Beneficiary Methods
  async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      return await db.select().from(beneficiaries);
    } catch (error) {
      console.error("Error getting beneficiaries:", error);
      return [];
    }
  }
  
  async getBeneficiary(id: number): Promise<Beneficiary | undefined> {
    try {
      const result = await db.select().from(beneficiaries).where(eq(beneficiaries.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting beneficiary:", error);
      return undefined;
    }
  }
  
  async createBeneficiary(item: InsertBeneficiary): Promise<Beneficiary> {
    try {
      const result = await db.insert(beneficiaries).values({
        name: item.name,
        aidHistory: item.aidHistory || null,
        futureNeeds: item.futureNeeds || null
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating beneficiary:", error);
      throw error;
    }
  }
  
  // Volunteer Application Methods
  async getVolunteerApplications(): Promise<VolunteerApplication[]> {
    try {
      return await db.select().from(volunteerApplications);
    } catch (error) {
      console.error("Error getting volunteer applications:", error);
      return [];
    }
  }
  
  async getVolunteerApplication(id: number): Promise<VolunteerApplication | undefined> {
    try {
      const result = await db.select().from(volunteerApplications).where(eq(volunteerApplications.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting volunteer application:", error);
      return undefined;
    }
  }
  
  async createVolunteerApplication(item: InsertVolunteerApplication): Promise<VolunteerApplication> {
    try {
      const result = await db.insert(volunteerApplications).values({
        name: item.name,
        email: item.email,
        organization: item.organization || null,
        role: item.role || null,
        country: item.country || null,
        bio: item.bio || null,
        applicationDate: new Date(),
        status: "pending"
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating volunteer application:", error);
      throw error;
    }
  }
  
  async updateVolunteerApplicationStatus(id: number, status: string): Promise<VolunteerApplication | undefined> {
    try {
      const result = await db.update(volunteerApplications)
        .set({ status })
        .where(eq(volunteerApplications.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error updating volunteer application status:", error);
      return undefined;
    }
  }
}

// Initialize the storage implementation using in-memory storage
export const storage = new MemStorage();