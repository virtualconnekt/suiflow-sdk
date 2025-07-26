# 📦 NPM Publishing Guide for SuiFlow SDK

## 🚀 Complete Setup for NPM Publication

I've created a complete npm package structure for your SuiFlow SDK! Here's what's been set up:

### 📁 New Package Structure

```
sdk/
├── package.json           # NPM package configuration
├── README.md              # Comprehensive documentation
├── LICENSE                # MIT license
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Build configuration
├── suiflow.d.ts          # Type definitions
├── src/
│   └── index.ts          # Modern TypeScript source
├── dist/                 # Built files (generated)
│   ├── suiflow.js        # UMD build
│   ├── suiflow.esm.js    # ES module build
│   ├── suiflow.cjs.js    # CommonJS build
│   └── suiflow.d.ts      # Type definitions
└── suiflow.js            # Your original file
```

## 🔧 Step-by-Step Publishing Process

### 1. Install Dependencies

```bash
cd sdk
npm install
```

### 2. Build the Package

```bash
npm run build
```

This creates optimized builds for:
- **UMD** (Universal Module Definition) - for script tags
- **ES Modules** - for modern bundlers
- **CommonJS** - for Node.js
- **TypeScript definitions** - for type safety

### 3. Test Locally

```bash
# Link package locally
npm link

# In another project, test it
npm link suiflow-sdk
```

### 4. Create NPM Account

```bash
npm adduser
# Follow prompts to create account
```

### 5. Publish to NPM

```bash
# First time publish
npm publish

# For updates
npm version patch  # or minor/major
npm publish
```

## 📝 Usage Examples After Publishing

### Installation by Users

```bash
npm install suiflow-sdk
```

### Modern JavaScript/TypeScript

```typescript
import SuiFlow from 'suiflow-sdk';

SuiFlow.payWithWidget({
    merchantId: 'your-merchant-id',
    amount: 1.0,
    onSuccess: (txHash, amount) => {
        console.log('Payment successful!', { txHash, amount });
    }
});
```

### React Integration

```jsx
import React from 'react';
import SuiFlow from 'suiflow-sdk';

function PayButton({ amount, merchantId }) {
    const handlePay = () => {
        SuiFlow.payWithWidget({
            merchantId,
            amount,
            onSuccess: (txHash, paidAmount) => {
                alert(`Paid ${paidAmount} SUI! Tx: ${txHash}`);
            }
        });
    };

    return <button onClick={handlePay}>Pay {amount} SUI</button>;
}
```

### Vue.js Integration

```vue
<template>
    <button @click="pay">Pay {{ amount }} SUI</button>
</template>

<script>
import SuiFlow from 'suiflow-sdk';

export default {
    props: ['amount', 'merchantId'],
    methods: {
        pay() {
            SuiFlow.payWithWidget({
                merchantId: this.merchantId,
                amount: this.amount,
                onSuccess: (txHash, amount) => {
                    this.$emit('payment-success', { txHash, amount });
                }
            });
        }
    }
};
</script>
```

### CDN Usage (No Build Tools)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Store</title>
</head>
<body>
    <button id="payBtn">Pay with Crypto</button>
    
    <script src="https://unpkg.com/suiflow-sdk/dist/suiflow.js"></script>
    <script>
        document.getElementById('payBtn').onclick = function() {
            Suiflow.payWithWidget({
                merchantId: 'your-merchant-id',
                amount: 5.0,
                onSuccess: function(txHash, amount) {
                    alert('Payment successful!');
                }
            });
        };
    </script>
</body>
</html>
```

## 🎯 Package Features

### ✨ What Users Get

1. **Easy Installation**: `npm install suiflow-sdk`
2. **TypeScript Support**: Full type definitions included
3. **Multiple Formats**: Works with any build system
4. **Tree Shaking**: Only imports what's needed
5. **Mock Mode**: Built-in testing capabilities
6. **Error Handling**: Comprehensive error management
7. **Modern API**: Promise-based and callback-based options

### 🔒 Built-in Features

- **Input Validation**: Prevents common integration errors
- **Popup Management**: Handles popup blockers gracefully
- **Message Handling**: Secure communication with payment window
- **Error Recovery**: Automatic cleanup and error reporting
- **Development Mode**: Mock payments for testing

## 📊 NPM Package Benefits

### For Developers Using Your SDK:

```bash
# Simple installation
npm install suiflow-sdk

# Automatic updates
npm update suiflow-sdk

# Version management
npm install suiflow-sdk@1.2.0
```

### For Framework Integration:

```javascript
// Webpack/Rollup automatically optimizes
import { payWithWidget } from 'suiflow-sdk';

// Only imports what's needed (tree shaking)
payWithWidget({ merchantId: 'abc', amount: 1.0, onSuccess: () => {} });
```

## 🔄 Update Process

### Releasing Updates

```bash
# Bug fixes
npm version patch    # 1.0.0 → 1.0.1

# New features  
npm version minor    # 1.0.0 → 1.1.0

# Breaking changes
npm version major    # 1.0.0 → 2.0.0

# Publish update
npm publish
```

### Semantic Versioning

- **Patch** (1.0.1): Bug fixes, no breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

## 📈 Marketing Your Package

### NPM Keywords

Your package includes these searchable keywords:
- `sui`, `blockchain`, `payment`, `crypto`
- `web3`, `suiflow`, `sdk`, `javascript`
- `typescript`, `payments`

### GitHub Integration

Link your npm package to GitHub repository:
- Automatic documentation hosting
- Issue tracking
- Version release notes
- Community contributions

## 🎉 Launch Checklist

- [ ] **Install dependencies**: `npm install`
- [ ] **Build package**: `npm run build`
- [ ] **Test locally**: `npm link` and test
- [ ] **Create npm account**: `npm adduser`
- [ ] **Publish**: `npm publish`
- [ ] **Update documentation**: Add npm install instructions
- [ ] **Announce**: Share on social media, forums
- [ ] **Monitor**: Watch for issues and feedback

## 🔗 Resources

- **NPM Registry**: https://www.npmjs.com/package/suiflow-sdk
- **Unpkg CDN**: https://unpkg.com/suiflow-sdk/
- **TypeScript Playground**: Test types online
- **Bundle Analyzer**: Check package size

---

**🎊 Congratulations!** Your SuiFlow SDK is now ready for global distribution via npm!
