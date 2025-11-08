import { Router } from "express";
import { register, login, refresh, me, seedAdmin } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/seed-admin", seedAdmin); // guarded by x-seed-token header

// Protected route
router.get("/me", protect, me);

export default router;
