export interface SuiWalletAdapter {
  signAndExecuteTransactionBlock(args: any): Promise<any>;
  getAccounts(): Promise<{ address: string }[]>;
  disconnect(): Promise<void>;
} 