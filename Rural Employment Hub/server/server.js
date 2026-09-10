import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import mongoSanitize from "mongo-sanitize";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import hierarchyRoutes from "./routes/hierarchyRoutes.js";

// Import Middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";

// Configure Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ============ CORS MIDDLEWARE (must be first — before helmet) ============
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Explicitly handle preflight OPTIONS for all routes
app.options("*", cors(corsOptions));

// ============ SECURITY MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: false, // allow cross-origin resource sharing
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 10000),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development",
});

app.use("/api/", limiter);

// ============ BODY PARSER MIDDLEWARE ============
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ============ LOGGING MIDDLEWARE ============
app.use(morgan("dev"));

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/hierarchy", hierarchyRoutes);

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Rural Employment Hub API is running",
    timestamp: new Date(),
  });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ============ GLOBAL ERROR HANDLER ============
app.use(globalErrorHandler);

// ============ DATABASE CONNECTION ============
const connectDB = async (maxRetries = 3, retryDelay = 2000) => {
  let retries = 0;
  
  const attempt = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        console.warn(`⚠️  MongoDB connection attempt ${retries} failed. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return attempt();
      } else {
        console.warn(`⚠️  MongoDB connection failed after ${maxRetries} attempts. Server will run in offline mode.`);
        console.error(`Error: ${error.message}`);
        return false;
      }
    }
  };
  
  return attempt();
};

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

connectDB().then((connected) => {
  const server = app.listen(PORT, () => {
    const status = connected ? "🚀" : "⚠️ (Offline Mode)";
    console.log(`${status} Rural Employment Hub Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Stop the existing server before starting another one.`);
      process.exit(1);
    }

    console.error(`❌ Server error: ${error.message}`);
    process.exit(1);
  });
});

// ============ GRACEFUL SHUTDOWN ============
process.on("SIGINT", () => {
  console.log("\n✋ Shutting down gracefully...");
  mongoose.disconnect();
  process.exit(0);
});

export default app;
