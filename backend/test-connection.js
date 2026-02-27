const pool = require("./src/db");

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connection successful!");
    console.log("Current database time:", result.rows[0].now);

    // Test by running a real query
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("\n📊 Tables in database:");
    console.log(tables.rows.map((t) => t.table_name).join("\n"));

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testConnection();
