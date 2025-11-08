import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const router = Router();

// Protected routes
router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
