## ⚠️ Hard-Locked Smart Contract Configuration

> **Important:**
>
> The following smart contract settings are hard-locked in the SDK and **cannot be changed** by any means (not via `.env`, not via the constructor, and not via `configure()`):
>
> - `contractPackageId`: `0xce43cd5a753080bb1546a3b575ca48892204699b580d89df5f384ca77da4641a0`
> - `contractObjectId`: `0x33baa75593ccc45a8edd06798ff6f0319d43287968590a90c3c593ff55b23574`
> - `rpcUrl`: `https://fullnode.testnet.sui.io:443`
> - `adminAddress`: `0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973bd95b2af702cbea6bc2a0f28`
>
> Any attempt to override these values will be ignored and a warning will be shown in the console. All contract-related features always use these official values.

---

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
- 📦 **Multiple Formats** - UMD, ES Modules, and CommonJS builds
- 🔧 **TypeScript Support** - Full type definitions included

## 📦 Installation

### NPM
```bash
npm install suiflow-sdk
```

### Yarn
```bash
yarn add suiflow-sdk
```

### Local Development Installation
If you're developing locally or want to install from the SDK source:

```bash
# Install from local directory
npm install /path/to/suiflow-sdk

# Or from tarball
npm install /path/to/suiflow-sdk-1.0.0.tgz

# For active development (creates symlink)
cd /path/to/suiflow-sdk
npm link
cd /path/to/your-project
npm link suiflow-sdk
```

### CDN
```html
<!-- UMD build for direct browser usage -->
<script src="https://unpkg.com/suiflow-sdk/dist/suiflow.js"></script>
```

## 🚀 Import Methods

### ES Modules (Recommended)
```javascript
import { SuiFlow } from 'suiflow-sdk';
import { SuiFlowProvider } from 'suiflow-sdk/react';
```

### CommonJS
```javascript
const { SuiFlow } = require('suiflow-sdk');
```

### UMD (Browser)
```html
<script src="https://unpkg.com/suiflow-sdk/dist/suiflow.js"></script>
<script>
    // Global Suiflow object is available
    Suiflow.payWithWidget({ /* options */ });
</script>
```

## Environment Variables Setup

Create a `.env` file in your project root:

```env
# SuiFlow Configuration
SUIFLOW_MERCHANT_ID=your-merchant-id-here
SUIFLOW_PRODUCT_ID=your-product-id-here ||optional||
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
    merchantId: 'your suiflow merchant id',
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
import { SuiFlowConfig } from 'suiflow-sdk';

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

SuiFlow.payWithWidget(paymentOptions);
```

### TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { SuiFlow, PaymentOptions, PaymentResult } from 'suiflow-sdk';
import { SuiFlowProvider } from 'suiflow-sdk/react';

// Type-safe payment options
const paymentOptions: PaymentOptions = {
    merchantId: 'your-merchant-id',
    amount: 1.0,
    onSuccess: (txHash: string, amount: number) => {
        // Handle success with full type safety
    },
    onError: (error: string) => {
        // Handle error
    }
};

SuiFlow.payWithWidget(paymentOptions);
```

### Available Types

```typescript
// Main payment interface
interface PaymentOptions {
    merchantId: string;
    amount: number;
    onSuccess: (txHash: string, paidAmount: number) => void;
    onError: (error: string) => void;
}

// Wallet integration types
interface WalletConnection {
    address: string;
    isConnected: boolean;
}

// React provider props
interface SuiFlowProviderProps {
    children: React.ReactNode;
    config?: SuiFlowConfig;
}
```

### React Integration

```jsx
import React from 'react';
import { SuiFlow } from 'suiflow-sdk';
import { SuiFlowProvider } from 'suiflow-sdk/react';

// Using the React Provider (Recommended for React apps)
function App() {
    return (
        <SuiFlowProvider>
            <PaymentComponent />
        </SuiFlowProvider>
    );
}

// Or direct usage
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
import { SuiFlow } from 'suiflow-sdk';

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

## 🛠️ Development & Building

### For SDK Contributors

If you're contributing to the SDK or need to build it locally:

