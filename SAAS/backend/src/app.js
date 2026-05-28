/**
 * app.js
 * ---------
 * Express application setup and middleware configuration.
 * This module creates and configures the Express app instance,
 * registers all global middleware, mounts all routes, and
 * exports the app for use by the server entry point (server.js).
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// ─── Route Imports ────────────────────────────────────────────────────────────
// ADMIN routes (JWT protected)
import authRoutes from "./api/admin/routes/authRoutes.js";

// ─── Error Middleware ─────────────────────────────────────────────────────────
// Must be imported and used LAST — after all routes
import errorMiddleware from "./api/admin/middlewares/errorMiddleware.js";

// Initialize the Express application
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Enable CORS — allow frontend origins to call this backend
app.use(cors());

// Set secure HTTP response headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Gzip compress responses — reduces payload size for faster transfers
app.use(compression());

// Parse cookies from incoming requests (needed for httpOnly refresh token)
app.use(cookieParser());

// Log every HTTP request to terminal in dev-friendly format
app.use(morgan("dev"));

// ─── Health Check ─────────────────────────────────────────────────────────────
// Used by load balancers / monitoring tools to verify server is alive
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── PUBLIC Routes (NO JWT) ───────────────────────────────────────────────────
// Customer-facing APIs — anyone with a machine_id can call these
// Will be wired here in Day 6 when public catalog controller is built:
// import catalogRoutes from "./api/public/routes/catalogRoutes.js";
// app.use("/api/public/catalog", catalogRoutes);

// ─── ADMIN Routes (JWT REQUIRED) ──────────────────────────────────────────────
// These are not protected here directly — protection is per-route via authMiddleware
app.use("/api/admin/auth", authRoutes);

// More admin routes will be added here in Week 3+:
// import userRoutes   from "./api/admin/routes/userRoutes.js";
// import deviceRoutes from "./api/admin/routes/deviceRoutes.js";
// app.use("/api/admin/users",   authMiddleware, tenantMiddleware, userRoutes);
// app.use("/api/admin/devices", authMiddleware, tenantMiddleware, deviceRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catches any request that didn't match a route above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Global Error Middleware ──────────────────────────────────────────────────
// MUST be last — catches errors passed via next(error) from any controller
app.use(errorMiddleware);

export default app;