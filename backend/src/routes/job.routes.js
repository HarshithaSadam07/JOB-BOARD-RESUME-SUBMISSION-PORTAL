import { Router } from "express";
import {
  createJob,
  listJobs,
  getJob,
  getJobsByCompany,
  updateJob,
  toggleJob
} from "../controllers/job.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();


// ===============================
//  PUBLIC ROUTES
// ===============================

// List all jobs (with filters)
router.get("/", listJobs);

// Get single job
router.get("/:id", getJob);

// Get all jobs from a company (for CompanyPage)
router.get("/company/:companyId", getJobsByCompany);


// ===============================
//  RECRUITER / ADMIN ROUTES
// ===============================

// Create job
router.post("/", protect, createJob);

// Update job
router.patch("/:id", protect, updateJob);

// Enable / disable job
router.patch("/:id/toggle", protect, toggleJob);


export default router;
