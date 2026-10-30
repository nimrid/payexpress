import {
  init,
  NimiqProviderError,
  getHostLanguage,
  getHostFiat,
  getHostNetwork,
  requestFullscreen,
  exitFullscreen,
  getFullscreen,
  onFullscreenChange,
  requestDeviceIdentifier,
  type NimiqProvider,
  type SignatureResult,
  type LightningPaymentResult,
  type Fiat,
  type Network,
} from '@nimiq/mini-app-sdk';

export interface NimiqStatus {
  isConnecting: boolean;
  isReady: boolean;
  accounts: string[] | null;
  activeAccount: string | null;
  consensus: boolean | null;
  blockNumber: number | null;
  balanceLuna: number | null;
  balanceNim: number | null;
  errorMessage: string | null;
  errorDetails?: {
    type: string;
    message: string;
    code?: number;
  } | null;
  hostContext: {
    language?: string;
    fiat?: Fiat;
    network?: Network;
    isInsideNimiqPay: boolean;
  };
}

class NimiqService {
  private providerPromise: Promise<NimiqProvider> | null = null;
  private providerInstance: NimiqProvider | null = null;

  /**
   * Initialize Nimiq Provider with SDK init()
   * Ref: https://nimiq.dev/mini-apps/tutorials/mini-app-tutorial
   */
  public async initProvider(timeout = 10_000): Promise<NimiqProvider> {
    if (this.providerInstance) {
      return this.providerInstance;
    }

    if (!this.providerPromise) {
      this.providerPromise = init({ timeout })
        .then((provider) => {
          this.providerInstance = provider;
          return provider;
        })
        .catch((err) => {
          this.providerPromise = null;
          throw err;
        });
    }

    return this.providerPromise;
  }

  /**
   * Check if Nimiq provider is available in window or already initialized
   */
  public isAvailable(): boolean {
    return typeof window !== 'undefined' && (Boolean(window.nimiq) || Boolean(this.providerInstance));
  }

  /**
   * Check if running inside Nimiq Pay
   */
  public isInsideNimiqPay(): boolean {
    return typeof window !== 'undefined' && (Boolean(window.nimiqPay) || Boolean(window.nimiq));
  }

  /**
   * Get host environment context injected by Nimiq Pay
   * Ref: https://nimiq.dev/mini-apps/tutorials/mini-app-tutorial#_5-add-localization
   */
  public getHostInfo() {
    const language = getHostLanguage() || window.nimiqPay?.language || navigator.language.split('-')[0] || 'en';
    const fiat = getHostFiat() || window.nimiqPay?.userFiat;
    const network = getHostNetwork() || window.nimiqPay?.network;
    return {
      language,
      fiat,
      network,
      isInsideNimiqPay: this.isInsideNimiqPay(),
    };
  }

  /**
   * Step 4 Tutorial 1: listAccounts()
   * Returns user's shared Nimiq accounts.
   */
  public async listAccounts(): Promise<string[]> {
    const provider = await this.initProvider();
    const accounts = await provider.listAccounts();
    return accounts || [];
  }

  /**
   * Step 4 Tutorial 1: isConsensusEstablished()
   * Checks whether wallet has established blockchain consensus
   */
  public async isConsensusEstablished(): Promise<boolean> {
    const provider = await this.initProvider();
    return await provider.isConsensusEstablished();
  }

  /**
   * Step 4 Tutorial 1: getBlockNumber()
   * Returns current blockchain height
   */
  public async getBlockNumber(): Promise<number> {
    const provider = await this.initProvider();
    return await provider.getBlockNumber();
  }

  /**
   * Run the 3 Tutorial 1 requests concurrently
   * Ref: https://nimiq.dev/mini-apps/tutorials/mini-app-tutorial#_4-add-mini-app-logic-and-ui
   */
  public async runThreeRequests(): Promise<{
    accounts: string[];
    consensus: boolean;
    blockNumber: number;
  }> {
    const provider = await this.initProvider();
    const [accounts, consensus, blockNumber] = await Promise.all([
      provider.listAccounts(),
      provider.isConsensusEstablished(),
      provider.getBlockNumber(),
    ]);

    return { accounts, consensus, blockNumber };
  }

  /**
   * Step 4 Tutorial 2: Dual-chain Nimiq Flow (listAccounts -> sign)
   * Ref: https://nimiq.dev/mini-apps/tutorials/dual-chain-mini-app-tutorial
   */
  public async runNimiqDualChainFlow(
    message = 'Nimiq Pay dual-chain tutorial',
    onProgress?: (step: string) => void
  ): Promise<{ accounts: string[]; signature: SignatureResult }> {
    const provider = await this.initProvider();

    onProgress?.('Requesting Nimiq accounts...');
    const accounts = await provider.listAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No Nimiq accounts returned from wallet.');
    }

