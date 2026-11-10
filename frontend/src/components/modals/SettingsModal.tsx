import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Globe, Check, Sparkles, Cpu, Layers, ShieldCheck, Smartphone, User, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { SupportedLanguage } from '../../i18n/translations';
import { EVM, SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../../services/evm';
import { Security } from '../../services/security';

interface SettingsModalProps {
  isOpen: boolean;
  selectedChain?: SupportedChainKey;
  onSelectChain?: (chainKey: SupportedChainKey) => void;
  onResetBalance: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  selectedChain,
  onSelectChain,
  onResetBalance,
  onClose,
}) => {
  const { currentLang, setLanguage, t, isNimiqDetected, supportedLanguages } = useTranslation();
  const activeChain = selectedChain || EVM.activeChain;
  const [switchingChain, setSwitchingChain] = useState(false);

  // User Profile Credentials
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserName(Security.getUserName());
      setUserPhone(Security.getUserPhone());
      setProfileSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    Security.setUserName(userName);
    Security.setUserPhone(userPhone);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 2500);
  };

  const handleChainSwitch = async (chainKey: SupportedChainKey) => {
    setSwitchingChain(true);
    try {
      await EVM.switchChain(chainKey);
      if (onSelectChain) {
        onSelectChain(chainKey);
      }
    } catch (err) {
      console.error('Chain switch failed:', err);
    } finally {
      setSwitchingChain(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '20px',
        }}
      >
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--color-nimiq-gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('settingsTitle')}</h3>
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

        {/* Scrollable Settings Content */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingRight: '4px' }}>
          
          {/* Native Security Card */}
          <div style={{
            background: 'var(--color-emerald-light)',
            border: '1.5px solid rgba(5, 150, 105, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--color-emerald)" />
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  Nimiq Pay Native Security
                </span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-emerald)',
                color: '#FFFFFF',
              }}>
                ✓ Enforced by Host Wallet
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, fontWeight: 500, margin: 0 }}>
              All transactions and withdrawals require biometric or passcode signing directly in your host Nimiq Pay wallet. No separate app-level PIN is required.
            </p>
          </div>

          {/* User Profile & Contact Credentials */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--color-nimiq-gold-dark)" />
                User Profile & Mobile Money
              </label>
              {profileSavedNotice && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-emerald)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} /> Saved
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: 600 }}>
                  Account / Display Name:
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex Nimiq"
                  className="input-field"
                  style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: 600 }}>
                  Default Mobile Money Phone Number:
                </span>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="input-field"
                  style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                style={{
                  alignSelf: 'flex-end',
                  padding: '7px 16px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: '4px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Save Details
              </button>
            </div>
          </div>

          {/* Nimiq Pay EVM Architecture Info */}
          <div style={{
            background: 'var(--color-nimiq-gold-subtle)',
            border: '1.5px solid var(--border-hero)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Cpu size={18} color="var(--color-nimiq-gold-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Universal EVM Address Across All Chains
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', lineHeight: 1.4, fontWeight: 500 }}>
                Nimiq Pay derives your EVM wallet from your master seed. Your address is identical across Polygon, Arbitrum, Base, Optimism, Celo, and Ethereum.
              </div>
            </div>
          </div>

          {/* Active Blockchain Network Switcher */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="var(--color-nimiq-gold-dark)" />
                {t('networkSetting')} (EVM Chain Switching)
              </label>
              {switchingChain && <span style={{ fontSize: '0.72rem', color: 'var(--color-nimiq-gold-dark)', fontWeight: 700 }}>Switching...</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(Object.keys(SUPPORTED_EVM_CHAINS) as SupportedChainKey[]).map((key) => {
                const chain = SUPPORTED_EVM_CHAINS[key];
                const isSelected = activeChain === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleChainSwitch(key)}
                    disabled={switchingChain}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isSelected ? 'var(--color-nimiq-gold)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{chain.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {chain.chainIdHex} ({chain.nativeCurrency.symbol})
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="var(--color-nimiq-gold-dark)" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Localization Status Banner */}
          <div style={{
            background: isNimiqDetected ? 'var(--color-emerald-light)' : 'var(--color-nimiq-gold-subtle)',
            border: `1.5px solid ${isNimiqDetected ? 'rgba(5, 150, 105, 0.35)' : 'var(--border-hero)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Sparkles size={16} color={isNimiqDetected ? 'var(--color-emerald)' : 'var(--color-nimiq-gold-dark)'} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: isNimiqDetected ? 'var(--color-emerald)' : 'var(--color-nimiq-gold-dark)', marginBottom: '2px' }}>
                {isNimiqDetected ? t('languageDetectedNimiq') : t('languageDetectedBrowser')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', lineHeight: 1.4, fontWeight: 500 }}>
                Nimiq Pay injects <code>window.nimiqPay.language</code> directly into the mini-app environment.
              </div>
            </div>
          </div>

          {/* Language Selection Grid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800 }}>
              {t('languageSetting')} (Nimiq Pay ISO 639-1)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {supportedLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as SupportedLanguage)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isSelected ? 'var(--color-nimiq-gold)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--color-nimiq-gold-dark)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {isSelected && <Check size={16} color="var(--color-nimiq-gold-dark)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live SDK Status */}
          <div style={{
            background: 'var(--color-emerald-light)',
            border: '1.5px solid rgba(5, 150, 105, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: 'var(--color-emerald)',
            fontWeight: 700,
          }}>
            ✓ <strong>{t('cashrampStatus')}:</strong> {t('liveTestMode')}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => {
                onResetBalance();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} />
              <span>Reset Demo Balance (15k NIM / 150 USDT)</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))',
                color: '#090D16',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
