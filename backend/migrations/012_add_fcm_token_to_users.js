/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Add FCM token column to users table
  pgm.addColumn("users", {
    fcm_token: {
      type: "TEXT",
      notNull: false,
      comment: "Firebase Cloud Messaging token for push notifications",
    },
  });

  // Add updated_at to track when token was last updated
  pgm.addColumn("users", {
    fcm_token_updated_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: false,
      comment: "When the FCM token was last updated",
    },
  });

  // Create index for faster lookups
  pgm.createIndex("users", "fcm_token", {
    name: "idx_users_fcm_token",
    where: "fcm_token IS NOT NULL",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("users", "fcm_token", { name: "idx_users_fcm_token" });
  pgm.dropColumn("users", "fcm_token_updated_at");
  pgm.dropColumn("users", "fcm_token");
};
