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
  pgm.createTable("users", {
    user_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    username: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
    email: {
      type: "VARCHAR(255)",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    role: {
      type: "VARCHAR(20)",
      notNull: true,
      default: "'user'",
      check: "role IN ('admin', 'user')",
    },
    is_active: {
      type: "BOOLEAN",
      notNull: true,
      default: true,
    },
    created_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    updated_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    last_login: {
      type: "TIMESTAMP WITH TIME ZONE",
      notNull: false,
    },
  });

  // Create indexes for better performance
  pgm.createIndex("users", "username");
  pgm.createIndex("users", "email");
  pgm.createIndex("users", "is_active");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("users");
};
