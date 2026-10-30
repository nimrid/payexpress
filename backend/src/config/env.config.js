require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  cashramp: {
    env: process.env.CASHRAMP_ENV || "test",
    secretKey: process.env.CASHRAMP_SECRET_KEY,
  },
  nimiq: {
    network: process.env.NIMIQ_NETWORK || "albatross",
    nimUsdRate: parseFloat(process.env.NIM_USD_RATE) || 0.00325,
  },
  polygon: {
    chainId: "0x89",
    usdtContract: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    usdcContract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    // Cashramp Settlement Pool on Polygon
    cashrampDepositPool: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  },
};

module.exports = config;
