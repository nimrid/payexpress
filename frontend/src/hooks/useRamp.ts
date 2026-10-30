import { useState, useEffect } from 'react';
import { Country, CryptoAsset, MarketRate, Transaction } from '../types';
import { API } from '../services/api';
import { EVM, SupportedChainKey, SUPPORTED_EVM_CHAINS } from '../services/evm';
import { Nimiq } from '../services/nimiq';

const DEFAULT_POPULAR_COUNTRIES: Country[] = [
  {
    id: 'cashramp_ke',
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    symbol: 'KSh',
    flag: '🇰🇪',
    dial: '+254',
    region: 'East Africa',
    defaultPaymentMethod: 'pm_mpesa_till',
    supportedMethods: ['M-Pesa Till (Buy Goods)', 'M-Pesa Paybill', 'Airtel Money'],
    indicativeRate: { depositRate: '131.20', withdrawalRate: '128.50' },
  },
  {
    id: 'VHlwZXM6OkNvdW50cnktOWY5MWE5NGYtNDUxYi00YWEyLWI2NjgtNjQ3YTM2ZDFjZmZh',
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    symbol: '₦',
    flag: '🇳🇬',
    dial: '+234',
    region: 'West Africa',
    defaultPaymentMethod: 'bank_transfer_ng',
    supportedMethods: ['Instant Bank Transfer', 'Chipper Cash', 'Kuda Bank', 'OPay'],
    indicativeRate: { depositRate: '1408.99', withdrawalRate: '1380.33' },
  },
  {
    id: 'VHlwZXM6OkNvdW50cnktZWMyOTY3N2QtMGYyYS00NjYzLWIzNDgtNGE5MDIxZWFmNGY3',
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    symbol: 'GH₵',
    flag: '🇬🇭',
    dial: '+233',
    region: 'West Africa',
    defaultPaymentMethod: 'mtn_momo_gh',
    supportedMethods: ['MTN MoMo', 'Vodafone Cash', 'AirtelTigo'],
    indicativeRate: { depositRate: '12.48', withdrawalRate: '12.12' },
  },
  {
    id: 'VHlwZXM6OkNvdW50cnktNDk1YTdhMGMtZGRiYi00MmViLThhOGItOTYyNmY5OWNlMjVi',
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    symbol: 'R',
    flag: '🇿🇦',
    dial: '+27',
    region: 'Southern Africa',
    defaultPaymentMethod: 'payshap_za',
    supportedMethods: ['Capitec Pay', 'Ozow Instant EFT', 'PayShap'],
    indicativeRate: { depositRate: '18.45', withdrawalRate: '17.95' },
  },
];

