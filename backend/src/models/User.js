import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["candidate", "recruiter", "admin"], default: "candidate", index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    
    // Profile fields
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: [experienceSchema],
    education: [educationSchema],
    resumeUrl: { type: String },
    about: { type: String },
    website: { type: String },
    github: { type: String },
    linkedin: { type: String },
    
    // For backward compatibility
    experienceYears: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
