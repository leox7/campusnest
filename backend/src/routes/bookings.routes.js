import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import {
  createBooking,
  listMyBookings,
  cancelBooking,
  simulatePay,
  getPayment,
} from "../controllers/bookings.controller.js";

const router = express.Router();

router.use(authenticateToken, requireRole("student"));

router.post("/", createBooking);
router.get("/my", listMyBookings);
router.patch("/:id/cancel", cancelBooking);
router.post("/:id/pay", simulatePay);
router.get("/:id/payment", getPayment);

export default router;
