export const uploadErrorHandler = (err, req, res, next) => {
  if (err) {
    if (err.message.includes("Only")) {
      return res.status(400).json({ message: err.message }); // invalid file type
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large (max 5MB)" });
    }
    return res.status(400).json({ message: err.message });
  }
  next();
};
