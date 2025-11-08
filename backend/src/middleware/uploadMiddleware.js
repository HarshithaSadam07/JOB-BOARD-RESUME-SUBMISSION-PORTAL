import multer from "multer";

// ✅ Store file in memory (needed for Cloudinary upload_stream)
const storage = multer.memoryStorage();

// ✅ Allow only PDF / DOC / DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, DOC, DOCX files allowed"), false);
  }

  cb(null, true);
};

// ✅ Multer instance with limits
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
