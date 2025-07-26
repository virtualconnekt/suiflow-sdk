import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  priceInSui: { type: Number, required: true },
  merchantAddress: { type: String, required: true },
  paymentLink: { type: String, required: true, unique: true },
  redirectURL: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema); 