// ============================================================================
// API ROUTES - OWNERS
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const ownersController = require("../controllers/ownersController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create owner
router.post(
  "/",
  validate(schemas.createOwner),
  asyncHandler(ownersController.createOwner),
);

// Get all owners
router.get("/", asyncHandler(ownersController.getAllOwners));

// Get owner by ID
router.get("/:id", asyncHandler(ownersController.getOwnerById));

// Update owner
router.put(
  "/:id",
  validate(schemas.updateOwner),
  asyncHandler(ownersController.updateOwner),
);

// Remove owner (soft delete)
router.delete("/:id", asyncHandler(ownersController.removeOwner));

// Add item to owner
router.post(
  "/items/add",
  validate(schemas.addItemToOwner),
  asyncHandler(ownersController.addItemToOwner),
);

// Remove item from owner
router.delete(
  "/items/remove",
  validate(schemas.removeItemFromOwner),
  asyncHandler(ownersController.removeItemFromOwner),
);

module.exports = router;
