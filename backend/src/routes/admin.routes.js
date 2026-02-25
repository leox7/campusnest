import express from "express";
import { listUsers, updateUserRole } from "../controllers/admin.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
