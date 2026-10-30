const Cashramp = require("cashramp");
const config = require("./env.config");

let client = null;

if (config.cashramp.secretKey) {
  try {
    client = new Cashramp({
      env: config.cashramp.env,
      secretKey: config.cashramp.secretKey,
    });
    console.log(`[Cashramp] Client initialized successfully in ${config.cashramp.env.toUpperCase()} mode.`);
  } catch (err) {
    console.error("[Cashramp] Initialization failed:", err.message);
  }
} else {
  console.warn("[Cashramp] WARNING: CASHRAMP_SECRET_KEY is not defined in .env");
}

module.exports = client;
