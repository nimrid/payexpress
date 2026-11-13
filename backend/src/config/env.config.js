const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config(); // fallback to cwd

const rawSecret = (process.env.CASHRAMP_SECRET_KEY || "").trim();
const rawPublic = (process.env.CASHRAMP_PUBLIC_KEY || process.env.CASHRAMP_API_KEY || "").trim();

const isPub = (k) => typeof k === "string" && k.startsWith("CSHRMP-PUBK_");
const isSec = (k) => typeof k === "string" && k.startsWith("CSHRMP-SECK_");

// If the user supplied a PUBK into CASHRAMP_SECRET_KEY, treat it as publicKey
const publicKey = rawPublic || (isPub(rawSecret) ? rawSecret : null) || "CSHRMP-PUBK_HamT0iejk40UYXA6";

// Cashramp GraphQL requires a Secret Key (CSHRMP-SECK_...) for mutations (quotes, customers, deposits, withdrawals).
const secretKey = isSec(rawSecret) ? rawSecret : (process.env.CASHRAMP_MUTATION_KEY || "CSHRMP-SECK_ArOjcxRdVmfolD6m");

// Cashramp SDK accepts env: "test" or "live"
const rawEnv = (process.env.CASHRAMP_ENV || "").toLowerCase().trim();
const normalizedEnv = (rawEnv === "production" || rawEnv === "prod" || rawEnv === "live") ? "live" : "test";

const config = {
  port: parseInt(process.env.PORT, 10) || 5001,
  cashramp: {
    env: normalizedEnv,
    publicKey,
    secretKey,
  },
  changenow: {
    apiKey: (process.env.CHANGENOW_API_KEY || "").trim(),
    baseUrl: (process.env.CHANGENOW_BASE_URL || "https://api.changenow.io").replace(/\/$/, ""),
  },
  nimiq: {
    network: process.env.NIMIQ_NETWORK || "albatross",
    nimUsdRate: parseFloat(process.env.NIM_USD_RATE) || 0.00325,
  },
  polygon: {
    chainId: "0x89",
    usdtContract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    // Cashramp Settlement Pool on Polygon
    cashrampDepositPool: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  },
};

module.exports = config;
