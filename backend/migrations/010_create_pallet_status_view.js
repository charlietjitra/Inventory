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
  // Create pallet current status view
  pgm.createView(
    "v_pallet_current_status",
    {},
    `
    SELECT 
      p.pallet_id,
      p.status,
      p.notes as pallet_notes,
      p.created_at as pallet_created_at,
      p.updated_at as pallet_updated_at,
      COUNT(l.lot_id) as active_lots,
      SUM(CASE WHEN l.status = 'active' THEN l.quantity ELSE 0 END) as total_quantity,
      SUM(CASE WHEN l.status = 'active' THEN l.total_value ELSE 0 END) as total_value
    FROM pallets p
    LEFT JOIN lots l ON p.pallet_id = l.pallet_id
    GROUP BY p.pallet_id, p.status, p.notes, p.created_at, p.updated_at
    ORDER BY p.pallet_id
  `,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropView("v_pallet_current_status");
};
