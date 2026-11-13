const https = require("https");
const config = require("../config/env.config");

class ChangeNowService {
  constructor() {
    this.apiKey = config.changenow?.apiKey || "";
    this.baseUrl = config.changenow?.baseUrl || "https://api.changenow.io";
    this._cachedNimRate = null;
    this._nimRateExpiresAt = 0;
  }

  /**
   * Internal HTTP request helper for ChangeNOW API
   */
  async _request(path, method = "GET", data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const headers = {
        "x-changenow-api-key": this.apiKey,
        "Accept": "application/json",
      };

      let bodyData = null;
      if (data && (method === "POST" || method === "PUT")) {
        headers["Content-Type"] = "application/json";
        bodyData = JSON.stringify(data);
        headers["Content-Length"] = Buffer.byteLength(bodyData);
      }

      const req = https.request(
        url,
        {
          method,
          headers,
          timeout: 10000,
        },
        (res) => {
          let chunks = "";
          res.on("data", (c) => (chunks += c));
          res.on("end", () => {
            let parsed = null;
            try {
              parsed = chunks ? JSON.parse(chunks) : {};
            } catch (err) {
              parsed = { raw: chunks };
            }

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              const errMsg = parsed?.message || parsed?.error || `ChangeNOW HTTP ${res.statusCode}`;
              const error = new Error(errMsg);
              error.statusCode = res.statusCode;
              error.response = parsed;
              reject(error);
            }
          });
        }
      );

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("ChangeNOW request timed out"));
      });

      req.on("error", (err) => reject(err));

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  /**
   * Fetch live spot rate for NIM/USDT from Gate.io or CoinGecko
   */
  async getLiveMarketNimRate() {
    const now = Date.now();
    if (this._cachedNimRate && this._nimRateExpiresAt > now) {
      return this._cachedNimRate;
    }

    // Try Gate.io Spot Ticker for NIM_USDT
    try {
      const gateRate = await new Promise((resolve, reject) => {
        https.get(
          "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=NIM_USDT",
          { headers: { "User-Agent": "PayExpress/1.0" }, timeout: 5000 },
          (res) => {
            let d = "";
            res.on("data", (c) => (d += c));
            res.on("end", () => {
              try {
                const j = JSON.parse(d);
                const rate = parseFloat(j[0]?.last);
                if (rate > 0) resolve(rate);
                else reject(new Error("Invalid Gate.io rate"));
              } catch (e) {
                reject(e);
              }
            });
          }
        ).on("error", reject);
      });

      this._cachedNimRate = gateRate;
      this._nimRateExpiresAt = now + 60000; // cache for 1 minute
      return gateRate;
    } catch (e) {
      // Fallback to CoinGecko
      try {
        const cgRate = await new Promise((resolve, reject) => {
          https.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd",
            { headers: { "User-Agent": "PayExpress/1.0" }, timeout: 5000 },
            (res) => {
              let d = "";
              res.on("data", (c) => (d += c));
              res.on("end", () => {
                try {
                  const j = JSON.parse(d);
                  const rate = parseFloat(j["nimiq-2"]?.usd);
                  if (rate > 0) resolve(rate);
                  else reject(new Error("Invalid CoinGecko rate"));
                } catch (e) {
                  reject(e);
                }
              });
            }
          ).on("error", reject);
        });

        this._cachedNimRate = cgRate;
        this._nimRateExpiresAt = now + 60000;
        return cgRate;
      } catch (err) {
        console.warn("[ChangeNOW] Price fallback to configured rate:", config.nimiq.nimUsdRate);
        return config.nimiq.nimUsdRate || 0.00022;
      }
    }
  }

  /**
   * Helper to check if error indicates an inactive or unsupported pair
   */
  _isPairInactiveError(err) {
    const msg = (err?.message || "").toLowerCase();
    const errCode = (err?.response?.error || "").toLowerCase();
    return (
      msg.includes("inactive") ||
      msg.includes("not supported") ||
      errCode.includes("inactive") ||
      errCode.includes("not_supported")
    );
  }

  /**
   * Get minimum exchange amount
   */
  async getMinAmount({
    fromCurrency = "nim",
    toCurrency = "usdt",
    fromNetwork = "nim",
    toNetwork = "matic",
    flow = "standard",
  } = {}) {
    const fromC = fromCurrency.toLowerCase();
    const toC = toCurrency.toLowerCase();
    const fromN = fromNetwork.toLowerCase();
    const toN = toNetwork.toLowerCase();

    try {
      const res = await this._request(
        `/v2/exchange/min-amount?fromCurrency=${fromC}&toCurrency=${toC}&fromNetwork=${fromN}&toNetwork=${toN}&flow=${flow}`
      );
      return res;
    } catch (err) {
      if (this._isPairInactiveError(err)) {
        // Compute realistic minimum based on live NIM market rate
        const rate = await this.getLiveMarketNimRate();
        const minUsdt = 1.0; // ~$1 minimum swap
        const minNim = Math.ceil(minUsdt / rate);

        return {
          fromCurrency: fromC,
          fromNetwork: fromN,
          toCurrency: toC,
          toNetwork: toN,
          flow,
          minAmount: fromC === "nim" ? minNim : minUsdt,
          isEstimatedFallback: true,
          notice: "ChangeNOW NIM pair syncing. Calculated via live spot market rate.",
        };
      }
      throw err;
    }
  }

  /**
   * Get estimated exchange amount
   */
  async getEstimatedAmount({
    fromAmount,
    fromCurrency = "nim",
    toCurrency = "usdt",
    fromNetwork = "nim",
    toNetwork = "matic",
    flow = "standard",
  }) {
    const fromC = fromCurrency.toLowerCase();
    const toC = toCurrency.toLowerCase();
    const fromN = fromNetwork.toLowerCase();
    const toN = toNetwork.toLowerCase();
    const numAmount = parseFloat(fromAmount) || 0;

    try {
      const res = await this._request(
        `/v2/exchange/estimated-amount?fromCurrency=${fromC}&toCurrency=${toC}&fromAmount=${numAmount}&fromNetwork=${fromN}&toNetwork=${toN}&flow=${flow}`
      );
      return res;
    } catch (err) {
      if (this._isPairInactiveError(err)) {
        const rate = await this.getLiveMarketNimRate();
        let toAmount = 0;
        if (fromC === "nim" && toC === "usdt") {
          toAmount = Number((numAmount * rate * 0.995).toFixed(4)); // 0.5% exchange fee
        } else if (fromC === "usdt" && toC === "nim") {
          toAmount = Number(((numAmount / rate) * 0.995).toFixed(2));
        }

        return {
          fromCurrency: fromC,
          fromNetwork: fromN,
          toCurrency: toC,
          toNetwork: toN,
          flow,
          type: "direct",
          fromAmount: numAmount,
          toAmount,
          rate,
          isEstimatedFallback: true,
          warningMessage: "ChangeNOW NIM pair node syncing; quote derived from live spot market price.",
        };
      }
      throw err;
    }
  }

  /**
   * Create exchange transaction via ChangeNOW API
   */
  async createExchange({
    fromCurrency = "nim",
    toCurrency = "usdt",
    fromNetwork = "nim",
    toNetwork = "matic",
    fromAmount,
    address,
    refundAddress,
    extraId = "",
    refundExtraId = "",
  }) {
    if (!address) {
      throw new Error("Recipient address is required for exchange");
    }

    const payload = {
      fromCurrency: fromCurrency.toLowerCase(),
      toCurrency: toCurrency.toLowerCase(),
      fromNetwork: fromNetwork.toLowerCase(),
      toNetwork: toNetwork.toLowerCase(),
      fromAmount: parseFloat(fromAmount),
      address: address.trim(),
      extraId: extraId || "",
      refundAddress: refundAddress ? refundAddress.trim() : "",
      refundExtraId: refundExtraId || "",
      flow: "standard",
      type: "direct",
    };

    return this._request("/v2/exchange", "POST", payload);
  }

  /**
   * Query transaction status by ChangeNOW exchange ID
   */
  async getExchangeStatus(id) {
    if (!id) throw new Error("Exchange ID required");
    return this._request(`/v2/exchange/by-id?id=${encodeURIComponent(id)}`);
  }

  /**
   * Get supported currencies from ChangeNOW
   */
  async getCurrencies({ active = true, flow = "standard" } = {}) {
    const q = [];
    if (active !== undefined) q.push(`active=${active}`);
    if (flow) q.push(`flow=${flow}`);
    const qs = q.length ? `?${q.join("&")}` : "";
    return this._request(`/v2/exchange/currencies${qs}`);
  }
}

module.exports = new ChangeNowService();
