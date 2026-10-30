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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Country, CryptoAsset, PaymentMethod } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../services/evm';
import { ChainLogo } from './ChainLogo';
import { Security } from '../services/security';
import { API } from '../services/api';

interface AddFundsProps {
  country: Country;
  cryptoAsset: CryptoAsset;
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
  }) => Promise<void> | void;
}

const POPULAR_BANKS: Record<string, string[]> = {
  NG: [
    'Access Bank',
    'Guaranty Trust Bank (GTB)',
    'Zenith Bank',
    'First Bank of Nigeria',
    'Kuda Bank',
    'OPay',
    'Moniepoint',
    'United Bank for Africa (UBA)',
    'PalmPay',
  ],
  GH: [
    'GCB Bank',
    'Ecobank Ghana',
    'Stanbic Bank',
    'Fidelity Bank',
    'CalBank',
    'Absa Ghana',
  ],
  ZA: [
    'Capitec Bank',
    'First National Bank (FNB)',
    'Standard Bank',
    'Absa Bank',
    'Nedbank',
    'Discovery Bank',
  ],
  KE: [
    'Equity Bank',
    'KCB Bank',
    'Co-operative Bank',
    'NCBA Bank',
    'Absa Bank Kenya',
    'Stanbic Bank Kenya',
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
    },
    {
      id: 'default_chipper_ng',
      identifier: 'chipper_cash',
      name: 'Chipper Cash',
      type: 'wallet',
      tag: 'Digital Wallet',
    },
  ],
  GH: [
    {
      id: 'default_bank_gh',
      identifier: 'bank_transfer_gh',
      name: 'Bank Account (Instant Pay)',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
    },
    {
      id: 'default_mtn_gh',
      identifier: 'mtn_momo_gh',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
    },
    {
      id: 'default_voda_gh',
      identifier: 'vodafone_cash_gh',
      name: 'Vodafone Cash',
      type: 'mobile_money',
      tag: 'Mobile Money',
    },
  ],
  ZA: [
    {
      id: 'default_bank_za',
      identifier: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
    },
    {
      id: 'default_capitec_za',
      identifier: 'capitec',
      name: 'Capitec Pay',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
    },
    {
      id: 'default_fnb_za',
      identifier: 'fnb',
      name: 'FNB',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
    },
    {
      id: 'default_easypay_za',
      identifier: 'easypay',
      name: 'EasyPay',
      type: 'wallet',
      tag: 'Digital Wallet',
    },
  ],
  KE: [
    {
      id: 'default_till_ke',
      identifier: 'pm_mpesa_till',
      name: 'M-Pesa Till (Buy Goods)',
      type: 'mobile_money',
      tag: 'Mobile Money',
    },
    {
      id: 'default_paybill_ke',
      identifier: 'm_pesa_paybill_ke',
      name: 'M-Pesa Paybill',
      type: 'mobile_money',
      tag: 'Mobile Money',
    },
    {
      id: 'default_airtel_ke',
      identifier: 'airtel_money_ke',
      name: 'Airtel Money',
      type: 'mobile_money',
      tag: 'Mobile Money',
    },
    {
      id: 'default_direct_bank_ke',
      identifier: 'direct_bank_ke',
      name: 'Direct Bank',
      type: 'bank_transfer',
      tag: 'Bank Transfer',
    },
  ],
};

