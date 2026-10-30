import React, { useState } from 'react';
import { X, Check, Layers, Cpu, ExternalLink } from 'lucide-react';
import { EVM, SUPPORTED_EVM_CHAINS, SupportedChainKey } from '../../services/evm';
import { ChainLogo } from '../ChainLogo';

interface ChainModalProps {
  isOpen: boolean;
  selectedChain: SupportedChainKey;
  onSelectChain: (chainKey: SupportedChainKey) => void;
  onClose: () => void;
}

export const ChainModal: React.FC<ChainModalProps> = ({
  isOpen,
  selectedChain,
  onSelectChain,
  onClose,
}) => {
  const [switching, setSwitching] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (chainKey: SupportedChainKey) => {
    setSwitching(chainKey);
    try {
      await EVM.switchChain(chainKey);
      onSelectChain(chainKey);
      onClose();
    } catch (err) {
      console.error('[ChainModal] Switch error:', err);
    } finally {
      setSwitching(null);
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--color-nimiq-gold-dark)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Select EVM Blockchain</h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
              Choose your target network for deposits, transfers, and ramp flows
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

        {/* Universal Address Info Banner */}
        <div style={{
          background: 'var(--color-nimiq-gold-subtle)',
          border: '1.5px solid var(--border-hero)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Cpu size={16} color="var(--color-nimiq-gold-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Single Address, All Chains:</strong> Your Nimiq Pay EVM address remains identical on all networks. Switching chains changes which contract you interact with.
          </div>
        </div>

        {/* Chain List */}
        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '56vh',
            paddingRight: '4px',
          }}
        >
          {(Object.keys(SUPPORTED_EVM_CHAINS) as SupportedChainKey[]).map((key) => {
            const chain = SUPPORTED_EVM_CHAINS[key];
            const isSelected = selectedChain === key;
            const isSwitchingThis = switching === key;

            const tokenList = Object.keys(chain.tokens).join(' • ');

            return (
              <div
                key={key}
                onClick={() => handleSelect(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: isSelected ? 'var(--color-nimiq-gold-subtle)' : 'var(--bg-surface-elevated)',
                  border: `1.5px solid ${isSelected ? 'var(--color-nimiq-gold)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: isSwitchingThis ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <ChainLogo chain={key} size={38} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {chain.name}
                      </span>
                      {chain.badge && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: key === 'polygon' || key === 'celo'
                              ? 'var(--color-emerald-light)'
                              : 'var(--bg-surface)',
                            color: key === 'polygon' || key === 'celo'
                              ? 'var(--color-emerald)'
                              : 'var(--text-muted)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {chain.badge}
                        </span>
                      )}
                    </div>

                    {/* Chain Meta */}
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500 }}>
                      Gas Token: <strong style={{ color: 'var(--text-primary)' }}>{chain.nativeCurrency.symbol}</strong> • Avg Fee: <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>{chain.avgFee}</span> • Speed: {chain.speed}
                    </div>

                    {/* Supported Tokens on this chain */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tokens:</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-nimiq-gold-dark)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {tokenList}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginLeft: '12px', flexShrink: 0 }}>
                  {isSwitchingThis ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-nimiq-gold-dark)', fontWeight: 700 }}>
                      Switching...
                    </span>
                  ) : isSelected ? (
                    <div
                      style={{
                        color: 'var(--color-nimiq-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      <Check size={16} /> Active
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: '#94A3B8',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      Select
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
