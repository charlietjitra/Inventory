// ============================================================================
// SIZE CATEGORIES CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");

const sizeCategoriesController = {
  // Create new size category
  async createSizeCategory(req, res) {
    const { category_name, min_weight_kg, max_weight_kg } = req.validated;

    const result = await pool.query(
      "INSERT INTO size_categories (category_name, min_weight_kg, max_weight_kg) VALUES ($1, $2, $3) RETURNING *",
      [category_name, min_weight_kg, max_weight_kg],
    );

    res.status(201).json(result.rows[0]);
  },

  // Get all size categories
  async getAllSizeCategories(req, res) {
    const result = await pool.query(
      "SELECT * FROM size_categories ORDER BY min_weight_kg, max_weight_kg",
    );
    res.json(result.rows);
  },

  // Get size category by ID
  async getSizeCategoryById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM size_categories WHERE size_category_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Size category not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Update size category
  async updateSizeCategory(req, res) {
    const { id } = req.params;
    const { category_name, min_weight_kg, max_weight_kg } = req.validated;

    // Check if size category exists
    const existsResult = await pool.query(
      "SELECT * FROM size_categories WHERE size_category_id = $1",
      [id],
    );

    if (existsResult.rows.length === 0) {
      throw new BusinessError("Size category not found", 404, "Not Found");
    }

    const current = existsResult.rows[0];

    const result = await pool.query(
      "UPDATE size_categories SET category_name = $1, min_weight_kg = $2, max_weight_kg = $3 WHERE size_category_id = $4 RETURNING *",
      [
        category_name || current.category_name,
        min_weight_kg !== undefined ? min_weight_kg : current.min_weight_kg,
        max_weight_kg !== undefined ? max_weight_kg : current.max_weight_kg,
        id,
      ],
    );

    res.json(result.rows[0]);
  },
};

module.exports = sizeCategoriesController;
