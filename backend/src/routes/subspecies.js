// ============================================================================
// API ROUTES - SUBSPECIES
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const subspeciesController = require("../controllers/subspeciesController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create subspecies
router.post(
  "/",
  validate(schemas.createSubspecies),
  asyncHandler(subspeciesController.createSubspecies),
);

// Get all subspecies
router.get("/", asyncHandler(subspeciesController.getAllSubspecies));

// Get subspecies by ID
router.get("/:id", asyncHandler(subspeciesController.getSubspeciesById));

// Update subspecies
router.put(
  "/:id",
  validate(schemas.updateSubspecies),
  asyncHandler(subspeciesController.updateSubspecies),
);

module.exports = router;
