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
  pgm.createTable("subspecies", {
    subspecies_id: {
      type: "SERIAL",
      primaryKey: true,
    },
    species_id: {
      type: "INTEGER",
      notNull: true,
      references: "species",
      onDelete: "CASCADE",
    },
    subspecies_name: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    description: {
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

  // Create unique constraint on species_id + subspecies_name combination
  pgm.addConstraint("subspecies", "unique_subspecies_per_species", {
    unique: ["species_id", "subspecies_name"],
  });

  // Create indexes
  pgm.createIndex("subspecies", "species_id");
  pgm.createIndex("subspecies", "subspecies_name");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("subspecies");
};
