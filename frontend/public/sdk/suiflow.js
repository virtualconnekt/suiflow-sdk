(function(window) {
  const Suiflow = {
<<<<<<< HEAD
    // Configuration
    config: {
      baseUrl: 'https://suiflow.virtualconnekt.com.ng', // Production domain
      environment: 'production' // 'production' or 'development'
    },

    // Set custom configuration
    configure(options) {
      if (options.baseUrl) this.config.baseUrl = options.baseUrl;
      if (options.environment) this.config.environment = options.environment;
    },

    // Get the appropriate base URL
    getBaseUrl() {
      return this.config.baseUrl;
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

    payWithWidget({ merchantId, amount, onSuccess, onError }) {
      try {
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

        function handler(event) {
          // Check origin for security (optional but recommended)
          // if (event.origin !== 'https://suiflow.virtualconnekt.com.ng') return;
          
          if (event.data && event.data.suiflowSuccess) {
            if (typeof onSuccess === 'function') onSuccess(event.data.txHash, event.data.amount);
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

    // Utility method to check if SuiFlow is available
    isAvailable() {
      return typeof window !== 'undefined';
    },

    // Get SDK version
    version: '1.0.0'
  };

  window.Suiflow = Suiflow;
})(window); 
=======
    init({ productId, onSuccess }) {
      // Open payment page in a popup window
      const width = 440;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        `http://localhost:5173/pay/${productId}`,
        'SuiFlowPayment',
        `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`
      );

      // Listen for postMessage from the popup
      function handler(event) {
        // Optionally check event.origin
        if (event.data && event.data.suiflowSuccess) {
          if (typeof onSuccess === 'function') onSuccess(event.data.txHash);
          if (popup && !popup.closed) popup.close();
          window.removeEventListener('message', handler);
        }
      }
      window.addEventListener('message', handler);
    },

    payWithWidget({ merchantId, amount, onSuccess }) {
      let url = `http://localhost:5173/widget/pay?merchantId=${encodeURIComponent(merchantId)}`;
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
      function handler(event) {
        if (event.data && event.data.suiflowSuccess) {
          if (typeof onSuccess === 'function') onSuccess(event.data.txHash, event.data.amount);
          if (popup && !popup.closed) popup.close();
          window.removeEventListener('message', handler);
        }
      }
      window.addEventListener('message', handler);
    }
  };

  window.Suiflow = Suiflow;
})(window);
>>>>>>> 6410348db5499b85f0b5c65ea20b7f949b2289f1
