// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

/**
 * Run database migrations
 * @param {string} command - up, down, redo, reset, status
 * @returns {Promise<void>}
 */
async function runMigration(command = "up") {
  return new Promise((resolve, reject) => {
    const migrationDir = path.join(__dirname, "..", "migrations");

    const env = {
      ...process.env,
      DATABASE_URL: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      PGMIGRATIONS_DIR: migrationDir,
    };

    const child = spawn("node-pg-migrate", [command], {
      stdio: "inherit",
      env,
      cwd: path.join(__dirname, ".."),
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Migration failed with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Initialize database (run all migrations)
 */
async function initializeDatabase() {
  console.log("Initializing database...");
  try {
    await runMigration("up");
    console.log("✓ Database initialized successfully");
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message);
    throw error;
  }
}

/**
 * Reset database (for development only)
 */
async function resetDatabase() {
  console.log("Resetting database...");
  try {
    await runMigration("reset");
    console.log("✓ Database reset successfully");
  } catch (error) {
    console.error("✗ Database reset failed:", error.message);
    throw error;
  }
}

/**
 * Check migration status
 */
async function checkMigrationStatus() {
  console.log("Checking migration status...");
  try {
    await runMigration("status");
  } catch (error) {
    console.error("✗ Failed to check status:", error.message);
    throw error;
  }
}

module.exports = {
  runMigration,
  initializeDatabase,
  resetDatabase,
  checkMigrationStatus,
};
