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
  // Create item catalog view that joins items with species, subspecies, and size categories
  pgm.createView(
    "v_item_catalog",
    {},
    `
    SELECT 
      i.item_id,
      i.species_id,
      s.species_name,
      i.subspecies_id,
      sub.subspecies_name,
      i.size_category_id,
      sc.category_name,
      i.created_at,
      i.updated_at
    FROM items i
    JOIN species s ON i.species_id = s.species_id
    LEFT JOIN subspecies sub ON i.subspecies_id = sub.subspecies_id
    JOIN size_categories sc ON i.size_category_id = sc.size_category_id
    ORDER BY s.species_name, sub.subspecies_name, sc.sort_order
  `,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropView("v_item_catalog");
};
