
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiWalletAdapter } from '../types/wallet';



export interface SuiFlowConfig {
  baseUrl?: string;
  environment?: 'development' | 'production';
  contractPackageId?: string;
  contractObjectId?: string;
  rpcUrl?: string;
  useSmartContract?: boolean;
  adminFee?: number;
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
  /**
   * Optional product identifier. If not provided, defaults to 'general'.
   */
  productId?: string;
  onSuccess: (txHash: string, amount: number, details: PaymentDetails) => void;
  onError: (error: string) => void;
  onProgress?: (message: string) => void;
}

export class SuiFlowCore {

  // Hard-locked contract config (cannot be overridden)
  private readonly lockedConfig = {
    contractPackageId: '0xce43cd5a753080bb1546a3b575ca48892204699b580d89df5f384ca77da4641a0',
    contractObjectId: '0x33baa75593ccc45a8edd06798ff6f0319d43287968590a90c3c593ff55b23574',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    adminAddress: '0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973bd95b2af702cbea6bc2a0f28',
  };
  private config: Required<SuiFlowConfig>;
  private suiClient: SuiClient;
  private wallet: SuiWalletAdapter | null = null;

  constructor(config: SuiFlowConfig = {}) {
    // Only allow non-locked config to be set, no process.env fallback
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:5173',
      environment: config.environment || 'development',
      contractPackageId: this.lockedConfig.contractPackageId,
      contractObjectId: this.lockedConfig.contractObjectId,
      rpcUrl: this.lockedConfig.rpcUrl,
      useSmartContract: config.useSmartContract ?? true,
      adminFee: config.adminFee || 0.01,
      // @ts-ignore
      adminAddress: this.lockedConfig.adminAddress,
    };
    this.suiClient = new SuiClient({ url: this.lockedConfig.rpcUrl });
  }

  setWalletAdapter(adapter: SuiWalletAdapter) {
    this.wallet = adapter;
  }

  configure(options: Partial<SuiFlowConfig>): void {
    const lockedKeys = ['contractPackageId', 'contractObjectId', 'rpcUrl', 'adminAddress'];
    for (const key of lockedKeys) {
      if (key in options) {
        delete options[key as keyof SuiFlowConfig];
        if (typeof window !== 'undefined') {
          // Browser
          console.warn(`[SuiFlow SDK] Attempted to override locked config key: ${key}. Ignored.`);
        } else {
          // Node.js
          // eslint-disable-next-line no-console
          console.warn(`[SuiFlow SDK] Attempted to override locked config key: ${key}. Ignored.`);
        }
      }
    }
    this.config = { ...this.config, ...options };
    // Always use locked values
    this.config.contractPackageId = this.lockedConfig.contractPackageId;
    this.config.contractObjectId = this.lockedConfig.contractObjectId;
    this.config.rpcUrl = this.lockedConfig.rpcUrl;
    // @ts-ignore
    this.config.adminAddress = this.lockedConfig.adminAddress;
    this.suiClient = new SuiClient({ url: this.lockedConfig.rpcUrl });
  }

  getConfig(): SuiFlowConfig {
    return { ...this.config };
  }

  isSmartContractEnabled(): boolean {
    // Always use locked config
    return this.config.useSmartContract && !!this.lockedConfig.contractPackageId && !!this.lockedConfig.contractObjectId;
  }

  private buildSmartContractTransaction(
    merchantAddress: string,
    merchantId: string,
    productId: string,
    amount: number
  ): Transaction {
    const txb = new Transaction();
    const amountInMist = Math.floor(amount * 1_000_000_000);
    const [paymentCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInMist)]);
    txb.moveCall({
      target: `${this.lockedConfig.contractPackageId}::payment_processor::process_widget_payment`,
      arguments: [
        txb.object(this.lockedConfig.contractObjectId),
        txb.pure.address(merchantAddress),
        txb.pure.vector('u8', new TextEncoder().encode(merchantId)),
        txb.pure.vector('u8', new TextEncoder().encode(productId)),
        paymentCoin
      ]
    });
    txb.setGasBudget(30_000_000);
    return txb;
  }

  /**
   * Execute smart contract payment
   * @param options PaymentOptions (productId is optional)
   */
  async payWithContract(options: PaymentOptions): Promise<void> {
    const { merchantId, merchantAddress, amount, productId, onSuccess, onError, onProgress } = options;
    // Default productId to 'general' if not provided
    const finalProductId = productId ?? 'general';
    try {
      if (onProgress) onProgress('🚀 Initializing smart contract payment...');
      if (!this.isSmartContractEnabled()) {
        throw new Error('Smart contract not configured. Please call configure() with contract details.');
      }
      if (!merchantId) throw new Error('merchantId is required');
      if (!merchantAddress) throw new Error('merchantAddress is required');
      if (!amount || amount <= 0) throw new Error('Valid amount is required');
      if (amount < this.config.adminFee + 0.001) {
        throw new Error(`Minimum amount is ${this.config.adminFee + 0.001} SUI (includes ${this.config.adminFee} SUI fee + gas)`);
      }
      if (!this.wallet) throw new Error('No wallet adapter set. Please call setWalletAdapter() first.');
      const accounts = await this.wallet.getAccounts();
      const customerAddress = accounts[0].address;
      if (onProgress) onProgress('⚡ Building transaction...');
      // Use finalProductId in transaction builder
      const txb = this.buildSmartContractTransaction(merchantAddress, merchantId, finalProductId, amount);
      if (onProgress) onProgress('🔗 Executing on blockchain...');
      const response = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEvents: true,
          showEffects: true,
          showBalanceChanges: true
        }
      });
      if (response.effects?.status?.status === 'success') {
        const txHash = response.digest;
        const events = response.effects.events || [];
        const paymentEvent = events.find((event: any) => event.type && event.type.includes('PaymentCompleted'));
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
        await this.notifyBackend(merchantId, txHash, amount, 'smart_contract', paymentDetails);
        onSuccess(txHash, amount, paymentDetails);
      } else {
        const error = response.effects?.status?.error || 'Transaction failed';
        throw new Error(`Smart contract execution failed: ${error}`);
      }
    } catch (error: any) {
      onError(error.message);
    }
  }

  /**
   * Enhanced payWithWidget with smart contract support
   * @param options PaymentOptions (productId is optional)
   */
  async payWithWidget(options: PaymentOptions): Promise<void> {
    const { merchantId, amount, productId, onSuccess, onError, onProgress } = options;
    // Default productId to 'general' if not provided
    const finalProductId = productId ?? 'general';
    if (!this.isSmartContractEnabled()) {
      const errMsg = 'Smart contract payment is required but not configured.';
      if (onProgress) onProgress('❌ ' + errMsg);
      onError(errMsg);
      return;
    }
    try {
      if (onProgress) onProgress('🔍 Fetching merchant details...');
      const merchantData = await this.getMerchantData(merchantId);
      if (merchantData && merchantData.walletAddress) {
        // Forward finalProductId to payWithContract
        return await this.payWithContract({ ...options, merchantAddress: merchantData.walletAddress, productId: finalProductId });
      } else {
        const errMsg = 'Merchant wallet not found. Cannot proceed with smart contract payment.';
        if (onProgress) onProgress('❌ ' + errMsg);
        onError(errMsg);
      }
    } catch (contractError: any) {
      if (onProgress) onProgress('❌ Smart contract payment failed.');
      onError(contractError.message || 'Smart contract payment failed.');
    }
  }

  payWithPopup(options: PaymentOptions): void {
    const { merchantId, amount, onSuccess, onError, onProgress } = options;
    try {
      if (onProgress) onProgress('🪟 Opening payment popup...');
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

  private async getMerchantData(merchantId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/merchants/${merchantId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Silent fail
    }
    return null;
  }

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
      if (!response.ok) {
        // Optionally log or handle
      }
    } catch (error) {
      // Optionally log or handle
    }
  }

  private cleanup(popup: Window, handler: (event: MessageEvent) => void, interval: NodeJS.Timeout): void {
    if (popup && !popup.closed) popup.close();
    if (handler) window.removeEventListener('message', handler);
    if (interval) clearInterval(interval);
  }

  async getAccounts(): Promise<{ address: string }[]> {
    if (!this.wallet) throw new Error('No wallet adapter set.');
    return this.wallet.getAccounts();
  }

  async disconnect(): Promise<void> {
    if (!this.wallet) return;
    await this.wallet.disconnect();
    this.wallet = null;
  }

  getPaymentMethods(): string[] {
    const methods = ['popup'];
    if (this.isSmartContractEnabled()) {
      methods.unshift('smart_contract');
    }
    return methods;
  }

  async withdrawAdminFees(): Promise<string> {
    if (!this.wallet) throw new Error('No wallet adapter set. Please call setWalletAdapter() first.');
    if (!this.isSmartContractEnabled()) {
      throw new Error('Smart contract not configured. Please call configure() with contract details.');
    }
    const accounts = await this.wallet.getAccounts();
    const txb = new Transaction();
    txb.moveCall({
      target: `${this.lockedConfig.contractPackageId}::payment_processor::withdraw_admin_fees`,
      arguments: [
        txb.object(this.lockedConfig.contractObjectId),
      ]
    });
    txb.setGasBudget(10_000_000);
    const response = await this.wallet.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: {
        showEvents: true,
        showEffects: true
      }
    });
    if (response.effects?.status?.status === 'success') {
      return response.digest;
    } else {
      const error = response.effects?.status?.error || 'Transaction failed';
      throw new Error(`Admin fee withdrawal failed: ${error}`);
    }
  }

  get version(): string {
    return '1.0.0';
  }
} 