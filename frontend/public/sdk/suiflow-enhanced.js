(function(window) {
  const Suiflow = {
    // Enhanced Configuration
    config: {
      baseUrl: 'http://localhost:4000', // Local development backend
      environment: 'development', // 'production' or 'development'
      // Smart contract configuration - LIVE ADDRESSES
      contractPackageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
      contractObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
      rpcUrl: 'https://fullnode.testnet.sui.io:443',
      useSmartContract: true, // ENABLE SMART CONTRACT
      adminFee: 0.01 // 0.01 SUI flat fee
    },

    // Enhanced configuration method
    configure(options) {
      if (options.baseUrl) this.config.baseUrl = options.baseUrl;
      if (options.environment) this.config.environment = options.environment;
      // Smart contract options
      if (options.contractPackageId) this.config.contractPackageId = options.contractPackageId;
      if (options.contractObjectId) this.config.contractObjectId = options.contractObjectId;
      if (options.rpcUrl) this.config.rpcUrl = options.rpcUrl;
      if (options.useSmartContract !== undefined) this.config.useSmartContract = options.useSmartContract;
      if (options.adminFee) this.config.adminFee = options.adminFee;
    },

    getBaseUrl() {
      return this.config.baseUrl;
    },

    // 🆕 NEW: Smart Contract Payment Method
    async payWithContract({ merchantId, merchantAddress, amount, productId = 'widget', onSuccess, onError, onProgress }) {
      try {
        if (onProgress) onProgress('🚀 Initializing smart contract payment...');
        
        // Validate smart contract configuration
        if (!this.config.contractPackageId || !this.config.contractObjectId) {
          throw new Error('Smart contract not configured. Please call Suiflow.configure() with contract details.');
        }
        
        // Validate inputs
        if (!merchantId) throw new Error('merchantId is required');
        if (!merchantAddress) throw new Error('merchantAddress is required');
        if (!amount || amount <= 0) throw new Error('Valid amount is required');
        if (amount < this.config.adminFee + 0.001) {
          throw new Error(`Minimum amount is ${this.config.adminFee + 0.001} SUI (includes ${this.config.adminFee} SUI fee + gas)`);
        }
        if (typeof onSuccess !== 'function') throw new Error('onSuccess callback is required');

        if (onProgress) onProgress('📱 Checking wallet availability...');
        
        // Enhanced wallet detection for different Sui wallets
        let wallet = null;
        
        // Check for Suiet Wallet
        if (window.suiet) {
          wallet = window.suiet;
          console.log('✅ Suiet wallet detected');
        }
        // Check for Sui Wallet  
        else if (window.suiWallet) {
          wallet = window.suiWallet;
          console.log('✅ Sui wallet detected');
        }
        // Check for Ethos Wallet
        else if (window.ethos) {
          wallet = window.ethos;
          console.log('✅ Ethos wallet detected');
        }
        // Check for generic sui provider
        else if (window.sui) {
          wallet = window.sui;
          console.log('✅ Generic Sui provider detected');
        }
        
        if (!wallet) {
          throw new Error('No Sui wallet detected. Please install and activate one of these wallets:\n• Suiet Wallet (suiet.app)\n• Sui Wallet\n• Ethos Wallet\n\nMake sure the wallet extension is enabled and you have created/imported a wallet.');
        }

        if (onProgress) onProgress('🔗 Connecting to wallet...');
        
        // Request wallet connection with enhanced error handling
        let connectResult;
        try {
          // Different wallets have different connection methods
          if (wallet.requestPermissions) {
            connectResult = await wallet.requestPermissions(['viewAccount', 'suggestTransactions']);
          } else if (wallet.connect) {
            connectResult = await wallet.connect();
          } else if (wallet.enable) {
            connectResult = await wallet.enable();
          } else {
            throw new Error('Wallet connection method not found');
          }
        } catch (connectionError) {
          throw new Error(`Wallet connection failed: ${connectionError.message}. Please make sure your wallet is unlocked and try again.`);
        }
        
        if (!connectResult) {
          throw new Error('Wallet connection denied by user. Please approve the connection request in your wallet.');
        }

        // Get wallet accounts with enhanced error handling
        let accounts;
        try {
          if (wallet.getAccounts) {
            accounts = await wallet.getAccounts();
          } else if (wallet.accounts) {
            accounts = wallet.accounts;
          } else {
            throw new Error('Unable to retrieve wallet accounts');
          }
        } catch (accountError) {
          throw new Error(`Failed to get wallet accounts: ${accountError.message}. Please make sure your wallet is properly set up.`);
        }
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet accounts found. Please create or import a wallet account and make sure it is selected.');
        }

        const customerAddress = accounts[0].address;
        
        if (onProgress) onProgress('⚡ Building transaction...');
        
        // Convert amount to MIST (1 SUI = 1,000,000,000 MIST)
        const amountInMist = Math.floor(amount * 1000000000);
        
        // Prepare transaction for wallet
        const txData = {
          packageObjectId: this.config.contractPackageId,
          module: 'payment',
          function: 'process_widget_payment',
          typeArguments: [],
          arguments: [
            this.config.contractObjectId, // Payment processor object
            merchantAddress,
            Array.from(new TextEncoder().encode(merchantId)),
            Array.from(new TextEncoder().encode(productId))
          ],
          gasBudget: 30000000 // 0.03 SUI gas budget
        };

        if (onProgress) onProgress('🔗 Executing on blockchain...');
        
        // Sign and execute transaction with enhanced error handling
        let response;
        try {
          if (wallet.signAndExecuteTransaction) {
            response = await wallet.signAndExecuteTransaction(txData);
          } else if (wallet.signAndExecuteTransactionBlock) {
            response = await wallet.signAndExecuteTransactionBlock(txData);
          } else if (wallet.executeTransaction) {
            response = await wallet.executeTransaction(txData);
          } else {
            throw new Error('Transaction execution method not found in wallet');
          }
        } catch (txError) {
          if (txError.message.includes('User rejected')) {
            throw new Error('Transaction was rejected by user. Please approve the transaction in your wallet to proceed.');
          } else if (txError.message.includes('Insufficient')) {
            throw new Error('Insufficient balance. Please make sure you have enough SUI tokens (at least 0.15 SUI) for the transaction and gas fees.');
          } else {
            throw new Error(`Transaction failed: ${txError.message}`);
          }
        }

        if (onProgress) onProgress('✅ Verifying transaction...');
        
        // Check transaction success
        if (response.effects?.status?.status === 'success') {
          const txHash = response.digest;
          
          // Parse events from transaction
          const events = response.effects.events || [];
          const paymentEvent = events.find(event => 
            event.type && event.type.includes('PaymentCompleted')
          );

          // Calculate payment details
          const paymentDetails = {
            method: 'smart_contract',
            txHash: txHash,
            customerAddress: customerAddress,
            merchantAddress: merchantAddress,
            totalAmount: amount,
            fee: this.config.adminFee,
            merchantReceived: amount - this.config.adminFee,
            gasUsed: response.effects.gasUsed || 'Unknown',
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

      } catch (error) {
        console.error('Smart contract payment error:', error);
        
        // Automatic fallback for certain errors
        if (this.shouldFallbackToPopup(error)) {
          if (onProgress) onProgress('🔄 Falling back to popup payment...');
          return this.payWithPopup({ merchantId, amount, onSuccess, onError, onProgress });
        }
        
        if (onError) onError(error.message);
      }
    },

    // Enhanced payWithWidget with smart contract support
    async payWithWidget({ merchantId, amount, onSuccess, onError, onProgress }) {
      // Try smart contract first if enabled
      if (this.config.useSmartContract && this.config.contractPackageId) {
        try {
          if (onProgress) onProgress('🔍 Fetching merchant details...');
          
          // Get merchant wallet address from backend
          const merchantData = await this.getMerchantData(merchantId);
          
          if (merchantData && merchantData.walletAddress) {
            return await this.payWithContract({
              merchantId,
              merchantAddress: merchantData.walletAddress,
              amount,
              onSuccess,
              onError,
              onProgress
            });
          } else {
            console.warn('Merchant wallet address not found, using popup fallback');
            if (onProgress) onProgress('⚠️ Merchant wallet not found, using popup...');
          }
        } catch (contractError) {
          console.warn('Smart contract failed, using popup fallback:', contractError);
          if (onProgress) onProgress('🔄 Smart contract failed, using popup...');
        }
      }

      // Fallback to popup payment
      return this.payWithPopup({ merchantId, amount, onSuccess, onError, onProgress });
    },

    // Original popup method (renamed for clarity)
    payWithPopup({ merchantId, amount, onSuccess, onError, onProgress }) {
      try {
        if (onProgress) onProgress('🪟 Opening payment popup...');
        
        // Validate inputs
        if (!merchantId) {
          throw new Error('merchantId is required');
        }
        if (!amount || amount <= 0) {
          throw new Error('amount must be greater than 0');
        }
        if (typeof onSuccess !== 'function') {
          throw new Error('onSuccess callback is required');
        }

        let url = `${this.getBaseUrl()}/widget/pay?merchantId=${encodeURIComponent(merchantId)}`;
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

        const handler = (event) => {
          // Check origin for security
          if (this.config.environment === 'production' && event.origin !== this.getBaseUrl()) {
            return;
          }
          
          if (event.data && event.data.suiflowSuccess) {
            const paymentDetails = {
              method: 'popup',
              txHash: event.data.txHash,
              totalAmount: event.data.amount
            };
            if (typeof onSuccess === 'function') onSuccess(event.data.txHash, event.data.amount, paymentDetails);
            this.cleanup(popup, handler, checkClosed);
          } else if (event.data && event.data.suiflowError) {
            if (typeof onError === 'function') onError(event.data.error);
            this.cleanup(popup, handler, checkClosed);
          }
        };
        
        window.addEventListener('message', handler);

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            this.cleanup(popup, handler, checkClosed);
          }
        }, 1000);

      } catch (error) {
        if (typeof onError === 'function') {
          onError(error.message);
        } else {
          console.error('SuiFlow SDK Error:', error.message);
        }
      }
    },

    init({ productId, onSuccess, onError }) {
      try {
        // Validate inputs
        if (!productId) {
          throw new Error('productId is required');
        }
        if (typeof onSuccess !== 'function') {
          throw new Error('onSuccess callback is required');
        }

        // Open payment page in a popup window
        const width = 440;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          `${this.getBaseUrl()}/pay/${productId}`,
          'SuiFlowPayment',
          `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`
        );

        if (!popup) {
          throw new Error('Payment popup was blocked. Please allow popups for this site.');
        }

        // Listen for postMessage from the popup
        function handler(event) {
          // Check origin for security (optional but recommended)
          // if (event.origin !== 'https://suiflow.virtualconnekt.com.ng') return;
          
          if (event.data && event.data.suiflowSuccess) {
            if (typeof onSuccess === 'function') onSuccess(event.data.txHash);
            if (popup && !popup.closed) popup.close();
            window.removeEventListener('message', handler);
          } else if (event.data && event.data.suiflowError) {
            if (typeof onError === 'function') onError(event.data.error);
            if (popup && !popup.closed) popup.close();
            window.removeEventListener('message', handler);
          }
        }
        window.addEventListener('message', handler);

        // Clean up if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            window.removeEventListener('message', handler);
            clearInterval(checkClosed);
          }
        }, 1000);

      } catch (error) {
        if (typeof onError === 'function') {
          onError(error.message);
        } else {
          console.error('SuiFlow SDK Error:', error.message);
        }
      }
    },

    // 🆕 Helper Methods
    async getMerchantData(merchantId) {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/merchants/${merchantId}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('Failed to fetch merchant data:', error);
      }
      return null;
    },

    async notifyBackend(merchantId, txHash, amount, method, details = {}) {
      try {
        const response = await fetch(`${this.getBaseUrl()}/api/payments/notify`, {
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
    },

    shouldFallbackToPopup(error) {
      const fallbackErrors = [
        'wallet not found',
        'wallet connection denied',
        'user rejected',
        'network error',
        'insufficient gas'
      ];
      
      return fallbackErrors.some(errType => 
        error.message.toLowerCase().includes(errType)
      );
    },

    cleanup(popup, handler, interval) {
      if (popup && !popup.closed) popup.close();
      if (handler) window.removeEventListener('message', handler);
      if (interval) clearInterval(interval);
    },

    // 🆕 Utility Methods
    isSmartContractEnabled() {
      return this.config.useSmartContract && 
             this.config.contractPackageId && 
             this.config.contractObjectId;
    },

    getPaymentMethods() {
      const methods = ['popup'];
      if (this.isSmartContractEnabled()) {
        methods.unshift('smart_contract');
      }
      return methods;
    },

    async checkWalletConnection() {
      try {
        // Check for any available Sui wallet
        const wallet = window.suiet || window.suiWallet || window.ethos || window.sui;
        if (!wallet) return false;
        
        let accounts;
        if (wallet.getAccounts) {
          accounts = await wallet.getAccounts();
        } else if (wallet.accounts) {
          accounts = wallet.accounts;
        } else {
          return false;
        }
        
        return accounts && accounts.length > 0;
      } catch {
        return false;
      }
    },

    // Utility method to check if SuiFlow is available
    isAvailable() {
      return typeof window !== 'undefined';
    },

    // Get SDK version
    version: '1.1.0'
  };

  window.Suiflow = Suiflow;
})(window);
