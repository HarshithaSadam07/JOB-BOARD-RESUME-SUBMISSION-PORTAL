import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -createdAt -updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = [
      'title', 'location', 'phone', 'skills', 'experience', 'education', 
      'resumeUrl', 'about', 'website', 'github', 'linkedin'
    ];

    // Only include fields that are in allowedUpdates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v -createdAt -updatedAt');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
