import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import session from "express-session";
import { storage } from "./storage.js";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize database if using PostgreSQL storage
(async () => {
  if (process.env.DATABASE_URL && storage.initDb) {
    try {
      log("Initializing database...");
      await storage.initDb();
      log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      process.exit(1); // Exit if database initialization fails
    }
  }
})();

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for session handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'humanitarian-aid-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' 
      ? new URL(process.env.CLIENT_URL || '').hostname 
      : 'localhost'
  }
}));

// Register routes
registerRoutes(app);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ 
    error: {
      message,
      status,
      timestamp: new Date().toISOString()
    }
  });
};

app.use(errorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  // Configure server to handle both IPv4 and IPv6
  const serverOptions = {
    port,
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost' // Use 0.0.0.0 in production for better compatibility
  };
  
  // Add reusePort option only for platforms that support it (not Windows)
  if (process.platform !== 'win32') {
    Object.assign(serverOptions, { reusePort: true });
  }
  
  server.listen(serverOptions, () => {
    log(`Server running on ${process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'}:${port}`);
  });
})();
