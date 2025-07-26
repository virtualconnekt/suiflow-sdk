import express from 'express';
import { 
  sendRegistrationOTP, 
  verifyOTPAndRegister, 
  login, 
  resendOTP,
  getProfile 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-otp-register', verifyOTPAndRegister);
router.post('/login', login);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Public route to get merchant data by ID (for SDK)
router.get('/merchants/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const Merchant = (await import('../models/Merchant.js')).default;
    
    const merchant = await Merchant.findById(merchantId).select('walletAddress suiWalletAddress businessName email');
    
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    
    // Return the wallet address (prefer suiWalletAddress if available)
    const walletAddress = merchant.suiWalletAddress || merchant.walletAddress;
    
    res.json({
      walletAddress,
      businessName: merchant.businessName,
      email: merchant.email
    });
    
  } catch (error) {
    console.error('Error fetching merchant data:', error);
    res.status(500).json({ message: 'Error fetching merchant data', error: error.message });
  }
});

export default router;
