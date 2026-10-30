import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, Check, Delete, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { Security } from '../../services/security';

export interface PinAuthModalProps {
  isOpen: boolean;
  mode?: 'verify' | 'setup' | 'change';
  title?: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  symbol?: string;
  recipientName?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  mode = 'verify',
  title,
  subtitle,
  amount,
  currency,
  symbol,
  recipientName,
  onSuccess,
  onClose,
}) => {
  // Current active mode (auto-switches to setup if user has no PIN configured yet)
  const [activeMode, setActiveMode] = useState<'verify' | 'setup' | 'change'>('verify');
  const [step, setStep] = useState<1 | 2 | 3>(1); // In setup: 1=enter, 2=confirm. In change: 1=current, 2=new, 3=confirm
  const [initialPin, setInitialPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Synchronous ref storage to prevent React closure or state-timing glitches
  const initialPinRef = useRef('');
  const newPinRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setInitialPin('');
      setNewPin('');
      initialPinRef.current = '';
      newPinRef.current = '';
      setStep(1);
      setErrorMessage(null);
      setIsSuccess(false);

      // If user hasn't set up a PIN yet, force setup mode
      if (!Security.hasPin() || mode === 'setup') {
        setActiveMode('setup');
      } else if (mode === 'change') {
        setActiveMode('change');
      } else {
        setActiveMode('verify');
      }
    }
  }, [isOpen, mode]);

  // Hardware keyboard listener
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          handleInputDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isSuccess, step, activeMode, initialPin, newPin]);

  if (!isOpen) return null;

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setPin('');
  };

  const handleInputDigit = (digit: string) => {
    if (pin.length >= 4 || isSuccess) return;

    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage(null);

    // When 4 digits are completed
    if (nextPin.length === 4) {
      if (activeMode === 'setup') {
        if (step === 1) {
          // Immediately save to ref and transition to confirm step
          initialPinRef.current = nextPin;
          setInitialPin(nextPin);
          setPin('');
          setStep(2);
        } else {
          // Confirm PIN in step 2
          const target = initialPinRef.current || initialPin;
          if (nextPin === target) {
            setIsSuccess(true);
            try {
              Security.setupPin(nextPin);
              setTimeout(() => {
                onSuccess();
              }, 450);
            } catch (err: any) {
              setIsSuccess(false);
              triggerShake(err.message || 'Failed to save PIN');
            }
          } else {
            triggerShake('PINs do not match. Please start over.');
            initialPinRef.current = '';
            setInitialPin('');
            setStep(1);
          }
        }
      } else if (activeMode === 'change') {
        if (step === 1) {
          // Verify current PIN first
          const result = Security.verifyPin(nextPin);
          if (result.valid) {
            setPin('');
            setStep(2);
          } else {
            triggerShake(result.error || 'Current PIN is incorrect');
          }
        } else if (step === 2) {
          // Enter new PIN
          newPinRef.current = nextPin;
          setNewPin(nextPin);
          setPin('');
          setStep(3);
        } else {
          // Confirm new PIN
          const targetNew = newPinRef.current || newPin;
          if (nextPin === targetNew) {
            setIsSuccess(true);
            try {
              Security.setupPin(nextPin);
              setTimeout(() => {
                onSuccess();
              }, 450);
            } catch (err: any) {
              setIsSuccess(false);
              triggerShake(err.message || 'Failed to change PIN');
            }
          } else {
            triggerShake('New PINs do not match. Please re-enter new PIN.');
            newPinRef.current = '';
            setNewPin('');
            setStep(2);
          }
        }
      } else {
        // Verify mode
        const result = Security.verifyPin(nextPin);
        if (result.valid) {
          setIsSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 450);
        } else {
          triggerShake(result.error || 'Incorrect Security PIN.');
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (isSuccess) return;
    setPin('');
    setErrorMessage(null);
  };

  const getHeaderTitle = () => {
    if (isSuccess) {
      if (activeMode === 'change') return 'PIN Changed Successfully';
      if (activeMode === 'setup') return 'Security PIN Configured';
      return 'Authorization Verified';
    }
    if (activeMode === 'setup') {
      return step === 1 ? 'Create Security PIN' : 'Confirm Security PIN';
    }
    if (activeMode === 'change') {
      return step === 1 ? 'Enter Current PIN' : step === 2 ? 'Enter New PIN' : 'Confirm New PIN';
    }
    return title || 'Authorize Payment';
  };

  const getHeaderSubtitle = () => {
    if (isSuccess) {
      if (activeMode === 'change') return 'Your new 4-digit PIN is active.';
      if (activeMode === 'setup') return 'Your wallet is now secured with SHA-256 encryption.';
      return 'PIN confirmed. Authorizing transaction...';
    }
    if (activeMode === 'setup') {
      return step === 1
        ? 'Create a 4-digit PIN to secure all payments and withdrawals'
        : 'Re-enter your 4-digit PIN to confirm setup';
    }
    if (activeMode === 'change') {
      return step === 1
        ? 'Verify your identity before setting a new PIN'
        : step === 2
        ? 'Enter your new 4-digit security PIN'
        : 'Re-enter your new PIN to confirm';
    }
    return subtitle || (amount ? `Enter your Security PIN to send ${symbol || ''}${amount.toLocaleString()} ${currency || ''}` : 'Enter your 4-digit Security PIN to proceed');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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

        {/* Lock / Security Icon */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: isSuccess
            ? 'rgba(16, 185, 129, 0.2)'
            : activeMode === 'setup' || activeMode === 'change'
            ? 'rgba(234, 175, 12, 0.15)'
            : 'rgba(59, 130, 246, 0.15)',
          color: isSuccess
            ? 'var(--color-emerald)'
            : activeMode === 'setup' || activeMode === 'change'
            ? 'var(--color-nimiq-gold)'
            : '#60A5FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          border: `1px solid ${isSuccess ? 'var(--color-emerald)' : 'var(--border-subtle)'}`,
          transition: 'all 0.2s ease',
        }}>
          {isSuccess ? <Check size={28} /> : (activeMode === 'setup' || activeMode === 'change') ? <ShieldCheck size={28} /> : <Lock size={26} />}
        </div>

        {/* Modal Titles */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
          {getHeaderTitle()}
        </h3>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4, fontWeight: 500 }}>
          {getHeaderSubtitle()}
        </p>

        {/* Transaction Summary Card (Verify Mode) */}
        {activeMode === 'verify' && (amount || recipientName) && (
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Recipient:
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {recipientName || 'Authorized Merchant / Recipient'}
              </div>
            </div>
            {amount && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Amount:
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--color-nimiq-gold-dark)' }}>
                  {symbol}{amount.toLocaleString()} {currency}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 700,
          }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PIN Digit Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            const isCurrent = pin.length === index && !isSuccess;
            return (
              <div
                key={index}
                style={{
                  width: '46px',
                  height: '50px',
                  borderRadius: '10px',
                  background: isSuccess
                    ? 'var(--color-emerald-light)'
                    : isFilled
                    ? 'var(--color-nimiq-gold-subtle)'
                    : 'var(--bg-surface)',
                  border: isSuccess
                    ? '2px solid var(--color-emerald)'
                    : isCurrent
                    ? '2px solid var(--color-nimiq-gold)'
                    : isFilled
                    ? '1.5px solid var(--color-nimiq-gold)'
                    : '1.5px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: isSuccess ? 'var(--color-emerald)' : 'var(--color-nimiq-gold-dark)',
                  boxShadow: isCurrent ? '0 0 12px rgba(246, 174, 45, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {isFilled ? '●' : isCurrent ? '_' : ''}
              </div>
            );
          })}
        </div>

        {/* On-screen Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          maxWidth: '280px',
          margin: '0 auto 16px auto',
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleInputDigit(digit)}
              disabled={isSuccess}
              style={{
                height: '48px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
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
            disabled={isSuccess || pin.length === 0}
            style={{
              height: '48px',
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
              opacity: pin.length > 0 ? 1 : 0.4,
            }}
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => handleInputDigit('0')}
            disabled={isSuccess}
            style={{
              height: '48px',
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSuccess || pin.length === 0}
            style={{
              height: '48px',
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              cursor: pin.length > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pin.length > 0 ? 1 : 0.4,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
