import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const jobSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    location: { type: String, trim: true, index: true },
    expLevel: { type: String, enum: ["junior", "mid", "senior"], required: true, index: true },
    type: { type: String, enum: ["full-time", "intern", "contract"], default: "full-time", index: true },
    salaryMin: Number,
    salaryMax: Number,
    skills: [{ type: String, trim: true, index: true }],
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

// Text search index
jobSchema.index({ title: "text", description: "text" });

export default mongoose.model("Job", jobSchema);
