/**
 * app.js
 * ---------
 * Express application setup and middleware configuration.
 * This module creates and configures the Express app instance,
 * registers all global middleware, defines base routes, and
 * exports the app for use by the server entry point (server.js).
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

// Initialize the Express application
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Parse incoming requests with JSON payloads (Content-Type: application/json)
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from other origins
app.use(cors());

// Set security-related HTTP response headers to protect against common web vulnerabilities
app.use(helmet());

// Compress response bodies to improve transfer speed and reduce bandwidth usage
app.use(compression());

// Parse Cookie header and populate req.cookies with cookie name-value pairs
app.use(cookieParser());

// Log HTTP requests to the console in developer-friendly format
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Health check endpoint used to verify that the server is up and running.
 * Typically consumed by load balancers, monitoring tools, or CI/CD pipelines.
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: "Server running"
    });
});

// ─── Export ───────────────────────────────────────────────────────────────────

// Export the configured Express app for use in server.js (entry point)
export default app;