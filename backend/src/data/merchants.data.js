const KNOWN_MERCHANTS = [
  // Kenya - Tills (Buy Goods)
  { identifier: "542890", type: "till", country: "KE", name: "Java House Cafe - Westlands", category: "Dining & Coffee", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Business", branch: "Westlands Branch, Nairobi" },
  { identifier: "890123", type: "till", country: "KE", name: "Naivas Supermarket - Westlands", category: "Groceries & Supermarket", provider: "M-Pesa Buy Goods", verifiedBadge: "Supermarket Partner", branch: "The Mall, Westlands" },
  { identifier: "123456", type: "till", country: "KE", name: "TotalEnergies Fuel Station - Kilimani", category: "Fuel & Travel", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Merchant", branch: "Argwings Kodhek Rd" },
  { identifier: "654321", type: "till", country: "KE", name: "Quickmart Supermarket - Pioneer", category: "Groceries & Retail", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Business", branch: "Pioneer House, CBD" },
  { identifier: "789456", type: "till", country: "KE", name: "Carrefour Kenya - Two Rivers", category: "Supermarket & Retail", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Enterprise", branch: "Two Rivers Mall" },
  { identifier: "345678", type: "till", country: "KE", name: "Artcaffé Coffee & Bakery", category: "Dining & Bakery", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Business", branch: "The Junction Mall" },
  { identifier: "901234", type: "till", country: "KE", name: "CleanShelf Supermarket", category: "Groceries", provider: "M-Pesa Buy Goods", verifiedBadge: "Verified Merchant", branch: "Kiambu Road" },

  // Kenya - Paybills
  { identifier: "888880", type: "paybill", country: "KE", name: "Kenya Power (KPLC Prepaid Tokens)", category: "Electricity Utility", provider: "M-Pesa Paybill", verifiedBadge: "Official Government Utility", note: "Tokens delivered via SMS instantly" },
  { identifier: "888888", type: "paybill", country: "KE", name: "Kenya Power (KPLC Postpaid Bill)", category: "Electricity Utility", provider: "M-Pesa Paybill", verifiedBadge: "Official Government Utility", note: "Postpaid bill settlement" },
  { identifier: "222111", type: "paybill", country: "KE", name: "Nairobi City Water & Sewerage", category: "Water Utility", provider: "M-Pesa Paybill", verifiedBadge: "Official City Utility", note: "Direct meter payment" },
  { identifier: "522522", type: "paybill", country: "KE", name: "KCB Bank Kenya Ltd", category: "Commercial Banking", provider: "M-Pesa Paybill", verifiedBadge: "Licensed Financial Institution", note: "Account deposit" },
  { identifier: "247247", type: "paybill", country: "KE", name: "Equity Bank Kenya", category: "Commercial Banking", provider: "M-Pesa Paybill", verifiedBadge: "Licensed Financial Institution", note: "Direct bank transfer" },
  { identifier: "400200", type: "paybill", country: "KE", name: "Co-operative Bank of Kenya", category: "Commercial Banking", provider: "M-Pesa Paybill", verifiedBadge: "Licensed Financial Institution", note: "Account deposit" },
  { identifier: "329101", type: "paybill", country: "KE", name: "Bolt Kenya Driver Payouts", category: "Transport & Rides", provider: "M-Pesa Paybill", verifiedBadge: "Verified Corporate", note: "Driver wallet reload" },
  { identifier: "999111", type: "paybill", country: "KE", name: "Safaricom Home Fibre Internet", category: "Internet Provider", provider: "M-Pesa Paybill", verifiedBadge: "Verified Telco Provider", note: "Monthly fiber renewal" },

  // Nigeria - Bank Accounts & NUBANs
  { identifier: "0123456789", type: "bank", country: "NG", name: "Adewale Johnson", category: "Personal Account", provider: "GTBank (Guaranty Trust)", verifiedBadge: "NUBAN Verified", bankName: "Guaranty Trust Bank" },
  { identifier: "9876543210", type: "bank", country: "NG", name: "TechMart Electronics Nigeria Ltd", category: "Corporate Merchant", provider: "Access Bank Plc", verifiedBadge: "Verified Business", bankName: "Access Bank" },
  { identifier: "2039485712", type: "bank", country: "NG", name: "Chioma Okonjo Spices & Foods", category: "Retail & Grocery", provider: "Zenith Bank Plc", verifiedBadge: "Verified Business", bankName: "Zenith Bank" },
  { identifier: "1102938475", type: "bank", country: "NG", name: "Oluwaseun Balogun Digital", category: "Freelancer / Services", provider: "Moniepoint MFB", verifiedBadge: "KYC Level 3 Verified", bankName: "Moniepoint MFB" },
  { identifier: "8031234567", type: "bank", country: "NG", name: "Ibrahim Danjuma Agency", category: "Agency Banking", provider: "OPay Digital Services", verifiedBadge: "Verified Merchant Agent", bankName: "OPay" },
  { identifier: "0019283746", type: "bank", country: "NG", name: "Kuda Microfinance Bank Payout", category: "Digital Banking", provider: "Kuda Bank", verifiedBadge: "Verified Fintech", bankName: "Kuda MFB" },

  // Ghana - Mobile Money & Bank
  // Nigeria - Chipper Cash
  { identifier: "@adewale_store", type: "chipper", country: "NG", name: "Adewale Digital Store", category: "Retail & Electronics", provider: "Chipper Cash", verifiedBadge: "Verified Chipper Merchant" },
  { identifier: "@techmart_ng", type: "chipper", country: "NG", name: "TechMart Gadgets Hub", category: "Electronics", provider: "Chipper Cash", verifiedBadge: "Verified Chipper Business" },

  // Ghana - Mobile Money & Bank
  { identifier: "0244123456", type: "momo", country: "GH", name: "Kwame Mensah Trading", category: "Wholesale & Retail", provider: "MTN Mobile Money", verifiedBadge: "Verified MoMo Merchant", branch: "Makola Market, Accra" },
  { identifier: "0501234567", type: "momo", country: "GH", name: "Abena Osei Provisions", category: "Groceries", provider: "Telecel Cash (Vodafone)", verifiedBadge: "Verified Merchant", branch: "Osu, Accra" },
  { identifier: "0207890123", type: "bank", country: "GH", name: "Kofi Boateng Enterprises", category: "Commercial", provider: "Ecobank Ghana", verifiedBadge: "Verified Corporate", bankName: "Ecobank Ghana" },

  // South Africa - PayShap & Banking
  { identifier: "1234567890", type: "bank", country: "ZA", name: "Thabo Mbeki Trading Enterprise", category: "Retail", provider: "Capitec Bank", verifiedBadge: "PayShap Verified", bankName: "Capitec" },
  { identifier: "62012345678", type: "bank", country: "ZA", name: "Sipho Ndlovu Supplies", category: "Services", provider: "First National Bank (FNB)", verifiedBadge: "Verified Account", bankName: "FNB" },
  { identifier: "0821234567", type: "wallet", country: "ZA", name: "Kagiso Superette", category: "Groceries", provider: "FNB E-Wallet", verifiedBadge: "Verified E-Wallet Recipient" },

  // Uganda - M-Pesa & Paybill
  { identifier: "185185", type: "paybill", country: "UG", name: "UMEME Yaka Prepaid Power", category: "Electricity Utility", provider: "M-PESA Paybill", verifiedBadge: "National Utility" },
  { identifier: "600100", type: "paybill", country: "UG", name: "National Water & Sewerage Corp", category: "Water Utility", provider: "M-PESA Paybill", verifiedBadge: "Official Utility" },
  { identifier: "0772123456", type: "momo", country: "UG", name: "Kampala Fast Grocers", category: "Retail", provider: "MTN Mobile Money", verifiedBadge: "Verified MoMo Merchant" },
  { identifier: "0752987654", type: "momo", country: "UG", name: "Shell Uganda Bugolobi", category: "Fuel & Travel", provider: "Airtel Money", verifiedBadge: "Verified Merchant" },
];

const NIGERIAN_BANKS = [
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "044", name: "Access Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "50515", name: "Moniepoint Microfinance Bank" },
  { code: "999992", name: "OPay (PayCom)" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "035", name: "Wema Bank (ALAT)" },
];

const REGIONAL_BANKS = {
  NG: NIGERIAN_BANKS,
  GH: [
    { code: "ECO", name: "Ecobank Ghana" },
    { code: "GCB", name: "GCB Bank Limited" },
    { code: "STB", name: "Stanbic Bank Ghana" },
    { code: "ABS", name: "Absa Bank Ghana" },
    { code: "FID", name: "Fidelity Bank Ghana" },
  ],
  ZA: [
    { code: "CAP", name: "Capitec Bank" },
    { code: "FNB", name: "First National Bank (FNB)" },
    { code: "ABS", name: "Absa Bank" },
    { code: "STB", name: "Standard Bank" },
    { code: "NED", name: "Nedbank" },
  ],
  KE: [
    { code: "EQT", name: "Equity Bank" },
    { code: "KCB", name: "KCB Bank Kenya" },
    { code: "COP", name: "Co-operative Bank of Kenya" },
    { code: "SCB", name: "Standard Chartered Bank" },
    { code: "NCBA", name: "NCBA Bank" },
  ],
};

module.exports = {
  KNOWN_MERCHANTS,
  NIGERIAN_BANKS,
  REGIONAL_BANKS,
};
