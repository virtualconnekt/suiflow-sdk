# 🚀 SuiFlow SDK Quick Setup with Environment Variables

This guide shows how to securely integrate SuiFlow payments using environment variables.

## 📋 Prerequisites

1. **Get Your Merchant ID**: Register at [SuiFlow Dashboard](https://suiflow.virtualconnekt.com.ng)
2. **Install SDK**: `npm install suiflow-sdk`

## 🔧 Step-by-Step Setup

### 1. Environment Configuration

Copy the environment template:
```bash
cp node_modules/suiflow-sdk/.env.example .env
```

Edit `.env` file:
```env
# Your actual merchant ID from SuiFlow dashboard
SUIFLOW_MERCHANT_ID=your-real-merchant-id-here
```

**⚠️ Important**: Add `.env` to your `.gitignore`:
```bash
echo ".env" >> .gitignore
```

### 2. Framework-Specific Setup

#### **React/Vite Projects**
```env
# .env
VITE_SUIFLOW_MERCHANT_ID=your-merchant-id
```

```jsx
// PaymentComponent.jsx
import { useState } from 'react';

function PaymentButton() {
    const merchantId = import.meta.env.VITE_SUIFLOW_MERCHANT_ID;
    
    const handlePayment = () => {
        window.Suiflow.payWithWidget({
            merchantId: merchantId, // From environment
            amount: 5.0,
            onSuccess: (txHash, amount) => {
                alert(`Payment successful! TX: ${txHash}`);
            }
        });
    };
    
    return <button onClick={handlePayment}>Pay 5 SUI</button>;
}
```

#### **Next.js Projects**
```env
# .env.local
NEXT_PUBLIC_SUIFLOW_MERCHANT_ID=your-merchant-id
```

```jsx
// components/PaymentButton.js
export default function PaymentButton() {
    const merchantId = process.env.NEXT_PUBLIC_SUIFLOW_MERCHANT_ID;
    
    const handlePayment = () => {
        window.Suiflow.payWithWidget({
            merchantId: merchantId,
            amount: 3.0,
            onSuccess: (txHash) => console.log('Success:', txHash)
        });
    };
    
    return <button onClick={handlePayment}>Pay 3 SUI</button>;
}
```

#### **Node.js/Express Backend**
```javascript
// server.js
require('dotenv').config();
const express = require('express');
const app = express();

// Secure endpoint to provide merchant config
app.get('/api/payment-config', authenticateUser, (req, res) => {
    res.json({
        merchantId: process.env.SUIFLOW_MERCHANT_ID, // From .env
        maxAmount: 100.0
    });
});

// Frontend fetches config from this secure endpoint
app.use(express.static('public'));
```

### 3. Using Configuration Helper

Download and use our configuration helper:

```javascript
// Import the helper
import SuiFlowConfig from 'suiflow-sdk/suiflow-config.js';

// Automatically handles environment variables
const config = new SuiFlowConfig();

// Create payment with auto-loaded config
const paymentOptions = config.getPaymentOptions(10.0, {
    onSuccess: (txHash, amount) => {
        console.log(`Paid ${amount} SUI successfully!`);
        // Update your app state here
    },
    onError: (error) => {
        console.error('Payment failed:', error);
        // Handle error in your app
    }
});

// Execute payment
Suiflow.payWithWidget(paymentOptions);
```

## 🔒 Security Checklist

- ✅ Merchant ID stored in environment variables
- ✅ `.env` file added to `.gitignore`
- ✅ Different merchant IDs for dev/production
- ✅ Backend API provides config (for sensitive data)
- ✅ Never commit environment files to Git

## 🚀 Production Deployment

### Vercel
```bash
# Set environment variables in Vercel dashboard
VITE_SUIFLOW_MERCHANT_ID=prod_merchant_id
```

### Netlify
```bash
# Set in Netlify environment variables
VITE_SUIFLOW_MERCHANT_ID=prod_merchant_id
```

### Traditional Server
```bash
# Set in your server environment
export SUIFLOW_MERCHANT_ID=prod_merchant_id
```

## 🛠️ Testing

Test your setup:
```javascript
// Test configuration loading
const config = new SuiFlowConfig();
try {
    config.validateConfig();
    console.log('✅ Configuration valid!');
    console.log('Merchant ID:', config.getMerchantId());
} catch (error) {
    console.error('❌ Configuration error:', error.message);
}
```

## 📞 Support

- **Documentation**: [GitHub](https://github.com/virtualconnekt/suiflow-sdk)
- **Issues**: [Report bugs](https://github.com/virtualconnekt/suiflow-sdk/issues)
- **Email**: support@virtualconnekt.com.ng

---

**Ready to accept payments?** Your environment variables are now secure and your integration is production-ready! 🎉
