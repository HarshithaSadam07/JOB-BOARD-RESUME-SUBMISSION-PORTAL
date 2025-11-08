import Job from "../models/Job.js";
import Company from "../models/Company.js";


// ===============================
//  Create a Job (Recruiter/Admin)
// ===============================
export const createJob = async (req, res) => {
  try {
    if (req.user.role === "candidate")
      return res.status(403).json({ message: "Only recruiters/admins can post jobs" });

    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ message: "Recruiter must belong to a company" });

    const { title, description, location, expLevel, type, salaryMin, salaryMax, skills } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    const job = await Job.create({
      companyId,
      title,
      description,
      location,
      expLevel,
      type,
      salaryMin,
      salaryMax,
      skills: typeof skills === "string" ? skills.split(",") : skills
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  List Jobs (Public + Filters)
//  Supports: ?search= ?location= ?expLevel=
//            ?type= ?skills=react,js ?companyId=
//            ?active=true
// ===============================
export const listJobs = async (req, res) => {
  try {
    const filter = {};
    const { search, location, expLevel, type, skills, companyId, active } = req.query;

    if (search) filter.$text = { $search: search };
    if (location) filter.location = location;
    if (expLevel) filter.expLevel = expLevel;
    if (type) filter.type = type;
    if (companyId) filter.companyId = companyId;
    if (active === "true") filter.isActive = true;
    if (skills) filter.skills = { $in: skills.split(",") };

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Get Single Job + Company Info
// ===============================
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("companyId", "name logoUrl verified");

    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Get All Jobs from a Company
// ===============================
export const getJobsByCompany = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.params.companyId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Update Job (Recruiter/Admin)
// ===============================
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role !== "admin" && job.companyId.toString() !== req.user.companyId)
      return res.status(403).json({ message: "Not authorized" });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Toggle Job (Enable / Disable)
// ===============================
export const toggleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isActive = !job.isActive;
    await job.save();

    res.json({ id: job._id, isActive: job.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
