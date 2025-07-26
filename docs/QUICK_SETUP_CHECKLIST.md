# 🚀 SuiFlow SDK Quick Setup Checklist

## ✅ Pre-Setup Checklist

- [ ] **Download SDK**: Copy `suiflow.js` to your project
- [ ] **Get Merchant ID**: From your SuiFlow dashboard
- [ ] **Web Server**: Set up local development server
- [ ] **Sui Wallet**: Install Suiet or compatible wallet

## 📁 File Structure Setup

```
your-project/
├── index.html          (your main page)
├── sdk/
│   └── suiflow.js     (SuiFlow SDK file)
├── test-sdk.html      (test page - optional)
└── styles.css         (your styles)
```

## 🔧 Quick Integration Steps

### 1. Basic HTML Setup
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your content -->
    <button id="payBtn">Pay with SuiFlow</button>
    
    <!-- Include SDK -->
    <script src="sdk/suiflow.js"></script>
    <script>
        // Your payment code here
    </script>
</body>
</html>
```

### 2. Add Payment Handler
```javascript
document.getElementById('payBtn').onclick = function() {
    Suiflow.payWithWidget({
        merchantId: 'YOUR_MERCHANT_ID_HERE',
        amount: 1.0, // Amount in SUI
        onSuccess: function(txHash, paidAmount) {
            alert('Payment successful!');
            console.log('Transaction:', txHash);
        }
    });
};
```

### 3. Replace Merchant ID
- [ ] Find your merchant ID in SuiFlow dashboard
- [ ] Replace `'YOUR_MERCHANT_ID_HERE'` with actual ID
- [ ] Format: `'687b8e4455ee9491cb288826'`

## 🧪 Testing Steps

### 1. Start Local Server
```bash
# Choose one method:

# Using Node.js
npx serve .

# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using PHP
php -S localhost:8000
```

### 2. Test in Browser
- [ ] Open `http://localhost:8000` in browser
- [ ] Click payment button
- [ ] Verify popup opens
- [ ] Test with small amount (0.01 SUI)

### 3. Troubleshooting
- [ ] Check browser console for errors
- [ ] Verify SDK file path is correct
- [ ] Confirm merchant ID is valid
- [ ] Test wallet connection

## 🔍 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| SDK not found | Check file path in `<script src="">` |
| Merchant ID invalid | Verify ID from dashboard |
| Popup blocked | Ensure triggered by user click |
| Network errors | Check internet connection |
| Wallet not connecting | Try different wallet or restart |

## 📋 Testing Checklist

- [ ] **SDK loads correctly** (no console errors)
- [ ] **Payment button works** (popup opens)
- [ ] **Small test payment** (0.01 SUI)
- [ ] **Success callback fires** (check console)
- [ ] **Error handling works** (test invalid amount)

## 🎯 Production Checklist

- [ ] **Update to production merchant ID**
- [ ] **Use HTTPS** for your website
- [ ] **Add error handling** for all scenarios
- [ ] **Test with real payments** (small amounts)
- [ ] **Implement backend verification**
- [ ] **Add user confirmation** UI

## 📞 Getting Help

If you encounter issues:

1. **Check the enhanced test file**: `test-sdk.html`
2. **Use debug console**: Look for detailed error messages
3. **Try offline demo**: `widget-test-offline.html`
4. **Review setup guide**: `SDK_SETUP_GUIDE.md`

## 🎉 Quick Start Commands

```bash
# 1. Navigate to your project
cd your-project

# 2. Copy SDK file
cp /path/to/suiflow.js ./sdk/

# 3. Start server
npx serve .

# 4. Open browser
# Go to http://localhost:3000
```

---

**🚀 Ready to go!** Once you complete this checklist, your SuiFlow integration should be working perfectly!
