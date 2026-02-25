import express from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registration attempts. Please try again in 1 hour." },
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

export default router;
