import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Building2,
  Wallet,
  ChevronDown,
  Layers,
  ShieldCheck,
  Loader2,
  CreditCard,
  AtSign,
  TrendingUp,
} from 'lucide-react';
import { Country, CryptoAsset, PaymentMethod, PaymentField, MarketRate } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../services/evm';
import { ChainLogo } from './ChainLogo';
import { Security } from '../services/security';
import { API } from '../services/api';

interface AddFundsProps {
  country: Country;
  cryptoAsset: CryptoAsset;
  rate?: MarketRate | number | null;
  nimUsdRate?: number;
  selectedChain?: SupportedChainKey;
  onOpenChainModal?: () => void;
  onBack: () => void;
  onRequestDeposit: (params: {
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    paymentMethodType: string;
    methodName: string;
    amount: number;
    fields?: Record<string, string>;
  }) => Promise<void> | void;
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

const DEFAULT_METHODS_FALLBACK: Record<string, PaymentMethod[]> = {
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

export const AddFunds: React.FC<AddFundsProps> = ({
  country,
  cryptoAsset,
  rate,
  nimUsdRate = 0.000222,
  selectedChain = 'polygon',
  onOpenChainModal,
  onBack,
  onRequestDeposit,
}) => {
  const { t } = useTranslation();

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
    return DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(() => {
    const list = DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
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

  const [amount, setAmount] = useState(defaultInitialAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveDepositRate = typeof rate === 'number'
    ? rate
    : parseFloat(rate?.depositRate || rate?.withdrawalRate || '1400');
  const activeNimRate = nimUsdRate || 0.000222;
  const numAmount = parseFloat(amount) || 0;
  const usdAmount = effectiveDepositRate > 0 ? (numAmount / effectiveDepositRate) : 0;
  const estimatedCryptoAmount = cryptoAsset === 'NIM'
    ? (usdAmount / activeNimRate).toFixed(1)
    : usdAmount.toFixed(2);

  // Fetch live Cashramp payment method types whenever country changes
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
        console.warn('[AddFunds] Live payment methods query notice:', err);
      }

      if (isMounted) {
        const fallback = DEFAULT_METHODS_FALLBACK[country.code] || [
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

    // Reset default bank name and amount for this country
    const banks = POPULAR_BANKS[country.code] || [];
    setFormValues((prev) => ({
      ...prev,
      bank_name: banks[0] || 'Commercial Bank',
      phone_number: Security.getUserPhone(country.dial),
      name: Security.getUserName() || '',
    }));
    setAmount(defaultInitialAmount);

    return () => {
      isMounted = false;
    };
  }, [country.code, country.id]);

  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

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

  // Determine current method classification
  const isBank = selectedMethod.type === 'bank_transfer' || selectedMethod.identifier.includes('bank') || selectedMethod.identifier.includes('baridi');
  const isWallet = selectedMethod.type === 'wallet' || selectedMethod.identifier.includes('chipper') || selectedMethod.identifier === 'easypay';
  const isMobile = !isBank && !isWallet;

  // Validate that all required fields for selected method are filled
  const fieldsConfig: PaymentField[] = selectedMethod.fields && selectedMethod.fields.length > 0
    ? selectedMethod.fields
    : isBank
    ? [
        { label: 'Bank Account Number', identifier: 'bank_account_number', required: true },
        { label: 'Bank Name', identifier: 'bank_name', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ]
    : isWallet
    ? [
        { label: 'ChipperTag / Wallet ID', identifier: 'chipper_tag', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ]
    : [
        { label: 'Phone Number', identifier: 'phone_number', required: true },
        { label: 'Account Name', identifier: 'name', required: true },
      ];

  const getEffectiveBankName = () => {
    if (formValues.bank_name === 'OTHER_CUSTOM') {
      return formValues.custom_bank_name || 'Other Bank';
    }
    return formValues.bank_name || POPULAR_BANKS[country.code]?.[0] || 'Commercial Bank';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0 || isSubmitting) return;

    const resolvedBank = getEffectiveBankName();
    const primaryId = formValues.bank_account_number ||
      formValues.phone_number ||
      formValues.chipper_tag ||
      formValues.rip ||
      formValues.account_number ||
      '';

    setIsSubmitting(true);
    try {
      await onRequestDeposit({
        phone: formValues.phone_number || primaryId,
        accountNumber: formValues.bank_account_number || formValues.account_number || formValues.rip || undefined,
        bankName: isBank ? resolvedBank : undefined,
        paymentMethodType: selectedMethod.identifier,
        methodName: selectedMethod.name,
        amount: num,
        fields: {
          ...formValues,
          bank_name: resolvedBank,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const idLower = (method.identifier || '').toLowerCase();
    const nameLower = (method.name || '').toLowerCase();
    if (idLower.includes('bank') || nameLower.includes('bank') || idLower.includes('baridi') || idLower === 'absa' || idLower === 'fnb' || idLower === 'capitec' || idLower === 'nedbank') {
      return <Building2 size={16} />;
    }
    if (idLower.includes('chipper') || idLower.includes('wallet') || idLower === 'easypay') {
      return <Wallet size={16} />;
    }
    return <Smartphone size={16} />;
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px',
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
            {t('addFunds')}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {country.flag} {country.name} • Onramp Local Fiat to Crypto
          </span>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Target Blockchain Selector Card */}
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
            Receive Crypto On Blockchain:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChainLogo chain={selectedChain} size={20} />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{chainConfig.name}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-emerald)', background: 'var(--color-emerald-light)', padding: '2px 7px', borderRadius: 'var(--radius-xs)', fontWeight: 800 }}>
              {chainConfig.avgFee} fee
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

      {/* Dynamic Payment Rail Selector */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Select {country.name} Payment Rail
          </span>
          {isLoadingMethods && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Loader2 size={12} className="spin-animate" /> Cashramp rails
            </span>
          )}
        </div>

        {/* Method Selection Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: paymentMethods.length > 2 ? 'repeat(2, 1fr)' : `repeat(${Math.max(1, paymentMethods.length)}, 1fr)`,
          gap: '8px',
        }}>
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod.identifier === method.identifier;
            return (
              <button
                type="button"
                key={method.id || method.identifier}
                onClick={() => setSelectedMethod(method)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? 'var(--color-emerald-light)'
                    : 'var(--bg-surface-elevated)',
                  border: isSelected
                    ? '2px solid var(--color-emerald)'
                    : '1.5px solid var(--border-subtle)',
                  color: isSelected ? 'var(--color-emerald)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  color: isSelected ? 'var(--color-emerald)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {getMethodIcon(method)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: isSelected ? 'var(--color-emerald)' : 'var(--text-primary)',
                  }}>
                    {method.name}
                  </div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 600, color: isSelected ? 'var(--color-emerald)' : 'var(--text-muted)' }}>
                    {method.tag || (method.type === 'bank_transfer' ? 'Instant Bank' : method.type === 'wallet' ? 'E-Wallet' : 'Mobile SIM')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Rail Explanatory Badge */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      }}>
        <ShieldCheck size={16} color="var(--color-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
          {isBank && (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>Bank Transfer On-ramp:</strong> Transfer via your bank app or USSD to the verified Cashramp agent details provided in the confirmation step. Crypto will be minted directly to your wallet once confirmed.
            </span>
          )}
          {isWallet && (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>Digital Wallet On-ramp:</strong> Send from your {selectedMethod.name} account to fund your crypto wallet instantly via Cashramp escrow.
            </span>
          )}
          {isMobile && (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>Mobile Money On-ramp:</strong> You will receive a direct prompt or verified agent mobile money number to deposit via {selectedMethod.name}.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dynamic Inputs Based on Selected Payment Rail */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <TrendingUp size={16} color="var(--color-emerald)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Your Sender Details • {selectedMethod.name}
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

              // Standard Bank Account / Paybill / RIP / Name Inputs
              const isBankAcc = fid === 'bank_account_number' || fid === 'account_number' || fid === 'rip';
              const placeholder = isBankAcc
                ? (country.code === 'DZ' ? '00799999000000000000' : '0123456789')
                : fid === 'name'
                ? 'Your Full Name'
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
                      type="text"
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

        {/* Amount Input */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {t('depositAmountFiat')} ({country.currency})
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              style={{
                paddingRight: '60px',
                fontSize: '1.15rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <span style={{ position: 'absolute', right: '16px', fontWeight: 800, color: 'var(--text-muted)' }}>
              {country.currency}
            </span>
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
          {presetAmounts.map((val) => (
            <button
              type="button"
              key={val}
              onClick={() => setAmount(val.toString())}
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
              +{country.symbol}{val.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Estimated Crypto To Receive */}
        {numAmount > 0 && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>
                Estimated to Receive
              </div>
              <div style={{ fontWeight: 800, color: 'var(--color-emerald)', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
                ~{Number(estimatedCryptoAmount).toLocaleString()} {cryptoAsset}
              </div>
            </div>
            {cryptoAsset === 'NIM' && (
              <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>⚡ ChangeNOW Bridge</span>
                <div>via ${usdAmount.toFixed(2)} USDT on Polygon</div>
              </div>
            )}
            {cryptoAsset === 'USDT' && (
              <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Direct Cashramp Mint</span>
                <div>on {chainConfig.name}</div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          style={{
            width: '100%',
            padding: '16px',
            background: isSubmitting
              ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.6) 0%, rgba(16, 185, 129, 0.6) 100%)'
              : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            fontSize: '0.94rem',
            cursor: isSubmitting ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-animate" />
              <span>Initiating Cashramp Deposit...</span>
            </>
          ) : (
            <>
              {getMethodIcon(selectedMethod)}
              <span>Deposit via {selectedMethod.name} ({country.symbol}{Number(amount || 0).toLocaleString()} ➔ {cryptoAsset})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFunds;
