import React, { useState } from 'react';
import { ArrowLeft, Wifi, Zap } from 'lucide-react';
import { Country, CryptoAsset } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface AirtimeBillsProps {
  country: Country;
  cryptoAsset: CryptoAsset;
  onBack: () => void;
  onPurchaseBundle: (bundleName: string, priceFiat: number) => void;
}

export const AirtimeBills: React.FC<AirtimeBillsProps> = ({
  country,
  onBack,
  onPurchaseBundle,
}) => {
  const { t } = useTranslation();
  const [operator, setOperator] = useState('MTN');
  const [recipient, setRecipient] = useState('+234 803 123 4567');

  const bundles = country.code === 'GH'
    ? [
        { name: 'MTN 1GB Daily Data', price: 6, tag: '24 Hours' },
        { name: 'MTN 3GB 3-Day Bundle', price: 15, tag: '3 Days' },
        { name: 'MTN 10GB Weekly Data', price: 40, tag: '7 Days' },
      ]
    : [
        { name: 'MTN 1GB Daily Data', price: 500, tag: '24 Hours' },
        { name: 'MTN 2.5GB 2-Day Bundle', price: 1000, tag: '2 Days' },
        { name: 'MTN 10GB Monthly Data', price: 4500, tag: '30 Days' },
      ];

  return (
    <div>
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
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('airtimeBills')}</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className="tab-group" style={{ marginBottom: '16px' }}>
        {['MTN', 'Airtel', 'Power Token'].map((op) => (
          <button
            key={op}
            onClick={() => setOperator(op)}
            className={`tab-btn ${operator === op ? 'active' : ''}`}
          >
            {op}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {t('rechargePhone')}
        </div>
        <input
          type="text"
          className="input-field"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>

      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
        {t('selectAmount')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {bundles.map((b) => (
          <div
            key={b.name}
            onClick={() => onPurchaseBundle(b.name, b.price)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--color-violet-light)',
                color: 'var(--color-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {operator === 'Power Token' ? <Zap size={18} /> : <Wifi size={18} />}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{b.name}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{b.tag}</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-nimiq-gold-dark)', fontSize: '0.94rem' }}>
              {country.symbol} {b.price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirtimeBills;
