import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  walletAddress: { type: String, required: true },
  suiWalletAddress: { type: String }, // For smart contract payments
  webhookUrl: { type: String },
  apiKey: { type: String, required: true, unique: true },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  smartContractEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Merchant', merchantSchema);
