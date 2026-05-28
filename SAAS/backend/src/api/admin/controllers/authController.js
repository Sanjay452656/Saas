import { loginUser, registerUser } from "../../../services/authService.js";
import ApiError from "../../../utils/ApiError.js";

// ─── POST /api/admin/auth/register ────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { company_id, name, email, password, role } = req.body;

    // Basic presence check — full zod validation comes in Day 7
    if (!company_id || !name || !email || !password || !role) {
      // Use ApiError — consistent error format across the whole app
      throw ApiError.badRequest("All fields are required: company_id, name, email, password, role");
    }

    // ✅ Register logic moved to service layer (separation of concerns)
    const user = await registerUser({ company_id, name, email, password, role });

    // ✅ password_hash is never returned — safeUser is returned from service
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data:    user,
    });
  } catch (error) {
    // Pass to global error middleware — handles ApiError and unexpected errors
    next(error);
  }
};

// ─── POST /api/admin/auth/login ───────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required");
    }

    const { accessToken, refreshToken, user } = await loginUser({ email, password });

    // Set refresh token as httpOnly cookie — more secure than exposing in body
    // httpOnly: JS cannot access it (XSS safe)
    // secure: only sent over HTTPS in production
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({
      success:     true,
      message:     "Login successful",
      accessToken, // Access token goes in response body — frontend stores in memory
      user,
    });
  } catch (error) {
    next(error);
  }
};