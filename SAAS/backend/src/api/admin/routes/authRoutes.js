import express from "express";
import { register, login } from "../controllers/authController.js";
import rateLimit from "express-rate-limit";

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// Applies ONLY to auth routes — prevents brute-force login attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many attempts. Please try again after 15 minutes.",
  },
});

const router = express.Router();

// POST /api/admin/auth/register
router.post("/register", authLimiter, register);

// POST /api/admin/auth/login
router.post("/login", authLimiter, login);

export default router;