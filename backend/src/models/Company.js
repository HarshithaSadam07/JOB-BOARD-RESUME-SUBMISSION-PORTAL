import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

companySchema.index({ name: 1 });

export default mongoose.model("Company", companySchema);
