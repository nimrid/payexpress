import React from 'react';
import { Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import { SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../services/evm';
import { useTranslation } from '../i18n/useTranslation';
import { ChainLogo } from './ChainLogo';

import { Country } from '../types';

interface HeaderProps {
  evmAddress: string | null;
  selectedChain: SupportedChainKey;
  activeCountry?: Country;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onConnectEvm: () => void;
  onOpenChainModal: () => void;
  onOpenCountryModal?: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedChain,
  activeCountry,
  theme = 'light',
  onToggleTheme,
  onOpenChainModal,
  onOpenCountryModal,
  onOpenSettings,
}) => {
  const { currentLang, supportedLanguages, t } = useTranslation();
  const currentLangInfo = supportedLanguages.find((l) => l.code === currentLang);
  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

  return (
    <header className="app-header">
      <div className="brand-badge">
        {/* Nimiq Gold Sun Hexagon + Lightning Payment Mark */}
        <div className="brand-logo" aria-label="PayExpress Logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hexagonal Sun Shield */}
            <polygon 
              points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2" 
              fill="#0F172A" 
            />
            {/* Inner Bold Forward Lightning Arrow */}
            <path 
              d="M13 5L7 13H12L11 19L17 11H12L13 5Z" 
              fill="#F6AE2D" 
            />
          </svg>
        </div>
        <div>
          <div className="brand-name">PayExpress</div>
          <div className="brand-sub">Nimiq Pay • Africa</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Daylight / Sunlight Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Daylight Mode active (Great for bright outdoors). Tap for Night Mode' : 'Night Mode active. Tap for Daylight Mode'}
            aria-label="Toggle Sunlight Mode"
            style={{
              background: 'var(--bg-pill)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme === 'light' ? 'var(--color-amber)' : 'var(--color-nimiq-gold)',
              transition: 'all 0.15s ease',
            }}
          >
            {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}

        {/* Active Corridor Selector Pill */}
        {activeCountry && onOpenCountryModal && (
          <button
            onClick={onOpenCountryModal}
            title={`Active Corridor: ${activeCountry.name} (${activeCountry.currency}) - Click to switch corridor`}
            style={{
              background: 'var(--bg-pill)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>{activeCountry.flag}</span>
            <span>{activeCountry.code}</span>
            <ChevronDown size={11} color="var(--text-muted)" />
          </button>
        )}

        {/* Chain Selector Pill */}
        <button
          onClick={onOpenChainModal}
          title={`Active Blockchain: ${chainConfig.name} (${chainConfig.chainIdHex}) - Click to switch`}
          style={{
            background: 'var(--bg-pill)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 9px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            transition: 'all 0.15s ease',
          }}
        >
          <ChainLogo chain={selectedChain} size={16} />
          <span style={{ maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {chainConfig.name.split(' ')[0]}
          </span>
          <ChevronDown size={12} color="var(--text-muted)" />
        </button>

        {/* Quick Settings & Language Menu Button */}
        <button
          onClick={onOpenSettings}
          title={`${t('languageSetting')} / ${t('settings')}`}
          style={{
            background: 'var(--bg-pill)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '0.76rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
          aria-label={t('settings')}
        >
          <span>{currentLangInfo?.flag || '🌐'}</span>
          <Settings size={13} color="var(--text-muted)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
