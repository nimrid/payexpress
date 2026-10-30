import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Transaction } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.telcoRef || transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid var(--color-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-emerald)',
            marginBottom: '14px',
          }}>
            <Check size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
            {transaction.type === 'spend' ? t('txSuccessful') : transaction.type === 'cashout' ? t('txSuccessful') : t('statusCompleted')}
          </h3>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--color-emerald)',
            margin: '8px 0',
          }}>
            {transaction.fiatCurrency} {Number(transaction.fiatAmount).toLocaleString()}
          </div>

          {/* Details Table */}
          <div style={{
            width: '100%',
            margin: '18px 0',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.82rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{transaction.recipientName || transaction.recipient}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('txReference')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{transaction.telcoRef}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('cryptoCost')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-nimiq-gold-dark)', fontWeight: 800 }}>
                {transaction.cryptoAmount} {transaction.cryptoAsset}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('networkSetting')}</span>
              <span style={{ color: 'var(--color-nimiq-gold-dark)', fontWeight: 700 }}>Polygon / Nimiq Albatross</span>
            </div>
          </div>

          {/* SMS Notification Preview */}
          <div style={{
            width: '100%',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            borderLeft: '4px solid var(--color-mpesa-green)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            textAlign: 'left',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            marginBottom: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-mpesa-green)', marginBottom: '3px' }}>
              💬 {t('telcoReference')}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>{transaction.smsConfirmation}</div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Copy size={15} />
              <span>{copied ? 'Copied!' : 'Copy Ref'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))',
                color: '#0F172A',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(246, 174, 45, 0.3)',
              }}
            >
              {t('done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