export const useRamp = () => {
  const [countries, setCountries] = useState<Country[]>(DEFAULT_POPULAR_COUNTRIES);
  const [activeCountry, setActiveCountry] = useState<Country>(() => {
    const savedCode = localStorage.getItem('payexpress_active_country_code');
    const matched = DEFAULT_POPULAR_COUNTRIES.find((c) => c.code === savedCode);
    return matched || DEFAULT_POPULAR_COUNTRIES[0];
  });
  const [activeCrypto, setActiveCrypto] = useState<CryptoAsset>('NIM');
  const [selectedChain, setSelectedChain] = useState<SupportedChainKey>('polygon');
  const [rate, setRate] = useState<MarketRate | null>(null);

  // Balances
  const [nimBalance, setNimBalance] = useState(14850.5);
  const [usdcBalance, setUsdcBalance] = useState(125.0);
  const [usdtBalance, setUsdtBalance] = useState(150.0);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  // Nimiq Dual-Chain State
  const [nimiqAddress, setNimiqAddress] = useState<string | null>(null);
  const [isNimiqConnecting, setIsNimiqConnecting] = useState(true);
  const [isNimiqReady, setIsNimiqReady] = useState(false);

  // Transactions Feed
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'CXP-829104',
      telcoRef: 'CR789012X9',
      status: 'COMPLETED',
      type: 'spend',
      title: 'Java House Cafe - Westlands',
      sub: 'Merchant Till #542890',
      recipient: '542890',
      recipientName: 'Java House Cafe',
      fiatAmount: '1500.00',
      fiatCurrency: 'KES',
      cryptoAsset: 'NIM',
      cryptoAmount: '3590.77',
      timestamp: new Date().toISOString(),
      smsConfirmation: 'Cashramp Confirmed: KES 1,500 transferred to Java House Cafe. Ref: CR789012X9.',
    },
  ]);

  // Load initial countries, EVM account, and Nimiq SDK provider
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // EVM check
      const addr = await EVM.getAccount();
      if (isMounted) setEvmAddress(addr);

      // Nimiq Provider check (Step 4 Tutorial 1)
      try {
        await Nimiq.initProvider(6000);
        if (isMounted) setIsNimiqReady(true);

        const nimAccounts = await Nimiq.listAccounts();
        if (isMounted && nimAccounts && nimAccounts.length > 0) {
          setNimiqAddress(nimAccounts[0]);
          try {
            const bal = await Nimiq.getBalance(nimAccounts[0]);
            if (isMounted && bal && typeof bal.nim === 'number') {
              setNimBalance(bal.nim);
            }
          } catch {
            // Balance query fallback
          }
        }
      } catch (err) {
        console.info('[Nimiq SDK] Provider initialization note:', err);
      } finally {
        if (isMounted) setIsNimiqConnecting(false);
      }

      // Countries & Rates
      const fetchedCountries = await API.getCountries();
      if (isMounted) {
        if (fetchedCountries.length > 0) {
          setCountries(fetchedCountries);
          const savedCode = localStorage.getItem('payexpress_active_country_code');
          const matched = savedCode ? fetchedCountries.find((c) => c.code === savedCode) : null;
          const current = matched || fetchedCountries.find((c) => c.code === 'KE') || fetchedCountries[0];
          setActiveCountry(current);
          loadRates(current.code);
        } else {
          loadRates(activeCountry.code);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadRates = async (countryCode: string) => {
    const fetchedRate = await API.getRates(countryCode);
    if (fetchedRate) {
      setRate(fetchedRate);
    }
  };

  const changeCountry = (country: Country) => {
    setActiveCountry(country);
    localStorage.setItem('payexpress_active_country_code', country.code);
    loadRates(country.code);
  };

  const connectEvm = async () => {
    try {
      const addr = await EVM.connect();
      setEvmAddress(addr);
      return addr;
    } catch (err) {
      console.warn('EVM connect error:', err);
      return null;
    }
  };

  const connectNimiq = async () => {
    try {
      setIsNimiqConnecting(true);
      await Nimiq.initProvider(10_000);
      setIsNimiqReady(true);
      const accounts = await Nimiq.listAccounts();
      if (accounts && accounts.length > 0) {
        setNimiqAddress(accounts[0]);
        try {
          const bal = await Nimiq.getBalance(accounts[0]);
          if (typeof bal.nim === 'number') {
            setNimBalance(bal.nim);
          }
        } catch {
          // fallback
        }
        return accounts[0];
      }
    } catch (err) {
      console.warn('connectNimiq error:', err);
    } finally {
      setIsNimiqConnecting(false);
    }
    return null;
  };

  // Total balance calculations
  const nimUsdRate = 0.00325;
  const currentCryptoUsd = activeCrypto === 'NIM'
    ? nimBalance * nimUsdRate
    : activeCrypto === 'USDT'
    ? usdtBalance
    : usdcBalance;

  const currentRateNum = parseFloat(rate?.depositRate || '1400');
  const fiatEquivalent = (currentCryptoUsd * currentRateNum).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const maxCryptoBalance = activeCrypto === 'NIM' ? nimBalance : activeCrypto === 'USDT' ? usdtBalance : usdcBalance;

  // Execute Spend
  const executeSpend = async (params: {
    recipient: string;
    recipientName: string;
    amount: number;
    accountNo?: string;
    bankName?: string;
    paymentMethodType?: string;
    quote?: any;
  }): Promise<Transaction> => {
    const cryptoAmount = params.quote?.cryptoAmount || (params.amount / currentRateNum);
    let onchainTxHash = '';

    // If using NIM, execute transaction via Nimiq Mini App SDK
    if (activeCrypto === 'NIM') {
      try {
        if (Nimiq.isAvailable()) {
          // PayExpress Merchant Treasury / Pool address
          const merchantNimiqAddress = 'NQ07 0000 0000 0000 0000 0000 0000 0000';
          onchainTxHash = await Nimiq.sendTransactionWithData({
            recipient: merchantNimiqAddress,
            nimAmount: cryptoAmount,
            data: `PayExpress:${params.recipientName.slice(0, 20)}`,
          });
        }
      } catch (nimErr) {
        const parsed = Nimiq.parseError(nimErr);
        if (parsed.isPermissionDenied) {
          throw new Error('Transaction was canceled in Nimiq Pay.');
        }
        console.warn('[Nimiq SDK] Spend transaction note:', nimErr);
      }
    } else if (activeCrypto === 'USDT' || activeCrypto === 'USDC') {
      // If using EVM Stablecoin, call Nimiq Pay window.ethereum
      try {
        const cashrampPool = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon USDT
        onchainTxHash = await EVM.sendTokenTransfer(cashrampPool, cryptoAmount, activeCrypto);
      } catch (err) {
        console.warn('EVM send error:', err);
      }
    }

    const res = await API.executeTransaction({
      type: 'spend',
      recipient: params.recipient,
      recipientName: params.recipientName,
      accountNo: params.accountNo,
      bankName: params.bankName,
      paymentMethodType: params.paymentMethodType,
      countryCode: activeCountry.code,
      amount: params.amount,
      currency: activeCountry.currency,
      cryptoAsset: activeCrypto,
      cryptoAmount,
      quoteId: params.quote?.id,
      nimiqTxHash: onchainTxHash,
    });

    const tx: Transaction = res.transaction || {
      id: `CXP-${Date.now().toString().slice(-6)}`,
      telcoRef: `CR${Math.floor(100000 + Math.random() * 900000)}X9`,
      status: 'COMPLETED',
      type: 'spend',
      title: params.recipientName,
      sub: `#${params.recipient}`,
      recipient: params.recipient,
      recipientName: params.recipientName,
      fiatAmount: params.amount,
      fiatCurrency: activeCountry.currency,
      cryptoAsset: activeCrypto,
      cryptoAmount: cryptoAmount.toString(),
      timestamp: new Date().toISOString(),
      smsConfirmation: `Cashramp Confirmed: ${activeCountry.currency} ${params.amount.toLocaleString()} transferred to ${params.recipientName}.`,
    };

    // Deduct balance
    if (activeCrypto === 'NIM') setNimBalance((b) => Math.max(0, b - cryptoAmount));
    else if (activeCrypto === 'USDT') setUsdtBalance((b) => Math.max(0, b - cryptoAmount));
    else setUsdcBalance((b) => Math.max(0, b - cryptoAmount));

    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  // Execute Cash Out / Offramp
  const executeCashOut = async (params: { phone: string; cryptoAmount: number; fiatAmount: number }): Promise<Transaction> => {
    let onchainTxHash = '';
    if (activeCrypto === 'NIM') {
      try {
        if (Nimiq.isAvailable()) {
          const cashrampPool = 'NQ07 0000 0000 0000 0000 0000 0000 0000';
          onchainTxHash = await Nimiq.sendTransactionWithData({
            recipient: cashrampPool,
            nimAmount: params.cryptoAmount,
            data: `CashOut:${params.phone.slice(-4)}`,
          });
        }
      } catch (nimErr) {
        const parsed = Nimiq.parseError(nimErr);
        if (parsed.isPermissionDenied) {
          throw new Error('Cash out transaction was canceled in Nimiq Pay.');
        }
        console.warn('[Nimiq SDK] Cash out note:', nimErr);
      }
    } else if (activeCrypto === 'USDT' || activeCrypto === 'USDC') {
      try {
        // Cashramp Settlement Pool on Polygon
        const cashrampDepositPool = '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7';
        onchainTxHash = await EVM.sendTokenTransfer(cashrampDepositPool, params.cryptoAmount, activeCrypto);
      } catch (err) {
        console.warn('EVM cashout transfer notice:', err);
      }
    }

    const res = await API.initiateWithdrawal({
      recipient: params.phone,
      recipientName: 'Mobile Money Recipient',
      amount: params.fiatAmount,
      currency: activeCountry.currency,
      countryCode: activeCountry.code,
      cryptoAsset: activeCrypto,
      cryptoAmount: params.cryptoAmount,
      nimiqTxHash: onchainTxHash,
    });

    const tx: Transaction = res.transaction || {
      id: `CXP-${Date.now().toString().slice(-6)}`,
      telcoRef: `CR${Math.floor(100000 + Math.random() * 900000)}X9`,
      status: 'COMPLETED',
      type: 'cashout',
      title: 'Cash Out to Mobile Money',
      sub: params.phone,
      recipient: params.phone,
      fiatAmount: params.fiatAmount,
      fiatCurrency: activeCountry.currency,
      cryptoAsset: activeCrypto,
      cryptoAmount: params.cryptoAmount.toString(),
      timestamp: new Date().toISOString(),
      nimiqTxHash: onchainTxHash,
      smsConfirmation: `Cashramp Confirmed: You received ${activeCountry.currency} ${params.fiatAmount.toLocaleString()} to ${params.phone}.`,
    };

    if (activeCrypto === 'NIM') setNimBalance((b) => Math.max(0, b - params.cryptoAmount));
    else if (activeCrypto === 'USDT') setUsdtBalance((b) => Math.max(0, b - params.cryptoAmount));
    else setUsdcBalance((b) => Math.max(0, b - params.cryptoAmount));

    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  // Execute Deposit
  const executeDeposit = async (params: {
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    methodName?: string;
    paymentMethodType?: string;
    amount: number;
    paymentRequestId?: string;
  }): Promise<Transaction> => {
    if (params.paymentRequestId) {
      try {
        await API.markDepositPaid(params.paymentRequestId);
      } catch (err) {
        console.warn('markDepositPaid API notice:', err);
      }
    }

    const cryptoCredit = activeCrypto === 'NIM'
      ? (params.amount / currentRateNum / nimUsdRate).toFixed(1)
      : (params.amount / currentRateNum).toFixed(2);

    const isBank = Boolean(params.accountNumber || params.paymentMethodType?.includes('bank'));
    const isWallet = Boolean(params.paymentMethodType?.includes('chipper') || params.paymentMethodType?.includes('wallet'));
    const methodLabel = params.methodName || (isBank ? 'Bank Transfer' : isWallet ? 'Digital Wallet' : 'Mobile Money');
    const displayAccount = params.accountNumber ? `${params.bankName ? params.bankName + ' ' : ''}#${params.accountNumber}` : (params.phone || 'Verified Account');

    const tx: Transaction = {
      id: params.paymentRequestId || `DEP-${Date.now().toString().slice(-6)}`,
      telcoRef: `CR${Math.floor(100000 + Math.random() * 900000)}X9`,
      status: 'COMPLETED',
      type: 'deposit',
      title: `Deposit via ${methodLabel}`,
      sub: displayAccount,
      recipient: displayAccount,
      accountNo: params.accountNumber,
      bankName: params.bankName,
      fiatAmount: params.amount,
      fiatCurrency: activeCountry.currency,
      cryptoAsset: activeCrypto,
      cryptoAmount: cryptoCredit,
      timestamp: new Date().toISOString(),
      smsConfirmation: `Cashramp Confirmed: ${activeCountry.currency} ${params.amount.toLocaleString()} received via ${methodLabel}. Credited ${cryptoCredit} ${activeCrypto}.`,
    };

    if (activeCrypto === 'NIM') setNimBalance((b) => b + parseFloat(cryptoCredit));
    else if (activeCrypto === 'USDT') setUsdtBalance((b) => b + parseFloat(cryptoCredit));
    else setUsdcBalance((b) => b + parseFloat(cryptoCredit));

    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  // Execute Airtime
  const executeAirtime = (bundleName: string, priceFiat: number): Transaction => {
    const cryptoCost = activeCrypto === 'NIM'
      ? parseFloat((priceFiat / currentRateNum / nimUsdRate).toFixed(1))
      : parseFloat((priceFiat / currentRateNum).toFixed(2));

    const tx: Transaction = {
      id: `AIR-${Date.now().toString().slice(-6)}`,
      telcoRef: `CR${Math.floor(100000 + Math.random() * 900000)}X9`,
      status: 'COMPLETED',
      type: 'airtime',
      title: bundleName,
      sub: 'Mobile Bundle Top-up',
      recipient: activeCountry.dial,
      fiatAmount: priceFiat,
      fiatCurrency: activeCountry.currency,
      cryptoAsset: activeCrypto,
      cryptoAmount: cryptoCost.toString(),
      timestamp: new Date().toISOString(),
      smsConfirmation: `Cashramp Confirmed: ${bundleName} loaded successfully on your line.`,
    };

    if (activeCrypto === 'NIM') setNimBalance((b) => Math.max(0, b - cryptoCost));
    else if (activeCrypto === 'USDT') setUsdtBalance((b) => Math.max(0, b - cryptoCost));
    else setUsdcBalance((b) => Math.max(0, b - cryptoCost));

    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  const resetBalance = () => {
    setNimBalance(15000);
    setUsdcBalance(150);
    setUsdtBalance(150);
  };

  return {
    countries,
    activeCountry,
    activeCrypto,
    selectedChain,
    setSelectedChain,
    rate,
    nimBalance,
    usdcBalance,
    usdtBalance,
    evmAddress,
    nimiqAddress,
    isNimiqConnecting,
    isNimiqReady,
    transactions,
    fiatEquivalent,
    maxCryptoBalance,
    changeCountry,
    setActiveCrypto,
    connectEvm,
    connectNimiq,
    executeSpend,
    executeCashOut,
    executeDeposit,
    executeAirtime,
    resetBalance,
  };
};
