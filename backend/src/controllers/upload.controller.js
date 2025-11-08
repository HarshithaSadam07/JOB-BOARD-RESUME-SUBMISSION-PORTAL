import cloudinary from "../utils/cloudinary.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "resumes", resource_type: "auto" },
      (error, result) => {
        if (error) return res.status(500).json({ message: "Upload failed", error });

        return res.status(200).json({
          message: "Uploaded successfully",
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};
