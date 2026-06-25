/**
 * server.js — Entry point for the VRS backend
 *
 * Loads environment variables, imports the Express app,
 * and starts listening on the configured port.
 */

const dotenv = require("dotenv");

// Load .env before anything else
dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 VRS server running on http://localhost:${PORT}`);
});
