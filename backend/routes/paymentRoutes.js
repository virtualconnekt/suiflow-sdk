import express from 'express';
import { createPaymentLink, verifyPayment, webhookHandler, getPaymentStatus, validateCreatePayment, getAllPayments, createCustomPaymentLink, createPayment, getExchangeRate, convertCurrency, getLivePrices, convertCurrencyLive, getMerchantSettings, updateMerchantUSDTRate } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { SuiClient } from '@mysten/sui.js/client';

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!' });
});

// Database test route
router.get('/db-test', async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const count = await Payment.countDocuments();
    const recentPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(5).select('_id status createdAt');
    
    res.json({ 
      message: 'Database connection working',
      totalPayments: count,
      recentPayments: recentPayments
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database test failed',
      error: error.message 
    });
  }
});

// Test SUI RPC connection - must come before parameterized routes
router.get('/rpc/test', async (req, res) => {
  try {
    console.log('Testing SUI RPC connection...');
    console.log('RPC URL:', process.env.SUI_RPC_URL);
    
    const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });
    
    // Try a simple method that should exist
    const version = await suiClient.getRpcApiVersion();
    
    res.json({ 
      success: true, 
      message: 'SUI RPC connection successful',
      version: version,
      rpcUrl: process.env.SUI_RPC_URL
    });
  } catch (error) {
    console.error('SUI RPC test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'SUI RPC connection failed',
      error: error.message,
      rpcUrl: process.env.SUI_RPC_URL
    });
  }
});

// Test transaction verification
router.get('/verify-txn/:txnHash', async (req, res) => {
  try {
    const { txnHash } = req.params;
    console.log('Testing transaction verification for:', txnHash);
    
    const suiClient = new SuiClient({ url: process.env.SUI_RPC_URL });
    
    const txn = await suiClient.getTransactionBlock({ 
      digest: txnHash,
      options: { showBalanceChanges: true, showEffects: true }
    });
    
    res.json({ 
      success: true, 
      message: 'Transaction found',
      transaction: {
        digest: txn.digest,
        effects: txn.effects?.status,
        balanceChanges: txn.balanceChanges?.length || 0
      }
    });
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Transaction verification failed',
      error: error.message
    });
  }
});

// Route to handle webhook notifications - must come before parameterized routes
router.post('/webhook', webhookHandler);

// Smart contract payment verification endpoint
router.post('/verify-smart-contract', async (req, res) => {
  try {
    const { txnHash, merchantAddress, expectedAmount, paymentId } = req.body;
    
    if (!txnHash || !merchantAddress || !expectedAmount) {
      return res.status(400).json({ message: 'Missing required fields: txnHash, merchantAddress, expectedAmount' });
    }
    
    console.log('🔍 Smart contract payment verification request:');
    console.log('- Transaction Hash:', txnHash);
    console.log('- Merchant Address:', merchantAddress);
    console.log('- Expected Amount:', expectedAmount);
    console.log('- Payment ID:', paymentId);
    
    const { verifySuiPayment } = await import('../services/suiPaymentVerifier.js');
    
    // Verify smart contract payment
    const isValid = await verifySuiPayment(txnHash, expectedAmount, merchantAddress, 'smart_contract');
    
    if (isValid) {
      // If payment ID is provided, update the payment record
      if (paymentId) {
        const Payment = (await import('../models/Payment.js')).default;
        const payment = await Payment.findById(paymentId);
        
        if (payment) {
          payment.status = 'paid';
          payment.txnHash = txnHash;
          payment.paymentType = 'smart_contract';
          payment.smartContract = {
            packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
            processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
            adminFee: 0.01,
            merchantReceived: expectedAmount - 0.01
          };
          payment.paidAt = new Date();
          await payment.save();
          
          console.log('✅ Payment record updated for smart contract transaction');
        }
      }
      
      res.json({
        success: true,
        message: 'Smart contract payment verified successfully',
        paymentType: 'smart_contract',
        merchantReceived: expectedAmount - 0.01,
        adminFee: 0.01,
        txnHash
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Smart contract payment verification failed'
      });
    }
    
  } catch (error) {
    console.error('❌ Smart contract verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying smart contract payment',
      error: error.message
    });
  }
});

// Route to create a payment during checkout (authentication optional for direct checkout)
router.post('/create', createPayment);

// Route to create a payment link with validation
router.post('/create-link', validateCreatePayment, createPaymentLink);

// Route to create a payment link with a custom price
router.post('/create-custom-link', createCustomPaymentLink);

// List all payments (requires authentication) - must come before parameterized routes
router.get('/', authenticateToken, getAllPayments);

// Route to send payment receipt emails
router.post('/send-receipt', async (req, res) => {
  try {
    const { senderEmail, paymentId } = req.body;
    
    // Validate required fields
    if (!senderEmail || !paymentId) {
      return res.status(400).json({ 
        message: 'Missing required fields: senderEmail and paymentId are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find the payment with populated merchant data
    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findById(paymentId).populate('merchant');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment is paid/completed
    if (payment.status !== 'paid' && payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment is not completed yet' });
    }

    // Get merchant information
    if (!payment.merchant) {
      return res.status(400).json({ message: 'Merchant information not found for this payment' });
    }

    // Import email service
    const emailService = (await import('../services/emailService.js')).default;

    // Send payment receipt emails
    await emailService.sendPaymentReceipt({
      senderEmail: senderEmail,
      merchantEmail: payment.merchant.email,
      merchantName: payment.merchant.businessName,
      amount: payment.amount,
      txHash: payment.txnHash,
      paymentId: payment._id.toString(),
      timestamp: payment.paidAt || payment.createdAt
    });

    res.status(200).json({ 
      message: 'Payment receipt emails sent successfully',
      sentTo: {
        customer: senderEmail,
        merchant: payment.merchant.email
      }
    });

  } catch (error) {
    console.error('Error sending payment receipt:', error);
    res.status(500).json({ 
      message: 'Failed to send payment receipt', 
      error: error.message 
    });
  }
});

// Currency conversion routes
router.get('/exchange-rate', getExchangeRate);
router.post('/convert-currency', convertCurrency);

// Live pricing routes
router.get('/live-prices', getLivePrices);
router.post('/convert-currency-live', convertCurrencyLive);

// Merchant settings routes
router.get('/merchant-settings/:merchantId', getMerchantSettings);
router.put('/merchant-settings/:merchantId/usdt-rate', updateMerchantUSDTRate);

// Route to verify a payment (with paymentId param)
router.post('/verify/:id', verifyPayment);

// Route to get payment status by ID
router.get('/status/:id', getPaymentStatus);

export default router;