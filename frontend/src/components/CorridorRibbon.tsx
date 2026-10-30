import React from 'react';
import { Globe, ChevronRight, Check, Zap } from 'lucide-react';
import { Country } from '../types';

interface CorridorRibbonProps {
  countries: Country[];
  activeCountry: Country;
  onSelectCountry: (country: Country) => void;
  onOpenModal: () => void;
}

export const CorridorRibbon: React.FC<CorridorRibbonProps> = ({
  countries,
  activeCountry,
  onSelectCountry,
  onOpenModal,
}) => {
  // Pin top commercial corridors first for fast 1-tap switching
  const PRIORITY_CODES = ['KE', 'NG', 'GH', 'ZA', 'CM', 'UG', 'TZ', 'RW', 'CI', 'SN', 'ZM', 'ET', 'BJ', 'DZ'];
  
  const sortedDisplay = React.useMemo(() => {
    const priorityList: Country[] = [];
    const others: Country[] = [];

    PRIORITY_CODES.forEach((code) => {
      const match = countries.find((c) => c.code === code);
      if (match) priorityList.push(match);
    });

    countries.forEach((c) => {
      if (!PRIORITY_CODES.includes(c.code)) others.push(c);
    });

    return [...priorityList, ...others];
  }, [countries]);

  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1.5px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={15} style={{ color: 'var(--color-nimiq-gold-dark)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            African Corridors ({countries.length > 0 ? countries.length : '28+'}+ Supported by Cashramp)
          </span>
        </div>

        <button
          onClick={onOpenModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-nimiq-gold-dark)',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '2px 4px',
          }}
        >
          <span>All Corridors</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Horizontal Scrolling Corridor Chips */}
      <div style={{
        display: 'flex',
        gap: '7px',
        overflowX: 'auto',
        paddingBottom: '6px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {sortedDisplay.slice(0, 14).map((c) => {
          const isSelected = c.code === activeCountry.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelectCountry(c)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1.8px solid var(--color-nimiq-gold)' : '1.5px solid var(--border-subtle)',
                background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: isSelected ? 800 : 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 4px rgba(246, 174, 45, 0.2)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{c.flag}</span>
              <span>{c.name}</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                opacity: 0.85,
                fontFamily: 'var(--font-mono)',
              }}>
                ({c.currency})
              </span>
              {isSelected && <Check size={12} style={{ color: 'var(--color-nimiq-gold-dark)' }} />}
            </button>
          );
        })}

        {/* View All Button Chip */}
        <button
          type="button"
          onClick={onOpenModal}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px dashed var(--border-hero)',
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span>+{Math.max(0, countries.length - 14)} More Corridors</span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Active Country Rail Highlights */}
      {activeCountry.supportedMethods && activeCountry.supportedMethods.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}>
          <Zap size={12} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
          <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>
            Active Rails in {activeCountry.name}:
          </span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {activeCountry.supportedMethods.join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default CorridorRibbon;
