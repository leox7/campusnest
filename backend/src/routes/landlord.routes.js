import express from "express";
import {
  createHostel,
  deleteHostel,
  listMyHostels,
  updateHostel,
} from "../controllers/landlord.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("landlord"));

router.get("/hostels", listMyHostels);
router.post("/hostels", createHostel);
router.put("/hostels/:id", updateHostel);
router.delete("/hostels/:id", deleteHostel);

export default router;
