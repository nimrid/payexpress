import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  ArrowDownToLine, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Layers, 
  Sun, 
  Moon, 
  Lock, 
  ExternalLink,
  Globe,
  Clock,
  ArrowRightLeft,
  Smartphone,
  Store,
  KeyRound
} from 'lucide-react';
import { Country, CryptoAsset } from '../types';
import '../styles/landing.css';

interface LandingPageProps {
  countries: Country[];
  activeCountry: Country;
  onSelectCountry: (country: Country) => void;
  onLaunchApp: (initialView?: 'home' | 'cashout' | 'deposit') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

// Featured corridor information
const FEATURED_CORRIDORS = [
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', symbol: 'KSh', rails: 'M-Pesa Buy Goods Till • Paybill • Airtel Money • Bank', speed: '< 45s' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', symbol: '₦', rails: 'Instant Bank Transfer (NUBAN) • Moniepoint • Chipper Cash', speed: '< 60s' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', symbol: 'GH₵', rails: 'MTN Mobile Money • Telecel Cash • GhIPSS Instant', speed: '< 45s' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', symbol: 'R', rails: 'PayShap Instant • Capitec Pay • Ozow • FNB E-Wallet', speed: '< 60s' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', symbol: 'USh', rails: 'MTN MoMo • Airtel Money • Commercial Bank Transfer', speed: '< 60s' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  countries,
  activeCountry,
  onSelectCountry,
  onLaunchApp,
  theme,
  onToggleTheme,
}) => {
  // Live Converter / Calculator state
  const [calcMode, setCalcMode] = useState<'cashout' | 'deposit'>('cashout');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('NIM');
  const [calcCountryCode, setCalcCountryCode] = useState<string>(activeCountry.code || 'KE');
  const [calcAmount, setCalcAmount] = useState<string>('50');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Find target calculation country
  const currentCalcCountry = useMemo(() => {
    return countries.find((c) => c.code === calcCountryCode) || activeCountry;
  }, [countries, calcCountryCode, activeCountry]);

  // Indicative rates fallback mapping
  const indicativeRates: Record<string, { deposit: number; withdrawal: number }> = {
    KE: { deposit: 131.2, withdrawal: 128.5 },
    NG: { deposit: 1408.0, withdrawal: 1380.0 },
    GH: { deposit: 12.5, withdrawal: 12.1 },
    ZA: { deposit: 18.4, withdrawal: 17.9 },
    UG: { deposit: 3750.0, withdrawal: 3680.0 },
  };

  const currentRateObj = indicativeRates[currentCalcCountry.code] || { deposit: 130.0, withdrawal: 127.0 };
  const effectiveRate = calcMode === 'cashout' ? currentRateObj.withdrawal : currentRateObj.deposit;
  const nimUsdPrice = 0.00325;

  // Calculation computation
  const quoteResult = useMemo(() => {
    const inputNum = parseFloat(calcAmount) || 0;
    if (inputNum <= 0) return { output: '0.00', rateText: '' };

    if (calcMode === 'cashout') {
      // User enters Crypto Amount -> receives Local Fiat
      const usdValue = selectedAsset === 'NIM' ? inputNum * nimUsdPrice : inputNum;
      const fiatPayout = usdValue * effectiveRate;
      return {
        output: fiatPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: currentCalcCountry.currency,
        symbol: currentCalcCountry.symbol,
      };
    } else {
      // User enters Local Fiat Amount -> receives Crypto
      const usdValue = inputNum / effectiveRate;
      const cryptoCredit = selectedAsset === 'NIM' ? usdValue / nimUsdPrice : usdValue;
      return {
        output: cryptoCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: selectedAsset,
        symbol: '',
      };
    }
  }, [calcAmount, calcMode, selectedAsset, effectiveRate, currentCalcCountry]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* 1. STICKY NAVIGATION */}
      <nav className="landing-nav" aria-label="Main Navigation">
        <div className="landing-container">
          <div className="landing-nav-inner">
            <button className="landing-brand" onClick={() => onLaunchApp('home')} title="Open Pay Express">
              <div className="landing-brand-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2" fill="#0F172A" />
                  <path d="M13 5L7 13H12L11 19L17 11H12L13 5Z" fill="#F6AE2D" />
                </svg>
              </div>
              <div className="landing-brand-text">
                <span className="landing-brand-title">PayExpress</span>
                <span className="landing-brand-tagline">Nimiq Pay & EVM Gateway</span>
              </div>
            </button>

            <div className="landing-nav-links">
              <button className="landing-nav-link" onClick={() => scrollToSection('features')}>Features</button>
              <button className="landing-nav-link" onClick={() => scrollToSection('calculator')}>Rate Calculator</button>
              <button className="landing-nav-link" onClick={() => scrollToSection('corridors')}>Corridors</button>
              <button className="landing-nav-link" onClick={() => scrollToSection('how-it-works')}>How It Works</button>
              <button className="landing-nav-link" onClick={() => scrollToSection('faq')}>FAQ</button>
            </div>

            <div className="landing-nav-actions">
              <button
                onClick={onToggleTheme}
                className="theme-toggle-btn"
                title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Daylight Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <button
                className="btn-launch-header"
                onClick={() => onLaunchApp('home')}
                title="Launch Pay Express Mini App"
              >
                <span>Launch App</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <Zap size={14} />
                <span>Next-Gen Crypto-to-Cash Gateway for Africa</span>
              </div>

              <h1 className="hero-title">
                African Crypto On & Off-Ramp <span className="hero-title-accent">Instantly</span>
              </h1>

              <p className="hero-subtitle">
                Deposit fiat and cash out crypto (<strong>NIM</strong> & <strong>USDT</strong>) directly with Mobile Money and Bank Accounts across Africa. Non-custodial, real-time FX rates, and sub-60 second settlement.
              </p>

              <div className="hero-cta-group">
                <button
                  className="btn-hero-primary"
                  onClick={() => onLaunchApp('home')}
                  title="Open Pay Express"
                >
                  <span>Launch Mini App</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  className="btn-hero-secondary"
                  onClick={() => scrollToSection('calculator')}
                >
                  <ArrowRightLeft size={16} />
                  <span>Check Live Rates</span>
                </button>
              </div>

              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <Clock size={16} className="hero-trust-icon" />
                  <span>Sub-60s Settlement</span>
                </div>
                <div className="hero-trust-item">
                  <ShieldCheck size={16} className="hero-trust-icon" />
                  <span>Non-Custodial</span>
                </div>
                <div className="hero-trust-item">
                  <Smartphone size={16} className="hero-trust-icon" />
                  <span>M-Pesa & Bank Rails</span>
                </div>
                <div className="hero-trust-item">
                  <ShieldCheck size={16} className="hero-trust-icon" />
                  <span>Nimiq Pay Native</span>
                </div>
              </div>
            </div>

            {/* LIVE CONVERTER WIDGET */}
            <div className="calc-card-container" id="calculator">
              <div className="calc-card">
                <div className="calc-card-header">
                  <div className="calc-segmented-control">
                    <button
                      className={`calc-tab-btn ${calcMode === 'cashout' ? 'active' : ''}`}
                      onClick={() => setCalcMode('cashout')}
                    >
                      <ArrowUpRight size={14} />
                      <span>Cash Out</span>
                    </button>
                    <button
                      className={`calc-tab-btn ${calcMode === 'deposit' ? 'active' : ''}`}
                      onClick={() => setCalcMode('deposit')}
                    >
                      <ArrowDownToLine size={14} />
                      <span>Add Funds</span>
                    </button>
                  </div>
                </div>

                <div className="calc-field-group">
                  {/* Corridor Selector */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      Selected Corridor:
                    </span>
                    <select
                      value={calcCountryCode}
                      onChange={(e) => setCalcCountryCode(e.target.value)}
                      className="calc-select-pill"
                    >
                      {FEATURED_CORRIDORS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Box */}
                  <div className="calc-input-box">
                    <div className="calc-label-row">
                      <span>{calcMode === 'cashout' ? 'You Cash Out' : 'You Deposit'}</span>
                      <span>Asset: {calcMode === 'cashout' ? selectedAsset : currentCalcCountry.currency}</span>
                    </div>
                    <div className="calc-value-row">
                      <input
                        type="number"
                        min="1"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="calc-text-input"
                        placeholder="0.00"
                      />
                      {calcMode === 'cashout' ? (
                        <select
                          value={selectedAsset}
                          onChange={(e) => setSelectedAsset(e.target.value as CryptoAsset)}
                          className="calc-select-pill"
                        >
                          <option value="NIM">NIM</option>
                          <option value="USDT">USDT</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-accent)' }}>
                          {currentCalcCountry.currency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="calc-divider">
                    <div className="calc-divider-btn">
                      <ArrowRightLeft size={16} />
                    </div>
                  </div>

                  {/* Output Box */}
                  <div className="calc-input-box" style={{ background: 'var(--bg-card-hero)' }}>
                    <div className="calc-label-row">
                      <span>{calcMode === 'cashout' ? 'Recipient Receives (Fiat)' : 'You Receive (Crypto)'}</span>
                      <span>Estimated Payout</span>
                    </div>
                    <div className="calc-value-row">
                      <div className="calc-text-input" style={{ color: 'var(--color-emerald)' }}>
                        {quoteResult.symbol}{quoteResult.output} {quoteResult.unit}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="calc-summary">
                  <div className="calc-summary-row">
                    <span>Target Rail:</span>
                    <span className="calc-summary-val">{currentCalcCountry.name} Mobile Money / Bank</span>
                  </div>
                  <div className="calc-summary-row">
                    <span>Settlement Speed:</span>
                    <span className="calc-summary-val" style={{ color: 'var(--color-emerald)' }}>&lt; 60 seconds</span>
                  </div>
                  <div className="calc-summary-row">
                    <span>Protocol Fee:</span>
                    <span className="calc-summary-val">0% Hidden Fees</span>
                  </div>
                </div>

                <button
                  className="btn-calc-submit"
                  onClick={() => {
                    const matched = countries.find((c) => c.code === calcCountryCode);
                    if (matched) onSelectCountry(matched);
                    onLaunchApp(calcMode === 'cashout' ? 'cashout' : 'deposit');
                  }}
                >
                  <span>Proceed in Pay Express</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORRIDOR RIBBON TICKER */}
      <div className="landing-corridor-bar" id="corridors">
        <div className="landing-corridor-list">
          {FEATURED_CORRIDORS.map((c) => (
            <div key={c.code} className="landing-corridor-pill">
              <span className="status-dot-active" />
              <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
              <span>{c.name} ({c.currency})</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{c.speed}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CORE FEATURES SECTION */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Powerful Capabilities</span>
            <h2 className="section-title">Built for Everyday African Liquidity</h2>
            <p className="section-desc">
              Whether depositing fiat or converting crypto to cash via mobile money or bank accounts, Pay Express bridges Web3 to real-world rails seamlessly.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-nimiq-gold-subtle)', color: 'var(--color-nimiq-gold-dark)' }}>
                <Zap size={26} />
              </div>
              <h3 className="feature-title">Cashramp Liquidity Engine</h3>
              <p className="feature-text">
                Direct integration with the official Cashramp SDK, offering live market FX rates and instant settlement across 28+ African countries.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Real-time Rates</span>
                <span className="feature-tag-pill">Instant Escrow</span>
                <span className="feature-tag-pill">28+ Countries</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-emerald-light)', color: 'var(--color-emerald)' }}>
                <Smartphone size={26} />
              </div>
              <h3 className="feature-title">Instant Mobile Money Cash Out</h3>
              <p className="feature-text">
                Withdraw your NIM or USDT directly into your local mobile money wallet (M-Pesa, MTN MoMo, Airtel Money, Telecel) or commercial bank account in under 60 seconds.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Instant Off-Ramp</span>
                <span className="feature-tag-pill">&lt; 60s Settlement</span>
                <span className="feature-tag-pill">Direct Payout</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-cyan-light)', color: 'var(--color-cyan)' }}>
                <ArrowDownToLine size={26} />
              </div>
              <h3 className="feature-title">Seamless Add Funds (On-Ramp)</h3>
              <p className="feature-text">
                Buy crypto instantly using your local fiat payment rails. Deposit with instant bank transfer (NUBAN, GhIPSS, PayShap) or mobile money.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Bank Transfer</span>
                <span className="feature-tag-pill">PayShap</span>
                <span className="feature-tag-pill">Local Currency</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-violet-light)', color: 'var(--color-violet)' }}>
                <Layers size={26} />
              </div>
              <h3 className="feature-title">Dual-Chain Multi-Network</h3>
              <p className="feature-text">
                Enjoy ultra-fast, zero-fee native Nimiq (NIM) transactions, plus multi-chain EVM token settlement across Polygon, Base, Arbitrum, Ethereum, and Celo.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Nimiq Pay</span>
                <span className="feature-tag-pill">Polygon</span>
                <span className="feature-tag-pill">Base L2</span>
                <span className="feature-tag-pill">Arbitrum</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-emerald-light)', color: 'var(--color-emerald)' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 className="feature-title">100% Non-Custodial Security</h3>
              <p className="feature-text">
                Your private keys remain exclusively in your wallet. We never take custody of your crypto or lock your funds. Transactions sign on your device.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Self-Custody</span>
                <span className="feature-tag-pill">No Lockups</span>
                <span className="feature-tag-pill">Zero Counterparty Risk</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrap" style={{ background: 'var(--color-nimiq-gold-subtle)', color: 'var(--color-nimiq-gold-dark)' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 className="feature-title">Nimiq Pay Native Security</h3>
              <p className="feature-text">
                Protected by Nimiq Pay's native wallet cryptography and biometric authorization. Zero separate passwords or PINs required.
              </p>
              <div className="feature-tag-list">
                <span className="feature-tag-pill">Host Wallet Enforced</span>
                <span className="feature-tag-pill">Biometrics Native</span>
                <span className="feature-tag-pill">Hardware-Backed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)' }} id="how-it-works">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Simple & Fast</span>
            <h2 className="section-title">How Pay Express Works in 3 Steps</h2>
            <p className="section-desc">
              No complicated onboarding, no multi-day verification delays. Connect and transact in seconds.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num-badge">1</div>
              <h3 className="step-title">Connect Your Wallet</h3>
              <p className="step-desc">
                Open directly inside <strong>Nimiq Pay</strong>, or connect MetaMask / your preferred EVM Web3 wallet on Polygon, Base, or Arbitrum.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num-badge">2</div>
              <h3 className="step-title">Choose Add Funds or Cash Out</h3>
              <p className="step-desc">
                Select your African country and preferred payment rail: Mobile Money (M-Pesa, MTN MoMo, Airtel) or Bank Account.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num-badge">3</div>
              <h3 className="step-title">Authorize & Settle Instantly</h3>
              <p className="step-desc">
                Confirm the live exchange rate and authorize natively in Nimiq Pay. Funds clear to your mobile wallet or crypto balance in under 60 seconds!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUPPORTED CORRIDORS SHOWCASE */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Coverage</span>
            <h2 className="section-title">Supported African Corridors</h2>
            <p className="section-desc">
              Direct connection to domestic settlement infrastructure across leading emerging economies.
            </p>
          </div>

          <div className="corridors-grid">
            {FEATURED_CORRIDORS.map((c) => (
              <div key={c.code} className="corridor-showcase-card">
                <div className="corridor-card-top">
                  <div className="corridor-flag-name">
                    <span className="corridor-flag">{c.flag}</span>
                    <div>
                      <div className="corridor-name">{c.name}</div>
                      <div className="corridor-currency">{c.currency} ({c.symbol})</div>
                    </div>
                  </div>
                  <span className="corridor-speed-pill">{c.speed}</span>
                </div>

                <div className="corridor-rails-list">
                  <div className="corridor-rail-item">
                    <CheckCircle2 size={14} color="var(--color-emerald)" />
                    <span>{c.rails}</span>
                  </div>
                </div>

                <button
                  style={{
                    background: 'var(--bg-pill)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                  onClick={() => {
                    const matched = countries.find((item) => item.code === c.code);
                    if (matched) onSelectCountry(matched);
                    onLaunchApp('home');
                  }}
                >
                  Pay in {c.name} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECURITY ARCHITECTURE */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="landing-container">
          <div className="security-banner">
            <div>
              <span className="section-tag">Security By Design</span>
              <h2 className="section-title" style={{ marginBlock: '12px' }}>
                Your Keys, Your Crypto. Never Custodial.
              </h2>
              <p className="section-desc">
                Pay Express leverages decentralised cryptographic signatures. Your funds are never locked in escrow or held on a centralised custodial balance.
              </p>
              <div style={{ marginTop: '24px' }}>
                <button
                  className="btn-hero-primary"
                  onClick={() => onLaunchApp('home')}
                >
                  <span>Launch Pay Express</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="security-points">
              <div className="security-point">
                <CheckCircle2 size={20} className="security-point-icon" />
                <div>
                  <div className="security-point-title">Client-Side Signatures</div>
                  <p className="security-point-desc">
                    Transactions are created and signed directly in your Nimiq Pay or EVM wallet. No private keys or seed phrases ever touch our servers.
                  </p>
                </div>
              </div>

              <div className="security-point">
                <CheckCircle2 size={20} className="security-point-icon" />
                <div>
                  <div className="security-point-title">Nimiq Pay Native Wallet Security</div>
                  <p className="security-point-desc">
                    Transactions are cryptographically signed and authorized directly within your Nimiq Pay host wallet.
                  </p>
                </div>
              </div>

              <div className="security-point">
                <CheckCircle2 size={20} className="security-point-icon" />
                <div>
                  <div className="security-point-title">Direct P2P Settlement Pools</div>
                  <p className="security-point-desc">
                    Liquidity routes directly through verified local fiat clearing partners for rapid M-Pesa, Mobile Money, and Bank delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="landing-section" id="faq">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-title">Everything You Need to Know</h2>
          </div>

          <div className="faq-list">
            {[
              {
                q: 'How fast does an off-ramp (cash out) or deposit take?',
                a: 'Mobile money cashouts (M-Pesa, MTN MoMo, Airtel) and bank deposits are typically completed in under 45 to 60 seconds. Direct commercial bank transfers typically clear within 1 to 3 minutes depending on the banking network.',
              },
              {
                q: 'Which cryptocurrencies can I deposit and cash out?',
                a: 'Pay Express natively supports Nimiq (NIM) for fast, low-cost transfers, as well as EVM stablecoin Tether (USDT) across Polygon, Base, Arbitrum, Ethereum, and Celo.',
              },
              {
                q: 'How do Add Funds and Cash Out work with Cashramp?',
                a: 'Add Funds allows you to deposit local fiat currency via mobile money or bank transfer and receive crypto directly into your wallet. Cash Out allows you to withdraw crypto and receive local fiat payout directly into your mobile money wallet or bank account in under 60 seconds.',
              },
              {
                q: 'Is Pay Express custodial? Do you hold my funds?',
                a: 'No. Pay Express is completely non-custodial. We never hold your keys or freeze your wallet balance. You remain in 100% control of your assets at all times.',
              },
              {
                q: 'Can I use Pay Express as a Nimiq Mini App?',
                a: 'Yes! Pay Express is optimized as a first-class Nimiq Mini App. Simply open it inside Nimiq Pay for automatic zero-click wallet integration, or access it from any mobile browser with MetaMask, Rainbow, or Coinbase Wallet.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--color-nimiq-gold)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>
                  {isOpen && <div className="faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="landing-section" style={{ paddingBlockEnd: '30px' }}>
        <div className="landing-container">
          <div className="cta-banner">
            <h2 className="cta-banner-title">Start Converting Crypto Across Africa Today</h2>
            <p className="cta-banner-desc">
              Experience the future of borderless African crypto liquidity and instant mobile money ramps. Non-custodial, lightning fast, and always fair.
            </p>
            <button
              className="btn-hero-primary"
              onClick={() => onLaunchApp('home')}
              style={{ paddingInline: '36px', fontSize: '1.1rem' }}
            >
              <span>Launch Mini App Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="landing-brand-logo" style={{ inlineSize: '32px', blockSize: '32px' }}>
                <Zap size={18} color="#0F172A" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-primary)' }}>PayExpress</span>
            </div>

            <div className="footer-links">
              <button className="footer-link" onClick={() => onLaunchApp('deposit')} style={{ background: 'none', border: 'none', padding: 0 }}>Add Funds</button>
              <button className="footer-link" onClick={() => onLaunchApp('cashout')} style={{ background: 'none', border: 'none', padding: 0 }}>Cash Out</button>
              <button className="footer-link" onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', padding: 0 }}>FAQ</button>
            </div>

            <div className="footer-copy">
              © {new Date().getFullYear()} PayExpress • Powered by Nimiq Pay & EVM Multi-Chain
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