    onProgress?.('Requesting Nimiq signing confirmation...');
    const signature = await provider.sign(message);

    onProgress?.('Nimiq flow completed.');
    return { accounts, signature };
  }

  /**
   * Fetch address balance in Luna (100,000 Luna = 1 NIM)
   * Ref: https://nimiq.dev/mini-apps/api-reference/nimiq-provider#getbalance
   */
  public async getBalance(address: string): Promise<{ luna: number; nim: number }> {
    const provider = await this.initProvider();
    if (typeof provider.getBalance !== 'function') {
      throw new Error('getBalance is not supported by this version of Nimiq Pay. Please update Nimiq Pay.');
    }

    const luna = await provider.getBalance(address);
    return {
      luna,
      nim: luna / 100_000,
    };
  }

  /**
   * Sign message with Nimiq Pay
   * Ref: https://nimiq.dev/mini-apps/api-reference/nimiq-provider#sign
   */
  public async signMessage(message: string): Promise<SignatureResult> {
    const provider = await this.initProvider();
    return await provider.sign(message);
  }

  /**
   * Send basic NIM payment
   * Ref: https://nimiq.dev/mini-apps/api-reference/nimiq-provider#sendbasictransaction
   */
  public async sendTransaction(params: {
    recipient: string;
    nimAmount: number;
    feeLuna?: number;
    validityStartHeight?: number;
  }): Promise<string> {
    const provider = await this.initProvider();
    const valueLuna = Math.round(params.nimAmount * 100_000);
    return await provider.sendBasicTransaction({
      recipient: params.recipient,
      value: valueLuna,
      fee: params.feeLuna,
      validityStartHeight: params.validityStartHeight,
    });
  }

  /**
   * Send NIM payment with attached public data memo
   * Ref: https://nimiq.dev/mini-apps/api-reference/nimiq-provider#sendbasictransactionwithdata
   */
  public async sendTransactionWithData(params: {
    recipient: string;
    nimAmount: number;
    data: string;
    feeLuna?: number;
    validityStartHeight?: number;
  }): Promise<string> {
    const provider = await this.initProvider();
    const valueLuna = Math.round(params.nimAmount * 100_000);
    return await provider.sendBasicTransactionWithData({
      recipient: params.recipient,
      value: valueLuna,
      data: params.data,
      fee: params.feeLuna,
      validityStartHeight: params.validityStartHeight,
    });
  }

  /**
   * Disconnect & clear cached accounts
   */
  public async disconnect(): Promise<void> {
    if (this.providerInstance) {
      this.providerInstance.disconnect();
    }
  }

  /**
   * Request device identifier from Nimiq Pay
   */
  public async getDeviceIdentifier(reason: string): Promise<string> {
    return await requestDeviceIdentifier({ reason });
  }

  /**
   * Fullscreen controls
   */
  public async toggleFullscreen(): Promise<boolean> {
    const isFull = await getFullscreen();
    if (isFull) {
      await exitFullscreen();
      return false;
    } else {
      await requestFullscreen();
      return true;
    }
  }

  public onFullscreenChange(listener: (enabled: boolean) => void) {
    return onFullscreenChange(listener);
  }

  /**
   * Format Nimiq address for display
   * Example: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000' -> 'NQ07...0000'
   */
  public formatAddress(address: string, short = true): string {
    if (!address) return '';
    const clean = address.replace(/\s+/g, '');
    if (!short || clean.length < 12) return address;
    return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
  }

  /**
   * Standardized error handling inspecting NimiqProviderError
   */
  public parseError(error: unknown): {
    message: string;
    type: string;
    code?: number;
    isWalletError: boolean;
    isPermissionDenied: boolean;
  } {
    if (NimiqProviderError.is(error)) {
      const isPermissionDenied = error.type === 'PERMISSION_DENIED' || error.code === 4001;
      return {
        message: isPermissionDenied
          ? 'Request was canceled or denied in Nimiq Pay.'
          : error.message || 'Nimiq wallet error occurred.',
        type: error.type,
        code: error.code,
        isWalletError: true,
        isPermissionDenied,
      };
    }

    const rawMessage = error instanceof Error ? error.message : String(error);
    return {
      message: rawMessage,
      type: 'GENERAL_ERROR',
      isWalletError: false,
      isPermissionDenied: false,
    };
  }
}

export const Nimiq = new NimiqService();
export {
  NimiqProviderError,
  getHostLanguage,
  getHostFiat,
  getHostNetwork,
  requestFullscreen,
  exitFullscreen,
  getFullscreen,
  onFullscreenChange,
  requestDeviceIdentifier,
};
export type { NimiqProvider, SignatureResult, LightningPaymentResult, Fiat, Network };
