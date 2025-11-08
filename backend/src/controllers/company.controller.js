import Company from "../models/Company.js";
import User from "../models/User.js";
import Job from "../models/Job.js"; // ✅ add this import at top

// ===============================
//  Create company (Recruiter/Admin)
// ===============================
export const createCompany = async (req, res) => {
  try {
    if (req.user.role === "candidate")
      return res.status(403).json({ message: "Only recruiters/admins can create companies" });

    const { name, website, logoUrl } = req.body;
    if (!name) return res.status(400).json({ message: "Company name required" });

    // prevent duplicate company names
    const exists = await Company.findOne({ name });
    if (exists) return res.status(409).json({ message: "Company already exists" });

    const company = await Company.create({
      name,
      website,
      logoUrl,
      ownerUserId: req.user.id
    });

    // link recruiter to the company
    await User.findByIdAndUpdate(req.user.id, { companyId: company._id });

    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Get SINGLE company by ID
// ===============================
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Get ALL companies (for /companies page)
//  Supports: ?search=, ?verified=true
// ===============================


export const getAllCompanies = async (req, res) => {
  try {
    const filter = {};

    if (req.query.verified === "true") filter.verified = true;
    if (req.query.search) filter.name = new RegExp(req.query.search, "i");

    // ✅ fetch companies
    const companies = await Company.find(filter).sort({ createdAt: -1 });

    // ✅ attach job count for each company
    const companyIds = companies.map(c => c._id);

    const jobCounts = await Job.aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: "$companyId", total: { $sum: 1 } } }
    ]);

    const countMap = {};
    jobCounts.forEach(j => countMap[j._id] = j.total);

    // ✅ merge with companies list
    const result = companies.map(c => ({
      ...c.toObject(),
      jobCount: countMap[c._id] || 0
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
//  Update company (owner or admin only)
// ===============================
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // 🚫 Recruiter can only edit own company
    if (req.user.role !== "admin" && company.ownerUserId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const { name, website, logoUrl, verified } = req.body;

    if (name) company.name = name;
    if (website) company.website = website;
    if (logoUrl) company.logoUrl = logoUrl;

    // ✅ Only admin can verify companies
    if (verified !== undefined && req.user.role === "admin") {
      company.verified = verified;
    }

    await company.save();
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
