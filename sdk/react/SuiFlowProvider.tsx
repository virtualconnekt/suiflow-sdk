import React, { useEffect } from 'react';
import { WalletProvider, useCurrentWallet, useCurrentAccount } from '@mysten/dapp-kit';
import { SuiFlowCore } from '../core/suiflow';
import { SuiWalletAdapter } from '../types/wallet';

interface SuiFlowProviderProps {
  sdk: SuiFlowCore;
  children: React.ReactNode;
}

export const SuiFlowProvider: React.FC<SuiFlowProviderProps> = ({ sdk, children }) => {
  const walletState = useCurrentWallet();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (walletState.connectionStatus === 'connected' && walletState.currentWallet && currentAccount) {
      const features = walletState.currentWallet.features;
      const signAndExecute = features['sui:signAndExecuteTransactionBlock']?.signAndExecuteTransactionBlock;
      const disconnect = features['standard:disconnect']?.disconnect;

      if (signAndExecute && disconnect) {
        const adapter: SuiWalletAdapter = {
          signAndExecuteTransactionBlock: (args: any) =>
            signAndExecute({ ...args, account: currentAccount }),
          getAccounts: async () => [{ address: currentAccount.address }],
          disconnect: () => disconnect(),
        };
        sdk.setWalletAdapter(adapter);
      }
    }
  }, [walletState, currentAccount, sdk]);

  return <WalletProvider>{children}</WalletProvider>;
};