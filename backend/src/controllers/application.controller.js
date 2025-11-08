import Application from "../models/Application.js";
import Job from "../models/Job.js";
import cloudinary from "../utils/cloudinary.js";

// Apply to job (auto upload + save to DB)
export const applyToJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;

    // Must include file
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // Check job exists & active
    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found or inactive" });
    }

    // Check if already applied
    const existing = await Application.findOne({
      jobId: job._id,
      userId: req.user.id,
    });

    if (existing) {
      return res.status(409).json({ message: "Already applied to this job" });
    }

    // Upload file to Cloudinary
    const cloudRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "resumes", resource_type: "raw" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Save application to DB
    const app = await Application.create({
      jobId: job._id,
      userId: req.user.id,
      resumeUrl: cloudRes.secure_url,
      resumePublicId: cloudRes.public_id,
      coverLetter,
    });

    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Candidate: list own applications
export const listMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user.id }).sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Recruiter: list applicants for job
export const listApplicationsForJob = async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId }).sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status
export const updateApplicationStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = req.body.status || app.status;
    app.notes = req.body.notes || app.notes;
    await app.save();

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
