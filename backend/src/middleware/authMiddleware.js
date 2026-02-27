// ============================================================================
// AUTH MIDDLEWARE (JWT)
// ============================================================================

const jwt = require("jsonwebtoken");
const { BusinessError } = require("./errorHandler");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Verify JWT token and extract user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new BusinessError("No token provided", 401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw new BusinessError("Invalid or expired token", 401, "Unauthorized");
  }
};

// Require authenticated user
const requireAuth = (req, res, next) => {
  if (!req.user) {
    throw new BusinessError("Not authenticated", 401, "Unauthorized");
  }
  next();
};

// Require specific role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new BusinessError("Not authenticated", 401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new BusinessError("Insufficient permissions", 403, "Forbidden");
    }

    next();
  };
};

// Require admin role
const requireAdmin = requireRole(["ADMIN"]);

module.exports = {
  verifyToken,
  requireAuth,
  requireRole,
  requireAdmin,
};
