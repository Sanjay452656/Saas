import ApiError from "../../../utils/ApiError.js";

// ─── RBAC Middleware ──────────────────────────────────────────────────────────
// Call AFTER authMiddleware — req.user must already be set.
//
// Usage:
//   router.get("/devices", authMiddleware, authorizeRoles("SUPER_ADMIN", "ADMIN"), handler)
//
// Roles in system: SUPER_ADMIN | ADMIN | TECHNICIAN
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Safety check — authMiddleware should always run first
      return next(ApiError.unauthorized("Not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
