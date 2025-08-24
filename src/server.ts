import express from "express";
import type {Application, Request, Response, NextFunction} from "express";

import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import {connectDB} from "./config/connectDB.js";
import cors from "cors";
import type {CorsOptions} from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { validateEnv } from "./config/env.js";

dotenv.config();

const requiredEnv = [
  'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_DATABASE',
  'ACCESS_KEY', 'REFRESH_KEY', 'CLOUDINARY_CLOUD_NAME', // Add ALL essential variables
];

for (const variable of requiredEnv) {
  if (!process.env[variable]) {
    // If a variable is missing, throw a clear error and crash the app immediately.
    throw new Error(`FATAL ERROR: Environment variable ${variable} is not defined.`);
  }
}

validateEnv();
const app: Application = express();

// 1. Set security HTTP headers
app.use(helmet());

// 2. Configure CORS
const corsOptions: CorsOptions = {
  origin: [process.env.URL_CLIENT, process.env.URL_CLIENT_MANAGEMENT],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// 3. Parse cookies
app.use(cookieParser());

// 4. Replace body parser with express's built-in parsers
// Use a reasonable payload limit to prevent DoS attacks
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ limit: "500kb", extended: true }));

// --- SECURITY MIDDLEWARES ---

// 5. General rate limiting for all API requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// 6. Mount the master router for all API endpoints
app.use("/api", apiRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // res.status(500).send("Something broke!");

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: 'error',
    message: message,
    // Only include the stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- DATABASE & SERVER STARTUP ---

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
