import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Copy, Check, Zap, Sparkles } from 'lucide-react';
import { Country, CryptoAsset } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { EVM } from '../services/evm';
import { Nimiq } from '../services/nimiq';

interface WalletHeroProps {
  country: Country;
  cryptoAsset: CryptoAsset;
  nimBalance: number;
  usdcBalance: number;
  usdtBalance: number;
  fiatValue: string;
  evmAddress?: string | null;
  nimiqAddress?: string | null;
  onSelectCountry: () => void;
  onToggleCrypto: (asset: CryptoAsset) => void;
  onConnectNimiq?: () => void;
}

export const WalletHero: React.FC<WalletHeroProps> = ({
  country,
  cryptoAsset,
  nimBalance,
  usdcBalance,
  usdtBalance,
  fiatValue,
  evmAddress,
  nimiqAddress,
  onSelectCountry,
  onToggleCrypto,
  onConnectNimiq,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const activeAddress = cryptoAsset === 'NIM' ? nimiqAddress : evmAddress;

  const getDisplayBalance = () => {
    if (cryptoAsset === 'NIM') return nimBalance.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (cryptoAsset === 'USDT') return usdtBalance.toFixed(2);
    return usdcBalance.toFixed(2);
  };

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      {/* African Corridor & Crypto Asset Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
        {/* Country Corridor Pill */}
        <button
          onClick={onSelectCountry}
          title="Select African payment corridor"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid var(--border-subtle)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: '1.15rem' }}>{country.flag}</span>
          <span>{country.name}</span>
          <span style={{ color: 'var(--text-accent)', fontSize: '0.74rem', fontWeight: 800 }}>({country.currency})</span>
          <ChevronDown size={13} color="var(--text-muted)" />
        </button>

        {/* NIM / USDC / USDT Native Segmented Control */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-pill)',
          padding: '3px',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--border-subtle)',
        }}>
          {(['NIM', 'USDC', 'USDT'] as CryptoAsset[]).map((asset) => {
            const isSelected = cryptoAsset === asset;
            return (
              <button
                key={asset}
                onClick={() => onToggleCrypto(asset)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isSelected 
                    ? 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))' 
                    : 'transparent',
                  color: isSelected ? '#0F172A' : 'var(--text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(246, 174, 45, 0.35)' : 'none',
                }}
              >
                {asset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spendable Purchasing Power Card (Hero Card) */}
      <div className="hero-card">
        {/* Card Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.72rem', 
            fontWeight: 800, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em' 
          }}>
            <ShieldCheck size={14} color="var(--color-emerald)" />
            {t('availableBalance')}
          </span>

          {/* Cashramp Live Liquidity Badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.66rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-emerald-light)',
            color: 'var(--color-emerald)',
          }}>
            <Sparkles size={10} />
            <span>INSTANT RAMP</span>
          </span>
        </div>

        {/* Primary Large Balance: FIAT (Local Purchasing Power) */}
        <div className="balance-fiat-hero">
          <span style={{ fontSize: '1.4rem', marginRight: '6px', color: 'var(--text-accent)' }}>
            {country.symbol}
          </span>
          {fiatValue}
          <span style={{ fontSize: '0.86rem', marginLeft: '6px', fontWeight: 700, color: 'var(--text-muted)' }}>
            {country.currency}
          </span>
        </div>

        {/* Sub-row: Underlying Crypto Balance & Live Exchange Rate */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          paddingTop: '8px',
          borderTop: '1px dashed var(--border-hero)',
        }}>
          <div className="balance-crypto-sub">
            <span style={{ color: 'var(--text-muted)' }}>≈</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {getDisplayBalance()} {cryptoAsset}
            </span>
          </div>

          {/* Active Vault Address Copy Pill */}
          {activeAddress ? (
            <button
              onClick={handleCopy}
              title={`Click to copy ${cryptoAsset === 'NIM' ? 'Nimiq' : 'EVM'} address`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: copied
                  ? 'var(--color-emerald-light)'
                  : 'var(--bg-pill)',
                border: copied
                  ? '1px solid var(--color-emerald)'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: copied
                  ? 'var(--color-emerald)'
                  : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? (
                <>
                  <Check size={10} /> Copied!
                </>
              ) : (
                <>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: cryptoAsset === 'NIM' ? 'var(--color-nimiq-gold)' : 'var(--color-emerald)',
                    }}
                  />
                  <span>
                    {cryptoAsset === 'NIM'
                      ? Nimiq.formatAddress(activeAddress)
                      : EVM.formatAddress(activeAddress)}
                  </span>
                  <Copy size={10} color="var(--text-muted)" />
                </>
              )}
            </button>
          ) : cryptoAsset === 'NIM' && onConnectNimiq ? (
            <button
              onClick={onConnectNimiq}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#0F172A',
                background: 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))',
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(246, 174, 45, 0.3)',
              }}
            >
              <Zap size={10} fill="#0F172A" /> CONNECT NIMIQ
            </button>
          ) : (
            <span
              style={{
                color: 'var(--text-accent)',
                background: 'var(--color-nimiq-gold-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.66rem',
                fontWeight: 800,
              }}
            >
              SECURE VAULT
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletHero;
