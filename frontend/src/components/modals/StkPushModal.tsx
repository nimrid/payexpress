import React, { useState, useEffect } from 'react';
import { Smartphone, Check, Delete, RotateCcw, ShieldCheck, Loader2, AlertCircle, Lock, Building2, Wallet } from 'lucide-react';
import { Security } from '../../services/security';

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
  onConfirmPin: (pin: string) => Promise<void> | void;
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
  cryptoAsset = 'USDC',
  cryptoAmount,
  agent,
  paymentDetails,
  onConfirmPin,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Setup mode tracking if user has never configured a PIN
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [initialPin, setInitialPin] = useState('');
  const initialPinRef = React.useRef('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setInitialPin('');
      initialPinRef.current = '';
      setSetupStep(1);
      setErrorMessage(null);
      setIsSuccess(false);
      setIsSubmitting(false);

      if (!Security.hasPin()) {
        setIsSetupMode(true);
      } else {
        setIsSetupMode(false);
      }
    }
  }, [isOpen]);

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setPin('');
  };

  const handleInputDigit = (digit: string) => {
    if (pin.length >= 4 || isSubmitting || isSuccess) return;

    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage(null);

    // Auto-verify / confirm on 4 digits
    if (nextPin.length === 4) {
      if (isSetupMode) {
        if (setupStep === 1) {
          initialPinRef.current = nextPin;
          setInitialPin(nextPin);
          setPin('');
          setSetupStep(2);
        } else {
          // Confirm PIN in step 2
          const target = initialPinRef.current || initialPin;
          if (nextPin === target) {
            setIsSubmitting(true);
            try {
              Security.setupPin(nextPin);
              setIsSuccess(true);
              setTimeout(async () => {
                await onConfirmPin(nextPin);
              }, 450);
            } catch (err: any) {
              triggerShake(err.message || 'Failed to save PIN');
              setIsSubmitting(false);
            }
          } else {
            triggerShake('PINs do not match. Please start over.');
            initialPinRef.current = '';
            setInitialPin('');
            setSetupStep(1);
          }
        }
      } else {
        // Verify against user's stored PIN
        setIsSubmitting(true);
        const result = Security.verifyPin(nextPin);
        if (result.valid) {
          setIsSuccess(true);
          setTimeout(async () => {
            await onConfirmPin(nextPin);
          }, 450);
        } else {
          setIsSubmitting(false);
          triggerShake(result.error || 'Incorrect Security PIN.');
        }
      }
    }
  };

  // Handle hardware keyboard input
  useEffect(() => {
    if (!isOpen || isSubmitting || isSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          handleInputDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setErrorMessage(null);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isSubmitting, isSuccess, isSetupMode, setupStep, initialPin]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    handleInputDigit(num);
  };

  const handleBackspace = () => {
    if (isSubmitting || isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (isSubmitting || isSuccess) return;
    setPin('');
    setErrorMessage(null);
  };
  const isBank = Boolean(accountNumber || paymentMethodType?.includes('bank'));
  const isWallet = Boolean(paymentMethodType?.includes('chipper') || paymentMethodType?.includes('wallet') || paymentMethodType === 'easypay');
  const methodLabel = methodName || (isBank ? 'Bank Transfer' : isWallet ? 'Digital Wallet' : 'Mobile Money');
  const accountIdentifier = accountNumber ? `${bankName ? bankName + ' ' : ''}#${accountNumber}` : phone;

  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-sheet"
        style={{
          textAlign: 'center',
          maxWidth: '380px',
          animation: isShaking ? 'shake 0.4s ease' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        {/* Security / Mobile / Bank Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isSuccess
            ? 'rgba(16, 185, 129, 0.25)'
            : isSetupMode
            ? 'rgba(234, 175, 12, 0.15)'
            : isBank
            ? 'rgba(59, 130, 246, 0.15)'
            : 'rgba(16, 185, 129, 0.15)',
          color: isSuccess
            ? 'var(--color-emerald)'
            : isSetupMode
            ? 'var(--color-nimiq-gold)'
            : isBank
            ? '#60A5FA'
            : 'var(--color-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px auto',
          border: `1px solid ${isSuccess ? 'var(--color-emerald)' : 'var(--border-subtle)'}`,
          transition: 'all 0.2s ease',
        }}>
          {isSuccess ? (
            <Check size={28} />
          ) : isSetupMode ? (
            <Lock size={26} />
          ) : isBank ? (
            <Building2 size={26} />
          ) : isWallet ? (
            <Wallet size={26} />
          ) : (
            <Smartphone size={26} />
          )}
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', color: '#F8FAFC' }}>
          {isSuccess
            ? 'Deposit Authorized'
            : isSetupMode
            ? setupStep === 1
              ? 'Set Transaction PIN'
              : 'Confirm Transaction PIN'
            : isBank
            ? 'Authorize Bank Deposit'
            : isWallet
            ? 'Authorize Wallet Deposit'
            : 'Authorize Mobile Deposit'}
        </h3>

        <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '14px', lineHeight: 1.4 }}>
          {isSuccess
            ? 'Crediting crypto to your wallet...'
            : isSetupMode
            ? setupStep === 1
              ? 'Create a 4-digit PIN to secure your wallet and future transfers'
              : 'Re-enter your 4-digit PIN to confirm setup'
            : isBank
            ? `Enter your 4-digit PIN to authorize deposit from ${accountIdentifier}`
            : isWallet
            ? `Enter your 4-digit PIN to authorize wallet deposit from ${phone || 'Chipper Cash'}`
            : `Enter your 4-digit PIN to authorize SIM push to ${phone}`}
        </p>

        {/* Error message banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Amount & Cashramp Agent Card */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px',
          textAlign: 'left',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Payment Method:
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {methodLabel}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Deposit Amount:
            </span>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
              {symbol} {amount.toLocaleString()} {currency}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
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
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '6px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: 'var(--color-nimiq-gold-dark)',
              fontWeight: 700,
            }}>
              <ShieldCheck size={14} />
              <span>Cashramp Agent: {agent}</span>
            </div>
          )}

          {paymentDetails && (
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-surface)',
              padding: '4px 6px',
              borderRadius: '4px',
            }}>
              {paymentDetails}
            </div>
          )}
        </div>

        {/* PIN Digit Indicators */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
            {isSetupMode ? (setupStep === 1 ? 'Enter New 4-Digit PIN:' : 'Confirm 4-Digit PIN:') : 'Enter 4-Digit Security PIN:'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              const isCurrent = pin.length === index && !isSuccess;
              return (
                <div
                  key={index}
                  style={{
                    width: '44px',
                    height: '48px',
                    borderRadius: '10px',
                    background: isSuccess
                      ? 'var(--color-emerald-light)'
                      : isFilled
                      ? 'var(--color-emerald-light)'
                      : 'var(--bg-surface)',
                    border: isSuccess
                      ? '2px solid var(--color-emerald)'
                      : isCurrent
                      ? '2px solid var(--color-nimiq-gold)'
                      : isFilled
                      ? '1.5px solid var(--color-emerald)'
                      : '1.5px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    color: 'var(--color-emerald)',
                    boxShadow: isCurrent ? '0 0 10px rgba(246, 174, 45, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isFilled ? '●' : isCurrent ? '_' : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px',
          maxWidth: '280px',
          margin: '0 auto 16px auto',
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              disabled={isSubmitting || isSuccess}
              style={{
                height: '48px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '1.18rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background 0.1s ease',
              }}
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting || isSuccess || pin.length === 0}
            style={{
              height: '46px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#F87171',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: pin.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              opacity: pin.length > 0 ? 1 : 0.5,
            }}
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSubmitting || isSuccess}
            style={{
              height: '46px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: '#F8FAFC',
              fontSize: '1.15rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            onMouseUp={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSubmitting || isSuccess || pin.length === 0}
            style={{
              height: '46px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: '#F8FAFC',
              fontSize: '1rem',
              cursor: pin.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pin.length > 0 ? 1 : 0.5,
            }}
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => {
            if (pin.length === 4) {
              handleInputDigit('');
            }
          }}
          disabled={isSubmitting || pin.length < 4}
          style={{
            width: '100%',
            padding: '14px',
            background: pin.length === 4
              ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
              : 'linear-gradient(135deg, rgba(5, 150, 105, 0.5) 0%, rgba(16, 185, 129, 0.5) 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: isSubmitting ? 'wait' : pin.length === 4 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
            boxShadow: pin.length === 4 ? '0 6px 20px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin-animate" />
              <span>Verifying & Authorizing...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>{isSetupMode ? 'Confirm & Set PIN' : 'Confirm PIN & Authorize'}</span>
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
