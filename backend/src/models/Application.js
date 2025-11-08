import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const applicationSchema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ Updated fields (Cloudinary upload)
    resumeUrl: {
      type: String,
      required: true,
    },
    resumePublicId: {
      type: String,
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "declined", "hired"],
      default: "applied",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate apply for same job by same user
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
