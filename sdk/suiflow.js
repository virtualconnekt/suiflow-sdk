(function(window) {
  const Suiflow = {
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