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
  pgm.createTable("lots", {
    lot_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    item_id: {
      type: "INTEGER",
      notNull: true,
      references: "items",
      onDelete: "CASCADE",
    },
    owner_id: {
      type: "INTEGER",
      notNull: true,
      references: "owners",
      onDelete: "CASCADE",
    },
    pallet_id: {
      type: "INTEGER",
      notNull: false,
      references: "pallets",
      onDelete: "SET NULL",
    },
    quantity: {
      type: "INTEGER",
      notNull: true,
      check: "quantity > 0",
    },
    unit_price: {
      type: "DECIMAL(10,2)",
      notNull: false,
    },
    total_value: {
      type: "DECIMAL(12,2)",
      notNull: false,
    },
    status: {
      type: "VARCHAR(50)",
      notNull: true,
      default: "'active'",
      check: "status IN ('active', 'sold', 'damaged', 'returned')",
    },
    received_date: {
      type: "DATE",
      notNull: true,
      default: pgm.func("CURRENT_DATE"),
    },
    expiry_date: {
      type: "DATE",
      notNull: false,
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

  // Create indexes for foreign keys and common queries
  pgm.createIndex("lots", "item_id");
  pgm.createIndex("lots", "owner_id");
  pgm.createIndex("lots", "pallet_id");
  pgm.createIndex("lots", "status");
  pgm.createIndex("lots", "received_date");
  pgm.createIndex("lots", "expiry_date");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("lots");
};
