import express from "express";
import {
  addHostelImage,
  createHostel,
  deleteHostelImage,
  deleteHostel,
  listMyHostels,
  updateHostelImage,
  updateHostel,
} from "../controllers/landlord.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("landlord"));

router.get("/hostels", listMyHostels);
router.post("/hostels", createHostel);
router.put("/hostels/:id", updateHostel);
router.delete("/hostels/:id", deleteHostel);
router.post("/hostels/:id/images", addHostelImage);
router.patch("/hostels/:id/images/:imageId", updateHostelImage);
router.delete("/hostels/:id/images/:imageId", deleteHostelImage);

export default router;
