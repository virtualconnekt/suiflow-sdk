import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/bcs';

// Types for better TypeScript support
export interface SuiFlowConfig {
  baseUrl?: string;
  environment?: 'development' | 'production';
  contractPackageId?: string;
  contractObjectId?: string;
  rpcUrl?: string;
  useSmartContract?: boolean;
  adminFee?: number;
  disableMockWallet?: boolean;
}

export interface PaymentDetails {
  method: 'smart_contract' | 'popup';
  txHash: string;
  customerAddress?: string;
  merchantAddress?: string;
  totalAmount: number;
  fee?: number;
  merchantReceived?: number;
  gasUsed?: string;
  eventData?: any;
}

export interface PaymentOptions {
  merchantId: string;
  merchantAddress?: string;
  amount: number;
  productId?: string;
  onSuccess: (txHash: string, amount: number, details: PaymentDetails) => void;
  onError: (error: string) => void;
  onProgress?: (message: string) => void;
}

export interface SuiWallet {
  requestPermissions(permissions: string[]): Promise<boolean>;
  connect?(): Promise<boolean>;
  enable?(): Promise<boolean>;
  getAccounts(): Promise<{ address: string }[]>;
  signAndExecuteTransactionBlock(params: {
    transactionBlock: Transaction;
    options?: {
      showEvents?: boolean;
      showEffects?: boolean;
      showBalanceChanges?: boolean;
    };
  }): Promise<any>;
  signAndExecuteTransaction?(txData: any): Promise<any>;
}

declare global {
  interface Window {
    suiet?: SuiWallet;
    suiWallet?: SuiWallet;
    ethos?: SuiWallet;
    sui?: SuiWallet;
  }
}

export class SuiFlowSDK {
  private config: Required<SuiFlowConfig>;
  private suiClient: SuiClient;

  constructor(config: SuiFlowConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:5173',
      environment: config.environment || 'development',
      contractPackageId: config.contractPackageId || '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
      contractObjectId: config.contractObjectId || '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
      rpcUrl: config.rpcUrl || 'https://fullnode.testnet.sui.io:443',
      useSmartContract: config.useSmartContract ?? true,
      adminFee: config.adminFee || 0.01,
      disableMockWallet: config.disableMockWallet ?? false
    };

    console.log('🔧 SuiFlowSDK initialized with config:', {
      baseUrl: this.config.baseUrl,
      environment: this.config.environment,
      rpcUrl: this.config.rpcUrl,
      useSmartContract: this.config.useSmartContract,
      disableMockWallet: this.config.disableMockWallet
    });

