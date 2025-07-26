# 🚀 SuiFlow Smart Contract Testing Guide

## ✅ Complete Setup Status

### 1. **Smart Contract Deployed** 
- **Package ID:** `0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6`
- **Processor Object:** `0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee`  
- **Admin Address:** `0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd`
- **Network:** Sui Testnet
- **Status:** ✅ LIVE & OPERATIONAL

### 2. **Backend Services** 
- **Status:** ✅ RUNNING (Port 4000)
- **Smart Contract Support:** ✅ Enhanced payment verification
- **Merchant API:** ✅ `/api/auth/merchants/:id` endpoint
- **Payment Verification:** ✅ Both traditional & smart contract
- **Database:** ✅ MongoDB connected with test merchant

### 3. **Frontend Test Interface**
- **Status:** ✅ RUNNING (Port 5173)
- **Test URL:** `http://localhost:5173/live-contract-test.html`
- **SDK Version:** v1.1.0 Enhanced with smart contract support
- **Configuration:** ✅ Local backend integration

### 4. **Test Data Ready**
- **Test Merchant ID:** `68764e309fcf5da6c3f17f6d`
- **Test Merchant Name:** Test Merchant
- **Merchant Wallet:** `0x742e7a91c2e6b30c8c1e7ce5b4d9c8f7a5b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9`
- **Test Amount:** 0.1 SUI (configurable)

## 🧪 What You Can Test Now

### **1. Smart Contract Direct Payment**
```javascript
// This will execute our deployed smart contract
Suiflow.payWithContract({
  merchantId: '68764e309fcf5da6c3f17f6d',
  merchantAddress: '0x742e...d0e9', 
  amount: 0.1,
  onSuccess: (txHash, amount, details) => {
    console.log('Smart contract payment successful!');
    console.log('TX Hash:', txHash);
    console.log('Merchant received:', details.merchantReceived, 'SUI');
    console.log('Admin fee:', details.fee, 'SUI');
  }
});
```

### **2. Hybrid Payment (Smart Contract + Popup Fallback)**
```javascript
// Tries smart contract first, falls back to popup
Suiflow.payWithWidget({
  merchantId: '68764e309fcf5da6c3f17f6d',
  amount: 0.1,
  onSuccess: (txHash, amount, details) => {
    console.log('Payment method used:', details.method);
  }
});
```

### **3. Traditional Popup Payment**
```javascript
// Traditional web-based payment popup
Suiflow.payWithPopup({
  merchantId: '68764e309fcf5da6c3f17f6d',
  amount: 0.1,
  onSuccess: (txHash, amount, details) => {
    console.log('Popup payment successful!');
  }
});
```

## 💰 Fee Structure Verification

### **Smart Contract Payments:**
- **Customer Pays:** X SUI (your input amount)
- **Merchant Receives:** X - 0.01 SUI  
- **Admin Fee:** 0.01 SUI (automatically deducted)
- **Gas Costs:** Paid by customer (~0.02-0.03 SUI)

### **Example with 0.1 SUI:**
- Customer pays: 0.1 SUI + gas
- Merchant gets: 0.09 SUI
- Admin gets: 0.01 SUI
- Total customer cost: ~0.13 SUI (including gas)

## 🔧 Prerequisites for Testing

### **🚨 IMPORTANT: Wallet Setup First!**
Before testing smart contracts, you MUST have a Sui wallet installed and connected.

### **1. Sui Wallet Installation & Setup**
**Step 1:** Install a Sui wallet browser extension:
- [Suiet Wallet](https://suiet.app/) (🌟 **Recommended** - Most compatible)
- [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
- [Ethos Wallet](https://ethoswallet.xyz/)

**Step 2:** After installation:
1. ✅ Create a new wallet or import existing one
2. ✅ **IMPORTANT:** Switch to **Testnet** mode in wallet settings
3. ✅ Get free testnet SUI from: https://faucet.sui.io/
4. ✅ Verify you have at least **0.15 SUI** in testnet

**Step 3:** Test wallet connection:
- 🧪 **Test URL:** `http://localhost:5173/wallet-test.html`
- This page will detect your wallet and verify connection

### **2. Testnet SUI Tokens**
- **Network:** Sui Testnet (NOT Mainnet!)
- **Faucet:** https://faucet.sui.io/
- **Minimum needed:** ~0.15 SUI per test transaction
- **Why needed:** 0.1 SUI for payment + 0.03 SUI for gas + buffer

### **3. Network Settings**
- **Wallet Network:** Sui Testnet
- **RPC URL:** `https://fullnode.testnet.sui.io:443`

## 🧪 Complete Testing Checklist

### **Smart Contract Integration:**
- [ ] Wallet connection works
- [ ] Smart contract payment executes successfully  
- [ ] Correct amount splits (merchant gets amount - 0.01 SUI)
- [ ] Admin fee collected (0.01 SUI)
- [ ] Transaction appears on [Sui Explorer](https://testnet.suivision.xyz/)
- [ ] Backend receives transaction notification
- [ ] Payment status updated in database

### **Fallback System:**
- [ ] Smart contract failure triggers popup fallback
- [ ] Popup payment works independently
- [ ] Hybrid method chooses correct payment type

### **Error Handling:**
- [ ] Wallet not installed error
- [ ] Insufficient balance error  
- [ ] Network connection errors
- [ ] Transaction rejection handling

## 🎯 Test Now!

### **⚠️ FIRST: Test Your Wallet Connection**
1. **Open wallet test:** `http://localhost:5173/wallet-test.html`
2. **Verify wallet is detected** and connection works
3. **Make sure you're on Testnet** with sufficient SUI

### **THEN: Test Smart Contract Payments**
1. **Open test interface:** `http://localhost:5173/live-contract-test.html`
2. **Connect your Sui wallet** (should work after wallet test above)
3. **Fill in test details** (merchant ID pre-filled)
4. **Click "Test Smart Contract Payment"**
5. **Approve transaction in wallet**
6. **Watch the magic happen!** ✨

## 🔍 Monitoring Tools

### **Transaction Verification:**
- **Live Contract Test Page:** Real-time transaction logs
- **Browser Console:** Detailed debug information  
- **Sui Explorer:** Blockchain transaction details
- **Backend Logs:** Payment processing status

### **Fee Monitoring:**
```bash
# Check admin fees collected
node fee-checker.js
```

## ⚡ Next Steps After Testing

1. **Revenue Tracking:** Monitor accumulated admin fees
2. **Production Deployment:** Switch SDK to production URLs
3. **Merchant Onboarding:** Add real merchant wallet addresses
4. **Fee Withdrawal:** Extract collected admin fees from smart contract

---

**🎉 Your smart contract payment system is fully operational and ready for comprehensive testing!**
