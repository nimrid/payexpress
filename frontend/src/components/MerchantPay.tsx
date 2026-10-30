import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  Receipt, 
  Building2, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  PlusCircle, 
  Info,
  MapPin,
  Zap,
  Smartphone,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Country, CryptoAsset, RampQuote, VerifiedRecipient, PaymentMethod } from '../types';
import { API } from '../services/api';
import { SlideToPay } from './SlideToPay';
import { useTranslation } from '../i18n/useTranslation';

interface MerchantPayProps {
  country: Country;
  cryptoAsset: CryptoAsset;
  maxCryptoBalance?: number;
  onNavigateToAddFunds?: () => void;
  onOpenCountryModal?: () => void;
  onBack: () => void;
  onExecutePay: (params: {
    recipient: string;
    recipientName: string;
    amount: number;
    accountNo?: string;
    quote?: RampQuote;
    bankName?: string;
    paymentMethodType?: string;
  }) => void;
}

interface PresetMerchant {
  id: string;
  label: string;
  acc?: string;
  bankName?: string;
}

// Fallback baseline payment methods per country while API loads or for offline resilience
const getDefaultPaymentMethods = (countryCode: string): PaymentMethod[] => {
  const code = (countryCode || 'KE').toUpperCase();
  switch (code) {
    case 'NG':
      return [
        {
          id: 'pm_ng_bank',
          identifier: 'bank_transfer_ng',
          name: 'Bank Account (NUBAN)',
          type: 'bank_transfer',
          tag: 'Instant Bank Pay',
          fields: [
            { label: 'Account Number', identifier: 'bank_account_number', required: true },
            { label: 'Bank Name', identifier: 'bank_name', required: true },
          ],
        },
        {
          id: 'pm_ng_chipper',
          identifier: 'chipper_cash',
          name: 'Chipper Cash',
          type: 'wallet',
          tag: 'ChipperTag',
          fields: [
            { label: 'ChipperTag', identifier: 'chipper_tag', required: true },
          ],
        },
      ];
    case 'GH':
      return [
        {
          id: 'pm_gh_momo',
          identifier: 'mtn_momo_gh',
          name: 'MTN Mobile Money',
          type: 'mobile_money',
          tag: 'MTN MoMo',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_gh_bank',
          identifier: 'bank_transfer_gh',
          name: 'Bank Account (Instant Pay)',
          type: 'bank_transfer',
          tag: 'GhIPSS Instant',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
        {
          id: 'pm_gh_vodafone',
          identifier: 'vodafone_cash_gh',
          name: 'Telecel (Vodafone Cash)',
          type: 'mobile_money',
          tag: 'Telecel Cash',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_gh_airteltigo',
          identifier: 'airteltigo_money_gh',
          name: 'AirtelTigo Money',
          type: 'mobile_money',
          tag: 'AirtelTigo',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
      ];
    case 'ZA':
      return [
        {
          id: 'pm_za_capitec',
          identifier: 'capitec',
          name: 'Capitec Pay / PayShap',
          type: 'bank_transfer',
          tag: 'PayShap',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
        {
          id: 'pm_za_bank',
          identifier: 'bank_transfer',
          name: 'Bank Transfer (EFT)',
          type: 'bank_transfer',
          tag: 'Commercial Bank',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
        {
          id: 'pm_za_fnb_ewallet',
          identifier: 'fnb_ewallet',
          name: 'FNB E-Wallet',
          type: 'wallet',
          tag: 'Mobile E-Wallet',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_za_absa',
          identifier: 'absa',
          name: 'Absa Bank',
          type: 'bank_transfer',
          tag: 'Direct Bank',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
      ];
    case 'UG':
      return [
        {
          id: 'pm_ug_mpesa',
          identifier: 'mpesa',
          name: 'M-PESA (Safaricom)',
          type: 'mobile_money',
          tag: 'M-Pesa Merchant',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_ug_paybill',
          identifier: 'mpesa_paybill',
          name: 'M-PESA (Paybill)',
          type: 'paybill',
          tag: 'Business Paybill',
          fields: [
            { label: 'Paybill Number', identifier: 'paybill_number', required: true },
            { label: 'Account Number', identifier: 'account_number', required: true },
          ],
        },
        {
          id: 'pm_ug_momo',
          identifier: 'mtn_momo',
          name: 'MTN Mobile Money',
          type: 'mobile_money',
          tag: 'MTN MoMo',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_ug_bank',
          identifier: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank_transfer',
          tag: 'Bank Transfer',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
      ];
    case 'TZ':
      return [
        {
          id: 'pm_tz_vodacom',
          identifier: 'vodacom',
          name: 'Vodacom M-Pesa',
          type: 'mobile_money',
          tag: 'M-Pesa Till',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_tz_tigo',
          identifier: 'tigopesa',
          name: 'TigoPesa',
          type: 'mobile_money',
          tag: 'TigoPesa',
          fields: [{ label: 'Phone Number', identifier: 'phone_number', required: true }],
        },
        {
          id: 'pm_tz_bank',
          identifier: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank_transfer',
          tag: 'Bank Transfer',
          fields: [{ label: 'Account Number', identifier: 'bank_account_number', required: true }],
        },
      ];
    case 'KE':
    default:
      return [
        {
          id: 'pm_ke_till',
          identifier: 'pm_mpesa_till',
          name: 'M-Pesa Till (Buy Goods)',
          type: 'till',
          tag: 'Buy Goods',
          fields: [{ label: 'Till Number', identifier: 'recipient', required: true }],
        },
        {
          id: 'pm_ke_paybill',
          identifier: 'm_pesa_paybill_ke',
          name: 'M-Pesa Paybill',
          type: 'paybill',
          tag: 'Paybill',
          fields: [
            { label: 'Paybill Number', identifier: 'recipient', required: true },
            { label: 'Account Number', identifier: 'accountNo', required: true },
          ],
        },
        {
          id: 'pm_ke_airtel',
          identifier: 'airtel_money_ke',
          name: 'Airtel Money',
          type: 'mobile_money',
          tag: 'Mobile Money',
          fields: [{ label: 'Phone Number', identifier: 'recipient', required: true }],
        },
        {
          id: 'pm_ke_bank',
          identifier: 'direct_bank_ke',
          name: 'Direct Bank Transfer',
          type: 'bank_transfer',
          tag: 'Bank Transfer',
          fields: [{ label: 'Account Number', identifier: 'recipient', required: true }],
        },
      ];
  }
};

export const MerchantPay: React.FC<MerchantPayProps> = ({
  country,
  cryptoAsset,
  maxCryptoBalance = 999999,
  onNavigateToAddFunds,
  onOpenCountryModal,
  onBack,
  onExecutePay,
}) => {
  const { t } = useTranslation();

  // Payment Methods loaded for this country
  const [methods, setMethods] = useState<PaymentMethod[]>(() => getDefaultPaymentMethods(country.code));
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(() => getDefaultPaymentMethods(country.code)[0]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  // Regional Banks list for Bank Transfer rails
  const [regionalBanks, setRegionalBanks] = useState<{ code: string; name: string }[]>([]);
  const [selectedBankName, setSelectedBankName] = useState<string>('');

  // Form Inputs
  const [identifier, setIdentifier] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  
  // Recipient Verification State
  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedRecipient | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Quote & Timer State
  const [quote, setQuote] = useState<RampQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [rateRefreshedNotice, setRateRefreshedNotice] = useState(false);
  const quoteTimerRef = useRef<any>(null);

  // Fetch payment methods and banks when country changes
  useEffect(() => {
    let isCancelled = false;
    const loadCountryRails = async () => {
      setIsLoadingMethods(true);
      setIdentifier('');
      setAccountNo('');
      setVerifiedInfo(null);

      // Set fallback initial list immediately to prevent blank UI
      const defaults = getDefaultPaymentMethods(country.code);
      setMethods(defaults);
      setSelectedMethod(defaults[0]);

      try {
        const [apiMethods, apiBanks] = await Promise.all([
          API.getPaymentMethods(country.code, country.id),
          API.getBanks(country.code),
        ]);

        if (isCancelled) return;

        if (apiMethods && apiMethods.length > 0) {
          // Normalize methods to ensure recognizable types
          const normalized = apiMethods.map((m) => {
            const idLower = (m.identifier || '').toLowerCase();
            const nameLower = (m.name || '').toLowerCase();
            let resolvedType = m.type || 'mobile_money';
            if (idLower.includes('paybill') || nameLower.includes('paybill')) resolvedType = 'paybill';
            else if (idLower.includes('till') || nameLower.includes('till') || nameLower.includes('buy goods')) resolvedType = 'till';
            else if (idLower.includes('chipper')) resolvedType = 'chipper';
            else if (idLower.includes('bank') || nameLower.includes('bank') || idLower.includes('capitec') || idLower.includes('fnb') || idLower.includes('absa')) resolvedType = 'bank_transfer';

            return {
              ...m,
              type: resolvedType,
            };
          });

          setMethods(normalized);
          setSelectedMethod(normalized[0]);
        }

        if (apiBanks && apiBanks.length > 0) {
          setRegionalBanks(apiBanks);
          setSelectedBankName(apiBanks[0].name);
        } else {
          setRegionalBanks([]);
          setSelectedBankName('');
        }
      } catch (err) {
        console.error('Error loading country payment rails:', err);
      } finally {
        if (!isCancelled) setIsLoadingMethods(false);
      }
    };

    loadCountryRails();
    return () => {
      isCancelled = true;
    };
  }, [country.code, country.id]);

  // Determine the Rail category for the active method
  const getActiveRailCategory = (): 'till' | 'paybill' | 'bank' | 'chipper' | 'momo' | 'wallet' => {
    const idLower = (selectedMethod.identifier || '').toLowerCase();
    const nameLower = (selectedMethod.name || '').toLowerCase();
    const typeLower = (selectedMethod.type || '').toLowerCase();

    if (idLower.includes('paybill') || nameLower.includes('paybill')) return 'paybill';
    if (idLower.includes('till') || nameLower.includes('till') || nameLower.includes('buy goods')) return 'till';
    if (idLower.includes('chipper')) return 'chipper';
    if (typeLower.includes('bank') || idLower.includes('bank') || nameLower.includes('bank') || idLower.includes('capitec') || idLower.includes('fnb') || idLower.includes('absa')) return 'bank';
    if (idLower.includes('ewallet') || idLower.includes('easypay') || typeLower.includes('wallet')) return 'wallet';
    return 'momo';
  };

  const activeRail = getActiveRailCategory();

  // Presets tailored to Country and Active Rail
  const getPresets = (): PresetMerchant[] => {
    const code = country.code;

    if (code === 'KE') {
      if (activeRail === 'till') {
        return [
          { id: '890123', label: 'Naivas Supermarket' },
          { id: '542890', label: 'Java House' },
          { id: '123456', label: 'TotalEnergies' },
          { id: '654321', label: 'Quickmart CBD' },
        ];
      }
      if (activeRail === 'paybill') {
        return [
          { id: '888880', label: 'KPLC Tokens', acc: '1428571932' },
          { id: '222111', label: 'Nairobi Water', acc: 'NW-94812' },
          { id: '522522', label: 'KCB Bank', acc: '110294819' },
          { id: '329101', label: 'Bolt Driver', acc: 'KBZ-481' },
        ];
      }
      if (activeRail === 'bank') {
        return [
          { id: '0123456789', label: 'Equity Bank Kenya', bankName: 'Equity Bank' },
          { id: '9876543210', label: 'Standard Chartered', bankName: 'Standard Chartered Bank' },
        ];
      }
      return [
        { id: '0733123456', label: 'Airtel Money Vendor' },
      ];
    }

    if (code === 'NG') {
      if (activeRail === 'chipper') {
        return [
          { id: '@adewale_store', label: 'Adewale Store' },
          { id: '@techmart_ng', label: 'TechMart Hub' },
        ];
      }
      return [
        { id: '0123456789', label: 'GTBank (Adewale)', bankName: 'Guaranty Trust Bank (GTBank)' },
        { id: '9876543210', label: 'Access (TechMart Ltd)', bankName: 'Access Bank' },
        { id: '1102938475', label: 'Moniepoint (Oluwaseun)', bankName: 'Moniepoint Microfinance Bank' },
        { id: '8031234567', label: 'OPay Agency (Danjuma)', bankName: 'OPay (PayCom)' },
        { id: '0019283746', label: 'Kuda MFB Merchant', bankName: 'Kuda Microfinance Bank' },
      ];
    }

    if (code === 'GH') {
      if (activeRail === 'bank') {
        return [
          { id: '0207890123', label: 'Ecobank Ghana (Kofi)', bankName: 'Ecobank Ghana' },
          { id: '144100123456', label: 'GCB Bank Limited', bankName: 'GCB Bank Limited' },
        ];
      }
      return [
        { id: '0244123456', label: 'MTN MoMo (Kwame)' },
        { id: '0501234567', label: 'Telecel (Abena Provisions)' },
        { id: '0261122334', label: 'AirtelTigo Merchant' },
      ];
    }

    if (code === 'ZA') {
      if (activeRail === 'wallet') {
        return [
          { id: '0821234567', label: 'FNB E-Wallet (Kagiso)' },
        ];
      }
      return [
        { id: '1234567890', label: 'Capitec PayShap (Thabo)', bankName: 'Capitec Bank' },
        { id: '62012345678', label: 'FNB Business (Sipho)', bankName: 'First National Bank (FNB)' },
        { id: '4050607080', label: 'Absa Commercial', bankName: 'Absa Bank' },
      ];
    }

    if (code === 'UG') {
      if (activeRail === 'paybill') {
        return [
          { id: '185185', label: 'UMEME Yaka Power', acc: '24681357' },
          { id: '600100', label: 'NWSC Water Kampala', acc: 'WTR-9182' },
        ];
      }
      if (activeRail === 'bank') {
        return [
          { id: '0123456789', label: 'Stanbic Bank Uganda' },
        ];
      }
      return [
        { id: '0772123456', label: 'MTN MoMo (Kampala Grocers)' },
        { id: '0752987654', label: 'Shell Bugolobi (Airtel)' },
      ];
    }

    // Default regional presets
    return [
      { id: '0701234567', label: `${country.name} MoMo Merchant` },
      { id: '0123456789', label: `${country.name} Commercial Bank` },
    ];
  };

  // Recipient Verification Lookup (debounced)
  useEffect(() => {
    const cleanId = identifier.trim();
    if (!cleanId || cleanId.length < 3) {
      setVerifiedInfo(null);
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    const lookupTimer = setTimeout(async () => {
      try {
        const res = await API.verifyRecipient(cleanId, country.code, activeRail);
        if (res.success && res.verified) {
          setVerifiedInfo({
            verified: true,
            recipientName: res.recipientName || 'Verified Merchant',
            category: res.category || 'Merchant',
            type: res.type || activeRail,
            provider: res.provider || selectedMethod.name || 'Official Rail',
            verifiedBadge: res.verifiedBadge || 'Verified Merchant',
            branch: res.branch,
            bankName: res.bankName || (activeRail === 'bank' ? selectedBankName : undefined),
            note: res.note,
          });
        } else {
          setVerifiedInfo(null);
        }
      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setIsVerifying(false);
      }
    }, 350);

    return () => clearTimeout(lookupTimer);
  }, [identifier, country.code, activeRail, selectedMethod.name, selectedBankName]);

  // Fetch Quote Function
  const fetchQuote = useCallback(async (isRefresh = false) => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    try {
      const res = await API.getQuote({
        amount: num,
        currency: country.currency,
        cryptoAsset,
        countryCode: country.code,
        type: 'spend',
        paymentMethodIdentifier: selectedMethod.identifier,
      });
      if (res.success && res.quote) {
        setQuote(res.quote);
        setSecondsRemaining(45);
        if (isRefresh) {
          setRateRefreshedNotice(true);
          setTimeout(() => setRateRefreshedNotice(false), 2500);
        }
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
    } finally {
      setIsQuoting(false);
    }
  }, [amount, country.currency, country.code, cryptoAsset, selectedMethod.identifier]);

  // Quote Refresh on amount/cryptoAsset/method change
  useEffect(() => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchQuote(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [amount, fetchQuote]);

  // 45s Countdown Timer for Quote Lock
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

  // Quick Amount Add
  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const isInsufficient = quote ? quote.cryptoAmount > maxCryptoBalance : false;

  const handleSlideConfirm = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0 || !identifier.trim() || isInsufficient) return;
    onExecutePay({
      recipient: identifier,
      recipientName: verifiedInfo?.recipientName || `${selectedMethod.name} #${identifier}`,
      amount: num,
      accountNo: activeRail === 'paybill' ? accountNo : undefined,
      bankName: activeRail === 'bank' ? (selectedBankName || verifiedInfo?.bankName || undefined) : undefined,
      paymentMethodType: selectedMethod.identifier,
      quote: quote || undefined,
    });
  };

  // Helper icon for a payment method tab
  const getMethodIcon = (m: PaymentMethod) => {
    const id = (m.identifier || '').toLowerCase();
    const name = (m.name || '').toLowerCase();
    if (id.includes('paybill') || name.includes('paybill')) return <Receipt size={14} style={{ marginRight: '6px' }} />;
    if (id.includes('till') || name.includes('till') || name.includes('buy goods')) return <Store size={14} style={{ marginRight: '6px' }} />;
    if (id.includes('chipper')) return <Zap size={14} style={{ marginRight: '6px' }} />;
    if (id.includes('bank') || name.includes('bank') || id.includes('capitec') || id.includes('fnb') || id.includes('absa')) return <Building2 size={14} style={{ marginRight: '6px' }} />;
    return <Smartphone size={14} style={{ marginRight: '6px' }} />;
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
            {t('payMerchant')}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Direct African Offramp & Settle
          </span>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Active Payment Corridor Banner with Country Change Option */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '16px',
        fontSize: '0.8rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>{country.flag}</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, fontSize: '0.88rem' }}>
              {country.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-nimiq-gold-dark)', fontWeight: 700 }}>
              Corridor Currency: {country.currency} ({country.symbol}) • {methods.length} Cashramp Rails
            </div>
          </div>
        </div>

        {onOpenCountryModal && (
          <button
            type="button"
            onClick={onOpenCountryModal}
            style={{
              background: 'var(--color-nimiq-gold-subtle)',
              border: '1.2px solid var(--color-nimiq-gold)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-nimiq-gold-dark)',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Change</span>
            <span style={{ fontSize: '0.75rem' }}>🌍</span>
          </button>
        )}
      </div>

      {/* Dynamic Payment Rail Tabs (Matched to Country Support in Cashramp) */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Select Supported Rail ({country.name})
        </div>
        <div 
          className="tab-group" 
          style={{ 
            display: 'flex', 
            gap: '6px', 
            overflowX: 'auto', 
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {methods.map((method) => {
            const isSelected = selectedMethod.identifier === method.identifier;
            return (
              <button
                key={method.identifier}
                onClick={() => {
                  setSelectedMethod(method);
                  setIdentifier('');
                  setAccountNo('');
                  setVerifiedInfo(null);
                }}
                className={`tab-btn ${isSelected ? 'active' : ''}`}
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  padding: '7px 12px',
                }}
              >
                {getMethodIcon(method)}
                {method.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Recipient Input Container */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>
            {activeRail === 'till' 
              ? 'Enter Merchant Till Number' 
              : activeRail === 'paybill' 
              ? 'Business Paybill Number' 
              : activeRail === 'chipper'
              ? 'ChipperTag (@username)'
              : activeRail === 'bank'
              ? country.code === 'NG' ? '10-Digit NUBAN Account Number' : 'Bank Account Number'
              : 'Merchant / Subscriber Mobile Number'}
          </span>
          {isVerifying ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-nimiq-gold-dark)', fontSize: '0.74rem', fontWeight: 700 }}>
              <RefreshCw size={12} className="spin-slow" /> Verifying name...
            </span>
          ) : verifiedInfo ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-emerald)', fontSize: '0.74rem', fontWeight: 800 }}>
              <CheckCircle2 size={13} /> {verifiedInfo.verifiedBadge || 'Verified'}
            </span>
          ) : null}
        </div>

        <input
          type="text"
          className="input-field"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={
            activeRail === 'till' 
              ? 'e.g. 890123 (Naivas) or 542890 (Java)' 
              : activeRail === 'paybill' 
              ? 'e.g. 888880 (KPLC Tokens) or 185185' 
              : activeRail === 'chipper'
              ? 'e.g. @adewale_store or @techmart_ng'
              : activeRail === 'bank'
              ? 'e.g. 0123456789'
              : `e.g. ${country.dial} 7...`
          }
          style={{
            borderColor: verifiedInfo ? 'var(--color-emerald)' : undefined,
            fontWeight: 700,
          }}
        />

        {/* 1-Tap Quick Fill Merchant Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', marginTop: '8px', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Quick Test:
          </span>
          {getPresets().map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setIdentifier(preset.id);
                if (preset.acc && activeRail === 'paybill') setAccountNo(preset.acc);
                if (preset.bankName && activeRail === 'bank') setSelectedBankName(preset.bankName);
              }}
              style={{
                flexShrink: 0,
                background: identifier === preset.id ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface-elevated)',
                border: identifier === preset.id ? '1.5px solid var(--color-nimiq-gold)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                color: identifier === preset.id ? 'var(--color-nimiq-gold-dark)' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Selector (When Bank Transfer is Active and Banks are available) */}
      {activeRail === 'bank' && regionalBanks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Select Commercial Bank ({country.name})
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedBankName}
              onChange={(e) => setSelectedBankName(e.target.value)}
              className="input-field"
              style={{
                appearance: 'none',
                paddingRight: '36px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {regionalBanks.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={16} 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} 
            />
          </div>
        </div>
      )}

      {/* Paybill Account Number / Meter Reference Field */}
      {activeRail === 'paybill' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Account / Meter / Customer Reference Number
          </div>
          <input
            type="text"
            className="input-field"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="e.g. Meter No (1428571932) or Account No"
          />
        </div>
      )}

      {/* Recipient Verification Hero Card (Appears as soon as resolved) */}
      {verifiedInfo && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(246, 174, 45, 0.06) 100%)',
          border: '1.5px solid var(--color-emerald)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '18px',
          boxShadow: 'var(--shadow-sm)',
          animation: 'fadeIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--color-emerald-subtle)',
                  color: 'var(--color-emerald)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.02em',
                }}>
                  <ShieldCheck size={12} /> {verifiedInfo.verifiedBadge || 'Official Business'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • {verifiedInfo.provider}
                </span>
              </div>

              <div style={{ fontSize: '1.02rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {verifiedInfo.recipientName}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                <span>{verifiedInfo.category}</span>
                {verifiedInfo.branch && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                    <MapPin size={11} /> {verifiedInfo.branch}
                  </span>
                )}
                {verifiedInfo.bankName && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    🏦 {verifiedInfo.bankName}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-emerald-subtle)',
              color: 'var(--color-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}>
            <Info size={13} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
            <span>Exact payment delivered to vendor via {selectedMethod.name}. Zero merchant deduction.</span>
          </div>
        </div>
      )}

      {/* Fiat-First Amount Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>{t('amountToPay')} ({country.currency})</span>
          <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
            ⚡ Instant P2P Offramp
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="number"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              paddingRight: '75px',
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
            fontSize: '0.95rem',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span>{country.flag}</span>
            <span>{country.currency}</span>
          </div>
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
        {[200, 500, 1000, 2500, 5000].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleAddAmount(val)}
            style={{
              flexShrink: 0,
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            +{val.toLocaleString()} {country.symbol}
          </button>
        ))}
      </div>

      {/* Insufficient Balance Banner */}
      {isInsufficient && quote && (
        <div style={{
          background: 'var(--color-amber-subtle)',
          border: '1.5px solid var(--color-amber)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Insufficient {cryptoAsset} Balance
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                You have {maxCryptoBalance.toFixed(2)} {cryptoAsset}, but need {quote.cryptoAmount.toLocaleString()} {cryptoAsset}
              </div>
            </div>
          </div>

          {onNavigateToAddFunds && (
            <button
              type="button"
              onClick={onNavigateToAddFunds}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--color-amber)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <PlusCircle size={13} /> Add Funds
            </button>
          )}
        </div>
      )}

      {/* Quote Breakdown Card with Countdown Lock Bar */}
      {quote && (
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
          {/* Rate Lock Progress Bar */}
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

          {/* Rate Timer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} style={{ color: 'var(--color-nimiq-gold-dark)' }} />
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                Quote Locked: {secondsRemaining}s
              </span>
              {rateRefreshedNotice && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', fontWeight: 800 }}>
                  ⚡ Rate Refreshed
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

          {/* Breakdown Rows */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Merchant Receives ({selectedMethod.name})</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {country.symbol} {quote.fiatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {quote.fiatCurrency}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>P2P Corridor Rate (Cashramp)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              1 USD = {quote.exchangeRate.toLocaleString()} {country.currency}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Network Gas Fee</span>
            <span style={{ color: 'var(--color-emerald)', fontWeight: 800 }}>
              Sponsored Free (PayExpress)
            </span>
          </div>

          {/* Total Crypto Deduction Hero */}
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
              <div>Total Crypto Cost</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Deducted from connected wallet
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--color-nimiq-gold-dark)', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 900 }}>
                {quote.cryptoAmount.toLocaleString()} {cryptoAsset}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ≈ ${(quote.usdAmount).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide to Pay Component */}
      <SlideToPay 
        label={t('slideToPay')} 
        onConfirm={handleSlideConfirm} 
        disabled={!parseFloat(amount) || !identifier.trim() || isInsufficient} 
      />
    </div>
  );
};

export default MerchantPay;
