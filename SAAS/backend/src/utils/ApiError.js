/**
 * ApiError.js
 * -----------
 * Custom error class for structured, predictable HTTP error responses.
 *
 * Extends the native JavaScript `Error` so it can be thrown like any
 * standard error but carries extra fields (statusCode, errors, isOperational)
 * that our global error-handling middleware can use to build a consistent
 * JSON response for the client.
 *
 * Usage:
 *   throw new ApiError(404, "Product not found");
 *   throw new ApiError(422, "Validation failed", ["email is required", "name is required"]);
 */

class ApiError extends Error {
  /**
   * @param {number}   statusCode   - HTTP status code (e.g. 400, 401, 403, 404, 500)
   * @param {string}   message      - Human-readable error message sent to the client
   * @param {Array}    [errors=[]]  - Optional array of detailed validation / field errors
   * @param {string}   [stack=""]   - Optional pre-built stack trace (useful when re-wrapping errors)
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // Call the parent Error constructor with the message so that
    // error.message is set correctly and instanceof checks work.
    super(message);

    // ── Core HTTP fields ────────────────────────────────────────────────────
    this.statusCode = statusCode;
    this.message    = message;

    // ── Payload fields ───────────────────────────────────────────────────────
    // `errors` holds granular validation messages (e.g. from express-validator)
    this.errors  = errors;

    // `success` is always false for errors – mirrors the success flag on ApiResponse
    this.success = false;

    // ── Operational flag ─────────────────────────────────────────────────────
    // Operational errors are *expected* failures (bad input, not found, etc.).
    // Set to true so the global error handler can distinguish them from
    // unexpected programmer errors (which should never reach the client).
    this.isOperational = true;

    // ── Stack trace ──────────────────────────────────────────────────────────
    if (stack) {
      this.stack = stack;
    } else {
      // Captures a clean stack that starts at the call-site, not inside ApiError
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Static factory helpers ─────────────────────────────────────────────────
  // Convenience methods so callers don't have to remember status codes.

  /** 400 Bad Request – malformed syntax or invalid parameters */
  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  /** 401 Unauthorized – missing or invalid authentication credentials */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  /** 403 Forbidden – authenticated but not allowed to access the resource */
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  /** 404 Not Found – requested resource does not exist */
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  /** 409 Conflict – e.g. duplicate email, uniqueness constraint violation */
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  /** 422 Unprocessable Entity – validation errors */
  static validationError(message = "Validation failed", errors = []) {
    return new ApiError(422, message, errors);
  }

  /** 429 Too Many Requests – rate limit exceeded */
  static tooManyRequests(message = "Too many requests, please try again later") {
    return new ApiError(429, message);
  }

  /** 500 Internal Server Error – unexpected server-side failure */
  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

export default ApiError;

/*
  ════════════════════════════════════════════════════════════════════════════
  HOW TO USE ApiError
  ════════════════════════════════════════════════════════════════════════════

  ── In a controller / service ────────────────────────────────────────────────

    import ApiError from "../utils/ApiError.js";

    // Option 1 – direct constructor
    throw new ApiError(404, "Product not found");

    // Option 2 – static factory (recommended for readability)
    throw ApiError.notFound("Product not found");
    throw ApiError.badRequest("Invalid SKU format");
    throw ApiError.unauthorized("Please log in first");
    throw ApiError.validationError("Validation failed", ["email is required"]);

  ── In a global error-handling middleware (e.g. errorHandler.js) ─────────────

    import ApiError from "../utils/ApiError.js";

    const errorHandler = (err, req, res, next) => {
      const statusCode = err instanceof ApiError ? err.statusCode : 500;
      const message    = err instanceof ApiError ? err.message    : "Internal server error";

      res.status(statusCode).json({
        success : false,
        message,
        errors  : err.errors ?? [],
        // Only expose stack in development
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      });
    };

    export default errorHandler;

  ════════════════════════════════════════════════════════════════════════════
*/
