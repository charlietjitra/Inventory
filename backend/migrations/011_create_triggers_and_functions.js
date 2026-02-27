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
  // Add triggers to automatically update updated_at columns
  pgm.sql(`
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add triggers to all tables with updated_at columns
  const tables = [
    "users",
    "species",
    "subspecies",
    "size_categories",
    "items",
    "owners",
    "pallets",
    "lots",
  ];

  tables.forEach((table) => {
    pgm.sql(`
      CREATE TRIGGER set_timestamp_${table}
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);
  });

  // Create function for calculating total_value automatically
  pgm.sql(`
    CREATE OR REPLACE FUNCTION calculate_lot_total_value()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.quantity IS NOT NULL AND NEW.unit_price IS NOT NULL THEN
        NEW.total_value = NEW.quantity * NEW.unit_price;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add trigger to automatically calculate total_value in lots table
  pgm.sql(`
    CREATE TRIGGER calculate_total_value_lots
    BEFORE INSERT OR UPDATE ON lots
    FOR EACH ROW
    EXECUTE PROCEDURE calculate_lot_total_value();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop triggers
  const tables = [
    "users",
    "species",
    "subspecies",
    "size_categories",
    "items",
    "owners",
    "pallets",
    "lots",
  ];

  tables.forEach((table) => {
    pgm.sql(`DROP TRIGGER IF EXISTS set_timestamp_${table} ON ${table};`);
  });

  pgm.sql(`DROP TRIGGER IF EXISTS calculate_total_value_lots ON lots;`);

  // Drop functions
  pgm.sql(`DROP FUNCTION IF EXISTS trigger_set_timestamp();`);
  pgm.sql(`DROP FUNCTION IF EXISTS calculate_lot_total_value();`);
};
