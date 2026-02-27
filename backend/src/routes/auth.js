// ============================================================================
// AUTH ROUTES (JWT-based)
// ============================================================================

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validate, schemas } = require("../middleware/validation");
const {
  verifyToken,
  requireAuth,
  requireAdmin,
} = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorHandler");

// Public routes
router.post(
  "/register",
  validate(schemas.register),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  validate(schemas.login),
  asyncHandler(authController.login),
);
router.get("/verify", asyncHandler(authController.verifyToken));

// Protected routes (require valid JWT token)
router.get("/me", verifyToken, asyncHandler(authController.getCurrentUser));
router.put(
  "/me",
  verifyToken,
  validate(schemas.updateUserSelf),
  asyncHandler(authController.updateUser),
);
router.put(
  "/:user_id/password",
  verifyToken,
  validate(schemas.changePassword),
  asyncHandler(authController.changePassword),
);

// Admin routes (require valid JWT token + ADMIN role)
router.get(
  "/",
  verifyToken,
  requireAdmin,
  asyncHandler(authController.getAllUsers),
);
router.get(
  "/:id",
  verifyToken,
  requireAdmin,
  asyncHandler(authController.getUserById),
);
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validate(schemas.updateUser),
  asyncHandler(authController.updateUser),
);

module.exports = router;