    this.suiClient = new SuiClient({ url: this.config.rpcUrl });
  }

  /**
   * Configure the SDK with new options
   */
  configure(options: Partial<SuiFlowConfig>): void {
    this.config = { ...this.config, ...options };
    if (options.rpcUrl) {
      this.suiClient = new SuiClient({ url: options.rpcUrl });
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): SuiFlowConfig {
    return { ...this.config };
  }

  /**
   * Check if smart contract is properly configured
   */
  isSmartContractEnabled(): boolean {
    return this.config.useSmartContract && 
           !!this.config.contractPackageId && 
           !!this.config.contractObjectId;
  }

  /**
   * Detect and get available Sui wallet
   */
  private async detectWallet(): Promise<SuiWallet> {
    console.log('🔍 Checking for installed wallets...');
    
    // Check if window is defined (for SSR compatibility)
    if (typeof window === 'undefined') {
      throw new Error('Cannot detect wallet in non-browser environment');
    }
    
    // Log all potential wallet objects for debugging
    console.log('Available wallet objects:', {
      suiet: !!window.suiet,
      suiWallet: !!window.suiWallet,
      ethos: !!window.ethos,
      sui: !!window.sui
    });
    
    // Check for Suiet Wallet (recommended)
    if (window.suiet) {
      console.log('✅ Suiet wallet detected');
      return window.suiet;
    }
    
    // Check for Sui Wallet
    if (window.suiWallet) {
      console.log('✅ Sui wallet detected');
      return window.suiWallet;
    }
    
    // Check for Ethos Wallet
    if (window.ethos) {
      console.log('✅ Ethos wallet detected');
      return window.ethos;
    }
    
    // Check for generic sui provider
    if (window.sui) {
      console.log('✅ Generic Sui provider detected');
      return window.sui;
    }

    // Add a small delay to ensure browser extension has time to inject wallet object
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try again after delay (some wallet extensions inject late)
    if (window.suiet || window.suiWallet || window.ethos || window.sui) {
      return this.detectWallet();
    }

    throw new Error('No Sui wallet detected. Please install and activate one of these wallets:\n• Suiet Wallet (suiet.app)\n• Sui Wallet\n• Ethos Wallet\n\nMake sure the wallet extension is enabled and you have created/imported a wallet.');
  }

  /**
   * Connect to wallet and get accounts
   */
  private async connectWallet(wallet: SuiWallet): Promise<{ address: string }[]> {
    try {
      console.log('🔌 Attempting to connect wallet:', wallet);
      let connectResult: boolean = false;

      // Try different connection methods in sequence
      if (wallet.requestPermissions) {
        console.log('🔑 Using requestPermissions method');
        connectResult = await wallet.requestPermissions(['viewAccount', 'suggestTransactions']);
      } else if (wallet.connect) {
        console.log('🔑 Using connect method');
        connectResult = await wallet.connect();
      } else if (wallet.enable) {
        console.log('🔑 Using enable method');
        connectResult = await wallet.enable();
      } else {
        console.log('❌ No standard connection method found');
        // If no explicit connection method, assume it's already connected
        connectResult = true;
      }

      if (!connectResult) {
        throw new Error('Wallet connection denied by user. Please approve the connection request in your wallet.');
      }

      // Get accounts
      let accounts: { address: string }[];
      
      console.log('👤 Retrieving wallet accounts');
      if (typeof wallet.getAccounts === 'function') {
        console.log('Using getAccounts method');
        accounts = await wallet.getAccounts();
      } else if ((wallet as any).accounts) {
        console.log('Using accounts property');
        accounts = (wallet as any).accounts;
      } else {
        throw new Error('Unable to retrieve wallet accounts');
      }

      console.log('👤 Accounts retrieved:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts found. Please create or import a wallet account and make sure it is selected.');
      }

      return accounts;
    } catch (error: any) {
      console.error('💥 Wallet connection error:', error);
      throw new Error(`Wallet connection failed: ${error.message}. Please make sure your wallet is unlocked and try again.`);
    }
  }

  /**
   * Build transaction block for smart contract payment
   */
  private buildSmartContractTransaction(
    merchantAddress: string,
    merchantId: string,
    productId: string,
    amount: number
  ): Transaction {
    const txb = new Transaction();
    const amountInMist = Math.floor(amount * 1_000_000_000);

    // Split coin from gas coin for payment
    const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInMist)]);

    // Call smart contract function
    txb.moveCall({
      target: `${this.config.contractPackageId}::payment_processor::process_widget_payment`,
      arguments: [
        txb.object(this.config.contractObjectId), // processor
        txb.pure.address(merchantAddress), // merchant_address
        txb.pure.vector('u8', new TextEncoder().encode(merchantId)), // merchant_id
        txb.pure.vector('u8', new TextEncoder().encode(productId)), // product_id
        paymentCoin // payment coin
      ]
    });

    // Set gas budget
    txb.setGasBudget(30_000_000);

    return txb;
  }

  /**
   * Execute smart contract payment
   */
  async payWithContract(options: PaymentOptions): Promise<void> {
    const { merchantId, merchantAddress, amount, productId = 'widget', onSuccess, onError, onProgress } = options;

    try {
      if (onProgress) onProgress('🚀 Initializing smart contract payment...');

      // Log current SDK configuration for debugging
      console.log('💼 SDK Configuration:', {
        useSmartContract: this.config.useSmartContract,
        disableMockWallet: this.config.disableMockWallet,
        contractPackageId: this.config.contractPackageId
      });

      // Validate smart contract configuration
      if (!this.isSmartContractEnabled()) {
        throw new Error('Smart contract not configured. Please call configure() with contract details.');
      }

      // Validate inputs
      if (!merchantId) throw new Error('merchantId is required');
      if (!merchantAddress) throw new Error('merchantAddress is required');
      if (!amount || amount <= 0) throw new Error('Valid amount is required');
      if (amount < this.config.adminFee + 0.001) {
        throw new Error(`Minimum amount is ${this.config.adminFee + 0.001} SUI (includes ${this.config.adminFee} SUI fee + gas)`);
      }

      if (onProgress) onProgress('📱 Detecting wallet...');

      // Check if wallet is available first
      if (!this.isWalletAvailable() && !this.config.disableMockWallet) {
        console.warn('⚠️ No wallet detected but continuing with mock wallet');
        if (onProgress) onProgress('⚠️ No wallet detected, using mock wallet...');
      } else if (!this.isWalletAvailable()) {
        throw new Error('No wallet detected. Please install and activate a Sui wallet extension.');
      }

      // Detect and connect wallet
      const wallet = await this.detectWallet();

      if (onProgress) onProgress('🔗 Connecting to wallet...');

      const accounts = await this.connectWallet(wallet);
      const customerAddress = accounts[0].address;

      if (onProgress) onProgress('⚡ Building transaction...');

      // Build transaction block
      const txb = this.buildSmartContractTransaction(merchantAddress, merchantId, productId, amount);

      console.log('🔧 TypeScript SDK Transaction built:', {
        package: this.config.contractPackageId,
        function: 'process_widget_payment',
        processor: this.config.contractObjectId,
        merchant: merchantAddress,
        merchantId,
        productId,
        amountSUI: amount,
        customerAddress
      });

      if (onProgress) onProgress('🔗 Executing on blockchain...');

      // Execute transaction
      const response = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEvents: true,
          showEffects: true,
          showBalanceChanges: true
        }
      });

      console.log('✅ TypeScript SDK Transaction executed:', {
        digest: response.digest,
        status: response.effects?.status?.status,
        gasUsed: response.effects?.gasUsed,
        balanceChanges: response.balanceChanges?.length || 0,
        events: response.events?.length || 0
      });

      if (onProgress) onProgress('✅ Verifying transaction...');

      // Check transaction success
      if (response.effects?.status?.status === 'success') {
        const txHash = response.digest;

        // Parse events from transaction
        const events = response.effects.events || [];
        const paymentEvent = events.find((event: any) => 
          event.type && event.type.includes('PaymentCompleted')
        );

        // Calculate payment details
        const paymentDetails: PaymentDetails = {
          method: 'smart_contract',
          txHash,
          customerAddress,
          merchantAddress,
          totalAmount: amount,
          fee: this.config.adminFee,
          merchantReceived: amount - this.config.adminFee,
          gasUsed: response.effects.gasUsed?.toString() || 'Unknown',
          eventData: paymentEvent?.parsedJson || null
        };

        if (onProgress) onProgress('📡 Notifying backend...');

        // Notify backend
        await this.notifyBackend(merchantId, txHash, amount, 'smart_contract', paymentDetails);

        // Success callback
        onSuccess(txHash, amount, paymentDetails);

      } else {
        const error = response.effects?.status?.error || 'Transaction failed';
        throw new Error(`Smart contract execution failed: ${error}`);
      }

    } catch (error: any) {
      console.error('Smart contract payment error:', error);
      onError(error.message);
    }
  }

  /**
   * Enhanced payWithWidget with smart contract support
   */
  async payWithWidget(options: PaymentOptions): Promise<void> {
    const { merchantId, amount, onSuccess, onError, onProgress } = options;

    // Try smart contract first if enabled
    if (this.isSmartContractEnabled()) {
      try {
        if (onProgress) onProgress('🔍 Fetching merchant details...');

        // Get merchant wallet address from backend
        const merchantData = await this.getMerchantData(merchantId);

        if (merchantData && merchantData.walletAddress) {
          return await this.payWithContract({
            ...options,
            merchantAddress: merchantData.walletAddress
          });
        } else {
          console.warn('Merchant wallet address not found, using popup fallback');
          if (onProgress) onProgress('⚠️ Merchant wallet not found, using popup...');
        }
      } catch (contractError: any) {
        console.warn('Smart contract failed, using popup fallback:', contractError);
        if (onProgress) onProgress('🔄 Smart contract failed, using popup...');
      }
    }

    // Fallback to popup payment
    return this.payWithPopup(options);
  }

  /**
   * Popup payment method (fallback)
   */
  payWithPopup(options: PaymentOptions): void {
    const { merchantId, amount, onSuccess, onError, onProgress } = options;

    try {
      if (onProgress) onProgress('🪟 Opening payment popup...');

      // Validate inputs
      if (!merchantId) throw new Error('merchantId is required');
      if (!amount || amount <= 0) throw new Error('amount must be greater than 0');

      let url = `${this.config.baseUrl}/widget/pay?merchantId=${encodeURIComponent(merchantId)}`;
      if (amount) url += `&amount=${encodeURIComponent(amount)}`;

      const width = 440;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        url,
        'SuiFlowWidgetPayment',
        `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`
      );

      if (!popup) {
        throw new Error('Payment popup was blocked. Please allow popups for this site.');
      }

      const handler = (event: MessageEvent) => {
        // Check origin for security
        if (this.config.environment === 'production' && event.origin !== this.config.baseUrl) {
          return;
        }

        if (event.data && event.data.suiflowSuccess) {
          const paymentDetails: PaymentDetails = {
            method: 'popup',
            txHash: event.data.txHash,
            totalAmount: event.data.amount
          };
          onSuccess(event.data.txHash, event.data.amount, paymentDetails);
          this.cleanup(popup, handler, checkClosed);
        } else if (event.data && event.data.suiflowError) {
          onError(event.data.error);
          this.cleanup(popup, handler, checkClosed);
        }
      };

      window.addEventListener('message', handler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          this.cleanup(popup, handler, checkClosed);
        }
      }, 1000);

    } catch (error: any) {
      onError(error.message);
    }
  }

  /**
   * Get merchant data from backend
   */
  private async getMerchantData(merchantId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/merchants/${merchantId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch merchant data:', error);
    }
    return null;
  }

  /**
   * Notify backend of payment
   */
  private async notifyBackend(
    merchantId: string,
    txHash: string,
    amount: number,
    method: string,
    details: PaymentDetails
  ): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/payments/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          txHash,
          amount,
          paymentMethod: method,
          details,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('✅ Backend notified successfully');
      } else {
        console.warn('⚠️ Backend notification failed');
      }
    } catch (error) {
      console.warn('❌ Failed to notify backend:', error);
    }
  }

  /**
   * Cleanup popup and event listeners
   */
  private cleanup(popup: Window, handler: (event: MessageEvent) => void, interval: NodeJS.Timeout): void {
    if (popup && !popup.closed) popup.close();
    if (handler) window.removeEventListener('message', handler);
    if (interval) clearInterval(interval);
  }

  /**
   * Check if any wallet is available without connecting
   */
  public isWalletAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const hasWallet = !!(window.suiet || window.suiWallet || window.ethos || window.sui);
    console.log('Wallet availability check:', hasWallet);
    return hasWallet;
  }

  /**
   * Check wallet connection status
   */
  async checkWalletConnection(): Promise<boolean> {
    try {
      const wallet = await this.detectWallet();
      const accounts = await this.connectWallet(wallet);
      return accounts && accounts.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): string[] {
    const methods = ['popup'];
    if (this.isSmartContractEnabled()) {
      methods.unshift('smart_contract');
    }
    return methods;
  }

  /**
   * Withdraw admin fees from the payment processor (admin only)
   */
  async withdrawAdminFees(): Promise<string> {
    try {
      console.log('🔑 Initializing admin fee withdrawal...');
      
      // Validate smart contract configuration
      if (!this.isSmartContractEnabled()) {
        throw new Error('Smart contract not configured. Please call configure() with contract details.');
      }
      
      // Detect and connect wallet
      const wallet = await this.detectWallet();
      const accounts = await this.connectWallet(wallet);
      
      // Build transaction
      const txb = new Transaction();
      
      // Call withdraw_admin_fees
      txb.moveCall({
        target: `${this.config.contractPackageId}::payment_processor::withdraw_admin_fees`,
        arguments: [
          txb.object(this.config.contractObjectId), // processor
        ]
      });
      
      // Set gas budget
      txb.setGasBudget(10_000_000);
      
      console.log('🔧 Built admin fee withdrawal transaction');
      
      // Execute transaction
      const response = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEvents: true,
          showEffects: true
        }
      });
      
      console.log('✅ Admin fee withdrawal executed:', {
        digest: response.digest,
        status: response.effects?.status?.status
      });
      
      // Return transaction hash
      return response.digest;
    } catch (error: any) {
      console.error('❌ Admin fee withdrawal error:', error);
      throw new Error(`Failed to withdraw admin fees: ${error.message}`);
    }
  }

  /**
   * Get SDK version
   */
  get version(): string {
    return '1.0.0';
  }
}

// Export for both ES modules and CommonJS
export default SuiFlowSDK;
