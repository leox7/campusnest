import express from "express";
import {
  getHostelByIdForAdmin,
  listHostels,
  listUsers,
  updateUserRole,
  verifyHostel,
} from "../controllers/admin.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));

router.get("/users", listUsers);
router.get("/hostels", listHostels);
router.get("/hostels/:id", getHostelByIdForAdmin);
router.put("/verify-hostel/:id", verifyHostel);
router.patch("/users/:id/role", updateUserRole);

export default router;
