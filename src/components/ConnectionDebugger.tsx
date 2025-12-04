import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

export default function ConnectionDebugger() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!account) {
        setDebugInfo(null);
        return;
      }

      try {
        // Chain IDを確認
        const chainId = await client.getChainIdentifier();
        
        // RPC URLを確認（複数の方法で試す）
        let rpcUrl = 'unknown';
        if ((client as any).transport?.url) {
          rpcUrl = (client as any).transport.url;
        } else if ((client as any).options?.url) {
          rpcUrl = (client as any).options.url;
        } else if ((client as any).url) {
          rpcUrl = (client as any).url;
        } else {
          // Chain IDから推測
          if (chainId === '833db4e1') {
            rpcUrl = 'https://fullnode.devnet.sui.io (devnet chain detected)';
          }
        }
        
        // 最新ブロックを取得して接続確認
        const checkpoint = await client.getLatestCheckpointSequenceNumber();
        
        const info = {
          walletAddress: account.address,
          rpcUrl,
          chainId,
          latestCheckpoint: checkpoint,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setDebugInfo(info);
        
        console.log('🔍 Connection Debug Info:');
        console.log('  Wallet Address:', account.address);
        console.log('  RPC URL:', rpcUrl);
        console.log('  Chain ID:', chainId);
        console.log('  Latest Checkpoint:', checkpoint);
        
        // Chain IDからネットワーク判定
        let network = 'unknown';
        if (chainId === '833db4e1') {
          network = 'devnet';
        } else if (chainId === '4c78adac') {
          network = 'testnet';
        } else if (chainId === '35834a8a') {
          network = 'mainnet';
        } else if (rpcUrl.includes('devnet')) {
          network = 'devnet';
        } else if (rpcUrl.includes('testnet')) {
          network = 'testnet';
        } else if (rpcUrl.includes('mainnet')) {
          network = 'mainnet';
        }
        
        console.log('  ✅ Actually Connected to:', network.toUpperCase());
        
      } catch (error) {
        console.error('❌ Connection check failed:', error);
      }
    };

    checkConnection();
  }, [account, client]);

  if (!account || !debugInfo) {
    return null;
  }

  // RPC URLからネットワークを判定
  let actualNetwork = 'unknown';
  if (debugInfo.rpcUrl.includes('devnet')) {
    actualNetwork = 'devnet';
  } else if (debugInfo.rpcUrl.includes('testnet')) {
    actualNetwork = 'testnet';
  } else if (debugInfo.rpcUrl.includes('mainnet')) {
    actualNetwork = 'mainnet';
  }

  const networkColors: any = {
    devnet: '#3B82F6',
    testnet: '#F59E0B',
    mainnet: '#10B981',
    unknown: '#6B7280',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        backgroundColor: '#1F2937',
        border: '2px solid #374151',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontSize: '0.75rem',
        color: '#E5E7EB',
        maxWidth: '400px',
        zIndex: 1000,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#60A5FA' }}>
        🔍 Connection Debug Info
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div>
          <span style={{ color: '#9CA3AF' }}>Network:</span>{' '}
          <span
            style={{
              color: networkColors[actualNetwork],
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {actualNetwork}
          </span>
        </div>
        
        <div>
          <span style={{ color: '#9CA3AF' }}>RPC URL:</span>{' '}
          <span style={{ color: '#D1D5DB', wordBreak: 'break-all' }}>
            {debugInfo.rpcUrl}
          </span>
        </div>
        
        <div>
          <span style={{ color: '#9CA3AF' }}>Chain ID:</span>{' '}
          <span style={{ color: '#D1D5DB' }}>{debugInfo.chainId}</span>
        </div>
        
        <div>
          <span style={{ color: '#9CA3AF' }}>Checkpoint:</span>{' '}
          <span style={{ color: '#D1D5DB' }}>{debugInfo.latestCheckpoint}</span>
        </div>
        
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #374151' }}>
          <span style={{ color: '#9CA3AF' }}>Updated:</span>{' '}
          <span style={{ color: '#D1D5DB' }}>{debugInfo.timestamp}</span>
        </div>
      </div>
      
      {actualNetwork === 'devnet' && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#064E3B',
            borderRadius: '0.25rem',
            color: '#6EE7B7',
          }}
        >
          ✅ Correctly connected to Devnet!
        </div>
      )}
      
      {actualNetwork === 'testnet' && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#78350F',
            borderRadius: '0.25rem',
            color: '#FCD34D',
          }}
        >
          ⚠️ Connected to Testnet (should be Devnet)
        </div>
      )}
    </div>
  );
}