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
  pgm.createTable("owners", {
    owner_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    owner_name: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    contact_email: {
      type: "VARCHAR(255)",
      notNull: false,
    },
    contact_phone: {
      type: "VARCHAR(20)",
      notNull: false,
    },
    address: {
      type: "TEXT",
      notNull: false,
    },
    notes: {
      type: "TEXT",
      notNull: false,
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
  });

  // Create indexes
  pgm.createIndex("owners", "owner_name");
  pgm.createIndex("owners", "contact_email");
  pgm.createIndex("owners", "is_active");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("owners");
};
