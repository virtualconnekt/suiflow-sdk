import jwt from 'jsonwebtoken';
import Merchant from '../models/Merchant.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Authentication attempt:');
    console.log('- Auth header present:', !!authHeader);
    console.log('- Token present:', !!token);

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('- Token decoded successfully');
    console.log('- Decoded merchantId:', decoded.merchantId);
    
    // Verify merchant still exists and is active
    const merchant = await Merchant.findById(decoded.merchantId);
    console.log('- Merchant found:', !!merchant);
    console.log('- Merchant active:', merchant?.isActive);
    
    if (!merchant || !merchant.isActive) {
      return res.status(401).json({ message: 'Invalid token or merchant deactivated' });
    }

    req.merchant = merchant; // Set the actual merchant object, not just the decoded token
    console.log('- Authentication successful for merchant:', merchant._id);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};
