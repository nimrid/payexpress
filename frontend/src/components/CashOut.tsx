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
  Info
} from 'lucide-react';
import { Country, CryptoAsset, RampQuote, VerifiedRecipient } from '../types';
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
  rate: number;
  selectedChain?: SupportedChainKey;
  onOpenChainModal?: () => void;
  onBack: () => void;
  onExecuteCashOut: (params: { phone: string; cryptoAmount: number; fiatAmount: number }) => void;
}

export const CashOut: React.FC<CashOutProps> = ({
  country,
  cryptoAsset,
  maxCryptoBalance,
  rate,
  selectedChain = 'polygon',
  onOpenChainModal,
  onBack,
  onExecuteCashOut,
}) => {
  const { t } = useTranslation();
  const [payoutType, setPayoutType] = useState<'momo' | 'bank'>('momo');
  const [phone, setPhone] = useState(() => Security.getUserPhone(country.dial));
  const [inputMode, setInputMode] = useState<'fiat' | 'crypto'>('fiat');
  const [fiatInput, setFiatInput] = useState('2000');
  const [cryptoInput, setCryptoInput] = useState('15');

  // Recipient Verification
  const [verifiedRecipient, setVerifiedRecipient] = useState<VerifiedRecipient | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Live Quote & Countdown
  const [quote, setQuote] = useState<RampQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [rateRefreshedNotice, setRateRefreshedNotice] = useState(false);
  const quoteTimerRef = useRef<any>(null);

  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

  // Recipient verification (debounced)
  useEffect(() => {
    const cleanNumber = phone.trim();
    if (!cleanNumber || cleanNumber.length < 5) {
      setVerifiedRecipient(null);
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    const timer = setTimeout(async () => {
      try {
        const res = await API.verifyRecipient(
          cleanNumber, 
          country.code, 
          payoutType === 'bank' ? 'bank' : 'phone'
        );
        if (res.success && res.verified) {
          setVerifiedRecipient({
            verified: true,
            recipientName: res.recipientName || 'Verified Payout Account',
            category: res.category || 'Mobile Wallet',
            provider: res.provider || (payoutType === 'bank' ? 'Commercial Bank' : 'Mobile Money'),
            verifiedBadge: res.verifiedBadge || 'KYC Verified',
            bankName: res.bankName,
          });
        } else {
          setVerifiedRecipient(null);
        }
      } catch (err) {
        console.error('Cashout recipient lookup error:', err);
      } finally {
        setIsVerifying(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phone, country.code, payoutType]);

  // Quote Fetcher
  const fetchQuote = useCallback(async (isRefresh = false) => {
    let fiatAmountNum = 0;
    if (inputMode === 'fiat') {
      fiatAmountNum = parseFloat(fiatInput) || 0;
    } else {
      const cryptoNum = parseFloat(cryptoInput) || 0;
      const nimUsdRate = 0.00325;
      const usdVal = cryptoAsset === 'NIM' ? cryptoNum * nimUsdRate : cryptoNum;
      fiatAmountNum = usdVal * rate;
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
  }, [fiatInput, cryptoInput, inputMode, country.currency, country.code, cryptoAsset, rate]);

  // Trigger quote when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [fiatInput, cryptoInput, inputMode, fetchQuote]);

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

  const handleSlideConfirm = () => {
    if (activeCryptoRequired <= 0 || !phone.trim() || isInsufficient) return;
    onExecuteCashOut({
      phone,
      cryptoAmount: activeCryptoRequired,
      fiatAmount: activeFiatReceived,
    });
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
            Offramp Crypto to MoMo / Bank
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

      {/* Payout Rail Switcher */}
      <div className="tab-group" style={{ marginBottom: '16px' }}>
        <button
          onClick={() => { setPayoutType('momo'); setVerifiedRecipient(null); }}
          className={`tab-btn ${payoutType === 'momo' ? 'active' : ''}`}
        >
          <Smartphone size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
          Mobile Money (M-Pesa / MoMo)
        </button>
        <button
          onClick={() => { setPayoutType('bank'); setVerifiedRecipient(null); }}
          className={`tab-btn ${payoutType === 'bank' ? 'active' : ''}`}
        >
          <Building2 size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
          Bank Account (EFT / NUBAN)
        </button>
      </div>

      {/* Recipient Account Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>
            {payoutType === 'momo' ? 'Destination Mobile Number' : 'Destination Bank Account Number'}
          </span>
          {isVerifying ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-nimiq-gold-dark)', fontSize: '0.74rem', fontWeight: 700 }}>
              <RefreshCw size={12} className="spin-slow" /> Verifying registered name...
            </span>
          ) : verifiedRecipient ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-emerald)', fontSize: '0.74rem', fontWeight: 800 }}>
              <CheckCircle2 size={13} /> {verifiedRecipient.verifiedBadge || 'Verified'}
            </span>
          ) : null}
        </div>

        <input
          type="text"
          className="input-field"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            Security.setUserPhone(e.target.value);
          }}
          placeholder={payoutType === 'momo' ? `${country.dial} 712 345 678` : 'e.g. 0123456789'}
          style={{
            borderColor: verifiedRecipient ? 'var(--color-emerald)' : undefined,
            fontWeight: 700,
          }}
        />
      </div>

      {/* Verified Recipient Card */}
      {verifiedRecipient && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(246, 174, 45, 0.06) 100%)',
          border: '1.5px solid var(--color-emerald)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                <ShieldCheck size={13} style={{ color: 'var(--color-emerald)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-emerald)', textTransform: 'uppercase' }}>
                  {verifiedRecipient.verifiedBadge}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  • {verifiedRecipient.provider}
                </span>
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {verifiedRecipient.recipientName}
              </div>
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-emerald-subtle)',
              color: 'var(--color-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
      )}

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
        {[1000, 2500, 5000, 10000, 25000].map((val) => (
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
          <span>Cashramp P2P Rate</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            1 USD = {quote ? quote.exchangeRate.toLocaleString() : rate} {country.currency}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Settlement Fee</span>
          <span style={{ color: 'var(--color-emerald)', fontWeight: 800 }}>
            Sponsored 0.00%
          </span>
        </div>

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
            <div>You Receive in MoMo / Bank</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Exact net deposit to your account
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
        <span>Funds are deposited directly by Cashramp licensed local liquidity agents.</span>
      </div>

      <SlideToPay 
        label={t('slideToCashOut')} 
        onConfirm={handleSlideConfirm} 
        disabled={activeCryptoRequired <= 0 || !phone.trim() || isInsufficient} 
      />
    </div>
  );
};

export default CashOut;
