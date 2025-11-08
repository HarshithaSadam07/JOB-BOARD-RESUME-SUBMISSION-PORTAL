import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      companyId: user.companyId || null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || "7d" }
  );
};
