import React from 'react';
import { Zap, ArrowDownToLine, Smartphone } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface QuickActionsProps {
  onNavigate: (view: 'pay' | 'deposit' | 'airtime') => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="actions-grid">
      {/* 1. Pay & Settle */}
      <button className="action-btn" onClick={() => onNavigate('pay')}>
        <div className="action-icon" style={{
          background: 'linear-gradient(135deg, rgba(246, 174, 45, 0.24), rgba(246, 174, 45, 0.08))',
          color: 'var(--color-nimiq-gold-dark)',
          border: '1.5px solid rgba(246, 174, 45, 0.35)',
        }}>
          <Zap size={22} fill="currentColor" />
        </div>
        <div className="action-label">{t('payMerchant')}</div>
        <div className="action-sub">Bank • MoMo • Till</div>
      </button>

      {/* 2. Add Funds */}
      <button className="action-btn" onClick={() => onNavigate('deposit')}>
        <div className="action-icon" style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(2, 132, 199, 0.06))',
          color: 'var(--color-cyan)',
          border: '1.5px solid rgba(2, 132, 199, 0.35)',
        }}>
          <ArrowDownToLine size={22} />
        </div>
        <div className="action-label">{t('addFunds')}</div>
        <div className="action-sub">Deposit / Onramp</div>
      </button>

      {/* 3. Airtime & Bills */}
      <button className="action-btn" onClick={() => onNavigate('airtime')}>
        <div className="action-icon" style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.06))',
          color: 'var(--color-violet)',
          border: '1.5px solid rgba(124, 58, 237, 0.35)',
        }}>
          <Smartphone size={22} />
        </div>
        <div className="action-label">{t('airtimeBills')}</div>
        <div className="action-sub">Data / Power</div>
      </button>
    </div>
  );
};

export default QuickActions;
