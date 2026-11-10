const client = require("../config/cashramp.config");
const { COUNTRY_METADATA } = require("../data/countries.data");

// In-memory cache for customer IDs to avoid re-creating on every request
const customerCache = new Map();

class CashrampService {
  /**
   * Fetch all live Cashramp-supported African countries from Cashramp API
   */
  async getCountries() {
    if (!client) throw new Error("Cashramp client not configured");

    const response = await client.getAvailableCountries();
    if (!response || !response.success || !Array.isArray(response.result)) {
      throw new Error(response?.error || "Failed to fetch live available countries from Cashramp");
    }

    return response.result.map((c) => {
      const code = (c.code || "").toUpperCase();
      const meta = COUNTRY_METADATA[code] || {};
      return {
        id: c.id,
        name: c.name,
        code,
        currency: meta.currency || "USD",
        symbol: meta.symbol || "$",
        flag: meta.flag || "🌍",
        dial: meta.dial || "",
        region: meta.region || "Africa",
        defaultPaymentMethod: meta.defaultPaymentMethod || null,
        supportedMethods: meta.supportedMethods || [],
        isLiveSandbox: true,
      };
    });
  }

  /**
   * Fetch live deposit and withdrawal market rates for any supported country from Cashramp API
   */
  async getMarketRates(countryCode) {
    if (!client) throw new Error("Cashramp client not configured");
    const code = (countryCode || "NG").toUpperCase();
    const meta = COUNTRY_METADATA[code] || {};

    const response = await client.getMarketRate({ countryCode: code });
    if (!response || !response.success || !response.result) {
      throw new Error(response?.error || `Failed to fetch live market rate for ${code} from Cashramp`);
    }

    return {
      countryCode: code,
      depositRate: response.result.depositRate,
      withdrawalRate: response.result.withdrawalRate,
      currency: meta.currency || "USD",
      source: "cashramp_live_api",
    };
  }

  /**
   * Fetch live payment method types for a country from Cashramp API
   */
  async getPaymentMethods(countryId, countryCode) {
    if (!client) throw new Error("Cashramp client not configured");
    const code = (countryCode || "NG").toUpperCase();

    // Automatically resolve live GraphQL countryId if not provided or non-global
    let targetCountryId = countryId;
    if (!targetCountryId || !targetCountryId.startsWith("VHlwZXM6OkNvdW50cn")) {
      const countries = await this.getCountries();
      const found = countries.find((c) => c.code === code);
      if (found && found.id) {
        targetCountryId = found.id;
      }
    }

    if (!targetCountryId) {
      throw new Error(`Could not find a valid Cashramp country ID for ${code}`);
    }

    const response = await client.getPaymentMethodTypes({ country: targetCountryId });
    if (!response || !response.success || !Array.isArray(response.result)) {
      throw new Error(response?.error || `Failed to fetch live payment method types for ${code} from Cashramp`);
    }

    return response.result.map((pm) => {
      const idLower = (pm.identifier || "").toLowerCase();
      const labelLower = (pm.label || "").toLowerCase();
      const isBank = idLower.includes("bank") || labelLower.includes("bank");
      const isWallet = idLower.includes("chipper") || idLower.includes("wallet");

      return {
        id: pm.id,
        identifier: pm.identifier,
        name: pm.label,
        type: isBank ? "bank_transfer" : isWallet ? "wallet" : "mobile_money",
        fields: pm.fields,
        tag: isBank ? "Bank Transfer" : isWallet ? "Digital Wallet" : "Mobile Money",
      };
    });
  }

  /**
   * Fetch supported rampable crypto assets from Cashramp API
   */
  async getRampableAssets() {
    if (!client) throw new Error("Cashramp client not configured");
    const response = await client.getRampableAssets();
    if (!response || !response.success) {
      throw new Error(response?.error || "Failed to fetch rampable assets from Cashramp");
    }
    return response.result || [];
  }

  /**
   * Fetch ramp min/max limits from Cashramp API
   */
  async getRampLimits() {
    if (!client) throw new Error("Cashramp client not configured");
    const response = await client.getRampLimits();
    if (!response || !response.success) {
      throw new Error(response?.error || "Failed to fetch ramp limits from Cashramp");
    }
    return response.result || {};
  }

