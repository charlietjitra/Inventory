// ============================================================================
// API ROUTES - SIZE CATEGORIES
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const sizeCategoriesController = require("../controllers/sizeCategoriesController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create size category
router.post(
  "/",
  validate(schemas.createSizeCategory),
  asyncHandler(sizeCategoriesController.createSizeCategory),
);

// Get all size categories
router.get("/", asyncHandler(sizeCategoriesController.getAllSizeCategories));

// Get size category by ID
router.get("/:id", asyncHandler(sizeCategoriesController.getSizeCategoryById));

// Update size category
router.put(
  "/:id",
  validate(schemas.updateSizeCategory),
  asyncHandler(sizeCategoriesController.updateSizeCategory),
);

module.exports = router;
