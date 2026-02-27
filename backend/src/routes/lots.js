// ============================================================================
// API ROUTES - LOTS
// ============================================================================

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const lotsController = require("../controllers/lotsController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all lots
router.get("/", asyncHandler(lotsController.getAllLots));

// Get lot by ID
router.get("/:id", asyncHandler(lotsController.getLotById));

// Get available (empty) lots
router.get("/available/only", asyncHandler(lotsController.getAvailableLots));

// Get lot history
router.get("/:id/history", asyncHandler(lotsController.getLotHistory));

// Get lot statistics
router.get("/stats/overview", asyncHandler(lotsController.getLotStats));

module.exports = router;
