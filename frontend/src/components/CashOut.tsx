import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Smartphone,
  Building2,
  Wallet,
  Info,
  Loader2,
  CreditCard,
  AtSign
} from 'lucide-react';
import { Country, CryptoAsset, MarketRate, RampQuote, PaymentMethod, PaymentField } from '../types';
import { SlideToPay } from './SlideToPay';
import { useTranslation } from '../i18n/useTranslation';
import { SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../services/evm';
import { ChainLogo } from './ChainLogo';
import { Security } from '../services/security';
import { API } from '../services/api';

interface CashOutProps {
  country: Country;
  cryptoAsset: CryptoAsset;
  maxCryptoBalance: number;
  rate?: MarketRate | number | null;
  nimUsdRate?: number;
  selectedChain?: SupportedChainKey;
  onOpenChainModal?: () => void;
  onBack: () => void;
  onExecuteCashOut: (params: {
    recipient?: string;
    phone?: string;
    recipientName?: string;
    accountNo?: string;
    bankName?: string;
    paymentMethodType?: string;
    methodName?: string;
    fields?: Record<string, string>;
    cryptoAmount: number;
    fiatAmount: number;
  }) => void;
}

const POPULAR_BANKS: Record<string, string[]> = {
  NG: [
    'Guaranty Trust Bank (GTBank)',
    'Access Bank',
    'Zenith Bank',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Moniepoint MFB',
    'OPay (PayCom)',
    'Kuda Microfinance Bank',
    'PalmPay',
    'Stanbic IBTC Bank',
    'Wema Bank (ALAT)',
  ],
  GH: [
    'Ecobank Ghana',
    'GCB Bank Limited',
    'Stanbic Bank Ghana',
    'Absa Bank Ghana',
    'Fidelity Bank Ghana',
    'CalBank',
  ],
  ZA: [
    'Capitec Bank',
    'First National Bank (FNB)',
    'Standard Bank',
    'Absa Bank',
    'Nedbank',
    'Discovery Bank',
    'Investec',
  ],
  KE: [
    'Equity Bank',
    'KCB Bank Kenya',
    'Co-operative Bank of Kenya',
    'NCBA Bank',
    'Absa Bank Kenya',
    'Stanbic Bank Kenya',
  ],
  TZ: [
    'CRDB Bank',
    'NMB Bank',
    'Stanbic Bank Tanzania',
    'Standard Chartered Tanzania',
    'Absa Bank Tanzania',
  ],
  UG: [
    'Stanbic Bank Uganda',
    'Centenary Bank',
    'Absa Bank Uganda',
    'Standard Chartered Uganda',
    'DFCU Bank',
  ],
  CM: [
    'Afriland First Bank',
    'Société Générale Cameroun',
    'BICEC',
    'Ecobank Cameroun',
    'UBA Cameroun',
  ],
};

const DEFAULT_CASHOUT_METHODS_FALLBACK: Record<string, PaymentMethod[]> = {
  NG: [
    {
      id: 'default_bank_ng',
      identifier: 'bank_transfer_ng',
      name: 'Bank Account',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
    {
      id: 'default_chipper_ng',
      identifier: 'chipper_cash',
      name: 'Chipper Cash',
      type: 'wallet',
      tag: 'Digital Wallet',
      fields: [
        { label: 'ChipperTag', identifier: 'chipper_tag', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
  ],
  GH: [
    {
      id: 'default_mtn_gh',
      identifier: 'mtn_momo_gh',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_bank_gh',
      identifier: 'bank_transfer_gh',
      name: 'Bank Account (Instant Pay)',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
    {
      id: 'default_voda_gh',
      identifier: 'vodafone_cash_gh',
      name: 'Vodafone Cash',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_airteltigo_gh',
      identifier: 'airteltigo_money_gh',
      name: 'AirtelTigo Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
  ],
  ZA: [
    {
      id: 'default_capitec_za',
      identifier: 'capitec',
      name: 'Capitec Bank',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_fnb_za',
      identifier: 'fnb',
      name: 'FNB',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_nedbank_za',
      identifier: 'nedbank',
      name: 'Nedbank',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_absa_za',
      identifier: 'absa',
      name: 'Absa Bank',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_fnb_ewallet_za',
      identifier: 'fnb_ewallet',
      name: 'FNB E-Wallet',
      type: 'wallet',
      tag: 'Digital Wallet',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_bank_za',
      identifier: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
    {
      id: 'default_easypay_za',
      identifier: 'easypay',
      name: 'EasyPay',
      type: 'wallet',
      tag: 'Digital Wallet',
      fields: [
        { label: 'PIN', identifier: 'pin', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
  ],
  DZ: [
    {
      id: 'default_baridimob_dz',
      identifier: 'baridimob',
      name: 'BaridiMob (Algérie Poste)',
      type: 'bank_transfer',
      tag: 'Postal Bank',
      fields: [
        { label: 'RIP Number (20 digits)', identifier: 'rip', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'CCP Number (Optional)', identifier: 'ccp', required: false },
      ],
    },
  ],
  KE: [
    {
      id: 'default_till_ke',
      identifier: 'pm_mpesa_till',
      name: 'M-Pesa Till (Buy Goods)',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Till Number', identifier: 'phone_number', required: true },
        { label: 'Store Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_paybill_ke',
      identifier: 'm_pesa_paybill_ke',
      name: 'M-Pesa Paybill',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Paybill Business No', identifier: 'paybill_number', required: true },
        { label: 'Account Number', identifier: 'phone_number', required: true },
        { label: 'Business Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_direct_bank_ke',
      identifier: 'direct_bank_ke',
      name: 'Direct Bank Transfer',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
  ],
  CM: [
    {
      id: 'default_mtn_cm',
      identifier: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_orange_cm',
      identifier: 'orange_money',
      name: 'Orange Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
  ],
  TZ: [
    {
      id: 'default_mpesa_tz',
      identifier: 'mpesa_paybill',
      name: 'M-PESA (Paybill)',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Paybill Number', identifier: 'paybill_number', required: true },
        { label: 'Account Number', identifier: 'account_number', required: true },
        { label: 'Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_mtn_tz',
      identifier: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_airtel_tz',
      identifier: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_bank_tz',
      identifier: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
  ],
  UG: [
    {
      id: 'default_mpesa_ug',
      identifier: 'mpesa',
      name: 'M-PESA',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_mtn_ug',
      identifier: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_airtel_ug',
      identifier: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
  ],
  ZM: [
    {
      id: 'default_mtn_zm',
      identifier: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_airtel_zm',
      identifier: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
      fields: [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ],
    },
    {
      id: 'default_bank_zm',
      identifier: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
      fields: [
        { label: 'Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
      ],
    },
  ],
};

export const CashOut: React.FC<CashOutProps> = ({
  country,
  cryptoAsset,
  maxCryptoBalance,
  rate,
  nimUsdRate = 0.000222,
  selectedChain = 'polygon',
  onOpenChainModal,
  onBack,
  onExecuteCashOut,
}) => {
  const { t } = useTranslation();
  const effectiveRate = typeof rate === 'number'
    ? rate
    : parseFloat(rate?.withdrawalRate || rate?.depositRate || '1400');

  // Country-specific preset amounts
  const presetAmounts = country.code === 'GH'
    ? [50, 100, 200, 500, 1000]
    : country.code === 'KE'
    ? [500, 1000, 2500, 5000, 10000]
    : country.code === 'ZA'
    ? [100, 250, 500, 1000, 2500]
    : country.code === 'DZ'
    ? [1000, 2500, 5000, 10000, 20000]
    : ['CM', 'CI', 'SN', 'BJ', 'BF', 'NE', 'TG', 'GA', 'TD', 'CF', 'CG'].includes(country.code)
    ? [5000, 10000, 25000, 50000, 100000]
    : [5000, 10000, 25000, 50000, 100000];

  const defaultInitialAmount = presetAmounts[1].toString();

  // Dynamic payment methods for active country
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    return DEFAULT_CASHOUT_METHODS_FALLBACK[country.code] || DEFAULT_CASHOUT_METHODS_FALLBACK.NG;
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(() => {
    const list = DEFAULT_CASHOUT_METHODS_FALLBACK[country.code] || DEFAULT_CASHOUT_METHODS_FALLBACK.NG;
    return list[0];
  });
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  // Dynamic field values
  const [formValues, setFormValues] = useState<Record<string, string>>(() => ({
    phone_number: Security.getUserPhone(country.dial),
    name: Security.getUserName() || '',
    bank_account_number: '',
    bank_name: POPULAR_BANKS[country.code]?.[0] || 'Commercial Bank',
    custom_bank_name: '',
    chipper_tag: '',
    rip: '',
    ccp: '',
    pin: '',
    paybill_number: '',
    account_number: '',
  }));

  const [inputMode, setInputMode] = useState<'fiat' | 'crypto'>('fiat');
  const [fiatInput, setFiatInput] = useState(defaultInitialAmount);
  const [cryptoInput, setCryptoInput] = useState('');

  // Live Quote & Countdown
  const [quote, setQuote] = useState<RampQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [rateRefreshedNotice, setRateRefreshedNotice] = useState(false);
  const quoteTimerRef = useRef<any>(null);

  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

  // Fetch live Cashramp payment methods whenever country changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMethods(true);

    const loadMethods = async () => {
      try {
        const liveMethods = await API.getPaymentMethods(country.code, country.id);
        if (isMounted && Array.isArray(liveMethods) && liveMethods.length > 0) {
          setPaymentMethods(liveMethods);
          setSelectedMethod(liveMethods[0]);
          return;
        }
      } catch (err) {
        console.warn('[CashOut] Live payment methods query notice:', err);
      }

      if (isMounted) {
        const fallback = DEFAULT_CASHOUT_METHODS_FALLBACK[country.code] || [
          {
            id: `default_momo_${country.code.toLowerCase()}`,
            identifier: 'mobile_money',
            name: `${country.name} Mobile Money`,
            type: 'mobile_money',
            tag: 'Mobile Money',
            fields: [
              { label: 'Phone Number', identifier: 'phone_number', required: true },
              { label: 'Account Name', identifier: 'name', required: true },
            ],
          },
          {
            id: `default_bank_${country.code.toLowerCase()}`,
            identifier: 'bank_transfer',
            name: 'Bank Account Transfer',
            type: 'bank_transfer',
            tag: 'Bank Transfer',
            fields: [
              { label: 'Account Number', identifier: 'bank_account_number', required: true },
              { label: 'Account Name', identifier: 'name', required: true },
              { label: 'Bank Name', identifier: 'bank_name', required: true },
            ],
          },
        ];
        setPaymentMethods(fallback);
        setSelectedMethod(fallback[0]);
      }
      setIsLoadingMethods(false);
    };

    loadMethods().finally(() => {
      if (isMounted) setIsLoadingMethods(false);
    });

    return () => {
      isMounted = false;
    };
  }, [country.code, country.id]);

  // Update field handler
  const handleFieldChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    if (key === 'phone_number') {
      Security.setUserPhone(val);
    }
    if (key === 'name') {
      Security.setUserName(val);
    }
  };

  // Quote Fetcher
  const fetchQuote = useCallback(async (isRefresh = false) => {
    let fiatAmountNum = 0;
    if (inputMode === 'fiat') {
      fiatAmountNum = parseFloat(fiatInput) || 0;
    } else {
      const cryptoNum = parseFloat(cryptoInput) || 0;
      const activeNimRate = nimUsdRate || 0.000222;
      const usdVal = cryptoAsset === 'NIM' ? cryptoNum * activeNimRate : cryptoNum;
      fiatAmountNum = usdVal * effectiveRate;
    }

    if (fiatAmountNum <= 0) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    try {
      const res = await API.getQuote({
        amount: Number(fiatAmountNum.toFixed(2)),
        currency: country.currency,
        cryptoAsset,
        countryCode: country.code,
        paymentMethodIdentifier: selectedMethod.identifier,
        type: 'spend',
      });

      if (res.success && res.quote) {
        setQuote(res.quote);
        setSecondsRemaining(45);
        if (inputMode === 'fiat') {
          setCryptoInput(res.quote.cryptoAmount.toString());
        }
        if (isRefresh) {
          setRateRefreshedNotice(true);
          setTimeout(() => setRateRefreshedNotice(false), 2500);
        }
      }
    } catch (err) {
      console.error('Error fetching cashout quote:', err);
    } finally {
      setIsQuoting(false);
    }
  }, [fiatInput, cryptoInput, inputMode, country.currency, country.code, cryptoAsset, effectiveRate, selectedMethod.identifier]);

  // Trigger quote when inputs or selected payment method changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [fiatInput, cryptoInput, inputMode, selectedMethod.identifier, fetchQuote]);

  // 45s countdown timer
  useEffect(() => {
    if (!quote) return;

    quoteTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchQuote(true);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (quoteTimerRef.current) clearInterval(quoteTimerRef.current);
    };
  }, [quote, fetchQuote]);

  const activeCryptoRequired = quote ? quote.cryptoAmount : (parseFloat(cryptoInput) || 0);
  const activeFiatReceived = quote ? quote.fiatAmount : (parseFloat(fiatInput) || 0);
  const isInsufficient = activeCryptoRequired > maxCryptoBalance;

  // Validate that all required fields for selected method are filled
  const fieldsConfig: PaymentField[] = selectedMethod.fields && selectedMethod.fields.length > 0
    ? selectedMethod.fields
    : selectedMethod.type === 'bank_transfer'
    ? [
        { label: 'Bank Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ]
    : selectedMethod.type === 'wallet'
    ? [
        { label: 'ChipperTag / Wallet ID', identifier: 'chipper_tag', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ]
    : [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ];

  const hasRequiredFields = fieldsConfig.every((f) => {
    if (!f.required) return true;
    if (f.identifier === 'bank_name') {
      const bVal = formValues.bank_name === 'OTHER_CUSTOM' ? formValues.custom_bank_name : formValues.bank_name;
      return Boolean(bVal && bVal.trim().length > 1);
    }
    const val = formValues[f.identifier];
    return Boolean(val && val.trim().length > 1);
  });

  const getPrimaryIdentifier = () => {
    return formValues.bank_account_number ||
      formValues.phone_number ||
      formValues.chipper_tag ||
      formValues.rip ||
      formValues.account_number ||
      '';
  };

  const getEffectiveBankName = () => {
    if (formValues.bank_name === 'OTHER_CUSTOM') {
      return formValues.custom_bank_name || 'Other Bank';
    }
    return formValues.bank_name || POPULAR_BANKS[country.code]?.[0] || 'Commercial Bank';
  };

  const handleSlideConfirm = () => {
    if (activeCryptoRequired <= 0 || !hasRequiredFields || isInsufficient) return;

    const primary = getPrimaryIdentifier();
    const bank = getEffectiveBankName();
    const name = formValues.name || Security.getUserName() || 'Recipient';

    onExecuteCashOut({
      recipient: primary,
      phone: formValues.phone_number || primary,
      recipientName: name,
      accountNo: formValues.bank_account_number || formValues.account_number || formValues.rip || primary,
      bankName: bank,
      paymentMethodType: selectedMethod.identifier,
      methodName: selectedMethod.name,
      fields: {
        ...formValues,
        bank_name: bank,
      },
      cryptoAmount: activeCryptoRequired,
      fiatAmount: activeFiatReceived,
    });
  };

  // Helper icon for payment method badge
  const getMethodIcon = (m: PaymentMethod) => {
    const idLower = (m.identifier || '').toLowerCase();
    const nameLower = (m.name || '').toLowerCase();
    if (idLower.includes('bank') || nameLower.includes('bank') || idLower.includes('baridi') || idLower === 'absa' || idLower === 'fnb' || idLower === 'capitec' || idLower === 'nedbank') {
      return <Building2 size={15} />;
    }
    if (idLower.includes('chipper') || idLower.includes('wallet') || idLower === 'easypay') {
      return <Wallet size={15} />;
    }
    return <Smartphone size={15} />;
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '7px 14px',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ArrowLeft size={14} /> {t('back')}
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('cashOut')}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {country.flag} {country.name} • Offramp Crypto to Local Fiat
          </span>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Network Source Selector */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>
            Deduct Crypto From Network:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChainLogo chain={selectedChain} size={20} />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{chainConfig.name}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-nimiq-gold-dark)', background: 'var(--color-nimiq-gold-subtle)', padding: '2px 7px', borderRadius: 'var(--radius-xs)', fontWeight: 800 }}>
              Gas: {chainConfig.nativeCurrency.symbol}
            </span>
          </div>
        </div>

        {onOpenChainModal && (
          <button
            type="button"
            onClick={onOpenChainModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--color-nimiq-gold-subtle)',
              border: '1.5px solid var(--color-nimiq-gold)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              color: 'var(--color-nimiq-gold-dark)',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Layers size={13} />
            <span>Change</span>
            <ChevronDown size={13} />
          </button>
        )}
      </div>

      {/* Country Specific Payout Rail Selector */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select {country.name} Payout Method:
          </label>
          {isLoadingMethods && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--color-nimiq-gold-dark)' }}>
              <Loader2 size={12} className="spin-animate" /> Loading rails
            </span>
          )}
        </div>

        {/* Responsive Grid of Verified Country Methods */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: paymentMethods.length > 2 ? 'repeat(2, 1fr)' : `repeat(${Math.max(1, paymentMethods.length)}, 1fr)`,
          gap: '8px',
        }}>
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod.identifier === method.identifier;
            return (
              <button
                key={method.id || method.identifier}
                type="button"
                onClick={() => setSelectedMethod(method)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--color-nimiq-gold-subtle), var(--bg-surface-elevated))'
                    : 'var(--bg-surface)',
                  border: isSelected
                    ? '2px solid var(--color-nimiq-gold)'
                    : '1.5px solid var(--border-subtle)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(246, 174, 45, 0.25)' : 'none',
                }}
              >
                <div style={{
                  color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {getMethodIcon(method)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {method.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {method.tag || 'Instant Payout'}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 size={14} color="var(--color-nimiq-gold-dark)" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Required Account Fields for Selected Payment Rail */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <ShieldCheck size={16} color="var(--color-emerald)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Recipient Details • {selectedMethod.name}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fieldsConfig.map((field) => {
            const fid = field.identifier;

            // Bank Name dropdown for bank transfer rails
            if (fid === 'bank_name') {
              const countryBanks = POPULAR_BANKS[country.code] || [];
              const isCustom = formValues.bank_name === 'OTHER_CUSTOM';

              return (
                <div key={fid}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--color-rose)' }}>*</span>}
                  </label>
                  {countryBanks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <select
                        className="input-field"
                        value={formValues.bank_name}
                        onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                        style={{ fontWeight: 700, cursor: 'pointer' }}
                      >
                        {countryBanks.map((bName) => (
                          <option key={bName} value={bName}>{bName}</option>
                        ))}
                        <option value="OTHER_CUSTOM">Other Bank (Type name)...</option>
                      </select>
                      {isCustom && (
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter your Bank Name"
                          value={formValues.custom_bank_name}
                          onChange={(e) => handleFieldChange('custom_bank_name', e.target.value)}
                          style={{ fontWeight: 700 }}
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Standard Bank"
                      value={formValues.bank_name}
                      onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                      style={{ fontWeight: 700 }}
                    />
                  )}
                </div>
              );
            }

            // Phone Number Input with Dial Code Badge
            if (fid === 'phone_number') {
              return (
                <div key={fid}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--color-rose)' }}>*</span>}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      position: 'absolute',
                      left: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}>
                      <span>{country.flag}</span>
                      <span>{country.dial}</span>
                    </div>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="712 345 678"
                      value={formValues.phone_number?.replace(country.dial, '').trimStart()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        handleFieldChange('phone_number', `${country.dial} ${raw}`);
                      }}
                      style={{ paddingLeft: '72px', fontWeight: 700 }}
                    />
                  </div>
                </div>
              );
            }

            // Chipper Cash Tag
            if (fid === 'chipper_tag') {
              return (
                <div key={fid}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--color-rose)' }}>*</span>}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <AtSign size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-nimiq-gold-dark)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="username"
                      value={formValues.chipper_tag?.replace('@', '')}
                      onChange={(e) => handleFieldChange('chipper_tag', `@${e.target.value.trim().replace(/^@+/, '')}`)}
                      style={{ paddingLeft: '34px', fontWeight: 700 }}
                    />
                  </div>
                </div>
              );
            }

            // Standard Bank Account / Paybill / RIP / PIN / Name Inputs
            const isBankAcc = fid === 'bank_account_number' || fid === 'account_number' || fid === 'rip';
            const placeholder = isBankAcc
              ? (country.code === 'DZ' ? '00799999000000000000' : '0123456789')
              : fid === 'name'
              ? 'Account / Beneficiary Full Name'
              : fid === 'paybill_number'
              ? 'Business Paybill Number'
              : fid === 'pin'
              ? '4 to 6 digit EasyPay PIN'
              : `Enter ${field.label}`;

            return (
              <div key={fid}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  {field.label} {field.required && <span style={{ color: 'var(--color-rose)' }}>*</span>}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {isBankAcc && (
                    <CreditCard size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  )}
                  <input
                    type={fid === 'pin' ? 'password' : 'text'}
                    className="input-field"
                    placeholder={placeholder}
                    value={formValues[fid] || ''}
                    onChange={(e) => handleFieldChange(fid, e.target.value)}
                    style={{
                      paddingLeft: isBankAcc ? '36px' : undefined,
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fiat-First Amount Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>How Much Do You Want to Cash Out?</span>
          <button
            type="button"
            onClick={() => setInputMode(inputMode === 'fiat' ? 'crypto' : 'fiat')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-nimiq-gold-dark)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Switch to {inputMode === 'fiat' ? cryptoAsset : country.currency}
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="number"
            className="input-field"
            value={inputMode === 'fiat' ? fiatInput : cryptoInput}
            onChange={(e) => {
              if (inputMode === 'fiat') setFiatInput(e.target.value);
              else setCryptoInput(e.target.value);
            }}
            placeholder="0.00"
            style={{
              paddingRight: '80px',
              fontSize: '1.3rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.02em',
            }}
          />
          <div style={{
            position: 'absolute',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            {inputMode === 'fiat' ? (
              <>
                <span>{country.flag}</span>
                <span>{country.currency}</span>
              </>
            ) : (
              <span>{cryptoAsset}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
        {presetAmounts.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              setInputMode('fiat');
              setFiatInput(val.toString());
            }}
            style={{
              flexShrink: 0,
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {country.symbol}{val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Insufficient Balance Banner */}
      {isInsufficient && (
        <div style={{
          background: 'var(--color-amber-subtle)',
          border: '1.5px solid var(--color-amber)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Insufficient {cryptoAsset} Balance
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Available: {maxCryptoBalance.toFixed(2)} {cryptoAsset} • Required: {activeCryptoRequired.toLocaleString()} {cryptoAsset}
            </div>
          </div>
        </div>
      )}

      {/* Live Quote Breakdown Card */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-hero)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '0.82rem',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Countdown Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--border-subtle)',
        }}>
          <div style={{
            height: '100%',
            width: `${(secondsRemaining / 45) * 100}%`,
            background: secondsRemaining > 10 ? 'var(--color-nimiq-gold)' : 'var(--color-amber)',
            transition: 'width 1s linear',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} style={{ color: 'var(--color-nimiq-gold-dark)' }} />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
              Withdrawal Rate Locked: {secondsRemaining}s
            </span>
            {rateRefreshedNotice && (
              <span style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', fontWeight: 800 }}>
                ⚡ Refreshed
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fetchQuote(true)}
            disabled={isQuoting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={11} className={isQuoting ? 'spin-slow' : ''} />
            Re-quote
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Cashramp P2P Rate ({selectedMethod.name})</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            1 USD = {quote ? quote.exchangeRate.toLocaleString() : effectiveRate.toLocaleString()} {country.currency}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Settlement Rail</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
            {selectedMethod.name} ({country.code})
          </span>
        </div>

        {cryptoAsset === 'NIM' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Cross-Chain Bridge</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ⚡ ChangeNOW (NIM ➔ USDT Polygon)
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Crypto Deducted</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-nimiq-gold-dark)' }}>
            {activeCryptoRequired.toLocaleString()} {cryptoAsset}
          </span>
        </div>

        {/* You Receive Hero */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-primary)',
          fontWeight: 800,
          fontSize: '0.98rem',
          borderTop: '1.5px solid var(--border-subtle)',
          paddingTop: '10px',
          marginTop: '2px',
        }}>
          <div>
            <div>You Receive</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Direct {selectedMethod.name} payout
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 900 }}>
              {country.symbol} {activeFiatReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {country.currency}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        marginBottom: '16px',
        padding: '0 4px',
      }}>
        <Info size={13} style={{ color: 'var(--color-nimiq-gold-dark)', flexShrink: 0 }} />
        <span>Payout sent directly to your {selectedMethod.name} via verified local Cashramp settlement agents.</span>
      </div>

      <SlideToPay 
        label={t('slideToCashOut')} 
        onConfirm={handleSlideConfirm} 
        disabled={activeCryptoRequired <= 0 || !hasRequiredFields || isInsufficient} 
      />
    </div>
  );
};

export default CashOut;
