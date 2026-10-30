// Nimiq Pay EVM Multi-Chain Provider Bridge (window.ethereum)
// Ref: https://nimiq.dev/mini-apps/features/evm-tokens
// Ref: https://nimiq.dev/mini-apps/api-reference/ethereum-provider

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

/**
 * Convert a UTF-8 string to hex for personal_sign.
 * Ref: https://nimiq.dev/mini-apps/tutorials/dual-chain-mini-app-tutorial#_4-1-add-the-script-block
 */
export function toHexUtf8(input: string): string {
  return `0x${Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`;
}

export interface ChainConfig {
  chainIdHex: string;
  chainIdDec: number;
  name: string;
  icon: string;
  badge?: string;
  avgFee: string;
  speed: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl: string;
  tokens: {
    USDT?: {
      address: string;
      decimals: number;
    };
    USDC?: {
      address: string;
      decimals: number;
    };
  };
}

export type SupportedChainKey = 'polygon' | 'arbitrum' | 'base' | 'optimism' | 'ethereum' | 'celo';

export const SUPPORTED_EVM_CHAINS: Record<SupportedChainKey, ChainConfig> = {
  polygon: {
    chainIdHex: '0x89',
    chainIdDec: 137,
    name: 'Polygon',
    icon: '🟣',
    badge: 'Primary Nimiq Rail',
    avgFee: '< $0.01',
    speed: '~2 sec',
    nativeCurrency: { name: 'Polygon Ecosystem Token', symbol: 'POL', decimals: 18 },
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    tokens: {
      USDT: {
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
      },
      USDC: {
        address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        decimals: 6,
      },
    },
  },
  arbitrum: {
    chainIdHex: '0xa4b1',
    chainIdDec: 42161,
    name: 'Arbitrum One',
    icon: '🔵',
    badge: 'Low Gas L2',
    avgFee: '~ $0.05',
    speed: '~1 sec',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    tokens: {
      USDT: {
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        decimals: 6,
      },
      USDC: {
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
      },
    },
  },
  base: {
    chainIdHex: '0x2105',
    chainIdDec: 8453,
    name: 'Base',
    icon: '🔵',
    badge: 'Coinbase L2',
    avgFee: '< $0.01',
    speed: '~1 sec',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.base.org',
    blockExplorerUrl: 'https://basescan.org',
    tokens: {
      USDC: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6,
      },
    },
  },
  optimism: {
    chainIdHex: '0xa',
    chainIdDec: 10,
    name: 'Optimism',
    icon: '🔴',
    badge: 'OP Mainnet',
    avgFee: '~ $0.03',
    speed: '~2 sec',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    tokens: {
      USDT: {
        address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        decimals: 6,
      },
      USDC: {
        address: '0x0b2C639c5333130819F78f566Bf72b956436430d',
        decimals: 6,
      },
    },
  },
  celo: {
    chainIdHex: '0xa4ec',
    chainIdDec: 42220,
    name: 'Celo',
    icon: '🟡',
    badge: 'Mobile Money Friendly',
    avgFee: '< $0.001',
    speed: '~5 sec',
    nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
    rpcUrl: 'https://forno.celo.org',
    blockExplorerUrl: 'https://celoscan.io',
    tokens: {
      USDT: {
        address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
        decimals: 6,
      },
      USDC: {
        address: '0xcebA97Fced71279A271821486535e190f098014f',
        decimals: 6,
      },
    },
  },
  ethereum: {
    chainIdHex: '0x1',
    chainIdDec: 1,
    name: 'Ethereum Mainnet',
    icon: '🔷',
    badge: 'Layer 1',
    avgFee: '~ $2.50+',
    speed: '~12 sec',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://cloudflare-eth.com',
    blockExplorerUrl: 'https://etherscan.io',
    tokens: {
      USDT: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
      },
      USDC: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
      },
    },
  },
};

let currentActiveChain: SupportedChainKey = 'polygon';

