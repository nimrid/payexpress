import React, { useState } from 'react';
import { Home, Zap, ArrowDownToLine, Smartphone, ShieldAlert } from 'lucide-react';
import { useRamp } from './hooks/useRamp';
import { Header } from './components/Header';
import { WalletHero } from './components/WalletHero';
import { QuickActions } from './components/QuickActions';
import { RateTicker } from './components/RateTicker';
import { ActivityFeed } from './components/ActivityFeed';
import { MerchantPay } from './components/MerchantPay';
import { AddFunds } from './components/AddFunds';
import { AirtimeBills } from './components/AirtimeBills';
import { CorridorRibbon } from './components/CorridorRibbon';

// Modals
import { CountryModal } from './components/modals/CountryModal';
import { ChainModal } from './components/modals/ChainModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { StkPushModal } from './components/modals/StkPushModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { PinAuthModal } from './components/modals/PinAuthModal';
import { Transaction } from './types';
import { API } from './services/api';
import { Security } from './services/security';

import './styles/app.css';

export function App() {
  const {
    countries,
    activeCountry,
    activeCrypto,
    selectedChain,
    setSelectedChain,
    rate,
    nimBalance,
    usdcBalance,
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
    executeSpend,
    executeDeposit,
    executeAirtime,
    resetBalance,
  } = useRamp();

  const [currentView, setCurrentView] = useState<'home' | 'pay' | 'deposit' | 'airtime'>('home');

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

  // Security PIN authorization state
  const [pinAuthRequest, setPinAuthRequest] = useState<{
    type: 'spend' | 'airtime';
    payload: any;
    title: string;
    subtitle?: string;
    amount?: number;
    currency?: string;
    symbol?: string;
    recipientName?: string;
  } | null>(null);

  const [pinModalMode, setPinModalMode] = useState<'verify' | 'setup' | 'change'>('verify');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinSet, setIsPinSet] = useState(() => Security.hasPin());

  // Listen for storage / PIN updates across any component
  React.useEffect(() => {
    const handlePinUpdated = () => {
      setIsPinSet(Security.hasPin());
    };
    window.addEventListener('payexpress_pin_updated', handlePinUpdated);
    return () => window.removeEventListener('payexpress_pin_updated', handlePinUpdated);
  }, []);

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

  const handleSpendConfirm = async (params: {
    recipient: string;
    recipientName: string;
    amount: number;
    accountNo?: string;
    quote?: any;
  }) => {
    // Intercept: Require user's Security PIN authorization
    setPinAuthRequest({
      type: 'spend',
      payload: params,
      title: 'Authorize Payment',
      subtitle: `Enter your Security PIN to send ${activeCountry.symbol}${params.amount.toLocaleString()} ${activeCountry.currency} to ${params.recipientName}`,
      amount: params.amount,
      currency: activeCountry.currency,
      symbol: activeCountry.symbol,
      recipientName: params.recipientName,
    });
    setPinModalMode(Security.hasPin() ? 'verify' : 'setup');
    setIsPinModalOpen(true);
  };

  const handlePurchaseAirtime = (bundleName: string, price: number) => {
    // Intercept: Require user's Security PIN authorization
    setPinAuthRequest({
      type: 'airtime',
      payload: { bundleName, price },
      title: 'Authorize Purchase',
      subtitle: `Enter your Security PIN to purchase ${bundleName} for ${activeCountry.symbol}${price.toLocaleString()}`,
      amount: price,
      currency: activeCountry.currency,
      symbol: activeCountry.symbol,
      recipientName: bundleName,
    });
    setPinModalMode(Security.hasPin() ? 'verify' : 'setup');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = async () => {
    setIsPinSet(true);
    setIsPinModalOpen(false);

    if (!pinAuthRequest) return;

    const request = pinAuthRequest;
    setPinAuthRequest(null);

    if (request.type === 'spend') {
      const tx = await executeSpend(request.payload);
      setActiveReceipt(tx);
      setCurrentView('home');
    } else if (request.type === 'airtime') {
      const tx = executeAirtime(request.payload.bundleName, request.payload.price);
      setActiveReceipt(tx);
      setCurrentView('home');
    }
  };

  const handleDepositRequest = async (params: {
    phone?: string;
    accountNumber?: string;
    bankName?: string;
    paymentMethodType: string;
    methodName: string;
    amount: number;
  }) => {
    try {
      const res = await API.initiateDeposit({
        phoneNumber: params.phone,
        bankAccountNumber: params.accountNumber,
        amount: params.amount,
        currency: activeCountry.currency,
        cryptoAsset: activeCrypto === 'NIM' ? 'USDC' : activeCrypto,
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

  const handleConfirmPin = async (_pin?: string) => {
    if (!stkData) return;
    setIsPinSet(true);
    const tx = await executeDeposit(stkData);
    setStkData(null);
    setActiveReceipt(tx);
    setCurrentView('home');
  };

  return (
    <main className={`app-frame theme-${theme}`}>
      {/* Header */}
      <Header
        evmAddress={evmAddress}
        selectedChain={selectedChain}
        theme={theme}
        onToggleTheme={toggleTheme}
        onConnectEvm={connectEvm}
        onOpenChainModal={() => setIsChainModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Area */}
      <div className="view-body">
        {currentView === 'home' && (
          <div>
            {/* Security Alert Banner when no PIN is set */}
            {!isPinSet && (
              <div style={{
                background: 'var(--color-nimiq-gold-subtle)',
                border: '1.5px solid var(--border-hero)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={20} color="var(--color-nimiq-gold-dark)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Security Setup Recommended
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      Create your 4-digit PIN to secure all payments and withdrawals.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPinAuthRequest(null);
                    setPinModalMode('setup');
                    setIsPinModalOpen(true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, var(--color-nimiq-gold), var(--color-nimiq-gold-dark))',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#0F172A',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(246, 174, 45, 0.3)',
                  }}
                >
                  Set PIN
                </button>
              </div>
            )}

            <WalletHero
              country={activeCountry}
              cryptoAsset={activeCrypto}
              nimBalance={nimBalance}
              usdcBalance={usdcBalance}
              usdtBalance={usdtBalance}
              fiatValue={fiatEquivalent}
              evmAddress={evmAddress}
              nimiqAddress={nimiqAddress}
              onSelectCountry={() => setIsCountryModalOpen(true)}
              onToggleCrypto={setActiveCrypto}
              onConnectNimiq={connectNimiq}
            />

            <QuickActions onNavigate={setCurrentView} />

            <RateTicker
              countryName={activeCountry.name}
              rate={rate}
            />

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

        {currentView === 'pay' && (
          <MerchantPay
            country={activeCountry}
            cryptoAsset={activeCrypto}
            maxCryptoBalance={maxCryptoBalance}
            onNavigateToAddFunds={() => setCurrentView('deposit')}
            onOpenCountryModal={() => setIsCountryModalOpen(true)}
            onBack={() => setCurrentView('home')}
            onExecutePay={handleSpendConfirm}
          />
        )}

        {currentView === 'deposit' && (
          <AddFunds
            country={activeCountry}
            cryptoAsset={activeCrypto}
            selectedChain={selectedChain}
            onOpenChainModal={() => setIsChainModalOpen(true)}
            onBack={() => setCurrentView('home')}
            onRequestDeposit={handleDepositRequest}
          />
        )}

        {currentView === 'airtime' && (
          <AirtimeBills
            country={activeCountry}
            cryptoAsset={activeCrypto}
            onBack={() => setCurrentView('home')}
            onPurchaseBundle={handlePurchaseAirtime}
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
          className={`nav-tab ${currentView === 'pay' ? 'active' : ''}`}
          onClick={() => setCurrentView('pay')}
        >
          <Zap size={18} />
          <span>Pay</span>
        </button>
        <button
          className={`nav-tab ${currentView === 'deposit' ? 'active' : ''}`}
          onClick={() => setCurrentView('deposit')}
        >
          <ArrowDownToLine size={18} />
          <span>Add Funds</span>
        </button>
        <button
          className={`nav-tab ${currentView === 'airtime' ? 'active' : ''}`}
          onClick={() => setCurrentView('airtime')}
        >
          <Smartphone size={18} />
          <span>Airtime</span>
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
        onConfirmPin={handleConfirmPin}
        onClose={() => setStkData(null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onResetBalance={resetBalance}
        onOpenPinModal={(mode) => {
          setPinAuthRequest(null);
          setPinModalMode(mode);
          setIsPinModalOpen(true);
        }}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <PinAuthModal
        isOpen={isPinModalOpen}
        mode={pinModalMode}
        title={pinAuthRequest?.title}
        subtitle={pinAuthRequest?.subtitle}
        amount={pinAuthRequest?.amount}
        currency={pinAuthRequest?.currency}
        symbol={pinAuthRequest?.symbol}
        recipientName={pinAuthRequest?.recipientName}
        onSuccess={handlePinSuccess}
        onClose={() => {
          setIsPinModalOpen(false);
          setPinAuthRequest(null);
        }}
      />
    </main>
  );
}

export default App;
