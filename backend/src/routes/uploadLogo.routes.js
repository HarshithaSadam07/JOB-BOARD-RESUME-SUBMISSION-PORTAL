import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload logo
router.post("/logo", protect, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Logo file required" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: "company-logos", resource_type: "image" },
      (err, uploadRes) => {
        if (err) return res.status(500).json({ message: err.message });

        res.json({
          logoUrl: uploadRes.secure_url,
          publicId: uploadRes.public_id
        });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
