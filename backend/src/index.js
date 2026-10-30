const express = require("express");
const cors = require("cors");
const config = require("./config/env.config");
const apiRoutes = require("./routes/api.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    cashrampEnv: config.cashramp.env,
    keyConfigured: Boolean(config.cashramp.secretKey),
  });
});

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 PayExpress Backend API running on port ${config.port}`);
  console.log(`🌐 Base URL: http://localhost:${config.port}`);
  console.log(`🔑 Cashramp SDK: Active (${config.cashramp.env.toUpperCase()} mode)`);
  console.log(`====================================================`);
});
