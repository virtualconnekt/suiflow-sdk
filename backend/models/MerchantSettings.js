/**
 * Merchant Settings Model
 * Stores merchant-specific configuration including USDT to Naira exchange rates
 */

import mongoose from 'mongoose';

const merchantSettingsSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    unique: true
  },
  
  // Exchange rate settings
  usdtToNgnRate: {
    type: Number,
    required: true,
    default: 1500, // 1 USDT = 1500 NGN
    min: 100,
    max: 10000
  },
  
  // Rate update settings
  rateLastUpdated: {
    type: Date,
    default: Date.now
  },
  
  rateUpdatedBy: {
    type: String,
    default: 'system'
  },
  
  // Pricing preferences
  preferLivePricing: {
    type: Boolean,
    default: true
  },
  
  fallbackToStaticRate: {
    type: Boolean,
    default: true
  },
  
  // Display preferences
  defaultDisplayCurrency: {
    type: String,
    enum: ['NGN', 'SUI', 'USDT'],
    default: 'NGN'
  },
  
  showLivePriceUpdates: {
    type: Boolean,
    default: true
  },
  
  // Rate history (last 10 updates)
  rateHistory: [{
    rate: Number,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: String,
    source: { type: String, enum: ['manual', 'api', 'system'], default: 'manual' }
  }],
  
  // Notification settings
  notifyOnPriceChange: {
    type: Boolean,
    default: false
  },
  
  priceChangeThreshold: {
    type: Number,
    default: 5 // Notify if price changes by more than 5%
  }
}, {
  timestamps: true
});

// Indexes
merchantSettingsSchema.index({ merchantId: 1 });
merchantSettingsSchema.index({ usdtToNgnRate: 1 });

// Methods
merchantSettingsSchema.methods.updateRate = function(newRate, updatedBy = 'merchant', source = 'manual') {
  // Add to history
  this.rateHistory.unshift({
    rate: newRate,
    updatedAt: new Date(),
    updatedBy,
    source
  });
  
  // Keep only last 10 entries
  if (this.rateHistory.length > 10) {
    this.rateHistory = this.rateHistory.slice(0, 10);
  }
  
  // Update current rate
  this.usdtToNgnRate = newRate;
  this.rateLastUpdated = new Date();
  this.rateUpdatedBy = updatedBy;
  
  return this.save();
};

merchantSettingsSchema.methods.getRateChangePercent = function() {
  if (this.rateHistory.length < 2) return 0;
  
  const currentRate = this.usdtToNgnRate;
  const previousRate = this.rateHistory[1].rate;
  
  return ((currentRate - previousRate) / previousRate * 100).toFixed(2);
};

// Static methods
merchantSettingsSchema.statics.getOrCreateSettings = async function(merchantId) {
  let settings = await this.findOne({ merchantId });
  
  if (!settings) {
    settings = new this({
      merchantId,
      usdtToNgnRate: 1500, // Default rate
      rateHistory: [{
        rate: 1500,
        updatedAt: new Date(),
        updatedBy: 'system',
        source: 'system'
      }]
    });
    
    await settings.save();
    console.log(`✅ Created default settings for merchant ${merchantId}`);
  }
  
  return settings;
};

merchantSettingsSchema.statics.updateMerchantRate = async function(merchantId, newRate, updatedBy = 'merchant') {
  const settings = await this.getOrCreateSettings(merchantId);
  return await settings.updateRate(newRate, updatedBy);
};

merchantSettingsSchema.statics.getMerchantRate = async function(merchantId) {
  const settings = await this.getOrCreateSettings(merchantId);
  return settings.usdtToNgnRate;
};

// Virtual for formatted rate
merchantSettingsSchema.virtual('formattedRate').get(function() {
  return `₦${this.usdtToNgnRate.toLocaleString('en-NG')}`;
});

// Ensure virtual fields are serialized
merchantSettingsSchema.set('toJSON', { virtuals: true });

const MerchantSettings = mongoose.model('MerchantSettings', merchantSettingsSchema);

export default MerchantSettings;
