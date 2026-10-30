import { Country, MarketRate, PaymentMethod, RampQuote, Transaction } from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const API = {
  async getCountries(): Promise<Country[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/countries`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('API getCountries error:', err);
      return [];
    }
  },

  async getRates(countryCode: string): Promise<MarketRate | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/rates?countryCode=${countryCode.toUpperCase()}`);
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('API getRates error:', err);
      return null;
    }
  },

  async getPaymentMethods(countryCode: string, countryId?: string): Promise<PaymentMethod[]> {
    try {
      const url = countryId 
        ? `${BASE_URL}/api/payment-methods?countryId=${countryId}&countryCode=${countryCode}` 
        : `${BASE_URL}/api/payment-methods?countryCode=${countryCode}`;
      const res = await fetch(url);
      const json = await res.json();
      return json.methods || [];
    } catch (err) {
      console.error('API getPaymentMethods error:', err);
      return [];
    }
  },

  async getBanks(countryCode: string): Promise<{ code: string; name: string }[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/banks?countryCode=${countryCode.toUpperCase()}`);
      const json = await res.json();
      return json.banks || [];
    } catch (err) {
      console.error('API getBanks error:', err);
      return [];
    }
  },

  async verifyRecipient(identifier: string, countryCode: string, type: string): Promise<{
    success: boolean;
    verified?: boolean;
    recipientName?: string;
    category?: string;
    type?: string;
    provider?: string;
    verifiedBadge?: string;
    branch?: string | null;
    bankName?: string | null;
    note?: string | null;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/api/verify-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, countryCode, type }),
      });
      return await res.json();
    } catch (err) {
      console.error('API verifyRecipient error:', err);
      return { success: false };
    }
  },

  async getQuote(params: {
    amount: number;
    currency: string;
    cryptoAsset: string;
    countryCode: string;
    type: 'spend' | 'deposit';
    paymentMethodIdentifier?: string;
  }): Promise<{ success: boolean; quote?: RampQuote; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      console.error('API getQuote error:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  async executeTransaction(payload: Record<string, unknown>): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/execute-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error('API executeTransaction error:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  async initiateWithdrawal(payload: Record<string, unknown>): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/initiate-withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error('API initiateWithdrawal error:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  async initiateDeposit(payload: Record<string, unknown>): Promise<{ success: boolean; deposit?: any; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/initiate-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error('API initiateDeposit error:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  async markDepositPaid(paymentRequest: string): Promise<{ success: boolean; result?: boolean; error?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/mark-deposit-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentRequest }),
      });
      return await res.json();
    } catch (err) {
      console.error('API markDepositPaid error:', err);
      return { success: false, error: (err as Error).message };
    }
  },
};
