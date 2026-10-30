import React from 'react';
import { Zap, ArrowUpFromLine, ArrowDownToLine, Smartphone } from 'lucide-react';
import { Transaction } from '../types';

interface ActivityFeedProps {
  transactions: Transaction[];
  onSelectTx: (tx: Transaction) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ transactions, onSelectTx }) => {
  if (transactions.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '32px 16px', 
        background: 'var(--bg-surface)', 
        border: '1.5px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-muted)', 
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        No recent payments or transfers yet
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          onClick={() => onSelectTx(tx)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
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
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: tx.type === 'spend' 
                ? 'var(--color-nimiq-gold-subtle)' 
                : tx.type === 'cashout' 
                ? 'var(--color-emerald-light)' 
                : tx.type === 'deposit' 
                ? 'var(--color-cyan-light)' 
                : 'var(--color-violet-light)',
              color: tx.type === 'spend' 
                ? 'var(--color-nimiq-gold-dark)' 
                : tx.type === 'cashout' 
                ? 'var(--color-emerald)' 
                : tx.type === 'deposit' 
                ? 'var(--color-cyan)' 
                : 'var(--color-violet)',
              flexShrink: 0,
            }}>
              {tx.type === 'spend' ? <Zap size={18} /> : tx.type === 'cashout' ? <ArrowUpFromLine size={18} /> : tx.type === 'deposit' ? <ArrowDownToLine size={18} /> : <Smartphone size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{tx.title}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tx.sub} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: tx.type === 'deposit' ? 'var(--color-emerald)' : 'var(--text-primary)',
            }}>
              {tx.type === 'deposit' ? '+' : '-'}{tx.fiatCurrency} {Number(tx.fiatAmount).toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              textTransform: 'uppercase',
              background: 'var(--color-emerald-light)',
              color: 'var(--color-emerald)',
              display: 'inline-block',
              marginTop: '3px',
              letterSpacing: '0.04em',
            }}>
              {tx.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
