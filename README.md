# PayExpress • Nimiq Pay African Ramp & Spend Mini-App

**PayExpress** is a Web3 Mini-App designed for **[Nimiq Pay](https://nimiq.dev/mini-apps)**, powered by the official **[Cashramp](https://cashramp.co/commerce)** SDK (`cashramp`). It bridges on-chain crypto balances (**NIM**, **USDC**, and **USDT**) across 6 EVM networks with real-time retail mobile money rails across 30+ African countries.

---

## 🏗️ Architecture & Folder Structure

```
pay express/
├── backend/                             # Node.js / Express API Server
│   ├── .env                             # Active Cashramp Secret Key & Port
│   ├── package.json                     # Backend dependencies (cashramp, express, cors, dotenv)
│   └── src/
│       ├── config/
│       │   ├── env.config.js            # Environment configuration
│       │   └── cashramp.config.js       # Official Cashramp SDK client initialization
│       ├── services/
│       │   └── cashramp.service.js      # Cashramp SDK integration (Rates, Quotes, Payouts, STK)
│       ├── controllers/
│       │   └── ramp.controller.js       # HTTP route handlers
│       ├── routes/
│       │   └── api.routes.js            # REST API endpoints (/api/countries, /api/rates, etc.)
│       ├── data/
│       │   ├── countries.data.js        # 30+ African corridor catalog with native rails
│       │   └── merchants.data.js        # Verified merchant directory
│       └── index.js                     # Express app entry point
│
└── frontend/                            # Vite + React + TypeScript Mini-App Shell
    ├── package.json                     # Frontend dependencies (lucide-react, etc.)
    └── src/
        ├── components/                  # Mobile-first Mini-App UI components
        │   ├── Header.tsx               # Native mini-app navigation header
        │   ├── WalletHero.tsx           # Obsidian vault card with 1-tap copyable EVM address
        │   ├── ChainLogo.tsx            # Official vector SVG marks (Polygon, Arbitrum, Base, OP, etc.)
        │   ├── MerchantPay.tsx          # Till, Paybill & Bank transfer with instant settlement
        │   ├── CashOut.tsx              # Automated P2P cash-out to mobile money / bank
        │   ├── AddFunds.tsx             # Telco STK push deposit with preset chips
        │   ├── SlideToPay.tsx           # Draggable slider + 1-tap instant confirm fallback
        │   └── modals/
        │       ├── CountryModal.tsx     # 30+ corridor bottom sheet with search & regional tabs
        │       ├── ChainModal.tsx       # 6 EVM blockchains with fees, gas tokens & speeds
        │       ├── StkPushModal.tsx     # Simulated USSD prompt with animated PIN dots
        │       ├── ReceiptModal.tsx     # Fintech transaction receipt with Cashramp reference
        │       └── SettingsModal.tsx    # 5-language localization & wallet settings
        ├── hooks/
        │   └── useRamp.ts               # State orchestration & transaction workflows
        ├── i18n/
        │   ├── translations.ts          # Localization (EN, FR, ES, DE, PT) per Nimiq Pay spec
        │   └── useTranslation.tsx       # 3-tier language resolution hook
        ├── services/
        │   ├── api.ts                   # Backend proxy client
        │   └── evm.ts                   # Nimiq Pay window.ethereum EVM multi-chain provider bridge
        └── styles/
            └── app.css                  # Mobile mini-app styling with flex layout & safe areas
```

---

## ⚡ Key Features

1. **Official Cashramp Commerce Integration**:
   - Connected via `CASHRAMP_SECRET_KEY` using the official `cashramp` npm SDK.
   - Real-time bid/ask P2P rates (`client.getMarketRate`).
   - Dynamic quote generation with exchange rate locks (`client.getRampQuote`).
   - Automated STK Push deposit simulation.

2. **30+ African Payment Corridors**:
   - **West Africa**: Nigeria (NGN), Ghana (GHS), Cameroon (XAF), Senegal (XOF), Côte d'Ivoire (XOF), Togo, Benin, Burkina Faso, Mali, Guinea, Sierra Leone, Liberia.
   - **East Africa**: Kenya (KES), Rwanda (RWF), Tanzania (TZS), Uganda (UGX), Ethiopia (ETB), Malawi (MWK).
   - **Southern & Central Africa**: South Africa (ZAR), Zambia (ZMW), Mozambique (MZN), Botswana (BWP), DR Congo, Gabon, Chad, Congo, Madagascar, Zimbabwe.
   - Supported rails: M-Pesa, MTN MoMo, Vodafone/Telecel Cash, AirtelTigo, Wave, Orange Money, Telebirr, Chipper Cash, Kuda Bank, Capitec, Instant NIP.

3. **Nimiq Mini App SDK & Dual-Chain Architecture**:
   - Implements the official [Nimiq Mini App Tutorial](https://nimiq.dev/mini-apps/tutorials/mini-app-tutorial) and [Dual-Chain Mini App Tutorial](https://nimiq.dev/mini-apps/tutorials/dual-chain-mini-app-tutorial) using `@nimiq/mini-app-sdk@0.2.4`.
   - **Tutorial 1 ("3 Requests")**:
     - `nimiq.listAccounts()`: Reads user-shared Nimiq addresses.
     - `nimiq.isConsensusEstablished()`: Verifies live consensus state.
     - `nimiq.getBlockNumber()`: Retrieves current blockchain height.
     - `nimiq.getBalance(address)`: Live on-chain balance lookup in Luna / NIM.
     - Normalized error handling via `NimiqProviderError` (e.g. `PERMISSION_DENIED`).
   - **Tutorial 2 ("Dual-Chain Signing Flows")**:
     - **Nimiq Flow**: `listAccounts()` ➔ `sign('Nimiq Pay dual-chain tutorial')` with Ed25519 public key and signature verification.
     - **Ethereum Flow**: `eth_requestAccounts` ➔ `personal_sign('Nimiq Pay dual-chain tutorial')` with `toHexUtf8` encoding.
     - Real-time step-by-step progress tracking and status indicators.
   - **Host Context Integration**: Reads `getHostLanguage()`, `getHostFiat()`, `getHostNetwork()`, and provides full-screen controls (`requestFullscreen()`).

4. **Multi-Chain EVM Support (`window.ethereum`)**:
   - Built to Nimiq Pay specifications ([EVM Tokens](https://nimiq.dev/mini-apps/features/evm-tokens)).
   - Native network switching across **Polygon**, **Arbitrum One**, **Base**, **Optimism**, **Celo**, and **Ethereum Mainnet**.
   - Official vector brand SVG logos for all supported blockchains.

5. **Localization (i18n)**:
   - Full 5-language translation per [Nimiq Pay Localization](https://nimiq.dev/mini-apps/features/localization):
     - English (`en`), Français (`fr`), Español (`es`), Deutsch (`de`), Português (`pt`).
   - Automatic 3-tier language detection: `getHostLanguage()` / `window.nimiqPay.language` ➔ `localStorage` ➔ `navigator.language` ➔ `'en'`.

6. **Mobile-First Mini-App Ergonomics**:
   - Flex column layout preventing bottom navigation tab cutoff.
   - Draggable "Slide to Pay" with 1-tap instant confirmation fallback.
   - 1-tap copyable Nimiq (`NQ...`) and EVM (`0x...`) address chips with `Copied! ✓` feedback.
   - Preset quick amount chips and live Cashramp rate locks.

---

## 🚀 Running Locally & Testing Inside Nimiq Pay

```bash
# 1. Start Backend API (Port 5001)
cd backend
npm start

# 2. Start Frontend Dev Server (Port 5173 with Host Access)
cd frontend
npm run dev
```

### Testing on your Phone with Nimiq Pay:
1. Make sure your phone and development machine are on the same Wi-Fi network.
2. In your terminal, note the **Network** URL shown by Vite, e.g.:
   ```bash
   http://192.168.1.42:5173
   ```
3. Open the **Nimiq Pay** app on your phone.
4. Navigate to **Mini Apps**.
5. Enter your network URL (`http://<your-ip>:5173`).
6. The app automatically connects to your Nimiq account and EVM wallet for payments and cash-out!

---

## 📄 License

This project is licensed under the [MIT License](file:///Users/hng/pay%20express/LICENSE).

