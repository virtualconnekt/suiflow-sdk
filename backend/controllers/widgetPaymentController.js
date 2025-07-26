import Merchant from '../models/Merchant.js';
import Payment from '../models/Payment.js';
import { verifySuiPayment } from '../services/suiPaymentVerifier.js';

export const createWidgetPayment = async (req, res) => {
  try {
    const { merchantId, amount } = req.body;
    if (!merchantId || !amount) return res.status(400).json({ message: 'merchantId and amount are required' });
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    const payment = new Payment({
      merchant: merchant._id,
      amount,
      merchantAddress: merchant.walletAddress,
      status: 'pending',
      paymentLink: '',
    });
    await payment.save();
    res.status(201).json({ paymentId: payment._id, merchantAddress: merchant.walletAddress });
  } catch (error) {
    res.status(500).json({ message: 'Error creating widget payment', error: error.message });
  }
};

export const verifyWidgetPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { txnHash, customerWallet, customerEmail } = req.body;
    const payment = await Payment.findById(paymentId).populate('merchant');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status === 'paid') return res.status(200).json({ message: 'Already verified', payment });
    
    // Verify on-chain
    const verified = await verifySuiPayment(txnHash, payment.amount, payment.merchantAddress);
    if (!verified) return res.status(400).json({ message: 'Payment not found on chain or invalid' });
    
    payment.status = 'paid';
    payment.txnHash = txnHash;
    payment.customerWallet = customerWallet;
    payment.paidAt = new Date();
    await payment.save();

    // Send email receipt if customer email is provided
    if (customerEmail) {
      try {
        const emailService = (await import('../services/emailService.js')).default;
        await emailService.sendPaymentReceipt({
          senderEmail: customerEmail,
          merchantEmail: payment.merchant.email,
          merchantName: payment.merchant.businessName,
          amount: payment.amount,
          txHash: payment.txnHash,
          paymentId: payment._id.toString(),
          timestamp: payment.paidAt
        });
        console.log(`Widget payment receipt emails sent for payment ${paymentId}`);
      } catch (emailError) {
        console.error('Failed to send widget payment receipt emails:', emailError);
        // Don't fail the payment verification if email fails
      }
    }

    res.status(200).json({ message: 'Payment verified', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying widget payment', error: error.message });
  }
}; 