```bash
# Clone the repository
git clone https://github.com/virtualconnekt/suiflow-sdk.git
cd suiflow-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Watch for changes during development
npm run dev
# or
npm run build:watch
```

### Build Output

The build process creates multiple formats:

- `dist/suiflow.js` - UMD build for browsers (with sourcemap)
- `dist/suiflow.esm.js` - ES Modules build (with sourcemap)  
- `dist/suiflow.cjs.js` - CommonJS build (with sourcemap)
- `dist/` - TypeScript declaration files (.d.ts)

### After Making Changes

When you modify the SDK source code:

1. **Rebuild the SDK**: `npm run build`
2. **If using npm link**: Changes are automatically available in linked projects
3. **If installed locally**: Reinstall in your project:
   ```bash
   npm install /path/to/suiflow-sdk
   ```

### Package Scripts

- `npm run build` - Build once
- `npm run build:watch` - Build and watch for changes
- `npm run dev` - Alias for build:watch
- `npm run clean` - Clean the dist folder

## 🔧 Configuration

### Environment Setup

You may use a `.env` file for merchant and environment settings (see `.env.example`), but **contract settings are always hard-locked** and cannot be changed.

```env
# Only these are configurable:
SUIFLOW_MERCHANT_ID=your-merchant-id-here
SUIFLOW_ENVIRONMENT=testnet
SUIFLOW_BASE_URL=http://localhost:5173
SUIFLOW_ADMIN_FEE=0.01
```

> **Note:**
> The following are **not** configurable and will always use the official values:
> - `SUIFLOW_PACKAGE_ID`
> - `SUIFLOW_PROCESSOR_OBJECT_ID`
> - `SUIFLOW_RPC_URL`
> - `SUIFLOW_ADMIN_ADDRESS`

### Peer Dependencies

The SDK requires these peer dependencies in your project:

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "@mysten/dapp-kit": "^0.17.1",
    "@mysten/sui": "^1.37.0",
    "@tanstack/react-query": "^5.83.0"
  }
}
```

Install them in your project:

```bash
npm install react react-dom @mysten/dapp-kit @mysten/sui @tanstack/react-query
```

### Build Configuration

The SDK is built with Rollup and provides three formats:

- **UMD**: For direct browser usage (includes all dependencies except React)
- **ES Modules**: For modern bundlers (external dependencies)
- **CommonJS**: For Node.js environments (external dependencies)

External dependencies (React, Sui libraries) are not bundled and must be provided by your application.

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
import { SuiFlow } from 'suiflow-sdk';

SuiFlow.payWithWidget({
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
import { SuiFlow } from 'suiflow-sdk';

SuiFlow.setMockMode(true);

SuiFlow.payWithWidget({
    merchantId: 'test-merchant',
    amount: 1.0,
    onSuccess: (txHash, amount) => {
        // This will be called immediately in mock mode
        expect(amount).toBe(1.0);
        expect(txHash).toMatch(/^mock_/);
    }
});
```

### Local Development Testing

When testing with a locally built SDK:

```bash
# Build the SDK
npm run build

# Test in watch mode (rebuilds on changes)
npm run dev

# In your test project, reinstall the local SDK
npm install /path/to/suiflow-sdk
```

## 🔗 Links

- [SuiFlow Dashboard](https://suiflow.virtualconnekt.com.ng) - Manage your account
- [Documentation](https://docs.suiflow.virtualconnekt.com.ng) - Full documentation
- [GitHub](https://github.com/virtualconnekt/suiflow-sdk) - Source code
- [Support](https://support.virtualconnekt.com.ng) - Get help
- [VirtualConnekt](https://virtualconnekt.com.ng) - Our main website

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test: `npm run build`
5. Submit a pull request

## 📞 Support

- 📧 Email: support@virtualconnekt.com.ng
- 💬 Discord: [SuiFlow Community](https://discord.gg/suiflow)
- 📖 Docs: [docs.suiflow.virtualconnekt.com.ng](https://docs.suiflow.virtualconnekt.com.ng)
- 🐛 Issues: [GitHub Issues](https://github.com/virtualconnekt/suiflow-sdk/issues)
- x  x.com: [x community](@virtual_connekt)

---
**Made with ❤️ by the VirtualConnekt Team**
