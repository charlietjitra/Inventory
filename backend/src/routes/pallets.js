// ============================================================================
// API ROUTES - PALLETS (CRITICAL)
// ============================================================================

const express = require("express");
const router = express.Router();
const { validate, schemas } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/authMiddleware");
const palletsController = require("../controllers/palletsController");

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create pallet
router.post(
  "/",
  validate(schemas.createPallet),
  asyncHandler(palletsController.createPallet),
);

// Get all pallets
router.get("/", asyncHandler(palletsController.getAllPallets));

// Get pallet detail (optimized - returns everything needed for detail page)
router.get(
  "/:id/detail",
  asyncHandler(palletsController.getPalletDetailOptimized),
);

// Get pallet status
router.get("/:id", asyncHandler(palletsController.getPalletStatus));

// Get pallet history (all movements and contents changes)
router.get("/:id/history", asyncHandler(palletsController.getPalletHistory));

// Get pallet storage duration stats
router.get(
  "/storage/duration",
  asyncHandler(palletsController.getPalletStorageDuration),
);

router.post(
  "/:id/assign-location",
  validate(schemas.assignLocation),
  asyncHandler(palletsController.assignLocationToPallet),
);

router.post(
  "/:id/add-contents",
  validate(schemas.addContents),
  asyncHandler(palletsController.addContentsToPallet),
);

router.post(
  "/:id/remove-contents",
  validate(schemas.removeContents),
  asyncHandler(palletsController.removeContentsFromPallet),
);

router.post(
  "/:id/move",
  validate(schemas.movePallet),
  asyncHandler(palletsController.movePallet),
);

module.exports = router;
