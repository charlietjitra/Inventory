// ============================================================================
// API ROUTES - ITEMS
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const itemsController = require("../controllers/itemsController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create item
router.post(
  "/",
  validate(schemas.createItem),
  asyncHandler(itemsController.createItem),
);

// Get all items
router.get("/", asyncHandler(itemsController.getAllItems));

// Get item by ID
router.get("/:id", asyncHandler(itemsController.getItemById));

// Get items by species
router.get(
  "/species/:species_id",
  asyncHandler(itemsController.getItemsBySpecies),
);

module.exports = router;
