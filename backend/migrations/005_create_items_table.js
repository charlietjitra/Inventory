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
  pgm.createTable("items", {
    item_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    species_id: {
      type: "INTEGER",
      notNull: true,
      references: "species",
      onDelete: "CASCADE",
    },
    subspecies_id: {
      type: "INTEGER",
      notNull: false,
      references: "subspecies",
      onDelete: "CASCADE",
    },
    size_category_id: {
      type: "INTEGER",
      notNull: true,
      references: "size_categories",
      onDelete: "CASCADE",
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

  // Create unique constraint on the combination to prevent duplicate items
  pgm.addConstraint("items", "unique_item_combination", {
    unique: ["species_id", "subspecies_id", "size_category_id"],
  });

  // Create indexes for foreign keys
  pgm.createIndex("items", "species_id");
  pgm.createIndex("items", "subspecies_id");
  pgm.createIndex("items", "size_category_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("items");
};
