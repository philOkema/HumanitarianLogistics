import express from "express";
import type { Express, Request, Response } from "express";
import type { Server } from "http";
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage.js";
import { insertInventorySchema, insertAidRequestSchema, User } from "@shared/schema";
import { z } from "zod";
import { setupAuth, authenticateFirebaseToken } from "./auth.js";
import * as admin from 'firebase-admin';
import { 
  type InsertInventory, 
  type InsertAidRequest,
  type Inventory,
  type AidRequest
} from "@shared/schema";
import { getAuth } from 'firebase-admin/auth';

// Role-based access control middleware
const hasRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as unknown as { role: string };
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    
    next();
  };
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Distribution Management Routes
  app.get("/api/distributions", async (req, res) => {
    try {
      const distributions = await storage.getDistributions();
      res.status(200).json({ distributions });
    } catch (error) {
      res.status(500).json({ message: "Error fetching distributions" });
    }
  });

  app.get("/api/distributions/:id", async (req, res) => {
    try {
      const distributionId = req.params.id;
      const distribution = await storage.getDistribution(distributionId);
      if (!distribution) {
        return res.status(404).json({ message: "Distribution not found" });
      }
      res.status(200).json({ distribution });
    } catch (error) {
      res.status(500).json({ message: "Error fetching distribution" });
    }
  });

  app.post("/api/distributions", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      let distributionData = req.body;
      console.log('Received distribution data:', distributionData);
      
      // Use volunteerId directly if present
      if (!distributionData.volunteerId && distributionData.assignedTo) {
        try {
          console.log('Looking up user by email:', JSON.stringify(distributionData.assignedTo));
          const auth = getAuth();
          const userRecord = await auth.getUserByEmail(distributionData.assignedTo);
          if (userRecord && userRecord.uid) {
            distributionData.volunteerId = userRecord.uid;
            console.log('Set volunteerId to:', userRecord.uid);
          }
        } catch (err) {
          console.error('Detailed error looking up user:', err as any);
          return res.status(400).json({ 
            message: "Assigned volunteer email not found in Firebase Auth.",
            error: (err as any).message,
            code: (err as any).code
          });
        }
      } else if (distributionData.volunteerId) {
        console.log('Using provided volunteerId:', distributionData.volunteerId);
      }
      
      const distribution = await storage.createDistribution(distributionData);
      console.log('Successfully created distribution:', distribution);
      res.status(201).json({ distribution });
      broadcastUpdate('distribution_updated');
    } catch (error) {
      console.error('Error creating distribution:', error as any);
      res.status(500).json({ 
        message: "Error creating distribution",
        error: (error as any).message 
      });
    }
  });

  app.patch("/api/distributions/:id", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      const distributionId = req.params.id;
      const updatedDistribution = await storage.createDistribution({ ...req.body, id: distributionId });
      if (!updatedDistribution) {
        return res.status(404).json({ message: "Distribution not found" });
      }
      res.status(200).json({ distribution: updatedDistribution });
    } catch (error) {
      res.status(500).json({ message: "Error updating distribution" });
    }
  });

  // User Profile Update Route
  app.patch("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as unknown as { id: string; role: string };
      const userId = req.params.id;
      
      if (user.id !== userId && user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
      }
      
      // Don't allow changing the role unless the user is an admin
      if (req.body.role && user.role !== 'admin') {
        delete req.body.role;
      }
      
      // Update the user profile
      // Note: This would call a storage method that doesn't exist yet
      // In a real app, you would implement this in the storage class
      
      // For now, just return the updated user
      const updatedUser = {
        ...user,
        ...req.body,
        id: userId
      };
      
      // Don't send the password to the client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Error updating user profile" });
    }
  });
  
  // User Role Management Routes (Admin only)
  app.get("/api/users", hasRole(["admin"]), async (req, res) => {
    try {
      const role = req.query.role as string;
      let users: User[] = [];
      
      if (role) {
        users = await storage.getUsersByRole(role);
      } else {
        // In a real app, you would add pagination here
        users = [];
        // This would get all users, which isn't implemented yet
      }
      
      // Remove passwords before sending
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.status(200).json({ users: sanitizedUsers });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  app.patch("/api/users/:id/role", hasRole(["admin"]), async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      if (!role || !["admin", "staff", "volunteer", "donor", "beneficiary", "guest"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password to the client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Error updating user role" });
    }
  });
  
  // Inventory Management Routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.status(200).json({ items });
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory" });
    }
  });
  
  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await storage.getInventoryItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(200).json({ item });
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory item" });
    }
  });
  
  app.post("/api/inventory", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      const item: InsertInventory = {
        id: Date.now().toString(),
        name: req.body.name,
        quantity: Number(req.body.quantity),
        unit: req.body.unit,
        category: req.body.category,
        locationId: req.body.locationId,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
      };
      
      const newItem = await storage.addInventoryItem(item);
      res.status(201).json({ item: newItem });
      broadcastUpdate('inventory_updated');
    } catch (error) {
      res.status(500).json({ message: "Error adding inventory item" });
    }
  });
  
  app.patch("/api/inventory/:id", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      const itemId = req.params.id;
      const updatedItem = await storage.updateInventoryItem(itemId, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(200).json({ item: updatedItem });
      broadcastUpdate('inventory_updated');
    } catch (error) {
      res.status(500).json({ message: "Error updating inventory item" });
    }
  });
  
  app.delete("/api/inventory/:id", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      const itemId = req.params.id;
      const success = await storage.removeInventoryItem(itemId);
      
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(200).json({ message: "Item deleted successfully" });
      broadcastUpdate('inventory_updated');
    } catch (error) {
      res.status(500).json({ message: "Error deleting inventory item" });
    }
  });
  
  // Aid Request Routes
  app.get("/api/aid-requests", authenticateFirebaseToken, async (req, res) => {
    try {
      const user = req.user as unknown as { role: string; uid: string };
      let requests = await storage.getAidRequests();
      
      // If user is a beneficiary, only show their own requests
      if (user.role === 'beneficiary') {
        requests = requests.filter(request => request.userId === user.uid);
      }
      
      res.status(200).json({ requests });
    } catch (error) {
      res.status(500).json({ message: "Error fetching aid requests" });
    }
  });
  
  app.get("/api/aid-requests/:id", async (req, res) => {
    try {
      const requestId = req.params.id;
      const request = await storage.getAidRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Aid request not found" });
      }
      
      res.status(200).json({ request });
    } catch (error) {
      res.status(500).json({ message: "Error fetching aid request" });
    }
  });
  
  app.post("/api/aid-requests", authenticateFirebaseToken, async (req, res) => {
    try {
      const newRequest = await storage.createAidRequest(req.body);
      res.status(201).json({ request: newRequest });
    } catch (error) {
      res.status(500).json({ message: "Error creating aid request" });
    }
  });
  
  app.patch("/api/aid-requests/:id/status", authenticateFirebaseToken, hasRole(["admin", "staff"]), async (req, res) => {
    try {
      const requestId = req.params.id;
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "in_progress", "in_transit", "delivered", "denied", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateAidRequestStatus(requestId, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Aid request not found" });
      }
      
      res.status(200).json({ request: updatedRequest });
      broadcastUpdate('aid_request_updated');
    } catch (error) {
      res.status(500).json({ message: "Error updating aid request status" });
    }
  });
  
  // Predefined aid items
  app.get("/api/aid-items", async (req, res) => {
    try {
      // Get all inventory items that can be requested as aid
      const items = await storage.getInventoryItems();
      const aidItems = items.filter(item => item.quantity > 0);
      
      res.status(200).json({ items: aidItems });
    } catch (error) {
      res.status(500).json({ message: "Error fetching aid items" });
    }
  });
  
  const server = http.createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true,
      serverNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024
    }
  });
  
  wss.on('connection', (ws, req) => {
    console.log('Client connected to WebSocket');
    
    // Handle client messages
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Function to broadcast updates to all connected clients
  function broadcastUpdate(type: string): void {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, timestamp: new Date().toISOString() }));
      }
    });
  }
  
  return server;
}
