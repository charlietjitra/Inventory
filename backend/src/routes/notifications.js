// ============================================================================
// NOTIFICATIONS ROUTES - FCM Push Notifications
// ============================================================================

const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const { validate, schemas } = require("../middleware/validation");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(verifyToken);

// Save FCM token for current user
router.post(
  "/fcm-token",
  validate(schemas.saveFCMToken),
  notificationsController.saveFCMToken,
);

// Remove FCM token for current user
router.delete("/fcm-token", notificationsController.removeFCMToken);

// Get current user's notification status
router.get("/status", notificationsController.getNotificationStatus);

// Send notification to specific user (admin/manager only)
router.post(
  "/send-to-user",
  validate(schemas.sendNotificationToUser),
  requireRole(["ADMIN", "MANAGER"]),
  notificationsController.sendNotificationToUser,
);

// Send broadcast notification to all users (admin only)
router.post(
  "/broadcast",
  validate(schemas.sendBroadcastNotification),
  requireRole(["ADMIN"]),
  notificationsController.sendBroadcastNotification,
);

// Test notification endpoint (development only)
router.post("/test", notificationsController.testNotification);

module.exports = router;
