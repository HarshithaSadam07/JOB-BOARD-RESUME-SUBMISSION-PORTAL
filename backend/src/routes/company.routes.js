import { Router } from "express";
import {
  createCompany,
  getCompany,
  getAllCompanies,
  updateCompany
} from "../controllers/company.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public list of companies (supports ?search= & ?verified=true)
router.get("/", getAllCompanies);

// Create company (recruiter/admin)
router.post("/", protect, createCompany);

// Public view (anyone can see company details)
router.get("/:id", getCompany);

// Update company (only owner or admin)
router.patch("/:id", protect, updateCompany);

export default router;
