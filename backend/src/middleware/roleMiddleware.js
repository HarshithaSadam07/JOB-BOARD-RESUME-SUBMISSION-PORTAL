export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

// Optional: Check if recruiter owns company resource
export const requireCompanyOwnership = (getCompanyIdFn) => {
  return async (req, res, next) => {
    try {
      const resourceCompanyId = await getCompanyIdFn(req);
      const requesterCompanyId = req.user.companyId?.toString();

      if (!resourceCompanyId || resourceCompanyId.toString() !== requesterCompanyId) {
        return res.status(403).json({ message: "You do not own this company resource" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
