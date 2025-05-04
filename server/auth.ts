import passport from "passport";
import { Express, Request, Response, NextFunction } from "express";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env');
dotenv.config({ path: envPath });

// Log environment variables (without sensitive data)
console.log('Environment loaded:', {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not Set',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set',
  NODE_ENV: process.env.NODE_ENV
});
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);

// Validate required environment variables
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars);
  throw new Error(`Missing required Firebase configuration: ${missingVars.join(', ')}`);
}

// Initialize Firebase Admin
let app;
try {
  app = getApps().length === 0 ? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  }) : getApps()[0];

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);

// Define valid roles
export const VALID_ROLES = ['admin', 'staff', 'donor', 'beneficiary'] as const;
type UserRole = typeof VALID_ROLES[number];

// Extend Express Request type for passport
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    }
  }
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.id) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check if user has required role
export const hasRole = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const userDoc = await db.collection('users').doc(req.user.id).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.role || !roles.includes(userData.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Error checking user role:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

// Update user role in Firestore
export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    await db.collection('users').doc(userId).set({ role }, { merge: true });
    await auth.setCustomUserClaims(userId, { role });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Get user role from Firestore
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    return userData?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Middleware to authenticate using Firebase ID token from Authorization header
export const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      role: decodedToken.role // custom claim
    };
    req.isAuthenticated = (() => true) as any;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export function setupAuth(app: Express) {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await auth.getUser(id);
      if (!user.email || !user.displayName) {
        throw new Error('Missing required user information');
      }
      done(null, {
        id: id,
        email: user.email,
        name: user.displayName,
        role: user.customClaims?.role || 'beneficiary'
      });
    } catch (error) {
      done(error, null);
    }
  });

  // Registration route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;
      
      console.log('Registration attempt:', { email, name, role });
      
      // Input validation
      if (!email || !password || !name || !role) {
        return res.status(400).json({ 
          message: "Missing required fields: email, password, name, and role are required" 
        });
      }

      // Validate role
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ 
          message: "Invalid role specified" 
        });
      }

      console.log('Creating user in Firebase...');
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name
      });
      console.log('User created successfully:', userRecord.uid);

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Set custom claims
      await auth.setCustomUserClaims(userRecord.uid, { role });

      const expressUser: Express.User = {
        id: userRecord.uid,
        email: userRecord.email || '',
        name: userRecord.displayName || '',
        role
      };

      res.status(201).json({ 
        user: expressUser,
        message: "User registered successfully"
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ 
          message: "Email address is already in use" 
        });
      }
      
      res.status(500).json({ 
        message: "Error creating user", 
        error: error.message || "Unknown error occurred"
      });
    }
  });

  // Login route
  app.post("/api/login", async (req: Request, res: Response, next) => {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt for email:', email);
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required"
        });
      }

      // Get user from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user role from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.role) {
        return res.status(403).json({ 
          message: "User role not found" 
        });
      }

      const expressUser: Express.User = {
        id: userRecord.uid,
        email: userRecord.email || '',
        name: userRecord.displayName || '',
        role: userData.role
      };

      req.login(expressUser, (loginErr) => {
        if (loginErr) {
          console.error('Session login error:', loginErr);
          return next(loginErr);
        }
        console.log('User successfully logged in and session created');
        res.status(200).json({ 
          user: expressUser,
          message: "Login successful"
        });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ 
          message: "Invalid email or password"
        });
      }
      res.status(401).json({ 
        message: "Invalid credentials", 
        error: error.message || "Unknown error occurred"
      });
    }
  });

  // Logout route
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      if (req.user?.id) {
        // Revoke all refresh tokens for user
        await auth.revokeRefreshTokens(req.user.id);
      }
      req.logout(() => {});
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: "Error during logout", 
        error: error.message || "Unknown error occurred"
      });
    }
  });

  // Get current user route
  app.get("/api/user", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user?.id) {
      console.log("User not authenticated when checking current user");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userRecord = await auth.getUser(req.user.id);
      console.log("Current authenticated user:", userRecord);
      
      if (!userRecord.email || !userRecord.displayName) {
        throw new Error('Missing required user information');
      }

      res.json({
        id: req.user.id,
        email: userRecord.email,
        name: userRecord.displayName,
        role: userRecord.customClaims?.role || 'beneficiary'
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Error getting user" });
    }
  });
}