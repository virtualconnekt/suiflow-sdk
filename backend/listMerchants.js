import mongoose from 'mongoose';
import Merchant from './models/Merchant.js';
import dotenv from 'dotenv';

dotenv.config();

async function listMerchants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all merchants
    const merchants = await Merchant.find({}).select('_id email businessName walletAddress suiWalletAddress');
    
    console.log(`Found ${merchants.length} merchants:`);
    merchants.forEach((merchant, index) => {
      console.log(`\n${index + 1}. Merchant ID: ${merchant._id}`);
      console.log(`   Email: ${merchant.email}`);
      console.log(`   Business: ${merchant.businessName || 'N/A'}`);
      console.log(`   Wallet: ${merchant.walletAddress || 'N/A'}`);
      console.log(`   SUI Wallet: ${merchant.suiWalletAddress || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listMerchants();
