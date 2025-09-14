import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from 'morgan';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import type {Application, Request, Response, NextFunction} from "express";
import type {CorsOptions} from "cors";

import { validateEnv } from "./config/env.js";
import apiRouter from "./routes/index.js";
import {connectDB} from "./config/connectDB.js";
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const requiredEnv = [
  // --- DATABASE (POSTGRESQL) ---
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'DB_DIALECT',

  // --- JWT SECRETS ---
  'ACCESS_KEY',
  'REFRESH_KEY',
  'ACCESS_TIME',
  'REFRESH_TIME',

  // --- CLIENT URLS (for CORS) ---
  'URL_CLIENT',
  'URL_CLIENT_MANAGEMENT',
  'URL_SERVER',

  // --- EXTERNAL SERVICES ---
  'EMAIL_APP',
  'EMAIL_APP_PASSWORD',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'VNP_TMNCODE',
  'VNP_HASHSECRET',
  'VNP_URL',
  'VNP_RETURNURL'
];

for (const variable of requiredEnv) {
  if (!process.env[variable]) {
    // If a variable is missing, throw a clear error and crash the app immediately.
    throw new Error(`FATAL ERROR: Environment variable ${variable} is not defined.`);
  }
}

validateEnv();
const app: Application = express();

// ===============================================================
// --- GLOBAL APPLICATION-LEVEL MIDDLEWARE ---
// ===============================================================

// Trust proxy headers (useful if you are behind a load balancer like Nginx or Heroku)
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN, // Use the single variable from our previous step
  credentials: true,
};
app.use(cors(corsOptions));

// Request logging (use 'combined' for production logging)
const logFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(logFormat));

// General rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body and cookie parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================================================
// --- API ROUTES ---
// ===============================================================

// Mount the master router for all API endpoints under a versioned namespace
app.use("/api", apiRouter);

// ===============================================================
// --- ERROR HANDLING ---
// ===============================================================

// Handle 404 Not Found for any API routes not matched above
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// The Global Error Handler (must be the last middleware)
app.use(errorHandler);

// ===============================================================
// --- SERVER STARTUP ---
// ===============================================================
const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Start the server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
