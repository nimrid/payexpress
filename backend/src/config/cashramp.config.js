const Cashramp = require("cashramp");
const config = require("./env.config");

let queryClient = null;
let mutationClient = null;

try {
  if (config.cashramp.publicKey) {
    queryClient = new Cashramp({
      env: config.cashramp.env,
      secretKey: config.cashramp.publicKey,
    });
  }
  if (config.cashramp.secretKey) {
    mutationClient = new Cashramp({
      env: config.cashramp.env,
      secretKey: config.cashramp.secretKey,
    });
  }
  console.log(`[Cashramp] Clients initialized successfully in ${config.cashramp.env.toUpperCase()} mode.`);
  if (config.cashramp.publicKey) {
    console.log(`[Cashramp] Active Public Key: ${config.cashramp.publicKey}`);
  }
  if (config.cashramp.secretKey) {
    console.log(`[Cashramp] Active Secret Key: ${config.cashramp.secretKey.slice(0, 15)}...`);
  }
} catch (err) {
  console.error("[Cashramp] Client initialization error:", err.message);
}

const getQClient = () => queryClient || mutationClient;
const getMClient = () => mutationClient || queryClient;

const activeClient = {
  // Queries (powered by Public Key)
  getAvailableCountries: () => getQClient().getAvailableCountries(),
  getMarketRate: (args) => getQClient().getMarketRate(args),
  getPaymentMethodTypes: (args) => getQClient().getPaymentMethodTypes(args),
  getRampableAssets: () => getQClient().getRampableAssets(),
  getRampLimits: () => getQClient().getRampLimits(),
  getPaymentRequest: (args) => getQClient().getPaymentRequest(args),
  getAccount: () => getMClient().getAccount(),

  // Mutations (powered by Secret Key)
  createCustomer: (args) => getMClient().createCustomer(args),
  addPaymentMethod: (args) => getMClient().addPaymentMethod(args),
  getRampQuote: (args) => getMClient().getRampQuote(args),
  refreshRampQuote: (args) => getMClient().refreshRampQuote(args),
  initiateRampQuoteDeposit: (args) => getMClient().initiateRampQuoteDeposit(args),
  initiateRampQuoteWithdrawal: (args) => getMClient().initiateRampQuoteWithdrawal(args),
  markDepositAsPaid: (args) => getMClient().markDepositAsPaid(args),
  markWithdrawalAsReceived: (args) => getMClient().markWithdrawalAsReceived(args),
  cancelDeposit: (args) => getMClient().cancelDeposit(args),
  confirmTransaction: (args) => getMClient().confirmTransaction(args),
  initiateHostedPayment: (args) => getMClient().initiateHostedPayment(args),
  withdrawOnchain: (args) => getMClient().withdrawOnchain(args),
};

module.exports = activeClient;
