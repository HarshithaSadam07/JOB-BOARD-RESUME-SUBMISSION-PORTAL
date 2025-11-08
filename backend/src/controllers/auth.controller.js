import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    // Harden role assignment: disallow creating admin from public register
    const safeRole = role === "recruiter" ? "recruiter" : "candidate";
    const user = await User.create({ name, email, password, role: safeRole });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId || null },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId || null },
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refresh token
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: "Invalid refresh token" });

    res.json({
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    });
  } catch (err) {
    res.status(401).json({ message: "Expired or invalid refresh token" });
  }
};

// Get logged-in user info
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Secure admin creation (seed) endpoint
// Guarded by ADMIN_SEED_TOKEN passed via 'x-seed-token' header
export const seedAdmin = async (req, res) => {
  try {
    const token = req.headers["x-seed-token"];
    if (!process.env.ADMIN_SEED_TOKEN || token !== process.env.ADMIN_SEED_TOKEN) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email & password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: "admin" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId || null },
      accessToken,
      refreshToken
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
