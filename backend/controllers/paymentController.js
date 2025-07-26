import Merchant from '../models/Merchant.js';
import Payment from '../models/Payment.js';
import MerchantSettings from '../models/MerchantSettings.js';
import { verifySuiPayment } from '../services/suiPaymentVerifier.js';
import { triggerWebhook } from '../utils/webhook.js';
import { body, validationResult } from 'express-validator';
import { 
    convertNairaToSUI, 
    convertSUIToNaira, 
    formatCurrency, 
    getCurrentRate,
    convertNairaToSUILive,
    convertSUIToNairaLive,
    getConversionRates,
    setMerchantUSDTRate,
    getUSDTRate
} from '../utils/nairaToSuiConverter.js';
import { fetchSUIUSDTPrice, getSUIPriceInfo } from '../services/livePriceService.js';

const processPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        const result = await paymentService.verifyPayment(paymentData);
        if (result.isValid) {
            // Logic to process the payment
            res.status(200).json({ message: 'Payment processed successfully', data: result });
        } else {
            res.status(400).json({ message: 'Invalid payment data', errors: result.errors });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        if (payment) {
            res.status(200).json({ message: 'Payment status retrieved', status: payment.status, payment });
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving payment status', error: error.message });
    }
};

const createPaymentLink = async (req, res) => {
    try {
        const { merchantId, amount, description, reference, productId, currency = 'NGN' } = req.body;
        let paymentData = { description, reference };
        
        // If productId is provided, fetch product and use its details
        if (productId) {
            const Product = (await import('../models/Product.js')).default;
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            
            // Find the merchant by wallet address
            const merchant = await Merchant.findOne({ walletAddress: product.merchantAddress });
            if (!merchant) {
                console.warn(`No merchant found for wallet address: ${product.merchantAddress}`);
                return res.status(404).json({ message: 'Merchant not found for this product' });
            }
            
            paymentData.product = product._id;
            paymentData.merchant = merchant._id; // Link to merchant
            
            // Handle currency conversion for product pricing
            if (product.currency === 'NGN' || !product.currency) {
                // Product price is in Naira, convert to SUI for blockchain
                paymentData.amountNGN = product.priceInSui; // This should be renamed to price
                paymentData.amountSUI = convertNairaToSUI(product.priceInSui);
                paymentData.amount = paymentData.amountSUI; // Blockchain amount
            } else {
                // Product price is already in SUI
                paymentData.amountSUI = product.priceInSui;
                paymentData.amountNGN = convertSUIToNaira(product.priceInSui);
                paymentData.amount = paymentData.amountSUI;
            }
            
            paymentData.merchantAddress = product.merchantAddress;
            paymentData.paymentLink = product.paymentLink;
            paymentData.currency = product.currency || 'NGN';
        } else {
            // Find merchant
            const merchant = await Merchant.findById(merchantId);
            if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
            
            paymentData.merchant = merchant._id;
            
            // Handle currency conversion based on input currency
            if (currency === 'NGN') {
                // Amount provided in Naira, convert to SUI for blockchain
                paymentData.amountNGN = amount;
                paymentData.amountSUI = convertNairaToSUI(amount);
                paymentData.amount = paymentData.amountSUI; // Blockchain amount
            } else if (currency === 'SUI') {
                // Amount provided in SUI, convert to Naira for display
                paymentData.amountSUI = amount;
                paymentData.amountNGN = convertSUIToNaira(amount);
                paymentData.amount = paymentData.amountSUI;
            } else {
                return res.status(400).json({ message: 'Invalid currency. Use NGN or SUI' });
            }
            
            paymentData.currency = currency;
            paymentData.paymentLink = `https://suiflow.app/pay/${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Add exchange rate info
        paymentData.exchangeRate = getCurrentRate();
        paymentData.exchangeRateAt = new Date();
        
        console.log(`Creating payment with currency conversion:`);
        console.log(`- Input currency: ${currency}`);
        console.log(`- Amount (NGN): ${formatCurrency(paymentData.amountNGN, 'NGN')}`);
        console.log(`- Amount (SUI): ${formatCurrency(paymentData.amountSUI, 'SUI')}`);
        console.log(`- Exchange rate: 1 SUI = ₦${paymentData.exchangeRate}`);
        
        // Create payment record
        const payment = new Payment(paymentData);
        await payment.save();
        
        res.status(201).json({ 
            message: 'Payment link created successfully',
            paymentLink: payment.paymentLink, 
            paymentId: payment._id,
            amounts: {
                naira: paymentData.amountNGN,
                sui: paymentData.amountSUI,
                display: formatCurrency(paymentData.amountNGN, 'NGN'),
                blockchain: formatCurrency(paymentData.amountSUI, 'SUI')
            },
            exchangeRate: paymentData.exchangeRate,
            currency: paymentData.currency
        });
    } catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).json({ message: 'Error creating payment link', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { paymentId, txnHash, customerWallet, customerEmail, paymentType = 'traditional', merchantAddress: providedMerchantAddress } = req.body;
        const paymentIdFromUrl = req.params.id;
        
        console.log('Verification request received:');
        console.log('- Payment ID from URL params:', paymentIdFromUrl);
        console.log('- Payment ID from body:', paymentId);
        console.log('- Transaction Hash:', txnHash);
        console.log('- Customer Wallet:', customerWallet);
        console.log('- Customer Email:', customerEmail);
        console.log('- Payment Type:', paymentType);
        console.log('- Provided Merchant Address:', providedMerchantAddress);
        
        // Use the ID from URL params if body doesn't have it
        const idToLookup = paymentIdFromUrl || paymentId;
        console.log('- ID to lookup:', idToLookup);
        
        const payment = await Payment.findById(idToLookup).populate('merchant');
        
        if (!payment) {
            console.error(`Payment not found with ID: ${idToLookup}`);
            console.log('Available payment IDs in database:');
            const allPayments = await Payment.find({}).select('_id product merchant status createdAt');
            console.log(allPayments.map(p => ({ id: p._id, product: p.product, merchant: p.merchant, status: p.status, createdAt: p.createdAt })));
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        console.log('Payment found:', {
            id: payment._id,
            product: payment.product,
            merchant: payment.merchant,
            amount: payment.amount,
            status: payment.status
        });
        
        // Get merchant address - prioritize provided address for smart contracts, then payment field, then merchant
        let merchantAddress = providedMerchantAddress || payment.merchantAddress;
        if (!merchantAddress && payment.merchant) {
            merchantAddress = payment.merchant.walletAddress || payment.merchant.suiWalletAddress;
        }
        
        if (!merchantAddress) {
            console.error('No merchant address found for payment:', paymentId);
            return res.status(400).json({ message: 'Payment has no merchant address' });
        }
        
        console.log(`Verifying ${paymentType} payment ${paymentId} with txn ${txnHash}`);
        console.log(`Expected amount: ${payment.amount} SUI`);
        console.log(`Merchant address: ${merchantAddress}`);
        
        // Add currency conversion info to logs
        if (payment.amountNGN && payment.amountSUI) {
            console.log(`Payment amounts:`);
            console.log(`- NGN: ${formatCurrency(payment.amountNGN, 'NGN')}`);
            console.log(`- SUI: ${formatCurrency(payment.amountSUI, 'SUI')}`);
            console.log(`- Exchange rate: 1 SUI = ₦${payment.exchangeRate || getCurrentRate()}`);
        }
        
        // Validate SUI amount with tolerance for precision
        const expectedSUIAmount = payment.amountSUI || payment.amount;
        const tolerance = 0.000001; // 1 microSUI tolerance
        
        // Call enhanced Sui verification service with payment type
        const isValid = await verifySuiPayment(txnHash, expectedSUIAmount, merchantAddress, paymentType);
        
        if (isValid) {
            payment.status = 'paid';
            payment.txnHash = txnHash;
            payment.customerWallet = customerWallet;
            payment.paymentType = paymentType; // Store payment type
            payment.customerEmail = customerEmail; // Store customer email
            payment.paidAt = new Date();
            
            // For smart contracts, store additional details
            if (paymentType === 'smart_contract') {
                payment.smartContract = {
                    packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
                    processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
                    adminFee: 0.01,
                    merchantReceived: payment.amount - 0.01
                };
            }
            
            await payment.save();
            
            console.log(`✅ ${paymentType} payment ${paymentId} verified successfully:`);
            console.log(`- Amount: ${formatCurrency(payment.amountNGN || payment.amount * getCurrentRate(), 'NGN')} (${formatCurrency(expectedSUIAmount, 'SUI')})`);
            console.log(`- Transaction: ${txnHash}`);
            console.log(`- Customer: ${customerWallet}`);
            
            // Send email receipt if customer email provided
            if (customerEmail) {
                try {
                    const { sendPaymentReceipt } = await import('../services/emailService.js');
                    await sendPaymentReceipt({
                        customerEmail,
                        merchantEmail: payment.merchant?.email,
                        paymentDetails: {
                            id: payment._id,
                            amountNGN: payment.amountNGN || convertSUIToNaira(payment.amount),
                            amountSUI: expectedSUIAmount,
                            description: payment.description,
                            txnHash,
                            currency: payment.currency || 'NGN',
                            exchangeRate: payment.exchangeRate || getCurrentRate()
                        }
                    });
                    console.log(`📧 Payment receipt sent to ${customerEmail}`);
                } catch (emailError) {
                    console.error('Failed to send payment receipt:', emailError.message);
                }
            }
            
            // Trigger merchant webhook if merchant has webhook URL
            if (payment.merchant && payment.merchant.webhookUrl) {
                const webhookData = {
                    event: 'payment.success',
                    amount: payment.amount,
                    txn: payment.txnHash,
                    status: payment.status,
                    reference: payment.reference,
                    paidAt: payment.paidAt,
                    createdAt: payment.createdAt,
                    paymentType: paymentType
                };
                
                // Add smart contract details if applicable
                if (paymentType === 'smart_contract') {
                    webhookData.smartContract = payment.smartContract;
                }
                
                await triggerWebhook(payment.merchant.webhookUrl, webhookData);
            }
            
            // Send email receipt if customer email is provided
            if (req.body.customerEmail) {
                console.log(`Attempting to send email receipt to: ${req.body.customerEmail}`);
                try {
                    const emailService = (await import('../services/emailService.js')).default;
                    await emailService.sendPaymentReceipt({
                        senderEmail: req.body.customerEmail,
                        merchantEmail: payment.merchant.email,
                        merchantName: payment.merchant.businessName,
                        amount: payment.amount,
                        txHash: payment.txnHash,
                        paymentId: payment._id.toString(),
                        timestamp: payment.paidAt
                    });
                    console.log(`✅ Payment receipt emails sent for payment ${paymentId}`);
                } catch (emailError) {
                    console.error('❌ Failed to send payment receipt emails:', emailError);
                    // Don't fail the payment verification if email fails
                }
            } else {
                console.log('❌ No customer email provided - skipping email receipt');
            }
            
            // Get redirect URL if product has one (for frontend to handle)
            let redirectURL = null;
            if (payment.product) {
                const Product = (await import('../models/Product.js')).default;
                const product = await Product.findById(payment.product);
                if (product && product.redirectURL) {
                    redirectURL = `${product.redirectURL}?paymentId=${payment._id}`;
                }
            }
            
            res.status(200).json({ 
                message: 'Payment verified', 
                payment,
                redirectURL // Send redirect URL to frontend
            });
        } else {
            console.log(`Payment verification failed for payment ${paymentId}`);
            res.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

const webhookHandler = async (req, res) => {
    try {
        // Example: receive webhook event and log
        const event = req.body;
        // TODO: Add logic to process webhook event
        res.status(200).json({ message: 'Webhook received', event });
    } catch (error) {
        res.status(500).json({ message: 'Error handling webhook', error: error.message });
    }
};

const getAllPayments = async (req, res) => {
  try {
    // Get the authenticated merchant from the request (set by auth middleware)
    const merchantId = req.merchant?._id;
    
    if (!merchantId) {
      return res.status(401).json({ message: 'Merchant not authenticated' });
    }
    
    // Filter payments by merchant
    const payments = await Payment.find({ merchant: merchantId })
      .populate('product')
      .populate('merchant')
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log(`Found ${payments.length} payments for merchant ${merchantId}`);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Add this new controller for custom price payment links
const createCustomPaymentLink = async (req, res) => {
    try {
        const { productId, customPrice } = req.body;
        if (!productId || !customPrice) {
            return res.status(400).json({ message: 'Product ID and custom price are required.' });
        }
        
        const Product = (await import('../models/Product.js')).default;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        // Find the merchant by wallet address
        const merchant = await Merchant.findOne({ walletAddress: product.merchantAddress });
        if (!merchant) {
            console.warn(`No merchant found for wallet address: ${product.merchantAddress}`);
            return res.status(404).json({ message: 'Merchant not found for this product' });
        }
        
        // Generate a unique payment link
        const paymentLink = `https://suiflow.app/pay/${Math.random().toString(36).substr(2, 9)}`;
        
        // Create payment record with custom price
        const payment = new Payment({
            product: product._id,
            merchant: merchant._id, // Link to merchant
            amount: customPrice,
            merchantAddress: product.merchantAddress,
            paymentLink,
            description: product.description || '',
            reference: '',
        });
        
        await payment.save();
        res.status(201).json({ paymentLink, paymentId: payment._id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating custom payment link', error: error.message });
    }
};

// Add this new controller for creating payments during checkout
const createPayment = async (req, res) => {
    try {
        const { productId } = req.body;
        const merchantId = req.merchant?._id;
        
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        
        // Find the product
        const Product = (await import('../models/Product.js')).default;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Find the merchant by wallet address if not authenticated
        let finalMerchantId = merchantId;
        if (!finalMerchantId && product.merchantAddress) {
            const merchant = await Merchant.findOne({ walletAddress: product.merchantAddress });
            if (merchant) {
                finalMerchantId = merchant._id;
                console.log(`Found merchant ${merchant._id} (${merchant.email}) for wallet address ${product.merchantAddress}`);
            } else {
                console.warn(`No merchant found for wallet address: ${product.merchantAddress}`);
            }
        }
        
        const payment = new Payment({
            product: product._id,
            merchant: finalMerchantId, // Now properly linked to merchant
            amount: product.priceInSui,
            merchantAddress: product.merchantAddress,
            status: 'pending',
            description: product.description || '',
            reference: '',
        });
        
        await payment.save();
        
        console.log(`Created payment ${payment._id} for product ${productId} by merchant ${finalMerchantId}`);
        
        res.status(201).json({ 
            paymentId: payment._id,
            amount: payment.amount,
            status: payment.status
        });
        
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

// Live pricing endpoints
const getLivePrices = async (req, res) => {
    try {
        const priceInfo = await getSUIPriceInfo();
        const { merchantId } = req.query;
        
        // Get conversion rates for this merchant
        const conversionRates = await getConversionRates(merchantId);
        
        res.status(200).json({
            message: 'Live prices retrieved successfully',
            prices: {
                sui: priceInfo,
                conversions: conversionRates
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting live prices:', error);
        res.status(500).json({ 
            message: 'Error getting live prices', 
            error: error.message 
        });
    }
};

const convertCurrencyLive = async (req, res) => {
    try {
        const { amount, fromCurrency, toCurrency, merchantId } = req.body;
        
        if (!amount || !fromCurrency || !toCurrency) {
            return res.status(400).json({ 
                message: 'Missing required fields: amount, fromCurrency, toCurrency' 
            });
        }
        
        let convertedAmount;
        let displayFrom, displayTo;
        let conversionMethod = 'live';
        
        try {
            if (fromCurrency === 'NGN' && toCurrency === 'SUI') {
                convertedAmount = await convertNairaToSUILive(amount, merchantId);
                displayFrom = formatCurrency(amount, 'NGN');
                displayTo = formatCurrency(convertedAmount, 'SUI');
            } else if (fromCurrency === 'SUI' && toCurrency === 'NGN') {
                convertedAmount = await convertSUIToNairaLive(amount, merchantId);
                displayFrom = formatCurrency(amount, 'SUI');
                displayTo = formatCurrency(convertedAmount, 'NGN');
            } else {
                return res.status(400).json({ 
                    message: 'Invalid currency pair. Supported: NGN<->SUI' 
                });
            }
        } catch (liveError) {
            console.warn('Live conversion failed, using static rates:', liveError.message);
            conversionMethod = 'static';
            
            // Fallback to static conversion
            if (fromCurrency === 'NGN' && toCurrency === 'SUI') {
                convertedAmount = convertNairaToSUI(amount);
                displayFrom = formatCurrency(amount, 'NGN');
                displayTo = formatCurrency(convertedAmount, 'SUI');
            } else if (fromCurrency === 'SUI' && toCurrency === 'NGN') {
                convertedAmount = convertSUIToNaira(amount);
                displayFrom = formatCurrency(amount, 'SUI');
                displayTo = formatCurrency(convertedAmount, 'NGN');
            }
        }
        
        // Get current rates for reference
        const rates = await getConversionRates(merchantId);
        
        res.status(200).json({
            message: 'Currency conversion successful',
            conversion: {
                original: {
                    amount,
                    currency: fromCurrency,
                    display: displayFrom
                },
                converted: {
                    amount: convertedAmount,
                    currency: toCurrency,
                    display: displayTo
                },
                method: conversionMethod,
                rates: rates,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({ 
            message: 'Error converting currency', 
            error: error.message 
        });
    }
};

// Merchant settings endpoints
const getMerchantSettings = async (req, res) => {
    try {
        const { merchantId } = req.params;
        
        if (!merchantId) {
            return res.status(400).json({ message: 'Merchant ID is required' });
        }
        
        const settings = await MerchantSettings.getOrCreateSettings(merchantId);
        
        res.status(200).json({
            message: 'Merchant settings retrieved successfully',
            settings: settings
        });
    } catch (error) {
        console.error('Error getting merchant settings:', error);
        res.status(500).json({ 
            message: 'Error getting merchant settings', 
            error: error.message 
        });
    }
};

const updateMerchantUSDTRate = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const { usdtRate } = req.body;
        
        if (!merchantId) {
            return res.status(400).json({ message: 'Merchant ID is required' });
        }
        
        if (!usdtRate || typeof usdtRate !== 'number' || usdtRate <= 0) {
            return res.status(400).json({ 
                message: 'Valid USDT rate is required (positive number)' 
            });
        }
        
        // Update in database
        const settings = await MerchantSettings.updateMerchantRate(
            merchantId, 
            usdtRate, 
            req.user?.email || 'merchant'
        );
        
        // Update in memory cache
        setMerchantUSDTRate(merchantId, usdtRate);
        
        console.log(`💱 Updated USDT rate for merchant ${merchantId}: 1 USDT = ₦${usdtRate}`);
        
        res.status(200).json({
            message: 'USDT exchange rate updated successfully',
            settings: settings,
            newRate: {
                rate: usdtRate,
                formatted: formatCurrency(usdtRate, 'NGN'),
                changePercent: settings.getRateChangePercent()
            }
        });
    } catch (error) {
        console.error('Error updating USDT rate:', error);
        res.status(500).json({ 
            message: 'Error updating USDT rate', 
            error: error.message 
        });
    }
};

// Currency conversion endpoints
const getExchangeRate = async (req, res) => {
    try {
        const { merchantId } = req.query;
        
        // Get both static and live rates
        const staticRate = getCurrentRate();
        const liveRates = await getConversionRates(merchantId);
        
        res.status(200).json({
            message: 'Exchange rates retrieved successfully',
            rates: {
                static: {
                    suiToNgn: staticRate,
                    description: `1 SUI = ₦${staticRate} (static)`
                },
                live: liveRates
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting exchange rate:', error);
        res.status(500).json({ 
            message: 'Error getting exchange rate', 
            error: error.message 
        });
    }
};

const convertCurrency = async (req, res) => {
    try {
        const { amount, fromCurrency, toCurrency } = req.body;
        
        if (!amount || !fromCurrency || !toCurrency) {
            return res.status(400).json({ 
                message: 'Missing required fields: amount, fromCurrency, toCurrency' 
            });
        }
        
        let convertedAmount;
        let displayFrom, displayTo;
        
        if (fromCurrency === 'NGN' && toCurrency === 'SUI') {
            convertedAmount = convertNairaToSUI(amount);
            displayFrom = formatCurrency(amount, 'NGN');
            displayTo = formatCurrency(convertedAmount, 'SUI');
        } else if (fromCurrency === 'SUI' && toCurrency === 'NGN') {
            convertedAmount = convertSUIToNaira(amount);
            displayFrom = formatCurrency(amount, 'SUI');
            displayTo = formatCurrency(convertedAmount, 'NGN');
        } else {
            return res.status(400).json({ 
                message: 'Invalid currency pair. Supported: NGN<->SUI' 
            });
        }
        
        res.status(200).json({
            message: 'Currency conversion successful',
            conversion: {
                original: {
                    amount,
                    currency: fromCurrency,
                    display: displayFrom
                },
                converted: {
                    amount: convertedAmount,
                    currency: toCurrency,
                    display: displayTo
                },
                exchangeRate: getCurrentRate(),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({ message: 'Error converting currency', error: error.message });
    }
};

// Validation middleware for payment creation
export const validateCreatePayment = [
  body('productId').optional().isString(),
  body('merchantId').optional().isString(),
  body('amount').optional().isNumeric(),
  body('description').optional().isString(),
  body('reference').optional().isString(),
  body('currency').optional().isIn(['NGN', 'SUI']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export { 
    processPayment, 
    getPaymentStatus, 
    createPaymentLink, 
    verifyPayment, 
    webhookHandler, 
    getAllPayments, 
    createCustomPaymentLink, 
    createPayment, 
    getExchangeRate, 
    convertCurrency,
    getLivePrices,
    convertCurrencyLive,
    getMerchantSettings,
    updateMerchantUSDTRate
};