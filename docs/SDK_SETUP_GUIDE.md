# SuiFlow SDK Setup Guide

## 📋 Prerequisites

Before setting up the SuiFlow SDK, ensure you have:

1. **A SuiFlow merchant account** with a valid merchant ID
2. **Basic web development knowledge** (HTML, CSS, JavaScript)
3. **A web server** to serve your files (local development server or hosting)
4. **Sui wallet** installed (recommended: Suiet wallet)

## 🚀 Step-by-Step Setup

### Step 1: Download the SDK

1. Navigate to your project directory
2. Copy the SuiFlow SDK file (`suiflow.js`) to your project
3. Place it in a `sdk/` folder or any accessible directory

```
your-project/
├── index.html
├── sdk/
│   └── suiflow.js
└── styles.css
```

### Step 2: Include the SDK in Your HTML

Add the SDK script tag to your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
</head>
<body>
    <!-- Your content here -->
    
    <!-- Include SuiFlow SDK -->
    <script src="sdk/suiflow.js"></script>
</body>
</html>
```

### Step 3: Get Your Merchant ID

1. Log into your SuiFlow merchant dashboard
2. Navigate to **Settings** or **Account** section
3. Copy your **Merchant ID** (format: `687b8e4455ee9491cb288826`)
4. Keep this ID secure and use it in your integration

### Step 4: Basic Payment Integration

Create a simple payment button:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuiFlow Payment Demo</title>
    <style>
        .payment-container {
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            background: white;
        }
        
        .payment-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
            transition: transform 0.2s;
        }
        
        .payment-button:hover {
            transform: translateY(-2px);
        }
        
        .amount-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .amount-input:focus {
            outline: none;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <h2>Make a Payment</h2>
        <input type="number" 
               id="amount" 
               class="amount-input"
               placeholder="Enter amount (SUI)" 
               min="0.01" 
               step="0.01" 
               value="0.1" />
        
        <button id="payBtn" class="payment-button">
            💳 Pay with SuiFlow
        </button>
        
        <div id="status" style="margin-top: 15px; padding: 10px; border-radius: 5px; display: none;"></div>
    </div>

    <!-- Include SuiFlow SDK -->
    <script src="sdk/suiflow.js"></script>
    
    <script>
        // Replace with your actual merchant ID
        const MERCHANT_ID = '687b8e4455ee9491cb288826';
        
        document.getElementById('payBtn').onclick = function() {
            const amount = parseFloat(document.getElementById('amount').value);
            const statusDiv = document.getElementById('status');
            
            // Validate amount
            if (!amount || amount <= 0) {
                showStatus('Please enter a valid amount', 'error');
                return;
            }
            
            // Show processing status
            showStatus('Opening payment window...', 'info');
            
            // Initialize SuiFlow payment
            Suiflow.payWithWidget({
                merchantId: MERCHANT_ID,
                amount: amount,
                onSuccess: function(txHash, paidAmount) {
                    showStatus(`Payment successful! Amount: ${paidAmount} SUI, Transaction: ${txHash}`, 'success');
                    console.log('Payment completed:', { txHash, paidAmount });
                    
                    // Here you can call your backend to update user balance
                    // updateUserBalance(paidAmount);
                },
                onError: function(error) {
                    showStatus(`Payment failed: ${error}`, 'error');
                    console.error('Payment error:', error);
                }
            });
        };
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.style.display = 'block';
            statusDiv.textContent = message;
            
            // Style based on type
            if (type === 'success') {
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusDiv.style.border = '1px solid #c3e6cb';
            } else if (type === 'error') {
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.style.border = '1px solid #f5c6cb';
            } else {
                statusDiv.style.background = '#d1ecf1';
                statusDiv.style.color = '#0c5460';
                statusDiv.style.border = '1px solid #bee5eb';
            }
        }
    </script>
</body>
</html>
```

### Step 5: Advanced Integration Options

#### A. Product-Based Payments

For selling specific products:

