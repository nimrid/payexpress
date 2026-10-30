import React from 'react';
import { SupportedChainKey } from '../services/evm';

interface ChainLogoProps {
  chain: SupportedChainKey | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ChainLogo: React.FC<ChainLogoProps> = ({ chain, size = 24, className, style }) => {
  const normalized = (chain || 'polygon').toLowerCase() as SupportedChainKey;

  switch (normalized) {
    case 'polygon':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#8247E5" />
          <path
            d="M21.1 12.7L18.3 11c-.3-.2-.7-.2-1 0l-2.8 1.6-1.9 1.1-2.8 1.6c-.3.2-.7.2-1 0L7 14.2c-.3-.2-.5-.5-.5-.9v-2.3c0-.4.2-.7.5-.9l1.8-1.1c.3-.2.7-.2 1 0l1.8 1.1c.3.2.5.5.5.9v1.6l1.9-1.1v-1.6c0-.4-.2-.7-.5-.9L11.7 7c-.3-.2-.7-.2-1 0L6.7 9.3c-.3.2-.5.5-.5.9v4.5c0 .4.2.7.5.9l4 2.3c.3.2.7.2 1 0l2.8-1.6 1.9-1.1 2.8-1.6c.3-.2.7-.2 1 0l1.8 1.1c.3.2.5.5.5.9v2.3c0 .4-.2.7-.5.9l-1.8 1.1c-.3.2-.7.2-1 0l-1.8-1.1c-.3-.2-.5-.5-.5-.9v-1.6l-1.9 1.1v1.6c0 .4.2.7.5.9l2.3 1.3c.3.2.7.2 1 0l4-2.3c.3-.2.5-.5.5-.9v-4.5c0-.4-.2-.7-.5-.9l-4-2.3z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'arbitrum':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#28A0F0" />
          <path
            d="M16 6.5l8.5 14.7h-4.3L16 13.9l-4.2 7.3H7.5L16 6.5z"
            fill="#FFFFFF"
          />
          <path
            d="M13.5 18.3h5l-2.5 4.3h-5l2.5-4.3z"
            fill="#12AAFF"
          />
        </svg>
      );

    case 'base':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#0052FF" />
          <path
            d="M16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6C10.7413 6 6.4259 10.0532 6.0249 15.2H19.5V16.8H6.0249C6.4259 21.9468 10.7413 26 16 26Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'optimism':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#FF0420" />
          <path
            d="M13.2 21.5c-3.1 0-5.2-2.3-5.2-5.5s2.1-5.5 5.2-5.5 5.2 2.3 5.2 5.5-2.1 5.5-5.2 5.5zm0-3c1.4 0 2.3-1.1 2.3-2.5s-.9-2.5-2.3-2.5-2.3 1.1-2.3 2.5.9 2.5 2.3 2.5zm6.5 2.8V10.7h3.8c2.4 0 4 1.4 4 3.5 0 2.2-1.6 3.6-4 3.6h-1.4v3.5h-2.4zm2.4-5.6h1.3c1 0 1.7-.5 1.7-1.4s-.7-1.4-1.7-1.4h-1.3v2.8z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'ethereum':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16 5.5l-6 10 6 3.5 6-3.5-6-10z" fill="#FFFFFF" fillOpacity="0.8" />
          <path d="M16 5.5l6 10-6 3.5V5.5z" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M16 20.2l-6-3.5 6 8.8 6-8.8-6 3.5z" fill="#FFFFFF" fillOpacity="0.8" />
          <path d="M16 20.2l6-3.5-6 8.8V20.2z" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M16 19l-6-3.5 6-2.5 6 2.5-6 3.5z" fill="#C0CBF6" />
        </svg>
      );

    case 'celo':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#35D07F" />
          <path
            d="M18.8 8a6.8 6.8 0 00-6 3.6 6.8 6.8 0 106 12.4 6.8 6.8 0 006-3.6 6.8 6.8 0 00-6-12.4zm0 11.2a4.4 4.4 0 110-8.8 4.4 4.4 0 010 8.8zm-5.6-2.4a4.4 4.4 0 110-8.8 4.4 4.4 0 010 8.8z"
            fill="#FCFF52"
          />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          style={{ flexShrink: 0, borderRadius: '50%', ...style }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#F6AE2D" />
          <path d="M16 7l7 12h-14l7-12z" fill="#090D16" />
        </svg>
      );
  }
};

export default ChainLogo;
