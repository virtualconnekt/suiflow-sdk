// Type definitions for SuiFlow SDK
declare module 'suiflow-sdk' {
  export interface PaymentOptions {
    merchantId: string;
    amount: number;
    onSuccess: (txHash: string, paidAmount: number) => void;
    onError?: (error: string) => void;
    environment?: 'testnet' | 'mainnet';
  }

  export interface ProductOptions {
    productId: string;
    onSuccess: (txHash: string) => void;
    onError?: (error: string) => void;
    environment?: 'testnet' | 'mainnet';
  }

  export interface PaymentResult {
    txHash: string;
    amount: number;
    timestamp: number;
  }

  export interface SuiFlowSDK {
    /**
     * Initialize a custom amount payment with the widget
     * @param options Payment configuration options
     */
    payWithWidget(options: PaymentOptions): void;

    /**
     * Initialize a product-based payment
     * @param options Product payment configuration
     */
    init(options: ProductOptions): void;

    /**
     * Set mock mode for testing (optional)
     * @param enabled Whether to enable mock mode
     */
    setMockMode?(enabled: boolean): void;

    /**
     * Get SDK version
     */
    version?: string;
  }

  const SuiFlow: SuiFlowSDK;
  export default SuiFlow;
}

// Global type for script tag usage
declare global {
  interface Window {
    Suiflow: import('suiflow-sdk').SuiFlowSDK;
  }
}

export {};
