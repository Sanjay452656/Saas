import ApiError from "../../../utils/ApiError.js";
import logger from "../../../utils/logger.js";

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered LAST in app.js — after all routes.
// Express identifies a 4-argument middleware as an error handler.
//
// All controllers should call next(error) instead of res.status().json()
// so that ALL errors flow through this single handler consistently.
const errorMiddleware = (err, req, res, next) => {
  // Log every error — include full error object for debugging
  logger.error(
    { err, path: req.path, method: req.method },
    err.message || "Unexpected error"
  );

  // Handle Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors:  [],
    });
  }

  // Handle Mongoose validation errors (schema-level)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Handle our own ApiError — these are expected/operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors:  err.errors,
    });
  }

  // Fallback — unexpected programmer error
  // Never expose internal details in production
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
