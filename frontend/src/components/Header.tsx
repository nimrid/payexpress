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
  onOpenLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedChain,
  theme = 'light',
  onToggleTheme,
  onOpenChainModal,
  onOpenSettings,
  onOpenLanding,
}) => {
  const { currentLang, supportedLanguages, t } = useTranslation();
  const currentLangInfo = supportedLanguages.find((l) => l.code === currentLang);
  const chainConfig = SUPPORTED_EVM_CHAINS[selectedChain] || SUPPORTED_EVM_CHAINS.polygon;

  return (
    <header className="app-header">
      <div 
        className="brand-badge" 
        onClick={onOpenLanding} 
        style={{ cursor: onOpenLanding ? 'pointer' : 'default' }}
        title={onOpenLanding ? 'Back to Landing Page' : 'PayExpress'}
      >
        {/* Nimiq Gold Sun Hexagon + Lightning Payment Mark */}
        <div className="brand-logo" aria-label="PayExpress Logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div className="brand-title-row">
            <span className="brand-name">PayExpress</span>
            <span className="beta-badge">BETA</span>
          </div>
          <div className="brand-sub">Nimiq Pay • Africa</div>
        </div>
      </div>

      <div className="header-controls">
        {/* Daylight / Sunlight Mode Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Daylight Mode (Outdoor Ready). Tap for Night Mode' : 'Night Mode. Tap for Daylight Mode'}
            aria-label="Toggle Sunlight Mode"
            className="header-icon-btn"
          >
            {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}

        {/* Chain Selector Pill */}
        <button
          onClick={onOpenChainModal}
          title={`Active Blockchain: ${chainConfig.name} (${chainConfig.chainIdHex}) - Click to switch`}
          className="header-chain-btn"
        >
          <ChainLogo chain={selectedChain} size={15} />
          <span className="header-chain-name">
            {chainConfig.name.split(' ')[0]}
          </span>
          <ChevronDown size={11} color="var(--text-muted)" />
        </button>

        {/* Quick Settings & Language Menu Button */}
        <button
          onClick={onOpenSettings}
          title={`${t('languageSetting')} / ${t('settings')}`}
          className="header-settings-btn"
          aria-label={t('settings')}
        >
          <span style={{ fontSize: '0.82rem', lineHeight: 1 }}>{currentLangInfo?.flag || '🌐'}</span>
          <Settings size={13} color="var(--text-muted)" />
        </button>
      </div>
    </header>
  );
};

export default Header;
