import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadResume } from "../controllers/upload.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// resume upload route
router.post("/resume", protect, upload.single("resume"), uploadResume);

export default router;