```javascript
// For pre-defined products
Suiflow.init({
    productId: 'your-product-id-here',
    onSuccess: function(txHash) {
        console.log('Product purchased!', txHash);
        // Update UI to show purchase confirmation
    }
});
```

#### B. Custom Amount Payments

For flexible amount payments:

```javascript
// For custom amounts (like top-ups, donations)
Suiflow.payWithWidget({
    merchantId: 'your-merchant-id',
    amount: 1.5, // Amount in SUI
    onSuccess: function(txHash, paidAmount) {
        console.log('Payment completed:', paidAmount, 'SUI');
        // Update user's balance or credits
    }
});
```

#### C. Backend Integration

After successful payment, update your backend:

```javascript
async function handlePaymentSuccess(txHash, amount) {
    try {
        const response = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transactionHash: txHash,
                amount: amount,
                userId: getCurrentUserId() // Your user identification
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Backend updated:', result);
            // Update UI to reflect new balance
        }
    } catch (error) {
        console.error('Backend update failed:', error);
    }
}
```

### Step 6: Testing Your Integration

1. **Start your local server**:
   ```bash
   # Using Node.js
   npx serve .
   
   # Using Python
   python -m http.server 8000
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open your website** in a browser
3. **Test the payment flow**:
   - Enter a small amount (e.g., 0.01 SUI)
   - Click the payment button
   - Verify the popup opens
   - Complete the test payment

### Step 7: Production Deployment

#### Update Configuration for Production

1. **Update API endpoints** in the SDK (if using custom backend)
2. **Use HTTPS** for your website
3. **Validate merchant ID** is correct for production
4. **Test with real payments** using small amounts

#### Security Best Practices

```javascript
// Validate inputs
function validatePaymentAmount(amount) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid payment amount');
    }
    if (numAmount > 1000) { // Set reasonable limits
        throw new Error('Amount too large');
    }
    return numAmount;
}

// Use environment variables for configuration
const CONFIG = {
    merchantId: process.env.SUIFLOW_MERCHANT_ID || 'your-fallback-id',
    apiUrl: process.env.SUIFLOW_API_URL || 'https://api.suiflow.com'
};
```

## 🔧 Troubleshooting

### Common Issues

1. **"SDK not found" error**:
   - Check the script path in your HTML
   - Ensure the SDK file is accessible
   - Verify your web server is running

2. **"Merchant ID invalid" error**:
   - Double-check your merchant ID
   - Ensure you're using the correct environment (test/production)

3. **Payment popup blocked**:
   - Ensure payment is triggered by user interaction
   - Check browser popup blocker settings

4. **Network connection errors**:
   - Verify internet connection
   - Check if Sui testnet is accessible
   - Try again later if testnet is experiencing issues

### Debug Mode

Add debug logging to your integration:

```javascript
// Enable debug mode
const DEBUG = true;

function debugLog(message, data) {
    if (DEBUG) {
        console.log('[SuiFlow Debug]', message, data);
    }
}

// Use in your payment handler
Suiflow.payWithWidget({
    merchantId: MERCHANT_ID,
    amount: amount,
    onSuccess: function(txHash, paidAmount) {
        debugLog('Payment Success', { txHash, paidAmount });
        // ... handle success
    }
});
```

## 📚 Next Steps

1. **Explore the dashboard** to manage payments and view analytics
2. **Set up webhooks** for real-time payment notifications
3. **Implement error handling** for production use
4. **Add payment confirmation** emails or notifications
5. **Test thoroughly** with different amounts and scenarios

## 🎯 Use Cases

- **E-commerce websites**: Product purchases
- **SaaS platforms**: Subscription payments
- **Gaming**: In-game currency top-ups
- **Content platforms**: Pay-per-view or premium access
- **Donations**: Charity or creator support
- **Marketplaces**: Peer-to-peer transactions

## 📞 Support

If you encounter issues:
- Check the browser console for error messages
- Verify your merchant ID and configuration
- Test with the offline demo for troubleshooting
- Contact SuiFlow support with specific error details

---

**🎉 Congratulations!** You've successfully set up the SuiFlow SDK. Your website can now accept Sui blockchain payments!
