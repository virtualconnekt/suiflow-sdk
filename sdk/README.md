# SuiFlow SDK

🚀 **Easy blockchain payments for your web applications**

SuiFlow SDK enables seamless integration of Sui blockchain payments into any website or web application. Accept crypto payments with just a few lines of code!

Built by [VirtualConnekt](https://virtualconnekt.com.ng) - Powering the future of digital payments.

## ✨ Features

- 🔥 **Simple Integration** - Add payments in minutes
- 💳 **Widget Payments** - Customizable payment popup
- 🛍️ **Product Payments** - Pre-configured product purchases  
- 🔒 **Secure** - Built-in transaction verification
- 📱 **Mobile Friendly** - Works on all devices
- 🌐 **Universal** - Works with any website
- ⚡ **Fast** - Instant payment confirmation
- 🇳🇬 **Nigerian-Optimized** - Built for the African market

## 📦 Installation

### NPM
```bash
npm install suiflow-sdk
```

### Yarn
```bash
yarn add suiflow-sdk
```

### CDN
```html
<script src="https://unpkg.com/suiflow-sdk/dist/suiflow.js"></script>
```

## Environment Variables Setup

Create a `.env` file in your project root:

```env
# SuiFlow Configuration
SUIFLOW_MERCHANT_ID=your-merchant-id-here
SUIFLOW_PRODUCT_ID=your-product-id-here
SUIFLOW_API_URL=https://suiflow.virtualconnekt.com.ng
```

For **Node.js** applications:
```javascript
require('dotenv').config();
const merchantId = process.env.SUIFLOW_MERCHANT_ID;
```

For **React/Vite** applications, use `VITE_` prefix:
```env
VITE_SUIFLOW_MERCHANT_ID=your-merchant-id-here
```
```javascript
const merchantId = import.meta.env.VITE_SUIFLOW_MERCHANT_ID;
```

For **Next.js** applications:
```env
NEXT_PUBLIC_SUIFLOW_MERCHANT_ID=your-merchant-id-here
```
```javascript
const merchantId = process.env.NEXT_PUBLIC_SUIFLOW_MERCHANT_ID;
```

## Quick Start

### 1. Get Your Merchant ID

Visit [SuiFlow Dashboard](https://suiflow.virtualconnekt.com.ng) to:
- Create your merchant account
- Get your unique merchant ID
- Configure your payment settings

### 2. Initialize Payment

```javascript
// ⚠️ SECURITY BEST PRACTICE: Store merchant ID in environment variables
const MERCHANT_ID = process.env.SUIFLOW_MERCHANT_ID; // From .env file

// Widget Payment (custom amount)
Suiflow.payWithWidget({
    merchantId: MERCHANT_ID, // Use environment variable
    amount: 1.5, // Amount in SUI
    onSuccess: function(txHash, paidAmount) {
        console.log('Payment successful!', txHash);
        // Update your application state
    },
    onError: function(error) {
        console.error('Payment failed:', error);
    }
});

// Product Payment (pre-configured)
Suiflow.init({
    productId: process.env.SUIFLOW_PRODUCT_ID, // Also from .env
    onSuccess: function(txHash) {
        console.log('Product purchased!', txHash);
        // Grant access to purchased item
    }
});
```

### 3. Add to Your HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Store</title>
</head>
<body>
    <button id="payButton">Pay with Crypto</button>
    
    <script src="https://unpkg.com/suiflow-sdk/dist/suiflow.js"></script>
    <script>
        // ⚠️ For production, fetch merchant ID from your backend API
        // to keep it secure and not expose in client-side code
        
        document.getElementById('payButton').onclick = function() {
            // Option 1: Fetch from your backend API (recommended)
            fetch('/api/payment-config')
                .then(res => res.json())
                .then(config => {
                    Suiflow.payWithWidget({
                        merchantId: config.merchantId, // From your secure backend
                        amount: 10.0,
                        onSuccess: function(txHash, amount) {
                            alert(`Payment successful! Paid ${amount} SUI`);
                        }
                    });
                });
            
            // Option 2: Direct usage (only for testing)
            // Suiflow.payWithWidget({
            //     merchantId: 'your-merchant-id-here',
            //     amount: 10.0,
            //     onSuccess: function(txHash, amount) {
            //         alert(`Payment successful! Paid ${amount} SUI`);
            //     }
            // });
        };
    </script>
</body>
</html>
```

## 📖 API Reference

### `Suiflow.payWithWidget(options)`

Create a custom amount payment.

**Parameters:**
- `merchantId` (string) - Your SuiFlow merchant ID
- `amount` (number) - Payment amount in SUI
- `onSuccess` (function) - Called when payment succeeds
- `onError` (function) - Called when payment fails

```javascript
Suiflow.payWithWidget({
    merchantId: '687b8e4455ee9491cb288826',
    amount: 5.0,
    onSuccess: (txHash, paidAmount) => {
        console.log('Success:', { txHash, paidAmount });
    },
    onError: (error) => {
        console.error('Error:', error);
    }
});
```

### `Suiflow.init(options)`

Initialize a product-based payment.

**Parameters:**
- `productId` (string) - Your product ID from SuiFlow dashboard
- `onSuccess` (function) - Called when purchase succeeds

```javascript
Suiflow.init({
    productId: 'product-123',
    onSuccess: (txHash) => {
        console.log('Product purchased:', txHash);
    }
});
```

## � Security Best Practices

### Environment Variables
- **Always** store merchant IDs in environment variables, never hardcode them
- Use different merchant IDs for development and production
- Copy `.env.example` to `.env` and fill with your actual values
- Add `.env` to your `.gitignore` file

### Client-Side vs Server-Side
```bash
# ❌ DON'T: Expose merchant ID directly in client code
const merchantId = 'merchant_12345_secret';

# ✅ DO: Fetch from your secure backend
fetch('/api/payment-config').then(res => res.json());
```

### Backend API Example
Create an endpoint that provides configuration:

```javascript
// server.js
app.get('/api/payment-config', authenticateUser, (req, res) => {
    res.json({
        merchantId: process.env.SUIFLOW_MERCHANT_ID,
        // Only return merchant ID for authenticated users
        userId: req.user.id
    });
});
```

## �🛠️ Advanced Usage

### Configuration Helper

For easier environment variable management, use our configuration helper:

```javascript
// Download suiflow-config.js from our GitHub repo
import SuiFlowConfig from './suiflow-config.js';

const config = new SuiFlowConfig();

// Automatically loads environment variables for your framework
const paymentOptions = config.getPaymentOptions(10.0, {
    onSuccess: (txHash, amount) => {
        console.log(`Payment successful! TX: ${txHash}, Amount: ${amount} SUI`);
    },
    onError: (error) => {
        console.error('Payment failed:', error);
    }
});

Suiflow.payWithWidget(paymentOptions);
```

### TypeScript Support

```typescript
import SuiFlow, { PaymentOptions, PaymentResult } from 'suiflow-sdk';

const paymentOptions: PaymentOptions = {
    merchantId: 'your-merchant-id',
    amount: 1.0,
    onSuccess: (txHash: string, amount: number) => {
        // Handle success
    },
    onError: (error: string) => {
        // Handle error
    }
};

SuiFlow.payWithWidget(paymentOptions);
```

### React Integration

```jsx
import React from 'react';
import SuiFlow from 'suiflow-sdk';

function PaymentButton({ amount, onPaymentSuccess }) {
    const handlePayment = () => {
        SuiFlow.payWithWidget({
            merchantId: process.env.REACT_APP_SUIFLOW_MERCHANT_ID,
            amount: amount,
            onSuccess: (txHash, paidAmount) => {
                onPaymentSuccess(txHash, paidAmount);
            },
            onError: (error) => {
                alert(`Payment failed: ${error}`);
            }
        });
    };

    return (
        <button onClick={handlePayment}>
            Pay {amount} SUI
        </button>
    );
}
```

### Vue.js Integration

```vue
<template>
    <button @click="handlePayment">Pay {{ amount }} SUI</button>
</template>

<script>
import SuiFlow from 'suiflow-sdk';

export default {
    props: ['amount'],
    methods: {
        handlePayment() {
            SuiFlow.payWithWidget({
                merchantId: process.env.VUE_APP_SUIFLOW_MERCHANT_ID,
                amount: this.amount,
                onSuccess: (txHash, paidAmount) => {
                    this.$emit('payment-success', { txHash, paidAmount });
                },
                onError: (error) => {
                    this.$emit('payment-error', error);
                }
            });
        }
    }
};
</script>
```

## 🔧 Configuration

### Environment Setup

Create a `.env` file in your project:

```env
SUIFLOW_MERCHANT_ID=your-merchant-id-here
SUIFLOW_ENVIRONMENT=testnet
```

### Webpack Configuration

If using Webpack, you might need to configure it for browser compatibility:

```javascript
// webpack.config.js
module.exports = {
    resolve: {
        fallback: {
            "crypto": false,
            "stream": false,
            "buffer": false
        }
    }
};
```

## 🎯 Use Cases

- **E-commerce stores** - Accept crypto payments
- **SaaS platforms** - Subscription payments
- **Gaming** - In-game purchases
- **Content creators** - Tips and donations
- **Marketplaces** - Peer-to-peer transactions
- **Educational platforms** - Course purchases

## 🔒 Security

- All transactions are verified on the Sui blockchain
- No private keys are handled by the SDK
- Payments are processed through secure popup windows
- Built-in protection against common web vulnerabilities

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Support

The SDK works seamlessly on mobile devices:

```javascript
// Mobile-optimized payment
Suiflow.payWithWidget({
    merchantId: 'your-merchant-id',
    amount: 1.0,
    // Mobile wallets will automatically open
    onSuccess: (txHash, amount) => {
        // Show mobile-friendly success message
        showMobileSuccessToast(`Payment of ${amount} SUI completed!`);
    }
});
```

## 🧪 Testing

### Test Environment

```javascript
// Use testnet for development
Suiflow.payWithWidget({
    merchantId: 'your-test-merchant-id',
    amount: 0.01, // Small amount for testing
    environment: 'testnet', // Optional: defaults to testnet
    onSuccess: (txHash, amount) => {
        console.log('Test payment successful!');
    }
});
```

### Mock Payments

For testing without actual blockchain transactions:

```javascript
// Enable mock mode for unit tests
Suiflow.setMockMode(true);

Suiflow.payWithWidget({
    merchantId: 'test-merchant',
    amount: 1.0,
    onSuccess: (txHash, amount) => {
        // This will be called immediately in mock mode
        expect(amount).toBe(1.0);
        expect(txHash).toMatch(/^mock_/);
    }
});
```

## 🔗 Links

- [SuiFlow Dashboard](https://dashboard.suiflow.com) - Manage your account
- [Documentation](https://docs.suiflow.com) - Full documentation
- [GitHub](https://github.com/suiflow/suiflow-sdk) - Source code
- [Support](https://support.suiflow.com) - Get help

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- 📧 Email: support@suiflow.com
- 💬 Discord: [SuiFlow Community](https://discord.gg/suiflow)
- 📖 Docs: [docs.suiflow.com](https://docs.suiflow.com)
- 🐛 Issues: [GitHub Issues](https://github.com/suiflow/suiflow-sdk/issues)

---

**Made with ❤️ by the SuiFlow Team**
