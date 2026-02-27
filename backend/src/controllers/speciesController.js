// ============================================================================
// SPECIES CONTROLLER
// ============================================================================

const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");

const speciesController = {
  // Create new species
  async createSpecies(req, res) {
    const { species_name, description } = req.validated;

    const result = await pool.query(
      "INSERT INTO species (species_name, description) VALUES ($1, $2) RETURNING *",
      [species_name, description || null],
    );

    res.status(201).json(result.rows[0]);
  },

  // Get all species
  async getAllSpecies(req, res) {
    const result = await pool.query(
      "SELECT * FROM species ORDER BY species_id",
    );
    res.json(result.rows);
  },

  // Get species by ID
  async getSpeciesById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM species WHERE species_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Species not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Update species
  async updateSpecies(req, res) {
    const { id } = req.params;
    const { species_name, description } = req.validated;

    // Check if species exists
    const existsResult = await pool.query(
      "SELECT * FROM species WHERE species_id = $1",
      [id],
    );

    if (existsResult.rows.length === 0) {
      throw new BusinessError("Species not found", 404, "Not Found");
    }

    const current = existsResult.rows[0];

    const result = await pool.query(
      "UPDATE species SET species_name = $1, description = $2 WHERE species_id = $3 RETURNING *",
      [
        species_name || current.species_name,
        description !== undefined ? description : current.description,
        id,
      ],
    );

    res.json(result.rows[0]);
  },

  // Get subspecies for a species
  async getSubspeciesBySpeciesId(req, res) {
    const { id } = req.params;

    // Verify species exists
    const speciesResult = await pool.query(
      "SELECT * FROM species WHERE species_id = $1",
      [id],
    );

    if (speciesResult.rows.length === 0) {
      throw new BusinessError("Species not found", 404, "Not Found");
    }

    const result = await pool.query(
      "SELECT * FROM subspecies WHERE species_id = $1 ORDER BY subspecies_id",
      [id],
    );

    res.json(result.rows);
  },
};

module.exports = speciesController;
