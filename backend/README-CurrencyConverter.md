# SuiFlow - Naira to SUI Currency Converter

A comprehensive utility for converting Nigerian Naira (₦) to SUI cryptocurrency for the SuiFlow payment system. This converter provides accurate, configurable exchange rate management with built-in validation and formatting capabilities.

## 🚀 Features

- **Precise Conversion**: Converts Naira to SUI with 6 decimal place precision  
- **Bidirectional**: Convert both NGN → SUI and SUI → NGN
- **Configurable Rates**: Easy exchange rate updates with validation
- **Input Validation**: Comprehensive error handling and input validation
- **Batch Processing**: Convert multiple amounts at once
- **Currency Formatting**: Professional display formatting for both currencies
- **Auto-Update Support**: Optional automatic rate updates from external APIs
- **Payment Validation**: Built-in payment amount validation

## 📦 Installation

The converter is already integrated into your SuiFlow backend. The files are located in:

```
backend/utils/nairaToSuiConverter.js     # Core converter functions
backend/currencyConfig.js                # Configuration and rate management
backend/enhancedPaymentController.js     # Integration examples
```

## 🔧 Basic Usage

### Core Conversion Functions

```javascript
import { convertNairaToSUI, convertSUIToNaira, formatCurrency } from './utils/nairaToSuiConverter.js';

// Convert Naira to SUI
const suiAmount = convertNairaToSUI(3000);    // Returns: 2.000000
const suiAmount2 = convertNairaToSUI(1500);   // Returns: 1.000000

// Convert SUI back to Naira  
const nairaAmount = convertSUIToNaira(2.5);   // Returns: 3750.00

// Format for display
console.log(formatCurrency(3000, 'NGN'));     // "₦3,000.00"
console.log(formatCurrency(2.0, 'SUI'));      // "2.000000 SUI"
```

### Exchange Rate Management

```javascript
import { setExchangeRate, getCurrentRate } from './utils/nairaToSuiConverter.js';

// Check current rate
console.log(getCurrentRate());                 // 1500 (default)

// Update exchange rate
setExchangeRate(1600);                        // 1 SUI = 1600 NGN
console.log(convertNairaToSUI(1600));         // 1.000000

// Using configuration system
import { initializeCurrencySystem, updateExchangeRateManually } from './currencyConfig.js';

initializeCurrencySystem();                   // Initialize with defaults
updateExchangeRateManually(1550, 'manual');   // Update with validation
```

## 🏗️ Integration Examples

### 1. Payment Processing Integration

```javascript
// In your payment controller
import { convertNairaToSUI, formatCurrency } from './utils/nairaToSuiConverter.js';

export const createPayment = async (req, res) => {
    const { amount, description } = req.body;
    
    // Convert Naira price to SUI for blockchain
    const amountSUI = convertNairaToSUI(amount);
    
    const payment = {
        amountNGN: amount,
        amountSUI: amountSUI,
        description,
        displayAmount: formatCurrency(amount, 'NGN'),
        blockchainAmount: formatCurrency(amountSUI, 'SUI')
    };
    
    // Save payment and proceed with blockchain transaction
    res.json({ success: true, payment });
};
```

### 2. Product Catalog with Dual Pricing

```javascript
// Convert product prices for display
const products = [
    { name: 'Basic Plan', priceNGN: 2500 },
    { name: 'Pro Plan', priceNGN: 5000 }
];

const productsWithSUI = products.map(product => ({
    ...product,
    priceSUI: convertNairaToSUI(product.priceNGN),
    displayPrice: formatCurrency(product.priceNGN, 'NGN'),
    blockchainPrice: formatCurrency(convertNairaToSUI(product.priceNGN), 'SUI')
}));
```

### 3. Payment Verification with Amount Validation

```javascript
export const verifyPayment = async (req, res) => {
    const { paymentId, receivedSUI } = req.body;
    const payment = await Payment.findById(paymentId);
    
    // Verify SUI amount matches expected (with tolerance)
    const tolerance = 0.000001;
    const isValid = Math.abs(receivedSUI - payment.amountSUI) <= tolerance;
    
    if (isValid) {
        // Process successful payment
        console.log(`✅ Payment verified: ${formatCurrency(payment.amountNGN, 'NGN')} → ${formatCurrency(receivedSUI, 'SUI')}`);
    }
};
```

## ⚙️ Configuration Options

### Default Settings

