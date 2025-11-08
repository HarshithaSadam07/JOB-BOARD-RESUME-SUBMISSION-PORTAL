import { Router } from "express";
import {
  applyToJob,
  listMyApplications,
  listApplicationsForJob,
  updateApplicationStatus
} from "../controllers/application.controller.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadErrorHandler } from "../middleware/errorMiddleware.js";

const router = Router();

// ✅ Candidate: apply to a job (file upload + auth)
router.post(
  "/jobs/:id/apply",
  protect,
  upload.single("resume"),   // ✅ multer parses file
  uploadErrorHandler,        // ✅ handles file errors
  applyToJob                 // ✅ controller receives req.file
);

// Candidate: view my applications
router.get("/mine", protect, listMyApplications);

// Recruiter/Admin: view applicants for a job
router.get("/job/:jobId", protect, listApplicationsForJob);

// Recruiter/Admin: update applicant status
router.patch("/:id/status", protect, updateApplicationStatus);

export default router;
