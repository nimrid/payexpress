const express = require("express");
const router = express.Router();
const rampController = require("../controllers/ramp.controller");

// Country & Payment Methods
router.get("/countries", (req, res) => rampController.getCountries(req, res));
router.get("/rates", (req, res) => rampController.getRates(req, res));
router.get("/payment-methods", (req, res) => rampController.getPaymentMethods(req, res));
router.get("/limits", (req, res) => rampController.getRampLimits(req, res));
router.get("/assets", (req, res) => rampController.getRampableAssets(req, res));
router.get("/banks", (req, res) => rampController.getBanks(req, res));

// Quotes & Verification
router.post("/verify-recipient", (req, res) => rampController.verifyRecipient(req, res));
router.post("/quote", (req, res) => rampController.getQuote(req, res));

// Execution, Offramping & Deposits
router.post("/execute-transaction", (req, res) => rampController.executeTransaction(req, res));
router.post("/initiate-withdrawal", (req, res) => rampController.initiateWithdrawal(req, res));
router.post("/withdraw", (req, res) => rampController.initiateWithdrawal(req, res));
router.post("/add-payment-method", (req, res) => rampController.addPaymentMethod(req, res));
router.post("/confirm-withdrawal-receipt", (req, res) => rampController.confirmWithdrawalReceipt(req, res));
router.post("/initiate-deposit", (req, res) => rampController.initiateDeposit(req, res));
router.post("/mark-deposit-paid", (req, res) => rampController.markDepositPaid(req, res));
router.post("/cancel-deposit", (req, res) => rampController.cancelDeposit(req, res));
router.get("/utility-catalog", (req, res) => rampController.getUtilityCatalog(req, res));

module.exports = router;
