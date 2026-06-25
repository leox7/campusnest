import express from "express";
import {
  getHostelById,
  listHostels,
  listSavedHostels,
  toggleSavedHostel,
} from "../controllers/hostels.controller.js";
import { listReviews } from "../controllers/reviews.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", requireRole("student"), listHostels);
router.get("/saved", requireRole("student"), listSavedHostels);
router.get("/:id", requireRole("student"), getHostelById);
router.get("/:id/reviews", listReviews);
router.post("/:id/save", requireRole("student"), toggleSavedHostel);

export default router;
