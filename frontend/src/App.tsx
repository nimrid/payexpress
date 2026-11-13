import React, { useState } from 'react';
import { Home, ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { useRamp } from './hooks/useRamp';
import { Header } from './components/Header';
import { WalletHero } from './components/WalletHero';
import { RateTicker } from './components/RateTicker';
import { ActivityFeed } from './components/ActivityFeed';
import { AddFunds } from './components/AddFunds';
import { CashOut } from './components/CashOut';
import { CorridorRibbon } from './components/CorridorRibbon';
import { LandingPage } from './components/LandingPage';

// Modals
import { CountryModal } from './components/modals/CountryModal';
import { ChainModal } from './components/modals/ChainModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { StkPushModal } from './components/modals/StkPushModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Transaction } from './types';
import { API } from './services/api';

import './styles/app.css';

export function App() {
  const {
    countries,
    activeCountry,
    activeCrypto,
    selectedChain,
    setSelectedChain,
    rate,
    nimUsdRate,
    nimBalance,
    usdtBalance,
    evmAddress,
    nimiqAddress,
    isNimiqConnecting,
    isNimiqReady,
    transactions,
    fiatEquivalent,
    maxCryptoBalance,
    changeCountry,
    setActiveCrypto,
    connectEvm,
    connectNimiq,
    executeCashOut,
    executeDeposit,
    resetBalance,
  } = useRamp();

  const [currentView, setCurrentView] = useState<'home' | 'cashout' | 'deposit'>('home');

  // View mode: 'landing' (marketing & education page) vs 'app' (mini-app interface)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'app' || window.location.hash === '#app' || Boolean((window as any).nimiqPay)) {
        return 'app';
      }
    }
    return 'landing';
  });

  const handleLaunchApp = (targetView?: 'home' | 'cashout' | 'deposit') => {
    if (targetView) {
      setCurrentView(targetView);
    }
    setViewMode('app');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Daylight / Night mode state (Default to daylight for outdoor sunlight readability)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('payexpress_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('payexpress_theme', next);
  };

  React.useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Modals state
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  // STK Push / Deposit state with live Cashramp payment session
  const [stkData, setStkData] = useState<{
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    methodName?: string;
    paymentMethodType?: string;
    amount: number;
    paymentRequestId?: string;
    agent?: string;
    paymentDetails?: string;
    cryptoAmount?: string | number;
    cryptoAsset?: string;
  } | null>(null);

  const handleCashOutConfirm = async (params: {
    recipient?: string;
    phone?: string;
    recipientName?: string;
    accountNo?: string;
    bankName?: string;
    paymentMethodType?: string;
    methodName?: string;
    fields?: Record<string, string>;
    cryptoAmount: number;
    fiatAmount: number;
  }) => {
    const tx = await executeCashOut(params);
    setActiveReceipt(tx);
    setCurrentView('home');
  };

  const handleDepositRequest = async (params: {
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    paymentMethodType: string;
    methodName: string;
    amount: number;
    fields?: Record<string, string>;
  }) => {
    try {
      const res = await API.initiateDeposit({
        phoneNumber: params.phone,
        bankAccountNumber: params.accountNumber,
        amount: params.amount,
        currency: activeCountry.currency,
        cryptoAsset: activeCrypto === 'NIM' ? 'USDT' : activeCrypto,
        network: selectedChain === 'polygon' ? 'matic' : selectedChain,
        userWalletAddress: evmAddress,
        countryCode: activeCountry.code,
        paymentMethodType: params.paymentMethodType,
      });

      if (res && res.success && res.deposit) {
        setStkData({
          phone: params.phone,
          accountNumber: params.accountNumber,
          bankName: params.bankName,
          methodName: params.methodName,
          paymentMethodType: params.paymentMethodType,
          amount: params.amount,
          paymentRequestId: res.deposit.paymentRequestId || res.deposit.id,
          agent: res.deposit.agent,
          paymentDetails: res.deposit.paymentDetails,
          cryptoAmount: res.deposit.amountUsd,
          cryptoAsset: activeCrypto,
        });
        return;
      }
    } catch (err) {
      console.warn('initiateDeposit request error:', err);
    }
    setStkData({
      ...params,
      cryptoAsset: activeCrypto,
    });
  };

  const handleConfirmDeposit = async () => {
    if (!stkData) return;
    const tx = await executeDeposit(stkData);
    setStkData(null);
    setActiveReceipt(tx);
    setCurrentView('home');
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        countries={countries}
        activeCountry={activeCountry}
        onSelectCountry={changeCountry}
        onLaunchApp={handleLaunchApp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <main className={`app-frame theme-${theme}`}>
      {/* Header */}
      <Header
        evmAddress={evmAddress}
        selectedChain={selectedChain}
        activeCountry={activeCountry}
        theme={theme}
        onToggleTheme={toggleTheme}
        onConnectEvm={connectEvm}
        onOpenChainModal={() => setIsChainModalOpen(true)}
        onOpenCountryModal={() => setIsCountryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLanding={() => setViewMode('landing')}
      />

      {/* Main View Area */}
      <div className="view-body">
        {currentView === 'home' && (
          <div>
            <WalletHero
              country={activeCountry}
              cryptoAsset={activeCrypto}
              nimBalance={nimBalance}
              usdtBalance={usdtBalance}
              fiatValue={fiatEquivalent}
              evmAddress={evmAddress}
              nimiqAddress={nimiqAddress}
              onSelectCountry={() => setIsCountryModalOpen(true)}
              onToggleCrypto={setActiveCrypto}
              onConnectNimiq={connectNimiq}
            />

            <RateTicker
              countryName={activeCountry.name}
              rate={rate}
            />

            {/* Quick Action Buttons for Add Funds & Cash Out */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setCurrentView('deposit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(246, 174, 45, 0.35)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ArrowDownToLine size={18} strokeWidth={2.4} />
                <span>Add Funds</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('cashout')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1.5px solid var(--border-hero)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ArrowUpRight size={18} strokeWidth={2.4} color="var(--color-emerald)" />
                <span>Cash Out</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recent Transactions
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-accent)' }}>Cashramp Verified</span>
            </div>

            <ActivityFeed
              transactions={transactions}
              onSelectTx={(tx) => setActiveReceipt(tx)}
            />
          </div>
        )}

        {currentView === 'deposit' && (
          <AddFunds
            country={activeCountry}
            cryptoAsset={activeCrypto}
            rate={rate}
            nimUsdRate={nimUsdRate}
            selectedChain={selectedChain}
            onOpenChainModal={() => setIsChainModalOpen(true)}
            onBack={() => setCurrentView('home')}
            onRequestDeposit={handleDepositRequest}
          />
        )}

        {currentView === 'cashout' && (
          <CashOut
            country={activeCountry}
            cryptoAsset={activeCrypto}
            maxCryptoBalance={maxCryptoBalance}
            rate={rate}
            nimUsdRate={nimUsdRate}
            selectedChain={selectedChain}
            onOpenChainModal={() => setIsChainModalOpen(true)}
            onBack={() => setCurrentView('home')}
            onExecuteCashOut={handleCashOutConfirm}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-tab ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>
        <button
          className={`nav-tab ${currentView === 'deposit' ? 'active' : ''}`}
          onClick={() => setCurrentView('deposit')}
        >
          <ArrowDownToLine size={18} />
          <span>Add Funds</span>
        </button>
        <button
          className={`nav-tab ${currentView === 'cashout' ? 'active' : ''}`}
          onClick={() => setCurrentView('cashout')}
        >
          <ArrowUpRight size={18} />
          <span>Cash Out</span>
        </button>
      </nav>

      {/* Modals */}
      <CountryModal
        isOpen={isCountryModalOpen}
        countries={countries}
        selectedCode={activeCountry.code}
        onSelect={(c) => {
          changeCountry(c);
          setIsCountryModalOpen(false);
        }}
        onClose={() => setIsCountryModalOpen(false)}
      />

      <ChainModal
        isOpen={isChainModalOpen}
        selectedChain={selectedChain}
        onSelectChain={setSelectedChain}
        onClose={() => setIsChainModalOpen(false)}
      />

      <ReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      <StkPushModal
        isOpen={Boolean(stkData)}
        phone={stkData?.phone || ''}
        accountNumber={stkData?.accountNumber}
        bankName={stkData?.bankName}
        methodName={stkData?.methodName}
        paymentMethodType={stkData?.paymentMethodType}
        amount={stkData?.amount || 0}
        currency={activeCountry.currency}
        symbol={activeCountry.symbol}
        cryptoAsset={stkData?.cryptoAsset || activeCrypto}
        cryptoAmount={stkData?.cryptoAmount}
        agent={stkData?.agent}
        paymentDetails={stkData?.paymentDetails}
        onConfirm={handleConfirmDeposit}
        onClose={() => setStkData(null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        selectedChain={selectedChain}
        onSelectChain={setSelectedChain}
        onResetBalance={resetBalance}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </main>
  );
}

export default App;
