import React from 'react';
import { MarketRate } from '../types';
import { Radio, ShieldCheck } from 'lucide-react';

interface RateTickerProps {
  countryName: string;
  rate: MarketRate | null;
}

export const RateTicker: React.FC<RateTickerProps> = ({ countryName, rate }) => {
  if (!rate) return null;

  return (
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
        <div style={{ 
          fontSize: '0.68rem', 
          fontWeight: 800, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          marginBottom: '2px' 
        }}>
          <ShieldCheck size={12} color="var(--color-emerald)" />
          <span>{countryName} • Cashramp Official P2P FX</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          1 USD ≈ {rate.withdrawalRate} {rate.currency}
        </div>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.68rem',
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-emerald-light)',
        border: '1px solid rgba(5, 150, 105, 0.3)',
        color: 'var(--color-emerald)',
        letterSpacing: '0.03em',
      }}>
        <Radio size={11} className="pulse" />
        <span>LIVE FX</span>
      </div>
    </div>
  );
};

export default RateTicker;
