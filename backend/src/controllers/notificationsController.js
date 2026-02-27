// ============================================================================
// NOTIFICATIONS CONTROLLER - FCM Push Notifications
// ============================================================================

const pool = require("../db");
const {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
} = require("../config/firebaseAdmin");
const { BusinessError } = require("../middleware/errorHandler");

const notificationsController = {
  // Save FCM token for user
  async saveFCMToken(req, res) {
    const { token } = req.validated;
    const userId = req.user.user_id;
    const username = req.user.username;

    console.log(`💾 Saving FCM token for user ${username} (ID: ${userId})`);
    console.log(`🎯 Token: ${token ? token.substring(0, 20) + "..." : "null"}`);

    try {
      const result = await pool.query(
        `UPDATE users 
         SET fcm_token = $1, fcm_token_updated_at = NOW() 
         WHERE user_id = $2 
         RETURNING user_id, username, fcm_token_updated_at`,
        [token, userId],
      );

      if (result.rows.length === 0) {
        console.error(`❌ User not found when saving FCM token: ${userId}`);
        throw new BusinessError("User not found", 404);
      }

      console.log(`✅ FCM token saved successfully for user ${username}`);
      console.log(`📅 Updated at: ${result.rows[0].fcm_token_updated_at}`);

      res.status(200).json({
        success: true,
        message: "FCM token saved successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(`❌ Error saving FCM token for user ${userId}:`, error);
      throw error;
    }
  },

  // Remove FCM token (when user logs out or disables notifications)
  async removeFCMToken(req, res) {
    const userId = req.user.user_id;

    try {
      await pool.query(
        `UPDATE users 
         SET fcm_token = NULL, fcm_token_updated_at = NOW() 
         WHERE user_id = $1`,
        [userId],
      );

      res.status(200).json({
        success: true,
        message: "FCM token removed successfully",
      });
    } catch (error) {
      throw error;
    }
  },

  // Send notification to specific user
  async sendNotificationToUser(req, res) {
    const { userId, title, body, data } = req.validated;

    try {
      // Get user's FCM token
      const userResult = await pool.query(
        "SELECT fcm_token, username FROM users WHERE user_id = $1 AND fcm_token IS NOT NULL",
        [userId],
      );

      if (userResult.rows.length === 0) {
        throw new BusinessError(
          "User not found or no FCM token available",
          404,
        );
      }

      const user = userResult.rows[0];

      // Send notification
      const result = await sendNotificationToDevice(
        user.fcm_token,
        title,
        body,
        data,
      );

      if (!result.success) {
        throw new BusinessError(
          `Failed to send notification: ${result.error}`,
          500,
        );
      }

      res.status(200).json({
        success: true,
        message: `Notification sent to ${user.username}`,
        data: { messageId: result.messageId },
      });
    } catch (error) {
      throw error;
    }
  },

  // Send notification to all users with FCM tokens
  async sendBroadcastNotification(req, res) {
    const { title, body, data } = req.validated;

    try {
      // Get all active users with FCM tokens
      const tokensResult = await pool.query(
        "SELECT fcm_token, username FROM users WHERE fcm_token IS NOT NULL AND is_active = true",
      );

      if (tokensResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No users with FCM tokens found",
          data: { sentCount: 0 },
        });
      }

      const tokens = tokensResult.rows.map((row) => row.fcm_token);

      // Send notifications
      const result = await sendNotificationToMultipleDevices(
        tokens,
        title,
        body,
        data,
      );

      if (!result.success) {
        throw new BusinessError(
          `Failed to send notifications: ${result.error}`,
          500,
        );
      }

      res.status(200).json({
        success: true,
        message: "Broadcast notification sent",
        data: {
          totalTargets: tokens.length,
          successCount: result.successCount,
          failureCount: result.failureCount,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // Test notification endpoint (development only)
  async testNotification(req, res) {
    if (process.env.NODE_ENV === "production") {
      throw new BusinessError("Test endpoint not available in production", 403);
    }

    const userId = req.user.user_id;

    try {
      // Get user's FCM token
      const userResult = await pool.query(
        "SELECT fcm_token, username FROM users WHERE user_id = $1 AND fcm_token IS NOT NULL",
        [userId],
      );

      if (userResult.rows.length === 0) {
        throw new BusinessError("No FCM token found for user", 404);
      }

      const user = userResult.rows[0];

      // Send test notification
      const result = await sendNotificationToDevice(
        user.fcm_token,
        "Test Notification",
        `Hello ${user.username}! This is a test notification from the warehouse inventory system.`,
        { type: "test", timestamp: new Date().toISOString() },
      );

      if (!result.success) {
        throw new BusinessError(
          `Failed to send test notification: ${result.error}`,
          500,
        );
      }

      res.status(200).json({
        success: true,
        message: "Test notification sent successfully",
        data: { messageId: result.messageId },
      });
    } catch (error) {
      throw error;
    }
  },

  // Get user's notification settings/status
  async getNotificationStatus(req, res) {
    const userId = req.user.user_id;

    try {
      const result = await pool.query(
        "SELECT fcm_token IS NOT NULL as has_token, fcm_token_updated_at FROM users WHERE user_id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        throw new BusinessError("User not found", 404);
      }

      res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      throw error;
    }
  },
};

module.exports = notificationsController;
