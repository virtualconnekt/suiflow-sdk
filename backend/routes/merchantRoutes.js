// Backend API endpoint to provide merchant wallet address
// Add this to your backend routes

import express from 'express';
const router = express.Router();
import Merchant from '../models/Merchant.js';
import { authenticateToken } from '../middleware/auth.js';

// GET /api/merchants/:merchantId
router.get('/:merchantId', async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        
        // Get merchant from database
        const merchant = await Merchant.findById(merchantId);
        
        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        
        // Return wallet address for smart contract payments
        res.json({
            merchantId: merchant._id,
            walletAddress: merchant.walletAddress, // Use walletAddress to match your DB
            businessName: merchant.businessName,
            // Don't expose sensitive data
        });
        
    } catch (error) {
        console.error('Error fetching merchant data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/merchants/:merchantId/wallet
// Endpoint for merchants to set their wallet address
router.post('/:merchantId/wallet', authenticateToken, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { walletAddress } = req.body;
        
        // Validate wallet address format (Sui address starts with 0x and is 66 chars)
        if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{64}$/)) {
            return res.status(400).json({ error: 'Invalid Sui wallet address' });
        }
        
        // Update merchant record
        await Merchant.findByIdAndUpdate(merchantId, {
            suiWalletAddress: walletAddress,
            smartContractEnabled: true,
            updatedAt: new Date()
        });
        
        res.json({ 
            success: true, 
            message: 'Wallet address updated successfully' 
        });
        
    } catch (error) {
        console.error('Error updating wallet address:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
