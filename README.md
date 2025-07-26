# Suiflow Project

## Overview
Suiflow is a payment processing application that provides a seamless checkout experience for users. It consists of a backend service that handles payment transactions and a frontend interface built with Vue.js for user interactions.

## Features
- Secure payment processing on Sui blockchain
- **📧 Automatic Email Receipts** - Professional receipts sent to customers and merchants
- Webhook support for payment notifications
- Email-based OTP authentication for merchants
- Payment widget for easy integration
- Comprehensive dashboard for merchants
- Real-time transaction verification
- Easy integration with other applications via SDK
- Comprehensive API documentation

## Project Structure
```
suipay-project
├── backend
│   ├── controllers          # Contains payment-related request handlers
│   ├── routes               # Defines payment-related routes
│   ├── services             # Payment verification services
│   ├── utils                # Utility functions for webhooks
│   ├── .env                 # Environment variables
│   ├── server.js            # Entry point for the backend application
│   ├── config.js            # Configuration settings
│   └── package.json         # Backend dependencies and scripts
├── frontend
│   ├── src
│   │   ├── components       # Vue components for the frontend
│   │   ├── views            # Vue views for different pages
│   │   ├── services         # API call handling
│   │   ├── App.vue          # Root Vue component
│   │   └── main.js          # Entry point for the frontend application
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies and scripts
├── sdk                      # JavaScript SDK for embedding payment functionality
│   └── suiflow.js          # Legacy JavaScript SDK
├── sdk-typescript           # 🆕 TypeScript SDK with proper coin handling
│   ├── src/                # TypeScript source files
│   ├── dist/               # Compiled JavaScript output
│   ├── package.json        # TypeScript SDK dependencies
│   └── test.html           # TypeScript SDK test interface
├── docs                     # API documentation
│   └── api-docs.md
└── README.md                # Project documentation
```

## Installation

### Backend
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file and configure your environment variables.
4. Start the backend server:
   ```
   node server.js
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm run dev
   ```

## Usage
- Access the frontend application in your browser at `http://localhost:3000` (or the port specified in your Vite configuration).
- Use the checkout interface to process payments.

## Smart Contract Integration 🚀

SuiFlow now includes a **TypeScript SDK** with proper smart contract integration!

### Key Improvements:
- **✅ Fixed Coin Handling**: Uses `TransactionBlock.splitCoins()` instead of passing amounts
- **✅ Type Safety**: Full TypeScript support prevents runtime errors  
- **✅ Modern Architecture**: Built on official `@mysten/sui.js` library
- **✅ Better Error Handling**: Structured error types and validation

### Smart Contract Details:
- **Package ID**: `0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6`
- **Processor Object**: `0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee`
- **Network**: Sui Testnet
- **Admin Fee**: 0.01 SUI per transaction
- **Automatic Money Splitting**: Admin fee + remainder to merchant

### Using the TypeScript SDK:

```bash
# Build the TypeScript SDK
cd sdk-typescript
npm install
npm run build
```

```typescript
// Import and use the TypeScript SDK
import SuiFlowSDK from './sdk-typescript/dist/index.js';

const sdk = new SuiFlowSDK({
    contractPackageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
    contractObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee'
});

// Smart contract payment with automatic fee splitting
await sdk.payWithContract({
    merchantId: 'your-merchant-id',
    merchantAddress: '0x...merchant-wallet-address',
    amount: 0.1, // 0.01 SUI admin fee + 0.09 SUI to merchant
    onSuccess: (txHash, amount, details) => {
        console.log('Payment successful!', txHash);
        console.log('Merchant received:', details.merchantReceived, 'SUI');
    },
    onError: (error) => console.error('Payment failed:', error)
});
```

>>>>>>> main
## Email Receipts Feature 📧

SuiFlow now automatically sends professional email receipts for all payments!

### What's Included:
- **Customer Receipts**: Detailed payment confirmation with transaction details
- **Merchant Notifications**: Payment alerts with customer information  
- **Professional Templates**: Clean, branded email design
- **Blockchain Verification**: Transaction hash and verification status
- **Automatic Sending**: No additional setup required

### How It Works:
1. Customer enters email during checkout
2. Payment is processed and verified on Sui blockchain
3. Professional receipts automatically sent to both parties
4. Includes transaction details, amounts, and verification status

### Testing:
```bash
# Test email functionality
cd backend
node testEmailReceipt.js

<<<<<<< HEAD
# Or use the test files:
# - test-email-receipts.html
# - frontend/public/widget-test.html
=======
# Test TypeScript SDK
cd sdk-typescript
npm run test

# Or use the test files:
# - test-email-receipts.html
# - frontend/public/widget-test.html
# - sdk-typescript/test.html
>>>>>>> main
```

## Documentation
For detailed API documentation, refer to the `docs/` directory:
- `api-docs.md` - Complete API reference
- `email-receipts.md` - Email feature documentation  
- `authentication-guide.md` - Merchant authentication
- `widget-integration.md` - Payment widget guide

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
