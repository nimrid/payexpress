import React, { useState, useMemo } from 'react';
import { X, Check, Search, Globe, ShieldCheck } from 'lucide-react';
import { Country } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

interface CountryModalProps {
  isOpen: boolean;
  countries: Country[];
  selectedCode: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  countries,
  selectedCode,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = useMemo(() => {
    const list = Array.from(new Set(countries.map((c) => c.region).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return countries.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        (c.supportedMethods && c.supportedMethods.some((m) => m.toLowerCase().includes(q)));

      const matchesRegion =
        selectedRegion === 'All' || c.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [countries, searchQuery, selectedRegion]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '20px',
        }}
      >
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--color-nimiq-gold-dark)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>African Payment Corridors</h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
              {countries.length}+ Active P2P Ramp & Spend Corridors Supported
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-pill)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, currency, or rail (e.g. M-Pesa, NGN, Ghana)..."
            style={{
              paddingLeft: '40px',
              fontSize: '0.88rem',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Region Filter Chips */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '12px',
          scrollbarWidth: 'none',
        }}>
          {regions.map((reg) => {
            const isSelected = selectedRegion === reg;
            const count = reg === 'All' ? countries.length : countries.filter((c) => c.region === reg).length;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1.5px solid var(--color-nimiq-gold)' : '1.5px solid var(--border-subtle)',
                  background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {reg} ({count})
              </button>
            );
          })}
        </div>

        {/* Country List (Scrollable) */}
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px',
            maxHeight: '52vh',
          }}
        >
          {filteredCountries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No countries match "{searchQuery}"
            </div>
          ) : (
            filteredCountries.map((c) => {
              const isSelected = c.code === selectedCode;
              return (
                <div
                  key={c.code}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface-elevated)',
                    border: `1.5px solid ${isSelected ? 'var(--color-nimiq-gold)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.7rem', flexShrink: 0 }}>{c.flag}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</span>
                        {c.isLiveSandbox && (
                          <span
                            title="Live Cashramp Test API Sandbox"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              background: 'var(--color-emerald-light)',
                              color: 'var(--color-emerald)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            <ShieldCheck size={11} /> LIVE SANDBOX
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-nimiq-gold-dark)' }}>{c.currency}</span> ({c.symbol}) • {c.dial}
                        {c.region && <span> • {c.region}</span>}
                      </div>

                      {/* Supported Payment Rails Pills */}
                      {c.supportedMethods && c.supportedMethods.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
                          {c.supportedMethods.slice(0, 3).map((m) => (
                            <span
                              key={m}
                              style={{
                                fontSize: '0.64rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                color: 'var(--text-secondary)',
                                fontWeight: 600,
                              }}
                            >
                              {m}
                            </span>
                          ))}
                          {c.supportedMethods.length > 3 && (
                            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              +{c.supportedMethods.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginLeft: '10px', flexShrink: 0 }}>
                    {isSelected ? (
                      <div
                        style={{
                          color: 'var(--color-nimiq-gold)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <Check size={16} /> {t('connected')}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#94A3B8',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        Select
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
