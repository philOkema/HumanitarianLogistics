import { 
  users, inventory, aidRequests, distributions, beneficiaries, volunteerApplications,
  type User, type InsertUser, 
  type Inventory, type InsertInventory,
  type AidRequest, type InsertAidRequest,
  type Distribution, type InsertDistribution,
  type Beneficiary, type InsertBeneficiary,
  type VolunteerApplication, type InsertVolunteerApplication
} from "@shared/schema";
import { db, usersCollection, distributionsCollection, inventoriesCollection, aidRequestsCollection, beneficiariesCollection, volunteerApplicationsCollection } from "./db";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import pkg from 'pg';
const { Pool } = pkg;

// Define the connect-pg-simple session store
const PostgresStore = connectPgSimple(session);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Inventory management
  getInventoryItems(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  addInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  removeInventoryItem(id: string): Promise<boolean>;
  
  // Aid Requests
  getAidRequests(): Promise<AidRequest[]>;
  getAidRequestsByUser(userId: string): Promise<AidRequest[]>;
  getAidRequest(id: string): Promise<AidRequest | undefined>;
  createAidRequest(request: InsertAidRequest): Promise<AidRequest>;
  updateAidRequestStatus(id: string, status: string): Promise<AidRequest | undefined>;
  
  // Distributions
  getDistributions(): Promise<Distribution[]>;
  getDistribution(id: string): Promise<Distribution | undefined>;
  createDistribution(distribution: InsertDistribution): Promise<Distribution>;
  
  // Beneficiaries
  getBeneficiaries(): Promise<Beneficiary[]>;
  getBeneficiary(id: string): Promise<Beneficiary | undefined>;
  createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary>;
  
  // Volunteer Applications
  getVolunteerApplications(): Promise<VolunteerApplication[]>;
  getVolunteerApplication(id: string): Promise<VolunteerApplication | undefined>;
  createVolunteerApplication(application: InsertVolunteerApplication): Promise<VolunteerApplication>;
  updateVolunteerApplicationStatus(id: string, status: string): Promise<VolunteerApplication | undefined>;
  
  // Session store for authentication
  sessionStore: session.Store;
  
  // Database initialization
  initDb(): Promise<void>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresStore({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL
      }),
      tableName: 'sessions'
    });
  }
  
  async initDb(): Promise<void> {
    // Initialize database tables if needed
    console.log('Firestore project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('Firestore collections initialized:', {
      users: usersCollection.id,
      inventories: inventoriesCollection.id,
      aidRequests: aidRequestsCollection.id,
      distributions: distributionsCollection.id,
      beneficiaries: beneficiariesCollection.id,
      volunteerApplications: volunteerApplicationsCollection.id
    });
  }
  
  async getUser(id: string): Promise<User | undefined> {
    const userDoc = await getDoc(doc(usersCollection, id));
    return userDoc.exists() ? userDoc.data() as User : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(usersCollection, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return undefined;
    return querySnapshot.docs[0].data() as User;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = user.id || Date.now().toString();
    const newUser = { 
      ...user, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(usersCollection, id), newUser);
    return newUser as User;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    const q = query(usersCollection, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }
  
  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const userRef = doc(usersCollection, id);
    await updateDoc(userRef, { role, updatedAt: new Date() });
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.exists() ? updatedDoc.data() as User : undefined;
  }
  
  async getInventoryItems(): Promise<Inventory[]> {
    const querySnapshot = await getDocs(inventoriesCollection);
    return querySnapshot.docs.map(doc => doc.data() as Inventory);
  }
  
  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    try {
      const itemDoc = await getDoc(doc(inventoriesCollection, id));
      return itemDoc.exists() ? itemDoc.data() as Inventory : undefined;
    } catch (error) {
      console.error('Error getting inventory item:', error);
      return undefined;
    }
  }
  
  async addInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = item.id || Date.now().toString();
    const newItem = { 
      ...item, 
      id,
      lastUpdate: new Date()
    };
    console.log("Writing inventory item to Firestore:", newItem);
    try {
      await setDoc(doc(inventoriesCollection, id), newItem);
      console.log("Successfully wrote inventory item to Firestore:", id);
      return newItem as Inventory;
    } catch (error) {
      console.error("Error writing inventory item:", error);
      return newItem as Inventory;
    }
  }
  
  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    try {
      const itemRef = doc(inventoriesCollection, id);
      await updateDoc(itemRef, { ...item, lastUpdate: new Date() });
      const updatedDoc = await getDoc(itemRef);
      return updatedDoc.exists() ? updatedDoc.data() as Inventory : undefined;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return undefined;
    }
  }
  
  async removeInventoryItem(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(inventoriesCollection, id));
      return true;
    } catch (error) {
      console.error('Error removing inventory item:', error);
      return false;
    }
  }
  
  async getAidRequests(): Promise<AidRequest[]> {
    const querySnapshot = await getDocs(aidRequestsCollection);
    return querySnapshot.docs.map(doc => doc.data() as AidRequest);
  }
  
  async getAidRequestsByUser(userId: string): Promise<AidRequest[]> {
    const q = query(aidRequestsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AidRequest);
  }
  
  async getAidRequest(id: string): Promise<AidRequest | undefined> {
    const requestDoc = await getDoc(doc(aidRequestsCollection, id));
    return requestDoc.exists() ? requestDoc.data() as AidRequest : undefined;
  }
  
  async createAidRequest(request: InsertAidRequest): Promise<AidRequest> {
    const id = request.id || Date.now().toString();
    const newRequest: any = {
      id,
      name: request.name,
      location: request.location,
      aidType: request.aidType,
      urgency: request.urgency,
      status: request.status || "pending",
      requestDate: request.requestDate || new Date(),
      createdAt: request.createdAt || new Date(),
      updatedAt: request.updatedAt || new Date(),
      userId: request.userId,
      notes: (request as any).notes || "",
      priority: (request as any).priority || "low",
      items: Array.isArray((request as any).items) ? (request as any).items : [],
    };
    try {
      await setDoc(doc(aidRequestsCollection, id), newRequest);
      return newRequest as AidRequest;
    } catch (error) {
      console.error('Error creating aid request in database:', error);
      throw new Error('Failed to create aid request in database');
    }
  }
  
  async updateAidRequestStatus(id: string, status: string): Promise<AidRequest | undefined> {
    const requestRef = doc(aidRequestsCollection, id);
    await updateDoc(requestRef, { status, updatedAt: new Date() });
    const updatedDoc = await getDoc(requestRef);
    return updatedDoc.exists() ? updatedDoc.data() as AidRequest : undefined;
  }
  
  async getDistributions(): Promise<Distribution[]> {
    const querySnapshot = await getDocs(distributionsCollection);
    return querySnapshot.docs.map(doc => doc.data() as Distribution);
  }
  
  async getDistribution(id: string): Promise<Distribution | undefined> {
    const distributionDoc = await getDoc(doc(distributionsCollection, id));
    return distributionDoc.exists() ? distributionDoc.data() as Distribution : undefined;
  }
  
  async createDistribution(distribution: InsertDistribution): Promise<Distribution> {
    const id = distribution.id || Date.now().toString();
    const newDistribution = { 
      ...distribution, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(distributionsCollection, id), newDistribution);
    return newDistribution as Distribution;
  }
  
  async getBeneficiaries(): Promise<Beneficiary[]> {
    const querySnapshot = await getDocs(beneficiariesCollection);
    return querySnapshot.docs.map(doc => doc.data() as Beneficiary);
  }
  
  async getBeneficiary(id: string): Promise<Beneficiary | undefined> {
    const beneficiaryDoc = await getDoc(doc(beneficiariesCollection, id));
    return beneficiaryDoc.exists() ? beneficiaryDoc.data() as Beneficiary : undefined;
  }
  
  async createBeneficiary(beneficiary: InsertBeneficiary): Promise<Beneficiary> {
    const id = beneficiary.id || Date.now().toString();
    const newBeneficiary = { 
      ...beneficiary, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(beneficiariesCollection, id), newBeneficiary);
    return newBeneficiary as Beneficiary;
  }
  
  async getVolunteerApplications(): Promise<VolunteerApplication[]> {
    const querySnapshot = await getDocs(volunteerApplicationsCollection);
    return querySnapshot.docs.map(doc => doc.data() as VolunteerApplication);
  }
  
  async getVolunteerApplication(id: string): Promise<VolunteerApplication | undefined> {
    const applicationDoc = await getDoc(doc(volunteerApplicationsCollection, id));
    return applicationDoc.exists() ? applicationDoc.data() as VolunteerApplication : undefined;
  }
  
  async createVolunteerApplication(application: InsertVolunteerApplication): Promise<VolunteerApplication> {
    const id = application.id || Date.now().toString();
    const newApplication = { 
      ...application, 
      id,
      status: "pending",
      applicationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(volunteerApplicationsCollection, id), newApplication);
    return newApplication as VolunteerApplication;
  }
  
  async updateVolunteerApplicationStatus(id: string, status: string): Promise<VolunteerApplication | undefined> {
    const applicationRef = doc(volunteerApplicationsCollection, id);
    await updateDoc(applicationRef, { status, updatedAt: new Date() });
    const updatedDoc = await getDoc(applicationRef);
    return updatedDoc.exists() ? updatedDoc.data() as VolunteerApplication : undefined;
  }
}

// Initialize the storage implementation using Firestore
export const storage = new DatabaseStorage();