```javascript
// In currencyConfig.js
const CURRENCY_CONFIG = {
    DEFAULT_SUI_TO_NGN_RATE: 1500,    // 1 SUI = 1500 NGN
    MIN_PAYMENT_NGN: 50,              // Minimum ₦50
    MAX_PAYMENT_NGN: 10000000,        // Maximum ₦10M
    SUI_DECIMAL_PLACES: 6,            // 6 decimal precision
    AUTO_UPDATE_ENABLED: false        // Manual updates only
};
```

### Enable Automatic Rate Updates

```javascript
import { updateRateFromAPI } from './currencyConfig.js';

// Enable auto-updates in config
CURRENCY_CONFIG.AUTO_UPDATE_ENABLED = true;
CURRENCY_CONFIG.UPDATE_INTERVAL_MINUTES = 30;

// Or update manually from API
const result = await updateRateFromAPI();
console.log(`Rate updated: ${result.newRate}`);
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Test core converter functions
node testNairaConverter.js

# Test configuration system  
node -e "import('./currencyConfig.js').then(config => config.initializeCurrencySystem())"

# Test integration examples
node integrationExample.js
```

### Test Output Example

```
🚀 Testing SuiFlow Naira to SUI Converter

📊 Test 1: Basic Conversion (Default Rate: 1 SUI = 1500 NGN)
₦1,500 → 1.000000 SUI
₦3,000 → 2.000000 SUI
₦7,500 → 5.000000 SUI

✅ All tests completed successfully!
```

## 📊 Common Use Cases

### 1. E-commerce Integration

```javascript
// Shopping cart total
const cartItems = [
    { price: 2500, quantity: 2 },
    { price: 1500, quantity: 1 }
];

const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const totalSUI = convertNairaToSUI(total);

console.log(`Cart Total: ${formatCurrency(total, 'NGN')} (${formatCurrency(totalSUI, 'SUI')})`);
// Output: "Cart Total: ₦6,500.00 (4.333333 SUI)"
```

### 2. Subscription Billing

```javascript
// Monthly subscription conversion
const subscriptionPlans = {
    basic: { monthly: 2500, yearly: 25000 },
    pro: { monthly: 5000, yearly: 50000 },
    enterprise: { monthly: 15000, yearly: 150000 }
};

Object.entries(subscriptionPlans).forEach(([plan, prices]) => {
    console.log(`${plan.toUpperCase()} Plan:`);
    console.log(`  Monthly: ${formatCurrency(prices.monthly, 'NGN')} → ${formatCurrency(convertNairaToSUI(prices.monthly), 'SUI')}`);
    console.log(`  Yearly: ${formatCurrency(prices.yearly, 'NGN')} → ${formatCurrency(convertNairaToSUI(prices.yearly), 'SUI')}`);
});
```

### 3. Analytics and Reporting

```javascript
// Convert payment history for reports
const payments = await Payment.find({ status: 'completed' });
const totalNGN = payments.reduce((sum, p) => sum + p.amountNGN, 0);
const totalSUI = convertNairaToSUI(totalNGN);

console.log(`Total Revenue: ${formatCurrency(totalNGN, 'NGN')} (${formatCurrency(totalSUI, 'SUI')})`);
```

## 🔒 Error Handling

The converter includes comprehensive error handling:

```javascript
try {
    const result = convertNairaToSUI(-100);
} catch (error) {
    console.log(error.message); // "Amount cannot be negative"
}

try {
    setExchangeRate(0);
} catch (error) {
    console.log(error.message); // "Exchange rate must be positive"
}
```

## 🚨 Important Notes

1. **Default Rate**: Currently set to 1 SUI = 1500 NGN
2. **Precision**: SUI amounts are rounded to 6 decimal places
3. **Validation**: All inputs are validated for type and range
4. **Thread Safety**: Rate updates are atomic and thread-safe
5. **Backwards Compatible**: Works with existing payment records

## 🔄 Migration Guide

For existing payments without SUI amounts:

```javascript
import { migratePricesToIncludeSUI } from './enhancedPaymentController.js';

// Run once to add SUI amounts to existing payments
const result = await migratePricesToIncludeSUI();
console.log(`Migrated ${result.migratedCount} payments`);
```

## 📈 Future Enhancements

- Real-time exchange rate API integration
- Multiple currency support (USD, EUR, etc.)
- Historical rate tracking
- Rate volatility alerts
- Custom rate sources

## 🤝 Support

For questions or issues with the currency converter:

1. Check the test files for usage examples
2. Review integration examples in `enhancedPaymentController.js`
3. Refer to configuration options in `currencyConfig.js`

---

**Ready to integrate!** The converter is production-ready and can be immediately used in your SuiFlow payment processing system.
