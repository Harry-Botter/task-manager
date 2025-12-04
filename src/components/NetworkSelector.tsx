import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

export default function NetworkSelector() {
  const client = useSuiClient();
  const [currentNetwork, setCurrentNetwork] = useState<string>('unknown');

  useEffect(() => {
    // 現在のネットワークを取得
    const checkNetwork = async () => {
      try {
        const chainId = await client.getChainIdentifier();
        
        // Chain IDからネットワークを判定
        if (chainId.includes('mainnet')) {
          setCurrentNetwork('mainnet');
        } else if (chainId.includes('testnet')) {
          setCurrentNetwork('testnet');
        } else if (chainId.includes('devnet')) {
          setCurrentNetwork('devnet');
        } else {
          setCurrentNetwork(chainId);
        }
      } catch (error) {
        console.error('Failed to get network:', error);
      }
    };

    checkNetwork();
  }, [client]);

  const getNetworkColor = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return '#10B981'; // green
      case 'testnet':
        return '#F59E0B'; // yellow
      case 'devnet':
        return '#3B82F6'; // blue
      default:
        return '#6B7280'; // gray
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        backgroundColor: '#1F2937',
        borderRadius: '0.375rem',
        border: '1px solid #374151',
        fontSize: '0.875rem',
        color: '#E5E7EB',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getNetworkColor(),
        }}
      />
      <span style={{ textTransform: 'capitalize' }}>{currentNetwork}</span>
    </div>
  );
}