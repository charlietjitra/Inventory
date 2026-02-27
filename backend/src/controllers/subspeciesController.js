// ============================================================================
// SUBSPECIES CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");

const subspeciesController = {
  // Create new subspecies
  async createSubspecies(req, res) {
    const { species_id, subspecies_name, description } = req.validated;

    // Verify species exists
    const speciesResult = await pool.query(
      "SELECT * FROM species WHERE species_id = $1",
      [species_id],
    );

    if (speciesResult.rows.length === 0) {
      throw new BusinessError("Species not found", 404, "Not Found");
    }

    const result = await pool.query(
      "INSERT INTO subspecies (species_id, subspecies_name, description) VALUES ($1, $2, $3) RETURNING *",
      [species_id, subspecies_name, description || null],
    );

    res.status(201).json(result.rows[0]);
  },

  // Get all subspecies
  async getAllSubspecies(req, res) {
    const result = await pool.query(
      `SELECT sb.*, sp.species_name 
       FROM subspecies sb
       JOIN species sp ON sb.species_id = sp.species_id
       ORDER BY sp.species_name, sb.subspecies_name`,
    );
    res.json(result.rows);
  },

  // Get subspecies by ID
  async getSubspeciesById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT sb.*, sp.species_name 
       FROM subspecies sb
       JOIN species sp ON sb.species_id = sp.species_id
       WHERE sb.subspecies_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Subspecies not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Update subspecies
  async updateSubspecies(req, res) {
    const { id } = req.params;
    const { subspecies_name, description } = req.validated;

    // Check if subspecies exists
    const existsResult = await pool.query(
      "SELECT * FROM subspecies WHERE subspecies_id = $1",
      [id],
    );

    if (existsResult.rows.length === 0) {
      throw new BusinessError("Subspecies not found", 404, "Not Found");
    }

    const current = existsResult.rows[0];

    const result = await pool.query(
      "UPDATE subspecies SET subspecies_name = $1, description = $2 WHERE subspecies_id = $3 RETURNING *",
      [
        subspecies_name || current.subspecies_name,
        description !== undefined ? description : current.description,
        id,
      ],
    );

    res.json(result.rows[0]);
  },
};

module.exports = subspeciesController;
