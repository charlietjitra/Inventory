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
  pgm.createTable("size_categories", {
    size_category_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    category_name: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
    description: {
      type: "TEXT",
      notNull: false,
    },
    sort_order: {
      type: "INTEGER",
      notNull: true,
      default: 0,
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
  pgm.createIndex("size_categories", "category_name");
  pgm.createIndex("size_categories", "sort_order");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("size_categories");
};
