import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // ✅ Fixed: was User.find() which returns array — must use findOne()
  const user = await User.findOne({ email });

  if (!user) {
    // Use same message for both "no user" and "wrong password"
    // Never reveal which one failed — prevents user enumeration attacks
    throw ApiError.unauthorized("Invalid credentials");
  }

  if (!user.is_active) {
    throw ApiError.forbidden("Your account has been deactivated. Contact your admin.");
  }

  // ✅ Fixed: was loginUser(email, password) called with req.body object
  // Now destructures correctly from the single object argument
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    logger.warn({ email }, "⚠️ Failed login attempt");
    throw ApiError.unauthorized("Invalid credentials");
  }

  const payload = {
    user_id:    user._id,
    company_id: user.company_id,
    role:       user.role,
  };

  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in DB for token rotation / logout invalidation
  user.refresh_token  = refreshToken;
  user.last_login_at  = new Date();
  await user.save();

  logger.info({ user_id: user._id, role: user.role }, "✅ User logged in");

  // ✅ Security: strip sensitive fields before returning
  const safeUser = {
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    company_id: user.company_id,
    is_active:  user.is_active,
  };

  return { accessToken, refreshToken, user: safeUser };
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ company_id, name, email, password, role }) => {
  // Check if email already exists — give a clean 409 conflict error
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("A user with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await User.create({
    company_id,
    name,
    email,
    password_hash,
    role,
  });

  logger.info({ user_id: user._id, role }, "✅ New user registered");

  // ✅ Security: never return password_hash in any response
  const safeUser = {
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    company_id: user.company_id,
    is_active:  user.is_active,
    createdAt:  user.createdAt,
  };

  return safeUser;
};