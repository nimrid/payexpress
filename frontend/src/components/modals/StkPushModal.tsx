import React, { useState } from 'react';
import { Smartphone, Check, Loader2, ShieldCheck, Building2, Wallet } from 'lucide-react';

interface StkPushModalProps {
  isOpen: boolean;
  phone: string;
  accountNumber?: string;
  bankName?: string;
  methodName?: string;
  paymentMethodType?: string;
  amount: number;
  currency: string;
  symbol: string;
  cryptoAsset?: string;
  cryptoAmount?: string | number;
  agent?: string;
  paymentDetails?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const StkPushModal: React.FC<StkPushModalProps> = ({
  isOpen,
  phone,
  accountNumber,
  bankName,
  methodName,
  paymentMethodType,
  amount,
  currency,
  symbol,
  cryptoAsset = 'USDT',
  cryptoAmount,
  agent,
  paymentDetails,
  onConfirm,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isBank = Boolean(accountNumber || paymentMethodType?.includes('bank'));
  const isWallet = Boolean(paymentMethodType?.includes('chipper') || paymentMethodType?.includes('wallet') || paymentMethodType === 'easypay');
  const methodLabel = methodName || (isBank ? 'Bank Transfer' : isWallet ? 'Digital Wallet' : 'Mobile Money');
  const accountIdentifier = accountNumber ? `${bankName ? bankName + ' ' : ''}#${accountNumber}` : phone;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-sheet"
        style={{
          textAlign: 'center',
          maxWidth: '380px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        {/* Modal Header Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: isBank
              ? 'rgba(59, 130, 246, 0.15)'
              : 'rgba(16, 185, 129, 0.15)',
            color: isBank ? '#60A5FA' : 'var(--color-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {isBank ? (
            <Building2 size={26} />
          ) : isWallet ? (
            <Wallet size={26} />
          ) : (
            <Smartphone size={26} />
          )}
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', color: '#F8FAFC' }}>
          {isBank ? 'Bank Transfer Instructions' : 'Complete Deposit'}
        </h3>

        <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px', lineHeight: 1.4 }}>
          {isBank
            ? `Send ${symbol} ${amount.toLocaleString()} to the details below, then confirm your deposit.`
            : `Please complete payment from ${accountIdentifier || 'your mobile money account'}, then tap confirm.`}
        </p>

        {/* Amount & Cashramp Agent Summary Card */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Payment Method:
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {methodLabel}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Deposit Amount:
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
              {symbol} {amount.toLocaleString()} {currency}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              {isBank ? 'Bank Account:' : isWallet ? 'Wallet Account:' : 'Phone Number:'}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {accountIdentifier}
            </span>
          </div>

          {cryptoAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Credited To Wallet:
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ≈ {cryptoAmount} {cryptoAsset}
              </span>
            </div>
          )}

          {agent && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '6px',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                color: 'var(--color-nimiq-gold-dark)',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={14} />
              <span>Cashramp Agent: {agent}</span>
            </div>
          )}

          {paymentDetails && (
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-surface)',
                padding: '6px 8px',
                borderRadius: '4px',
                wordBreak: 'break-all',
              }}
            >
              {paymentDetails}
            </div>
          )}
        </div>

        {/* Nimiq Pay Security Note */}
        <div
          style={{
            background: 'rgba(234, 175, 12, 0.1)',
            border: '1px solid rgba(234, 175, 12, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '16px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="var(--color-nimiq-gold)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Nimiq Pay Secured:</strong> Cryptographic verification is handled natively by your wallet. No extra PIN needed.
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
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
            marginBottom: '8px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-animate" />
              <span>Confirming Deposit...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>I Have Paid • Confirm Deposit</span>
            </>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel Transaction
        </button>
      </div>
    </div>
  );
};
