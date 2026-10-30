export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export const translations = {
  en: {
    // Header & Meta
    appName: 'PayExpress',
    tagline: 'African Ramp & Spend Engine',
    miniAppBadge: 'Nimiq Pay Mini-App',
    connected: 'Connected',
    connectWallet: 'Connect Wallet',
    changeCountry: 'Change Country',
    settings: 'Settings',

    // Wallet Hero
    availableBalance: 'Available Balance',
    marketRate: 'Market Rate',
    estimatedValue: 'Est. Fiat Value',
    depositRate: 'Deposit Rate',
    withdrawRate: 'Withdraw Rate',

    // Action Pillars
    payMerchant: 'Pay Merchant',
    payMerchantDesc: 'M-Pesa Till/Paybill & Bank Transfer',
    cashOut: 'Cash Out',
    cashOutDesc: 'Off-ramp to Mobile Money / Bank',
    addFunds: 'Add Funds',
    addFundsDesc: 'On-ramp Fiat via STK Push / Bank',
    airtimeBills: 'Airtime & Bills',
    airtimeBillsDesc: 'Instant Telco Data & Utility Payments',

    // Merchant Pay
    merchantType: 'Merchant Type',
    tillNumber: 'Till Number (Buy Goods)',
    paybillNumber: 'Paybill Number',
    bankAccount: 'Bank Account',
    accountNumber: 'Account / Reference Number',
    storeNumber: 'Store / Till Number',
    amountToPay: 'Amount to Pay',
    verifyMerchant: 'Verify Merchant',
    verifiedMerchant: 'Verified Merchant',
    calculatingQuote: 'Calculating live quote...',
    liveQuoteLocked: 'Live Cashramp Quote Locked',
    quoteRate: 'Exchange Rate',
    cryptoCost: 'You Pay',
    expiresIn: 'Quote expires in',
    seconds: 's',
    recipientNotice: 'Merchant receives instant local currency',

    // Cash Out
    recipientPhone: 'Recipient Mobile Number',
    selectPaymentMethod: 'Select Payment Method',
    cashOutAmount: 'Amount in Crypto to Cash Out',
    youReceive: 'You Receive',
    bankName: 'Bank Name',
    recipientName: 'Account Holder Name',
    instantPayout: 'Instant automated settlement via Cashramp',

    // Add Funds
    depositAmountFiat: 'Deposit Amount',
    phoneNumberPrompt: 'M-Pesa / Mobile Money Number',
    stkPushInfo: 'You will receive an STK prompt on your phone to authorize payment',
    cryptoWillReceive: 'You will receive',
    depositViaBank: 'Deposit via Bank Transfer',
    bankTransferInfo: 'Transfer to designated virtual account',

    // Airtime & Bills
    selectTelco: 'Select Network Provider',
    airtimeType: 'Airtime or Data',
    selectAmount: 'Select Amount',
    rechargePhone: 'Phone Number to Recharge',
    instantDelivery: 'Instant bundle top-up within 10 seconds',

    // Slider & Common
    slideToPay: 'Slide to Pay',
    slideToCashOut: 'Slide to Cash Out',
    slideToAddFunds: 'Slide to Add Funds',
    slideToRecharge: 'Slide to Recharge',
    processing: 'Processing transaction...',
    approvingNimiq: 'Requesting Nimiq Pay approval...',
    txSuccessful: 'Transaction Completed Successfully!',
    txFailed: 'Transaction Failed',
    viewReceipt: 'View Receipt',
    close: 'Close',
    back: 'Back',
    cancel: 'Cancel',
    tryAgain: 'Try Again',

    // Settings Modal
    settingsTitle: 'Settings & Localization',
    languageSetting: 'Language',
    languageDetectedNimiq: 'Auto-detected from Nimiq Pay (window.nimiqPay.language)',
    languageDetectedBrowser: 'Detected from Browser',
    networkSetting: 'Active Network',
    connectedAddress: 'Connected Polygon Address',
    cashrampStatus: 'Cashramp Integration',
    liveTestMode: 'Active (Live Test Sandbox)',

    // Receipts
    receiptTitle: 'Payment Receipt',
    txReference: 'Cashramp Reference',
    telcoReference: 'Telco Confirmation',
    statusCompleted: 'COMPLETED',
    done: 'Done',
  },

  fr: {
    // Header & Meta
    appName: 'PayExpress',
    tagline: 'Moteur de Ramping et Paiement Africain',
    miniAppBadge: 'Mini-App Nimiq Pay',
    connected: 'Connecté',
    connectWallet: 'Connecter Portefeuille',
    changeCountry: 'Changer de Pays',
    settings: 'Paramètres',

    // Wallet Hero
    availableBalance: 'Solde Disponible',
    marketRate: 'Taux du Marché',
    estimatedValue: 'Valeur Fiat Estimée',
    depositRate: 'Taux de Dépôt',
    withdrawRate: 'Taux de Retrait',

    // Action Pillars
    payMerchant: 'Payer Marchand',
    payMerchantDesc: 'M-Pesa Till/Paybill et Virement Bancaire',
    cashOut: 'Retirer Fiat',
    cashOutDesc: 'Crypto vers Mobile Money / Banque',
    addFunds: 'Déposer Fiat',
    addFundsDesc: 'Fiat vers Crypto via STK Push / Banque',
    airtimeBills: 'Crédit & Factures',
    airtimeBillsDesc: 'Recharge Mobile et Factures Instantanées',

    // Merchant Pay
    merchantType: 'Type de Marchand',
    tillNumber: 'Numéro Till / Marchand',
    paybillNumber: 'Numéro Paybill',
    bankAccount: 'Compte Bancaire',
    accountNumber: 'Numéro de Compte / Référence',
    storeNumber: 'Numéro de Boutique / Caisse',
    amountToPay: 'Montant à Payer',
    verifyMerchant: 'Vérifier le Marchand',
    verifiedMerchant: 'Marchand Vérifié',
    calculatingQuote: 'Calcul du devis en direct...',
    liveQuoteLocked: 'Devis Cashramp Verrouillé',
    quoteRate: 'Taux de Change',
    cryptoCost: 'Vous Payez',
    expiresIn: 'Expire dans',
    seconds: 's',
    recipientNotice: 'Le commerçant reçoit les devises locales immédiatement',

    // Cash Out
    recipientPhone: 'Numéro de Téléphone Mobile',
    selectPaymentMethod: 'Mode de Paiement',
    cashOutAmount: 'Montant Crypto à Retirer',
    youReceive: 'Vous Recevez',
    bankName: 'Nom de la Banque',
    recipientName: 'Nom du Titulaire',
    instantPayout: 'Paiement automatisé instantané via Cashramp',

    // Add Funds
    depositAmountFiat: 'Montant du Dépôt',
    phoneNumberPrompt: 'Numéro Mobile Money',
    stkPushInfo: 'Vous recevrez une notification STK sur votre téléphone pour confirmer',
    cryptoWillReceive: 'Vous recevrez',
    depositViaBank: 'Dépôt par Virement Bancaire',
    bankTransferInfo: 'Transférer sur le compte virtuel indiqué',

    // Airtime & Bills
    selectTelco: 'Sélectionner l’Opérateur',
    airtimeType: 'Crédit ou Forfait Internet',
    selectAmount: 'Sélectionner le Montant',
    rechargePhone: 'Numéro à Recharger',
    instantDelivery: 'Recharge instantanée en moins de 10 secondes',

    // Slider & Common
    slideToPay: 'Glisser pour Payer',
    slideToCashOut: 'Glisser pour Retirer',
    slideToAddFunds: 'Glisser pour Déposer',
    slideToRecharge: 'Glisser pour Recharger',
    processing: 'Transaction en cours...',
    approvingNimiq: 'Demande de signature Nimiq Pay...',
    txSuccessful: 'Transaction Réussie !',
    txFailed: 'Échec de la Transaction',
    viewReceipt: 'Voir le Reçu',
    close: 'Fermer',
    back: 'Retour',
    cancel: 'Annuler',
    tryAgain: 'Réessayer',

    // Settings Modal
    settingsTitle: 'Paramètres et Localisation',
    languageSetting: 'Langue',
    languageDetectedNimiq: 'Détecté depuis Nimiq Pay (window.nimiqPay.language)',
    languageDetectedBrowser: 'Détecté depuis le Navigateur',
    networkSetting: 'Réseau Actif',
    connectedAddress: 'Adresse Polygon Connectée',
    cashrampStatus: 'Intégration Cashramp',
    liveTestMode: 'Actif (Bac à Sable Test)',

    // Receipts
    receiptTitle: 'Reçu de Paiement',
    txReference: 'Référence Cashramp',
    telcoReference: 'Confirmation Opérateur',
    statusCompleted: 'TERMINÉ',
    done: 'Terminé',
  },

  es: {
    // Header & Meta
    appName: 'PayExpress',
    tagline: 'Motor de Rampa y Pagos en África',
    miniAppBadge: 'Mini-App Nimiq Pay',
    connected: 'Conectado',
    connectWallet: 'Conectar Billetera',
    changeCountry: 'Cambiar País',
    settings: 'Ajustes',

    // Wallet Hero
    availableBalance: 'Saldo Disponible',
    marketRate: 'Tipo de Cambio',
    estimatedValue: 'Valor Fiat Estimado',
    depositRate: 'Tasa de Depósito',
    withdrawRate: 'Tasa de Retiro',

    // Action Pillars
    payMerchant: 'Pagar Comercio',
    payMerchantDesc: 'M-Pesa Till/Paybill y Transferencia',
    cashOut: 'Retirar Fondos',
    cashOutDesc: 'De Cripto a Dinero Móvil / Banco',
    addFunds: 'Añadir Fondos',
    addFundsDesc: 'De Fiat a Cripto vía STK / Banco',
    airtimeBills: 'Recargas y Servicios',
    airtimeBillsDesc: 'Datos Móviles y Pago de Facturas',

    // Merchant Pay
    merchantType: 'Tipo de Comercio',
    tillNumber: 'Número Till (Comercio)',
    paybillNumber: 'Número Paybill',
    bankAccount: 'Cuenta Bancaria',
    accountNumber: 'Número de Cuenta / Referencia',
    storeNumber: 'Número de Tienda',
    amountToPay: 'Monto a Pagar',
    verifyMerchant: 'Verificar Comercio',
    verifiedMerchant: 'Comercio Verificado',
    calculatingQuote: 'Calculando cotización en vivo...',
    liveQuoteLocked: 'Cotización Cashramp Fijada',
    quoteRate: 'Tipo de Cambio',
    cryptoCost: 'Pagas en Cripto',
    expiresIn: 'Expira en',
    seconds: 's',
    recipientNotice: 'El comercio recibe moneda local al instante',

    // Cash Out
    recipientPhone: 'Número Móvil del Destinatario',
    selectPaymentMethod: 'Método de Pago',
    cashOutAmount: 'Monto Cripto a Retirar',
    youReceive: 'Recibirás',
    bankName: 'Nombre del Banco',
    recipientName: 'Nombre del Titular',
    instantPayout: 'Liquidación automática instantánea con Cashramp',

    // Add Funds
    depositAmountFiat: 'Monto del Depósito',
    phoneNumberPrompt: 'Número de Dinero Móvil',
    stkPushInfo: 'Recibirás una notificación STK en tu teléfono para autorizar',
    cryptoWillReceive: 'Recibirás',
    depositViaBank: 'Depósito por Transferencia Bancaria',
    bankTransferInfo: 'Transfiere a la cuenta virtual indicada',

    // Airtime & Bills
    selectTelco: 'Seleccionar Operador',
    airtimeType: 'Saldo o Paquete de Datos',
    selectAmount: 'Seleccionar Monto',
    rechargePhone: 'Teléfono a Recargar',
    instantDelivery: 'Recarga inmediata en menos de 10 segundos',

    // Slider & Common
    slideToPay: 'Deslizar para Pagar',
    slideToCashOut: 'Deslizar para Retirar',
    slideToAddFunds: 'Deslizar para Depositar',
    slideToRecharge: 'Deslizar para Recargar',
    processing: 'Procesando transacción...',
    approvingNimiq: 'Solicitando confirmación en Nimiq Pay...',
    txSuccessful: '¡Transacción Completada con Éxito!',
    txFailed: 'Transacción Fallida',
    viewReceipt: 'Ver Recibo',
    close: 'Cerrar',
    back: 'Atrás',
    cancel: 'Cancelar',
    tryAgain: 'Reintentar',

    // Settings Modal
    settingsTitle: 'Ajustes y Localización',
    languageSetting: 'Idioma',
    languageDetectedNimiq: 'Auto-detectado de Nimiq Pay (window.nimiqPay.language)',
    languageDetectedBrowser: 'Detectado del Navegador',
    networkSetting: 'Red Activa',
    connectedAddress: 'Dirección Polygon Conectada',
    cashrampStatus: 'Integración Cashramp',
    liveTestMode: 'Activo (Modo de Pruebas)',

    // Receipts
    receiptTitle: 'Recibo de Pago',
    txReference: 'Referencia Cashramp',
    telcoReference: 'Confirmación Operador',
    statusCompleted: 'COMPLETADO',
    done: 'Listo',
  },

  de: {
    // Header & Meta
    appName: 'PayExpress',
    tagline: 'Afrikanische Ramp- & Bezahlplattform',
    miniAppBadge: 'Nimiq Pay Mini-App',
    connected: 'Verbunden',
    connectWallet: 'Wallet verbinden',
    changeCountry: 'Land ändern',
    settings: 'Einstellungen',

    // Wallet Hero
    availableBalance: 'Verfügbares Guthaben',
    marketRate: 'Marktkurs',
    estimatedValue: 'Geschätzter Fiat-Wert',
    depositRate: 'Einzahlungskurs',
    withdrawRate: 'Auszahlungskurs',

    // Action Pillars
    payMerchant: 'Händler bezahlen',
    payMerchantDesc: 'M-Pesa Till/Paybill & Banküberweisung',
    cashOut: 'Auszahlen',
    cashOutDesc: 'Krypto zu Mobile Money / Bankkonto',
    addFunds: 'Aufladen',
    addFundsDesc: 'Fiat zu Krypto via STK-Push / Bank',
    airtimeBills: 'Guthaben & Rechnungen',
    airtimeBillsDesc: 'Sofortige Mobilfunk- und Versorgerzahlungen',

    // Merchant Pay
    merchantType: 'Händlertyp',
    tillNumber: 'Till-Nummer',
    paybillNumber: 'Paybill-Nummer',
    bankAccount: 'Bankkonto',
    accountNumber: 'Kontonummer / Referenz',
    storeNumber: 'Filial- / Kassennummer',
    amountToPay: 'Zahlungsbetrag',
    verifyMerchant: 'Händler prüfen',
    verifiedMerchant: 'Geprüfter Händler',
    calculatingQuote: 'Live-Angebot wird berechnet...',
    liveQuoteLocked: 'Cashramp-Angebot gesichert',
    quoteRate: 'Wechselkurs',
    cryptoCost: 'Sie zahlen',
    expiresIn: 'Gültig für',
    seconds: 's',
    recipientNotice: 'Händler erhält sofort Landeswährung',

    // Cash Out
    recipientPhone: 'Mobilnummer des Empfängers',
    selectPaymentMethod: 'Zahlungsmethode wählen',
    cashOutAmount: 'Kryptobetrag zur Auszahlung',
    youReceive: 'Sie erhalten',
    bankName: 'Bankname',
    recipientName: 'Kontoinhaber',
    instantPayout: 'Sofortige automatische Auszahlung über Cashramp',

    // Add Funds
    depositAmountFiat: 'Einzahlungsbetrag',
    phoneNumberPrompt: 'Mobile Money Telefonnummer',
    stkPushInfo: 'Sie erhalten eine Bestätigungsaufforderung (STK Push) auf Ihrem Telefon',
    cryptoWillReceive: 'Sie erhalten',
    depositViaBank: 'Einzahlung per Banküberweisung',
    bankTransferInfo: 'Überweisung auf virtuelles Konto',

    // Airtime & Bills
    selectTelco: 'Mobilfunkanbieter wählen',
    airtimeType: 'Guthaben oder Datenpaket',
    selectAmount: 'Betrag wählen',
    rechargePhone: 'Rufnummer aufladen',
    instantDelivery: 'Sofortige Aufladung innerhalb von 10 Sekunden',

    // Slider & Common
    slideToPay: 'Wischen zum Bezahlen',
    slideToCashOut: 'Wischen zum Auszahlen',
    slideToAddFunds: 'Wischen zum Aufladen',
    slideToRecharge: 'Wischen zum Aufladen',
    processing: 'Transaktion wird ausgeführt...',
    approvingNimiq: 'Nimiq Pay Autorisierung anfordern...',
    txSuccessful: 'Transaktion erfolgreich abgeschlossen!',
    txFailed: 'Transaktion fehlgeschlagen',
    viewReceipt: 'Beleg ansehen',
    close: 'Schließen',
    back: 'Zurück',
    cancel: 'Abbrechen',
    tryAgain: 'Erneut versuchen',

    // Settings Modal
    settingsTitle: 'Einstellungen & Sprache',
    languageSetting: 'Sprache',
    languageDetectedNimiq: 'Automatisch von Nimiq Pay erkannt (window.nimiqPay.language)',
    languageDetectedBrowser: 'Vom Browser erkannt',
    networkSetting: 'Aktives Netzwerk',
    connectedAddress: 'Verbundene Polygon-Adresse',
    cashrampStatus: 'Cashramp-Integration',
    liveTestMode: 'Aktiv (Test-Sandbox)',

    // Receipts
    receiptTitle: 'Zahlungsbeleg',
    txReference: 'Cashramp Referenz',
    telcoReference: 'Netzbetreiber-Bestätigung',
    statusCompleted: 'ABGESCHLOSSEN',
    done: 'Fertig',
  },

  pt: {
    // Header & Meta
    appName: 'PayExpress',
    tagline: 'Motor de Rampa e Pagamentos em África',
    miniAppBadge: 'Mini-App Nimiq Pay',
    connected: 'Conectado',
    connectWallet: 'Conectar Carteira',
    changeCountry: 'Alterar País',
    settings: 'Definições',

    // Wallet Hero
    availableBalance: 'Saldo Disponível',
    marketRate: 'Taxa de Mercado',
    estimatedValue: 'Valor Fiat Estimado',
    depositRate: 'Taxa de Depósito',
    withdrawRate: 'Taxa de Retirada',

    // Action Pillars
    payMerchant: 'Pagar Comerciante',
    payMerchantDesc: 'M-Pesa Till/Paybill e Transferência Bancária',
    cashOut: 'Levantar Fundos',
    cashOutDesc: 'Cripto para Dinheiro Móvel / Banco',
    addFunds: 'Depositar Fundos',
    addFundsDesc: 'Fiat para Cripto via STK Push / Banco',
    airtimeBills: 'Recargas & Faturas',
    airtimeBillsDesc: 'Dados Móveis e Pagamento de Serviços',

    // Merchant Pay
    merchantType: 'Tipo de Comerciante',
    tillNumber: 'Número Till (Comércio)',
    paybillNumber: 'Número Paybill',
    bankAccount: 'Conta Bancária',
    accountNumber: 'Número de Conta / Referência',
    storeNumber: 'Número de Loja / Caixa',
    amountToPay: 'Valor a Pagar',
    verifyMerchant: 'Verificar Comerciante',
    verifiedMerchant: 'Comerciante Verificado',
    calculatingQuote: 'A calcular cotação em tempo real...',
    liveQuoteLocked: 'Cotação Cashramp Bloqueada',
    quoteRate: 'Taxa de Câmbio',
    cryptoCost: 'Você Paga',
    expiresIn: 'Expira em',
    seconds: 's',
    recipientNotice: 'O comerciante recebe moeda local instantaneamente',

    // Cash Out
    recipientPhone: 'Número de Telemóvel do Destinatário',
    selectPaymentMethod: 'Método de Pagamento',
    cashOutAmount: 'Valor em Cripto a Levantar',
    youReceive: 'Receberá',
    bankName: 'Nome do Banco',
    recipientName: 'Nome do Titular',
    instantPayout: 'Pagamento automático instantâneo com Cashramp',

    // Add Funds
    depositAmountFiat: 'Valor do Depósito',
    phoneNumberPrompt: 'Número de Dinheiro Móvel',
    stkPushInfo: 'Receberá uma solicitação STK no telemóvel para autorizar',
    cryptoWillReceive: 'Receberá',
    depositViaBank: 'Depósito por Transferência Bancária',
    bankTransferInfo: 'Transferir para a conta virtual indicada',

    // Airtime & Bills
    selectTelco: 'Selecionar Operadora',
    airtimeType: 'Saldo ou Pacote de Dados',
    selectAmount: 'Selecionar Valor',
    rechargePhone: 'Telemóvel a Recarregar',
    instantDelivery: 'Recarga imediata em menos de 10 segundos',

    // Slider & Common
    slideToPay: 'Deslize para Pagar',
    slideToCashOut: 'Deslize para Levantar',
    slideToAddFunds: 'Deslize para Depositar',
    slideToRecharge: 'Deslize para Recarregar',
    processing: 'A processar transação...',
    approvingNimiq: 'A solicitar autorização Nimiq Pay...',
    txSuccessful: 'Transação Concluída com Sucesso!',
    txFailed: 'Falha na Transação',
    viewReceipt: 'Ver Recibo',
    close: 'Fechar',
    back: 'Voltar',
    cancel: 'Cancelar',
    tryAgain: 'Tentar Novamente',

    // Settings Modal
    settingsTitle: 'Definições e Localização',
    languageSetting: 'Idioma',
    languageDetectedNimiq: 'Auto-detetado do Nimiq Pay (window.nimiqPay.language)',
    languageDetectedBrowser: 'Detetado do Navegador',
    networkSetting: 'Rede Ativa',
    connectedAddress: 'Endereço Polygon Conectado',
    cashrampStatus: 'Integração Cashramp',
    liveTestMode: 'Ativo (Ambiente de Testes)',

    // Receipts
    receiptTitle: 'Recibo de Pagamento',
    txReference: 'Referência Cashramp',
    telcoReference: 'Confirmação Operadora',
    statusCompleted: 'CONCLUÍDO',
    done: 'Concluído',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
