/**
 * SuiFlow SDK Configuration Helper
 * This file helps manage environment variables and configuration
 * Copy this to your project and modify as needed
 */

class SuiFlowConfig {
    constructor() {
        this.config = {
            merchantId: null,
            apiUrl: 'http://localhost:5173',
            environment: 'production'
        };
        this.loadConfig();
    }

    loadConfig() {
        // Node.js environment
        if (typeof process !== 'undefined' && process.env) {
            this.config.merchantId = process.env.SUIFLOW_MERCHANT_ID;
            this.config.apiUrl = process.env.SUIFLOW_API_URL || this.config.apiUrl;
            this.config.environment = process.env.NODE_ENV || 'production';
        }
        
        // Vite environment
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            this.config.merchantId = import.meta.env.VITE_SUIFLOW_MERCHANT_ID;
            this.config.apiUrl = import.meta.env.VITE_SUIFLOW_API_URL || this.config.apiUrl;
        }
        
        // Next.js environment
        if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUIFLOW_MERCHANT_ID) {
            this.config.merchantId = process.env.NEXT_PUBLIC_SUIFLOW_MERCHANT_ID;
            this.config.apiUrl = process.env.NEXT_PUBLIC_SUIFLOW_API_URL || this.config.apiUrl;
        }
        
        // Vue.js environment
        if (typeof process !== 'undefined' && process.env.VUE_APP_SUIFLOW_MERCHANT_ID) {
            this.config.merchantId = process.env.VUE_APP_SUIFLOW_MERCHANT_ID;
            this.config.apiUrl = process.env.VUE_APP_SUIFLOW_API_URL || this.config.apiUrl;
        }
    }

    getMerchantId() {
        if (!this.config.merchantId) {
            throw new Error('SuiFlow merchant ID not found. Please set SUIFLOW_MERCHANT_ID in your environment variables.');
        }
        return this.config.merchantId;
    }

    getApiUrl() {
        return this.config.apiUrl;
    }

    isProduction() {
        return this.config.environment === 'production';
    }

    validateConfig() {
        const errors = [];
        
        if (!this.config.merchantId) {
            errors.push('Missing merchant ID - set SUIFLOW_MERCHANT_ID environment variable');
        }
        
        if (!this.config.apiUrl) {
            errors.push('Missing API URL');
        }
        
        if (errors.length > 0) {
            throw new Error(`SuiFlow configuration errors:\n${errors.join('\n')}`);
        }
        
        return true;
    }

    getPaymentOptions(amount, callbacks = {}) {
        this.validateConfig();
        
        return {
            merchantId: this.getMerchantId(),
            amount: amount,
            onSuccess: callbacks.onSuccess || function(txHash, paidAmount) {
                console.log('Payment successful:', { txHash, paidAmount });
            },
            onError: callbacks.onError || function(error) {
                console.error('Payment failed:', error);
            }
        };
    }
}

// Usage Examples:

// 1. Basic usage
// const suiflowConfig = new SuiFlowConfig();
// const paymentOptions = suiflowConfig.getPaymentOptions(10.0, {
//     onSuccess: (txHash, amount) => alert(`Paid ${amount} SUI!`),
//     onError: (error) => alert(`Payment failed: ${error}`)
// });
// Suiflow.payWithWidget(paymentOptions);

// 2. Manual configuration
// const suiflowConfig = new SuiFlowConfig();
// try {
//     suiflowConfig.validateConfig();
//     Suiflow.payWithWidget({
//         merchantId: suiflowConfig.getMerchantId(),
//         amount: 5.0,
//         onSuccess: (txHash) => console.log('Success:', txHash)
//     });
// } catch (error) {
//     console.error('Configuration error:', error.message);
// }

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuiFlowConfig;
}
if (typeof window !== 'undefined') {
    window.SuiFlowConfig = SuiFlowConfig;
}
