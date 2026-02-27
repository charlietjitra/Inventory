// ============================================================================
// OWNERS CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../middleware/pagination");

const ownersController = {
  // Create new owner
  async createOwner(req, res) {
    const { owner_name, item_id, contact_info } = req.validated;

    // Verify item exists
    const itemResult = await pool.query(
      "SELECT * FROM items WHERE item_id = $1",
      [item_id],
    );
    if (itemResult.rows.length === 0) {
      throw new BusinessError("Item not found", 404, "Not Found");
    }

    const result = await pool.query(
      "INSERT INTO owners (owner_name, item_id, contact_info) VALUES ($1, $2, $3) RETURNING *",
      [owner_name, item_id, contact_info || null],
    );

    res.status(201).json(result.rows[0]);
  },

  // Get all active owners with pagination
  async getAllOwners(req, res) {
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT o.owner_id) as count FROM owners o WHERE o.removed_at IS NULL`,
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      `SELECT DISTINCT o.owner_id, o.owner_name, o.contact_info, o.created_at
       FROM owners o
       WHERE o.removed_at IS NULL
       ORDER BY o.owner_name
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },

  // Get owner by ID
  async getOwnerById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.owner_id, o.owner_name, o.contact_info, o.created_at
       FROM owners o
       WHERE o.owner_id = $1 AND o.removed_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Owner not found", 404, "Not Found");
    }

    // Get items supplied by this owner
    const itemsResult = await pool.query(
      `SELECT i.item_id, s.species_name, sc.category_name, i.size_category_id
       FROM items i
       JOIN owner_items oi ON i.item_id = oi.item_id
       JOIN species s ON i.species_id = s.species_id
       JOIN size_categories sc ON i.size_category_id = sc.size_category_id
       WHERE oi.owner_id = $1
       ORDER BY s.species_name`,
      [id],
    );

    res.json({
      ...result.rows[0],
      items: itemsResult.rows,
    });
  },

  // Update owner
  async updateOwner(req, res) {
    const { id } = req.params;
    const { owner_name, item_id, contact_info } = req.validated;

    // Check if owner exists and is active
    const existsResult = await pool.query(
      "SELECT * FROM owners WHERE owner_id = $1 AND removed_at IS NULL",
      [id],
    );

    if (existsResult.rows.length === 0) {
      throw new BusinessError("Owner not found", 404, "Not Found");
    }

    const current = existsResult.rows[0];

    // If item_id is being updated, verify new item exists
    if (item_id) {
      const itemResult = await pool.query(
        "SELECT * FROM items WHERE item_id = $1",
        [item_id],
      );
      if (itemResult.rows.length === 0) {
        throw new BusinessError("Item not found", 404, "Not Found");
      }
    }

    const result = await pool.query(
      "UPDATE owners SET owner_name = $1, item_id = $2, contact_info = $3 WHERE owner_id = $4 RETURNING *",
      [
        owner_name || current.owner_name,
        item_id || current.item_id,
        contact_info !== undefined ? contact_info : current.contact_info,
        id,
      ],
    );

    res.json(result.rows[0]);
  },

  // Soft delete owner
  async removeOwner(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE owners SET removed_at = NOW() WHERE owner_id = $1 AND removed_at IS NULL RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Owner not found", 404, "Not Found");
    }

    res.json({ message: "Owner removed", owner: result.rows[0] });
  },

  // Add item to owner (establish owner-item relationship)
  async addItemToOwner(req, res) {
    const { owner_id, item_id } = req.validated;

    // Verify owner exists and is active
    const ownerResult = await pool.query(
      "SELECT * FROM owners WHERE owner_id = $1 AND removed_at IS NULL",
      [owner_id],
    );

    if (ownerResult.rows.length === 0) {
      throw new BusinessError("Owner not found or removed", 404, "Not Found");
    }

    // Verify item exists
    const itemResult = await pool.query(
      "SELECT * FROM items WHERE item_id = $1",
      [item_id],
    );

    if (itemResult.rows.length === 0) {
      throw new BusinessError("Item not found", 404, "Not Found");
    }

    // Check if relationship already exists
    const existsResult = await pool.query(
      "SELECT * FROM owner_items WHERE owner_id = $1 AND item_id = $2",
      [owner_id, item_id],
    );

    if (existsResult.rows.length > 0) {
      throw new BusinessError(
        "Owner already supplies this item",
        400,
        "Duplicate Relationship",
      );
    }

    // Create owner-item relationship
    const result = await pool.query(
      "INSERT INTO owner_items (owner_id, item_id, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [owner_id, item_id],
    );

    res.status(201).json({
      message: "Item added to owner",
      ownerItem: result.rows[0],
    });
  },

  // Remove item from owner (delete owner-item relationship)
  async removeItemFromOwner(req, res) {
    const { owner_id, item_id } = req.validated;

    // Verify owner exists
    const ownerResult = await pool.query(
      "SELECT * FROM owners WHERE owner_id = $1 AND removed_at IS NULL",
      [owner_id],
    );

    if (ownerResult.rows.length === 0) {
      throw new BusinessError("Owner not found", 404, "Not Found");
    }

    // Verify relationship exists
    const relationshipResult = await pool.query(
      "SELECT * FROM owner_items WHERE owner_id = $1 AND item_id = $2",
      [owner_id, item_id],
    );

    if (relationshipResult.rows.length === 0) {
      throw new BusinessError(
        "Owner does not supply this item",
        404,
        "Not Found",
      );
    }

    // Delete relationship
    const result = await pool.query(
      "DELETE FROM owner_items WHERE owner_id = $1 AND item_id = $2 RETURNING *",
      [owner_id, item_id],
    );

    res.json({
      message: "Item removed from owner",
      ownerItem: result.rows[0],
    });
  },
};

module.exports = ownersController;
