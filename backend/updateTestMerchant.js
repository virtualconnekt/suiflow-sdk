import mongoose from 'mongoose';
import Merchant from './models/Merchant.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateTestMerchant() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find test merchant by ID
    const testMerchant = await Merchant.findById('68764e309fcf5da6c3f17f6d');
    
    if (!testMerchant) {
      console.log('❌ Test merchant not found');
      process.exit(1);
    }

    // Update with a test wallet address (using a valid testnet address format)
    testMerchant.suiWalletAddress = '0x742e7a91c2e6b30c8c1e7ce5b4d9c8f7a5b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9';
    testMerchant.walletAddress = testMerchant.suiWalletAddress; // Fallback
    
    await testMerchant.save();
    
    console.log('✅ Test merchant updated successfully');
    console.log('📋 Merchant Details:');
    console.log('- ID:', testMerchant._id);
    console.log('- Email:', testMerchant.email);
    console.log('- Business Name:', testMerchant.businessName);
    console.log('- Wallet Address:', testMerchant.suiWalletAddress);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateTestMerchant();