export const AddFunds: React.FC<AddFundsProps> = ({
  country,
  cryptoAsset,
  selectedChain = 'polygon',
  onOpenChainModal,
  onBack,
  onRequestDeposit,
}) => {
  const { t } = useTranslation();

  // Country-specific preset amounts
  const presetAmounts = country.code === 'GH'
    ? [20, 50, 100, 200, 500]
    : country.code === 'KE'
    ? [500, 1000, 2500, 5000, 10000]
    : country.code === 'ZA'
    ? [100, 250, 500, 1000, 2500]
    : [2500, 5000, 10000, 25000, 50000];

  const defaultInitialAmount = country.code === 'GH'
    ? '100'
    : country.code === 'KE'
    ? '1000'
    : country.code === 'ZA'
    ? '250'
    : '10000';

  // Dynamic payment methods for active country
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    return DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(() => {
    const list = DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
    return list[0];
  });
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  // Form input fields
  const [phone, setPhone] = useState(() => Security.getUserPhone(country.dial));
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [bankName, setBankName] = useState(() => {
    const banks = POPULAR_BANKS[country.code] || [];
    return banks[0] || 'Commercial Bank';
  });
  const [customBank, setCustomBank] = useState('');
  const [walletTag, setWalletTag] = useState('');
  const [amount, setAmount] = useState(defaultInitialAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live Cashramp payment method types whenever country changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMethods(true);

    API.getPaymentMethods(country.code, country.id)
      .then((methods) => {
        if (!isMounted) return;
        if (methods && methods.length > 0) {
          setPaymentMethods(methods);
          // Pick default payment method if available, or first
          const matched = country.defaultPaymentMethod
            ? methods.find((m) => m.identifier === country.defaultPaymentMethod)
            : null;
          setSelectedMethod(matched || methods[0]);
        } else {
          const fallback = DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
          setPaymentMethods(fallback);
          setSelectedMethod(fallback[0]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load Cashramp payment methods:', err);
        const fallback = DEFAULT_METHODS_FALLBACK[country.code] || DEFAULT_METHODS_FALLBACK.NG;
        setPaymentMethods(fallback);
        setSelectedMethod(fallback[0]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMethods(false);
      });

    // Reset default bank name and amount for this country
    const banks = POPULAR_BANKS[country.code] || [];
    setBankName(banks[0] || 'Commercial Bank');
    setCustomBank('');
    setAmount(defaultInitialAmount);
    setPhone(Security.getUserPhone(country.dial));

    return () => {
      isMounted = false;
    };
  }, [country.code, country.id]);

  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

  // Determine current method classification
  const isBank = selectedMethod.type === 'bank_transfer' || selectedMethod.identifier.includes('bank');
  const isWallet = selectedMethod.type === 'wallet' || selectedMethod.identifier.includes('chipper') || selectedMethod.identifier === 'easypay';
  const isMobile = !isBank && !isWallet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0 || isSubmitting) return;

    const resolvedBank = bankName === 'other' ? (customBank.trim() || 'Commercial Bank') : bankName;

    setIsSubmitting(true);
    try {
      await onRequestDeposit({
        phone: isMobile ? phone : (isWallet ? walletTag || phone : phone),
        accountNumber: isBank ? accountNumber : undefined,
        bankName: isBank ? resolvedBank : undefined,
        paymentMethodType: selectedMethod.identifier,
        methodName: selectedMethod.name,
        amount: num,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'bank_transfer' || method.identifier.includes('bank')) {
      return <Building2 size={16} />;
    }
    if (method.type === 'wallet' || method.identifier.includes('chipper') || method.identifier === 'easypay') {
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
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('addFunds')}</h2>
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
            Payment Rail ({country.name})
          </span>
          {isLoadingMethods && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Loader2 size={12} className="spin-animate" /> Cashramp rails
            </span>
          )}
        </div>

        {/* Method Selection Chips/Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
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
                    ? '1.5px solid var(--color-emerald)'
                    : '1.5px solid var(--border-subtle)',
                  color: isSelected ? 'var(--color-emerald)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(5, 150, 105, 0.2)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  color: isSelected ? 'var(--color-emerald)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {getMethodIcon(method)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
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
              <strong style={{ color: 'var(--text-primary)' }}>Bank Transfer On-ramp:</strong> Transfer via your bank app or USSD to Cashramp escrow. Crypto will be minted directly to your EVM address once verified.
            </span>
          )}
          {isWallet && (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>Digital Wallet On-ramp:</strong> Authorize deposit directly via your {selectedMethod.name} account to fund your crypto wallet instantly.
            </span>
          )}
          {isMobile && (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>Mobile STK Push:</strong> You will receive a SIM Toolkit prompt on your phone to authorize payment via {selectedMethod.name}.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dynamic Inputs Based on Selected Payment Rail */}
        {isBank && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {/* Bank Name Selector */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Your Bank ({country.name})
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-field"
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    paddingRight: '36px',
                  }}
                >
                  {(POPULAR_BANKS[country.code] || ['Commercial Bank']).map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                  <option value="other">
                    Other Commercial Bank...
                  </option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Custom Bank Name if "Other" is picked */}
            {bankName === 'other' && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Enter Bank Name
                </div>
                <input
                  type="text"
                  placeholder="e.g. Sterling Bank, Standard Chartered"
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            {/* Bank Account Number */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Bank Account Number (NIP / Instant Transfer)
              </div>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit account number"
                className="input-field"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
              />
            </div>
          </div>
        )}

        {isWallet && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {selectedMethod.identifier === 'chipper_cash' ? 'ChipperTag or Registered Phone' : `${selectedMethod.name} ID`}
            </div>
            <input
              type="text"
              placeholder={selectedMethod.identifier === 'chipper_cash' ? '@username or +234...' : 'Account ID'}
              value={walletTag}
              onChange={(e) => setWalletTag(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {isMobile && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {selectedMethod.name} Mobile Number
            </div>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                Security.setUserPhone(e.target.value);
              }}
              placeholder={`${country.dial} 801 234 5678`}
              className="input-field"
            />
          </div>
        )}

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
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
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

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
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
              <span>Processing with Cashramp...</span>
            </>
          ) : isBank ? (
            <>
              <Building2 size={18} />
              <span>Deposit via Bank Transfer ({country.symbol}{Number(amount || 0).toLocaleString()} ➔ {cryptoAsset})</span>
            </>
          ) : isWallet ? (
            <>
              <Wallet size={18} />
              <span>Deposit via {selectedMethod.name} ({country.symbol}{Number(amount || 0).toLocaleString()} ➔ {cryptoAsset})</span>
            </>
          ) : (
            <>
              <Smartphone size={18} />
              <span>Prompt Mobile STK Push ({country.symbol}{Number(amount || 0).toLocaleString()} ➔ {cryptoAsset})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddFunds;
