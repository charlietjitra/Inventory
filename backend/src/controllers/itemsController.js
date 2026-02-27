// ============================================================================
// ITEMS CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../middleware/pagination");

const itemsController = {
  // Create new item (unique combination of species + subspecies + size)
  async createItem(req, res) {
    const { species_id, subspecies_id, size_category_id } = req.validated;

    // Verify all references exist
    const speciesResult = await pool.query(
      "SELECT * FROM species WHERE species_id = $1",
      [species_id],
    );
    if (speciesResult.rows.length === 0) {
      throw new BusinessError("Species not found", 404, "Not Found");
    }

    const subspeciesResult = await pool.query(
      "SELECT * FROM subspecies WHERE subspecies_id = $1",
      [subspecies_id],
    );
    if (subspeciesResult.rows.length === 0) {
      throw new BusinessError("Subspecies not found", 404, "Not Found");
    }

    const sizeCategoryResult = await pool.query(
      "SELECT * FROM size_categories WHERE size_category_id = $1",
      [size_category_id],
    );
    if (sizeCategoryResult.rows.length === 0) {
      throw new BusinessError("Size category not found", 404, "Not Found");
    }

    const result = await pool.query(
      "INSERT INTO items (species_id, subspecies_id, size_category_id) VALUES ($1, $2, $3) RETURNING *",
      [species_id, subspecies_id, size_category_id],
    );

    res.status(201).json(result.rows[0]);
  },

  // Get all items with full catalog details (paginated)
  async getAllItems(req, res) {
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query("SELECT COUNT(*) FROM v_item_catalog");
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      "SELECT * FROM v_item_catalog ORDER BY item_id LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },

  // Get item by ID
  async getItemById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM v_item_catalog WHERE item_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Item not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Get items by species (with pagination)
  async getItemsBySpecies(req, res) {
    const { species_id } = req.params;
    const { page, limit, offset } = getPaginationParams(req, 50);

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM v_item_catalog WHERE species_id = $1",
      [species_id],
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      "SELECT * FROM v_item_catalog WHERE species_id = $1 ORDER BY subspecies_name, category_name LIMIT $2 OFFSET $3",
      [species_id, limit, offset],
    );

    res.json(formatPaginatedResponse(result.rows, total, page, limit));
  },
};

module.exports = itemsController;
