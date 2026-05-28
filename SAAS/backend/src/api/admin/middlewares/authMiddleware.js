import jwt from "jsonwebtoken";
import ApiError from "../../../utils/ApiError.js";

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Verifies the JWT access token on every protected admin route.
// Attaches decoded payload (user_id, company_id, role) to req.user.
export const authMiddleware = (req, res, next) => {
  try {
    // Token must be in Authorization header as: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach to req so every downstream controller/middleware can read it
    req.user = {
      user_id:    decoded.user_id,
      company_id: decoded.company_id,
      role:       decoded.role,
    };

    next();
  } catch (error) {
    // jwt.verify throws TokenExpiredError / JsonWebTokenError
    if (error.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Access token has expired. Please login again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(ApiError.unauthorized("Invalid access token"));
    }
    next(error);
  }
};
