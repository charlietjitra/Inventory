// ============================================================================
// API ROUTES - SPECIES
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const speciesController = require("../controllers/speciesController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create species
router.post(
  "/",
  validate(schemas.createSpecies),
  asyncHandler(speciesController.createSpecies),
);

// Get all species
router.get("/", asyncHandler(speciesController.getAllSpecies));

// Get species by ID
router.get("/:id", asyncHandler(speciesController.getSpeciesById));

// Update species
router.put(
  "/:id",
  validate(schemas.updateSpecies),
  asyncHandler(speciesController.updateSpecies),
);

// Get subspecies for species
router.get(
  "/:id/subspecies",
  asyncHandler(speciesController.getSubspeciesBySpeciesId),
);

module.exports = router;
