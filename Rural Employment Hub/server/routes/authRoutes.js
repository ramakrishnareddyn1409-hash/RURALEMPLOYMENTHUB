import express from "express";
import {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logout,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { checkValidation } from "../middleware/validation.js";
import { registerValidation, loginValidation } from "../validators/validations.js";

const router = express.Router();

// Public Routes
router.post("/register", registerValidation, checkValidation, register);
router.post("/login", loginValidation, checkValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// OTP Routes (phone-based login)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected Routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

export default router;