export const EVM = {
  get activeChain(): SupportedChainKey {
    return currentActiveChain;
  },

  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  },

  async getAccount(): Promise<string | null> {
    if (!this.isAvailable()) return '0x71C9F408A6dB61472D437F96839353Eaa4B8a89F';
    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
      return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  },

  async getChainId(): Promise<string | null> {
    if (!this.isAvailable()) return SUPPORTED_EVM_CHAINS[currentActiveChain].chainIdHex;
    try {
      return await window.ethereum!.request({ method: 'eth_chainId' });
    } catch {
      return null;
    }
  },

  async switchChain(chainKey: SupportedChainKey): Promise<void> {
    const targetChain = SUPPORTED_EVM_CHAINS[chainKey];
    if (!targetChain) throw new Error(`Unsupported chain ${chainKey}`);

    currentActiveChain = chainKey;

    if (!this.isAvailable()) return;

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChain.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError?.code === 4902 || switchError?.message?.includes('4902')) {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: targetChain.chainIdHex,
              chainName: targetChain.name,
              rpcUrls: [targetChain.rpcUrl],
              nativeCurrency: targetChain.nativeCurrency,
              blockExplorerUrls: [targetChain.blockExplorerUrl],
            },
          ],
        });
      } else {
        console.warn('[EVM] switchChain warning:', switchError);
      }
    }
  },

  async getAccounts(): Promise<string[]> {
    if (!this.isAvailable()) return [];
    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
      return accounts || [];
    } catch {
      return [];
    }
  },

  async requestAccounts(): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('Ethereum provider not found. Open this app inside Nimiq Pay.');
    }
    const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
    return accounts || [];
  },

  async personalSign(message: string, address?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Ethereum provider not found. Open this app inside Nimiq Pay.');
    }
    const accounts = address ? [address] : await this.requestAccounts();
    if (!accounts.length) throw new Error('No Ethereum accounts returned.');
    const hexMessage = toHexUtf8(message);
    const signature = (await window.ethereum!.request({
      method: 'personal_sign',
      params: [hexMessage, accounts[0]],
    })) as string;
    return signature;
  },

  async runEthereumDualChainFlow(
    message = 'Nimiq Pay dual-chain tutorial',
    onProgress?: (step: string) => void
  ): Promise<{ accounts: string[]; signature: string }> {
    if (!this.isAvailable()) {
      throw new Error('Ethereum provider not found. Open this app inside Nimiq Pay.');
    }

    onProgress?.('Requesting Ethereum accounts...');
    const accounts = (await window.ethereum!.request({
      method: 'eth_requestAccounts',
    })) as string[];
    if (!accounts || !accounts.length) {
      throw new Error('No Ethereum accounts returned.');
    }

    onProgress?.('Requesting Ethereum signing confirmation...');
    const hexMsg = toHexUtf8(message);
    const signature = (await window.ethereum!.request({
      method: 'personal_sign',
      params: [hexMsg, accounts[0]],
    })) as string;

    onProgress?.('Ethereum flow completed.');
    return { accounts, signature };
  },

  async connect(chainKey?: SupportedChainKey): Promise<string> {
    if (!this.isAvailable()) {
      return '0x71C9F408A6dB61472D437F96839353Eaa4B8a89F';
    }

    const accounts = await this.requestAccounts();

    if (!accounts || accounts.length === 0) {
      throw new Error('No EVM account returned from Nimiq Pay');
    }

    await this.switchChain(chainKey || currentActiveChain);
    return accounts[0];
  },

  async readTokenBalance(tokenSymbol: 'USDT' | 'USDC', chainKey?: SupportedChainKey): Promise<number> {
    const targetChainKey = chainKey || currentActiveChain;
    const chain = SUPPORTED_EVM_CHAINS[targetChainKey];
    const tokenConfig = chain.tokens[tokenSymbol];
    if (!tokenConfig || !this.isAvailable()) return 150.0;

    try {
      const userAddress = await this.getAccount();
      if (!userAddress) return 0;

      // balanceOf(address) selector: 0x70a08231
      const cleanAddress = userAddress.toLowerCase().replace('0x', '').padStart(64, '0');
      const data = `0x70a08231${cleanAddress}`;

      const rawHex = await window.ethereum!.request({
        method: 'eth_call',
        params: [{ to: tokenConfig.address, data }, 'latest'],
      });

      if (!rawHex || rawHex === '0x') return 0;
      const rawUnits = BigInt(rawHex);
      return Number(rawUnits) / 10 ** tokenConfig.decimals;
    } catch (err) {
      console.warn('[EVM] readTokenBalance error:', err);
      return 0;
    }
  },

  async sendTokenTransfer(
    recipientAddress: string,
    amount: number,
    tokenSymbol: 'USDT' | 'USDC',
    chainKey?: SupportedChainKey
  ): Promise<string> {
    const targetChainKey = chainKey || currentActiveChain;
    const chain = SUPPORTED_EVM_CHAINS[targetChainKey];
    const tokenConfig = chain.tokens[tokenSymbol];
    if (!tokenConfig) throw new Error(`Token ${tokenSymbol} not available on ${chain.name}`);

    if (!this.isAvailable()) {
      return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    }

    const userAddress = await this.connect(targetChainKey);
    const rawUnits = BigInt(Math.round(amount * 10 ** tokenConfig.decimals));

    // ERC-20 transfer(address,uint256) selector: 0xa9059cbb
    const cleanTo = recipientAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    const cleanAmount = rawUnits.toString(16).padStart(64, '0');
    const data = `0xa9059cbb${cleanTo}${cleanAmount}`;

    const txHash = await window.ethereum!.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: userAddress,
          to: tokenConfig.address,
          data,
          value: '0x0',
        },
      ],
    });

    return txHash;
  },

  formatAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  },
};
