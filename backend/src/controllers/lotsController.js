// ============================================================================
// LOTS CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../middleware/pagination");

const lotsController = {
  // Get all lots with occupancy status (paginated)
  async getAllLots(req, res) {
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM v_lot_occupancy",
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      "SELECT * FROM v_lot_occupancy ORDER BY lot_letter, depth, height LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },

  // Get lot by ID
  async getLotById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM v_lot_occupancy WHERE lot_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Lot not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Get empty lots only (paginated)
  async getAvailableLots(req, res) {
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM v_lot_occupancy WHERE status = 'EMPTY'",
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      "SELECT * FROM v_lot_occupancy WHERE status = 'EMPTY' ORDER BY lot_letter, depth, height LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },

  // Get lot occupancy history
  async getLotHistory(req, res) {
    const { id } = req.params;

    // Verify lot exists
    const lotResult = await pool.query("SELECT * FROM lots WHERE lot_id = $1", [
      id,
    ]);
    if (lotResult.rows.length === 0) {
      throw new BusinessError("Lot not found", 404, "Not Found");
    }

    const result = await pool.query(
      `SELECT pl.location_id, pl.pallet_id, pl.moved_in_at, pl.moved_out_at, pl.moved_by, pl.notes
       FROM pallet_locations pl
       WHERE pl.lot_id = $1
       ORDER BY pl.moved_in_at DESC`,
      [id],
    );

    res.json(result.rows);
  },

  // Get lot occupancy statistics
  async getLotStats(req, res) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_lots,
        COUNT(CASE WHEN status = 'EMPTY' THEN 1 END) as empty_lots,
        COUNT(CASE WHEN status = 'OCCUPIED' THEN 1 END) as occupied_lots
       FROM v_lot_occupancy`,
    );

    res.json(result.rows[0]);
  },
};

module.exports = lotsController;
