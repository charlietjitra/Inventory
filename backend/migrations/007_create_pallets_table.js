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
  pgm.createTable("pallets", {
    pallet_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    status: {
      type: "VARCHAR(50)",
      notNull: true,
      default: "'available'",
      check: "status IN ('available', 'in_use', 'maintenance', 'damaged')",
    },
    notes: {
      type: "TEXT",
      notNull: false,
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

  // Create index for status lookups
  pgm.createIndex("pallets", "status");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("pallets");
};
