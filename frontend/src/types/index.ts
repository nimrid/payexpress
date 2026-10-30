export type CryptoAsset = 'NIM' | 'USDC' | 'USDT';

export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  symbol: string;
  flag: string;
  dial: string;
  defaultPaymentMethod?: string;
  region?: string;
  supportedMethods?: string[];
  isLiveSandbox?: boolean;
  indicativeRate?: {
    depositRate: string;
    withdrawalRate: string;
  };
}

export interface MarketRate {
  countryCode: string;
  depositRate: string;
  withdrawalRate: string;
  currency: string;
  source: string;
  change24h?: string;
}

export interface PaymentField {
  label: string;
  identifier: string;
  required: boolean;
}

export interface PaymentMethod {
  id: string;
  identifier: string;
  name: string;
  type: 'bank_transfer' | 'mobile_money' | 'merchant' | 'wallet' | string;
  fields?: PaymentField[];
  tag?: string;
  fee?: string;
}

export interface RampQuote {
  id: string;
  exchangeRate: number;
  usdAmount: number;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAsset: CryptoAsset;
  cryptoAmount: number;
  paymentMethodType: string;
  paymentType: string;
  expiresAt: string;
  source: string;
}

export interface VerifiedRecipient {
  verified: boolean;
  recipientName: string;
  category?: string;
  type?: string;
  provider?: string;
  verifiedBadge?: string;
  branch?: string | null;
  bankName?: string | null;
  note?: string | null;
}

export interface Transaction {
  id: string;
  telcoRef: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  type: 'spend' | 'cashout' | 'deposit';
  title: string;
  sub: string;
  recipient: string;
  recipientName?: string;
  accountNo?: string;
  bankName?: string;
  fiatAmount: string | number;
  fiatCurrency: string;
  cryptoAsset: CryptoAsset;
  cryptoAmount: string | number;
  network?: string;
  timestamp: string;
  nimiqTxHash?: string;
  smsConfirmation?: string;
}

export type { NimiqPayHostContext } from '@nimiq/mini-app-sdk';
