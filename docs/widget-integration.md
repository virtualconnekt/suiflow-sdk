# SuiFlow Payment Widget Documentation

## Overview
The SuiFlow Payment Widget allows you to integrate cryptocurrency payments directly into any website with just a few lines of code. Users can pay any custom amount in SUI tokens, and payments are automatically verified on the blockchain.

## Quick Start

### 1. Include the SDK
```html
<script src="https://your-suiflow-domain.com/sdk/suiflow.js"></script>
```

### 2. Add Payment Button
```html
<input type="number" id="amount" placeholder="Enter amount" min="0.01" step="0.01" />
<button onclick="payWithWidget()">Pay with SuiFlow</button>
```

### 3. Implement Payment Function
```javascript
function payWithWidget() {
  const amount = parseFloat(document.getElementById('amount').value);
  
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID', // Get from dashboard
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
      alert('Payment successful! Amount: ' + paidAmount + ', Tx: ' + txHash);
      // Handle successful payment - update user balance, credits, etc.
    }
  });
}
```

## Widget API Reference

### `Suiflow.payWithWidget(options)`

Opens a payment popup where users can connect their wallet and pay the specified amount.

**Parameters:**
- `options` (Object):
  - `merchantId` (string, required): Your merchant ID from the SuiFlow dashboard
  - `amount` (number, required): Payment amount in SUI tokens
  - `onSuccess` (function, optional): Callback function called after successful payment

**onSuccess Callback:**
- `txHash` (string): Blockchain transaction hash
- `paidAmount` (number): Actual amount paid in SUI

## Use Cases

### 1. Digital Content Sales
```javascript
function buyContent(contentId, price) {
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: price,
    onSuccess: function(txHash, paidAmount) {
      // Unlock content for user
      unlockContent(contentId);
      showThankYou(txHash);
    }
  });
}
```

### 2. Service Credits/Top-up
```javascript
function topUpCredits() {
  const amount = document.getElementById('topup-amount').value;
  
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: parseFloat(amount),
    onSuccess: function(txHash, paidAmount) {
      // Add credits to user account
      addCredits(paidAmount * 100); // 1 SUI = 100 credits
      updateUI();
    }
  });
}
```

### 3. Donation/Tip System
```javascript
function tipCreator(creatorId) {
  const tipAmount = document.getElementById('tip-amount').value;
  
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: parseFloat(tipAmount),
    onSuccess: function(txHash, paidAmount) {
      // Record tip in database
      recordTip(creatorId, paidAmount, txHash);
      showTipConfirmation();
    }
  });
}
```

## Integration Examples

### E-commerce Checkout
```html
<div class="checkout-widget">
  <h3>Pay with Cryptocurrency</h3>
  <div>
    <label>Amount: $<span id="usd-amount">10.00</span></label>
    <input type="hidden" id="sui-amount" value="0.5" />
  </div>
  <button onclick="payWithCrypto()" class="crypto-pay-btn">
    Pay 0.5 SUI
  </button>
</div>

<script>
function payWithCrypto() {
  const suiAmount = parseFloat(document.getElementById('sui-amount').value);
  
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: suiAmount,
    onSuccess: function(txHash, paidAmount) {
      // Complete the order
      completeOrder(txHash);
      redirectToSuccess();
    }
  });
}
</script>
```

### Subscription Service
```html
<div class="subscription-plans">
  <div class="plan" data-price="1.0">
    <h4>Basic Plan</h4>
    <p>1 SUI/month</p>
    <button onclick="subscribe(1.0)">Subscribe</button>
  </div>
  <div class="plan" data-price="2.5">
    <h4>Premium Plan</h4>
    <p>2.5 SUI/month</p>
    <button onclick="subscribe(2.5)">Subscribe</button>
  </div>
</div>

<script>
function subscribe(amount) {
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
      // Activate subscription
      activateSubscription(txHash, paidAmount);
      showWelcomeMessage();
    }
  });
}
</script>
```

## Best Practices

### 1. Validation
Always validate the amount before calling the widget:
```javascript
function payWithWidget() {
  const amount = parseFloat(document.getElementById('amount').value);
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  if (amount < 0.01) {
    alert('Minimum payment is 0.01 SUI');
    return;
  }
  
  // Proceed with payment...
}
```

### 2. Error Handling
```javascript
function payWithWidget() {
  try {
    Suiflow.payWithWidget({
      merchantId: 'YOUR_MERCHANT_ID',
      amount: amount,
      onSuccess: function(txHash, paidAmount) {
        // Handle success
      }
    });
  } catch (error) {
    console.error('Payment widget error:', error);
    alert('Payment system temporarily unavailable');
  }
}
```

### 3. User Feedback
Provide clear feedback during the payment process:
```javascript
function payWithWidget() {
  const button = document.getElementById('pay-button');
  button.textContent = 'Processing...';
  button.disabled = true;
  
  Suiflow.payWithWidget({
    merchantId: 'YOUR_MERCHANT_ID',
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
      button.textContent = 'Payment Successful!';
      // Reset after 3 seconds
      setTimeout(() => {
        button.textContent = 'Pay with SuiFlow';
        button.disabled = false;
      }, 3000);
    }
  });
}
```

## Security Notes

1. **Never expose sensitive data**: Don't include private keys or sensitive merchant data in client-side code
2. **Verify on backend**: Always verify payments on your backend server using the transaction hash
3. **Use HTTPS**: Ensure your website uses HTTPS for secure communication
4. **Amount validation**: Validate payment amounts on both client and server side

## Troubleshooting

### Widget doesn't open
- Check that the SuiFlow SDK is properly loaded
- Verify the merchant ID is correct
- Ensure the amount is a valid number

### Payment not detected
- Wait a few seconds for blockchain confirmation
- Check the transaction hash on a Sui blockchain explorer
- Verify the merchant wallet address is correct

## Support

For technical support or questions:
- Check the SuiFlow dashboard for payment status
- Review transaction history in your merchant account
- Contact support with transaction hash for specific payment issues
