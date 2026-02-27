// ============================================================================
// MAIN SERVER FILE - EXPRESS SETUP
// ============================================================================

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorHandler");
const pool = require("./db");

const authRoutes = require("./routes/auth");
const speciesRoutes = require("./routes/species");
const subspeciesRoutes = require("./routes/subspecies");
const sizeCategoriesRoutes = require("./routes/sizeCategories");
const itemsRoutes = require("./routes/items");
const ownersRoutes = require("./routes/owners");
const lotsRoutes = require("./routes/lots");
const palletsRoutes = require("./routes/pallets");
const notificationsRoutes = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/health/db", async (req, res, next) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({ status: "OK", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/subspecies", subspeciesRoutes);
app.use("/api/size-categories", sizeCategoriesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/owners", ownersRoutes);
app.use("/api/lots", lotsRoutes);
app.use("/api/pallets", palletsRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
});

app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n========================================`);
  console.log(`Warehouse Inventory API`);
  console.log(`========================================`);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://<your-ip>:${PORT}`);
});

process.on("SIGINT", () => {
  console.log("\n shut down ");
  server.close(() => {
    console.log("Server closed");
    pool.end();
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n shut down ");
  server.close(() => {
    console.log("Server closed");
    pool.end();
    process.exit(0);
  });
});