  /**
   * Create or fetch customer in Cashramp API
   */
  async getOrCreateCustomer(name, email, countryId) {
    if (!client) throw new Error("Cashramp client not configured");

    const parts = (name || "Nimiq User").trim().split(/\s+/);
    const firstName = parts[0] || "Nimiq";
    const lastName = parts.slice(1).join(" ") || "User";
    const cacheKey = `customer_${countryId}_${firstName}_${lastName}`.toLowerCase();

    if (customerCache.has(cacheKey)) {
      return customerCache.get(cacheKey);
    }

    const uniqueEmail = email || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@nimiqpay.africa`;
    const customerResp = await client.createCustomer({
      firstName,
      lastName,
      email: uniqueEmail,
      country: countryId,
    });

    if (!customerResp || !customerResp.success || !customerResp.result) {
      throw new Error(customerResp?.error || "Failed to create customer on Cashramp");
    }

    customerCache.set(cacheKey, customerResp.result.id);
    return customerResp.result.id;
  }

  /**
   * Add a payout payment method for a customer (bank account or mobile money) via Cashramp API
   */
  async addPaymentMethod({ customerId, paymentMethodType, fields, ownership = "first_party" }) {
    if (!client) throw new Error("Cashramp client not configured");

    const response = await client.addPaymentMethod({
      customer: customerId,
      paymentMethodType,
      fields,
      ownership,
    });

    if (!response || !response.success || !response.result) {
      throw new Error(response?.error || "Failed to register payment method on Cashramp");
    }

    return response.result;
  }

  /**
   * Request live quote for Direct Ramp (deposit or withdrawal/offramp) via Cashramp API
   */
  async getQuote({ amount, currency, cryptoAsset, countryCode, paymentMethodType, type = "spend" }) {
    if (!client) throw new Error("Cashramp client not configured");

    const code = (countryCode || "NG").toUpperCase();
    const isSpendOrWithdraw = type === "spend" || type === "cashout" || type === "withdrawal";
    const paymentType = isSpendOrWithdraw ? "withdrawal" : "deposit";

    // Lookup country
    const countries = await this.getCountries();
    const country = countries.find((c) => c.code === code) || countries[0];
    const customerId = await this.getOrCreateCustomer(null, null, country.id);

    // Default payment method for the country from live methods
    let targetPmType = paymentMethodType;
    if (!targetPmType) {
      const livePms = await this.getPaymentMethods(country.id, country.code);
      targetPmType = livePms[0]?.identifier || (code === "NG" ? "bank_transfer_ng" : "mobile_money");
    }

    // Fetch live market rates
    const rates = await this.getMarketRates(country.code);
    const unitRate = parseFloat(isSpendOrWithdraw ? rates.withdrawalRate : rates.depositRate);

    // Calculate USD amount for quote
    const numAmount = parseFloat(amount) || 0;
    const isUsd = currency === "usd" || currency === "USD";
    const usdAmount = isUsd ? numAmount : Number((numAmount / unitRate).toFixed(2));

    const quoteParams = {
      customer: customerId,
      amount: usdAmount,
      currency: "usd",
      paymentType,
      paymentMethodType: targetPmType,
      country: country.code,
    };

    const response = await client.getRampQuote(quoteParams);
    if (!response || !response.success || !response.result) {
      throw new Error(response?.error || "Failed to fetch live quote from Cashramp");
    }

    const liveRate = parseFloat(response.result.exchangeRate) || unitRate;
    const calculatedFiat = isUsd ? Number((numAmount * liveRate).toFixed(2)) : numAmount;

    const computeCryptoCost = (usd, asset) => {
      const a = (asset || "USDT").toUpperCase();
      if (a === "NIM") return Number((usd / 0.00325).toFixed(2));
      if (a === "CELO") return Number((usd / 0.65).toFixed(3));
      return Number(usd.toFixed(2));
    };

    return {
      id: response.result.id,
      exchangeRate: liveRate,
      usdAmount,
      fiatAmount: calculatedFiat,
      fiatCurrency: country.currency,
      cryptoAsset: cryptoAsset || "USDT",
      cryptoAmount: computeCryptoCost(usdAmount, cryptoAsset),
      paymentMethodType: targetPmType,
      paymentType,
      expiresAt: new Date(Date.now() + 45000).toISOString(),
      source: "cashramp_live_api",
    };
  }

  /**
   * Alias getRampQuote to getQuote
   */
  async getRampQuote(params) {
    return this.getQuote(params);
  }

  /**
   * Initiate Offramp / Withdrawal via Cashramp Direct Ramp API
   */
  async initiateWithdrawal({
    quoteId,
    paymentMethodId,
    reference,
    recipient,
    recipientName = "Recipient",
    amount,
    currency,
    countryCode = "NG",
    cryptoAsset = "USDT",
    cryptoAmount,
    accountNo,
    bankName,
    paymentMethodType,
    nimiqTxHash,
  }) {
    if (!client) throw new Error("Cashramp client not configured");

    const code = countryCode.toUpperCase();
    const countries = await this.getCountries();
    const country = countries.find((c) => c.code === code) || countries[0];
    const customerId = await this.getOrCreateCustomer(recipientName, null, country.id);

    const ref = reference || `CR_WD_${Date.now().toString().slice(-6)}_${Math.floor(100 + Math.random() * 900)}`;

    let resolvedPmType = paymentMethodType;
    if (!resolvedPmType) {
      const livePms = await this.getPaymentMethods(country.id, country.code);
      resolvedPmType = livePms[0]?.identifier || (code === "NG" ? "bank_transfer_ng" : "mobile_money");
    }

    // Ensure payment method is registered on Cashramp
    let activePaymentMethodId = paymentMethodId;
    if (!activePaymentMethodId || !activePaymentMethodId.startsWith("VHlwZXM6OkNhc2hyYW1wOjpQMlBQYXltZW50TWV0aG9k")) {
      const pmFields = [];
      if (resolvedPmType.includes("bank") || code === "NG") {
        pmFields.push({ identifier: "bank_account_number", value: String(accountNo || recipient || "0123456789") });
        pmFields.push({ identifier: "name", value: String(recipientName || "Recipient") });
        pmFields.push({ identifier: "bank_name", value: String(bankName || "Access Bank") });
      } else {
        pmFields.push({ identifier: "phone_number", value: String(recipient || "+234800000000") });
        pmFields.push({ identifier: "name", value: String(recipientName || "Recipient") });
      }

      const pmResult = await this.addPaymentMethod({
        customerId,
        paymentMethodType: resolvedPmType,
        fields: pmFields,
      });
      activePaymentMethodId = pmResult.id;
    }

    // Ensure valid withdrawal quote from Cashramp
    let activeQuoteId = quoteId;
    if (!activeQuoteId || !activeQuoteId.startsWith("VHlwZXM6OkNhc2hyYW1wOjpBUEk6OlJhbXBRdW90ZS")) {
      const freshQuote = await this.getQuote({
        amount,
        currency,
        cryptoAsset,
        countryCode: code,
        paymentMethodType: resolvedPmType,
        type: "withdrawal",
      });
      activeQuoteId = freshQuote.id;
    }

    // Call Cashramp SDK initiateRampQuoteWithdrawal
    const withdrawalResponse = await client.initiateRampQuoteWithdrawal({
      rampQuote: activeQuoteId,
      paymentMethod: activePaymentMethodId,
      reference: ref,
    });

    if (!withdrawalResponse || !withdrawalResponse.success || !withdrawalResponse.result) {
      throw new Error(withdrawalResponse?.error || "Failed to initiate withdrawal on Cashramp");
    }

    const liveResult = withdrawalResponse.result;

    return {
      success: true,
      transaction: {
        id: liveResult.id,
        cashrampRequestId: liveResult.id,
        status: liveResult.status || "PROCESSING",
        type: "cashout",
        title: "Cash Out to Mobile Money / Bank",
        recipient: recipient || accountNo,
        recipientName: recipientName || "Recipient",
        accountNo: accountNo || null,
        bankName: bankName || null,
        fiatAmount: Number(liveResult.amountLocal || amount),
        fiatCurrency: currency || country.currency,
        cryptoAsset: cryptoAsset || "USDT",
        cryptoAmount: liveResult.amountUsd || cryptoAmount || (Number(amount) / parseFloat(liveResult.exchangeRate)).toFixed(2),
        exchangeRate: liveResult.exchangeRate,
        agent: liveResult.agent,
        paymentDetails: liveResult.paymentDetails,
        network: cryptoAsset === "NIM" ? "Nimiq Albatross PoS" : "Polygon PoS",
        timestamp: new Date().toISOString(),
        nimiqTxHash: nimiqTxHash || null,
        paymentMethodId: activePaymentMethodId,
        paymentMethodType: resolvedPmType,
        source: "cashramp_direct_ramp",
      },
    };
  }

  /**
   * Confirm customer received offramp fiat payout
   */
  async markWithdrawalReceived({ paymentRequest }) {
    if (!client) throw new Error("Cashramp client not configured");
    const response = await client.markWithdrawalAsReceived({ paymentRequest });
    if (!response || !response.success) {
      throw new Error(response?.error || "Failed to mark withdrawal as received on Cashramp");
    }
    return response;
  }

  /**
   * Helper to map network identifiers to Cashramp's GraphQL enum
   * Enum values: celo, bsc, eth, matic, sol, op, base, btc, ltc, trx
   */
  _mapNetwork(network) {
    if (!network) return "matic";
    const net = String(network).toLowerCase();
    if (net.includes("polygon") || net.includes("matic") || net === "0x89") return "matic";
    if (net.includes("celo") || net === "0xa4ec") return "celo";
    if (net.includes("base") || net === "0x2105") return "base";
    if (net.includes("optimism") || net === "op" || net === "0xa") return "op";
    if (net.includes("bsc") || net.includes("binance") || net === "0x38") return "bsc";
    if (net.includes("eth") || net === "0x1") return "eth";
    if (net.includes("sol")) return "sol";
    return "matic";
  }

  /**
   * Helper to map cryptocurrency identifiers to Cashramp's GraphQL enum
   * Enum values: usd_tether, usd_coin, cusd, bitcoin, ethereum, litecoin, tron, solana
   */
  _mapCrypto(crypto) {
    if (!crypto) return "usd_tether";
    const c = String(crypto).toUpperCase();
    if (c === "USDT") return "usd_tether";
    if (c === "CUSD") return "cusd";
    if (c === "BTC") return "bitcoin";
    if (c === "ETH") return "ethereum";
    if (c === "SOL") return "solana";
    return "usd_tether";
  }

  /**
   * Initiate Direct Ramp Deposit via Cashramp SDK with onchain stablecoin delivery
   */
  async initiateDeposit({
    quoteId,
    reference,
    phoneNumber,
    bankAccountNumber,
    onchainAddress,
    cryptoAsset = "USDT",
    network = "matic",
    amount,
    currency,
    countryCode = "NG",
    paymentMethodType,
  }) {
    if (!client) throw new Error("Cashramp client not configured");

    const code = (countryCode || "NG").toUpperCase();
    const countries = await this.getCountries();
    const country = countries.find((c) => c.code === code) || countries[0];

    const ref = reference || `CR_DEP_${Date.now().toString().slice(-6)}_${Math.floor(100 + Math.random() * 900)}`;

    let targetPmType = paymentMethodType;
    if (!targetPmType) {
      const livePms = await this.getPaymentMethods(country.id, country.code);
      targetPmType = livePms[0]?.identifier || (code === "NG" ? "bank_transfer_ng" : "mobile_money");
    }

    // Ensure valid deposit quote
    let activeQuoteId = quoteId;
    if (!activeQuoteId || !activeQuoteId.startsWith("VHlwZXM6OkNhc2hyYW1wOjpBUEk6OlJhbXBRdW90ZS")) {
      const freshQuote = await this.getQuote({
        amount: amount || 10,
        currency: currency || "local_currency",
        cryptoAsset,
        countryCode: code,
        paymentMethodType: targetPmType,
        type: "deposit",
      });
      activeQuoteId = freshQuote.id;
    }

    const params = {
      rampQuote: activeQuoteId,
      reference: ref,
    };

    if (phoneNumber) {
      params.phoneNumber = String(phoneNumber);
    }
    if (bankAccountNumber) {
      params.bankAccountNumber = String(bankAccountNumber);
    }

    if (onchainAddress) {
      params.onchainTransferInfo = {
        address: onchainAddress,
        cryptocurrency: this._mapCrypto(cryptoAsset),
        network: this._mapNetwork(network),
      };
    }

    const response = await client.initiateRampQuoteDeposit(params);
    if (!response || !response.success || !response.result) {
      throw new Error(response?.error || "Failed to initiate deposit on Cashramp");
    }

    const res = response.result;
    return {
      success: true,
      deposit: {
        id: res.id,
        paymentRequestId: res.id,
        reference: ref,
        status: res.status,
        agent: res.agent,
        paymentDetails: res.paymentDetails,
        paymentMethodType: targetPmType,
        exchangeRate: res.exchangeRate,
        amountLocal: res.amountLocal,
        amountUsd: res.amountUsd,
        expiresAt: res.expiresAt,
        onchainTransferInfo: params.onchainTransferInfo || null,
        source: "cashramp_direct_ramp",
      },
    };
  }

  /**
   * Confirm customer has authorized/paid the deposit fiat
   */
  async markDepositPaid({ paymentRequest, receipt }) {
    if (!client) throw new Error("Cashramp client not configured");
    const response = await client.markDepositAsPaid({
      paymentRequest,
      receipt: receipt || "payment_confirmed_via_app",
    });
    if (!response || !response.success) {
      throw new Error(response?.error || "Failed to mark deposit as paid on Cashramp");
    }
    return response;
  }

  /**
   * Cancel an ongoing deposit
   */
  async cancelDeposit({ paymentRequest }) {
    if (!client) throw new Error("Cashramp client not configured");
    const response = await client.cancelDeposit({ paymentRequest });
    if (!response || !response.success) {
      throw new Error(response?.error || "Failed to cancel deposit on Cashramp");
    }
    return response;
  }
}

module.exports = new CashrampService();
