import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { createReview } from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/", authenticateToken, requireRole("student"), createReview);

export default router;
