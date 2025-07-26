/**
 * SuiFlow Currency Configuration
 * Central configuration for exchange rates and currency settings
 */

import { setExchangeRate, getCurrentRate } from './utils/nairaToSuiConverter.js';

// Default exchange rate configuration
const CURRENCY_CONFIG = {
    // Exchange rates (1 SUI = X NGN)
    DEFAULT_SUI_TO_NGN_RATE: 1500,
    
    // Rate update settings
    AUTO_UPDATE_ENABLED: false, // Set to true to enable automatic rate updates
    UPDATE_INTERVAL_MINUTES: 30, // How often to update rates (if auto-update is enabled)
    
    // API configuration for fetching real-time rates
    RATE_API_CONFIG: {
        enabled: false, // Set to true to use external API
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=ngn',
        timeout: 5000, // 5 seconds timeout
        retryAttempts: 3
    },
    
    // Precision settings
    SUI_DECIMAL_PLACES: 6,
    NGN_DECIMAL_PLACES: 2,
    
    // Validation settings
    MIN_EXCHANGE_RATE: 100,   // Minimum allowed rate (NGN per SUI)
    MAX_EXCHANGE_RATE: 10000, // Maximum allowed rate (NGN per SUI)
    
    // Payment amount limits
    MIN_PAYMENT_NGN: 50,      // Minimum payment in Naira
    MAX_PAYMENT_NGN: 10000000, // Maximum payment in Naira (10M NGN)
    
    // Tolerance for payment verification
    PAYMENT_TOLERANCE_PERCENT: 0.1 // 0.1% tolerance for rounding differences
};

/**
 * Initialize currency system with default settings
 */
export function initializeCurrencySystem() {
    console.log('🚀 Initializing SuiFlow Currency System...');
    
    // Set default exchange rate
    setExchangeRate(CURRENCY_CONFIG.DEFAULT_SUI_TO_NGN_RATE);
    
    console.log(`✅ Exchange rate set: 1 SUI = ₦${getCurrentRate()}`);
    console.log(`✅ Auto-update: ${CURRENCY_CONFIG.AUTO_UPDATE_ENABLED ? 'Enabled' : 'Disabled'}`);
    console.log(`✅ API integration: ${CURRENCY_CONFIG.RATE_API_CONFIG.enabled ? 'Enabled' : 'Disabled'}`);
    
    // Start auto-update if enabled
    if (CURRENCY_CONFIG.AUTO_UPDATE_ENABLED) {
        startAutoRateUpdate();
    }
    
    console.log('✅ Currency system initialized successfully!\n');
}

/**
 * Start automatic rate updates (if enabled)
 */
function startAutoRateUpdate() {
    const intervalMs = CURRENCY_CONFIG.UPDATE_INTERVAL_MINUTES * 60 * 1000;
    
    console.log(`🔄 Starting auto-update every ${CURRENCY_CONFIG.UPDATE_INTERVAL_MINUTES} minutes`);
    
    const interval = setInterval(async () => {
        try {
            await updateRateFromAPI();
        } catch (error) {
            console.error('Auto-update failed:', error.message);
        }
    }, intervalMs);
    
    // Store interval ID for potential cleanup
    global.currencyUpdateInterval = interval;
    
    return interval;
}

/**
 * Update exchange rate from external API
 */
export async function updateRateFromAPI() {
    if (!CURRENCY_CONFIG.RATE_API_CONFIG.enabled) {
        throw new Error('API rate updates are disabled');
    }
    
    const { url, timeout, retryAttempts } = CURRENCY_CONFIG.RATE_API_CONFIG;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
            console.log(`📡 Fetching exchange rate from API (attempt ${attempt}/${retryAttempts})...`);
            
            // Note: This is a placeholder implementation
            // Replace with actual HTTP client (axios, fetch, etc.)
            const response = await mockAPICall(url, timeout);
            
            if (response && response.sui && response.sui.ngn) {
                const newRate = response.sui.ngn;
                
                // Validate the rate
                if (newRate < CURRENCY_CONFIG.MIN_EXCHANGE_RATE || 
                    newRate > CURRENCY_CONFIG.MAX_EXCHANGE_RATE) {
                    throw new Error(`Rate ${newRate} is outside valid range`);
                }
                
                // Update the rate
                const oldRate = getCurrentRate();
                setExchangeRate(newRate);
                
                const changePercent = ((newRate - oldRate) / oldRate * 100).toFixed(2);
                
                console.log(`✅ Rate updated from API:`);
                console.log(`   Old: 1 SUI = ₦${oldRate}`);
                console.log(`   New: 1 SUI = ₦${newRate}`);
                console.log(`   Change: ${changePercent > 0 ? '+' : ''}${changePercent}%`);
                
                return { success: true, oldRate, newRate, changePercent };
            } else {
                throw new Error('Invalid API response format');
            }
            
        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === retryAttempts) {
                throw new Error(`Failed to update rate after ${retryAttempts} attempts: ${error.message}`);
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

/**
 * Mock API call (replace with actual HTTP client)
 */
async function mockAPICall(url, timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API response with slight rate variation
            const baseRate = CURRENCY_CONFIG.DEFAULT_SUI_TO_NGN_RATE;
            const variation = (Math.random() - 0.5) * 100; // ±50 NGN variation
            const newRate = Math.round(baseRate + variation);
            
            resolve({
                sui: {
                    ngn: newRate
                }
            });
        }, Math.random() * 1000 + 500); // Simulate network delay
    });
}

/**
 * Manual rate update with validation
 */
export function updateExchangeRateManually(newRate, source = 'manual') {
    // Validate input
    if (typeof newRate !== 'number' || newRate <= 0) {
        throw new Error('Rate must be a positive number');
    }
    
    if (newRate < CURRENCY_CONFIG.MIN_EXCHANGE_RATE || 
        newRate > CURRENCY_CONFIG.MAX_EXCHANGE_RATE) {
        throw new Error(`Rate must be between ₦${CURRENCY_CONFIG.MIN_EXCHANGE_RATE} and ₦${CURRENCY_CONFIG.MAX_EXCHANGE_RATE} per SUI`);
    }
    
    const oldRate = getCurrentRate();
    setExchangeRate(newRate);
    
    const changePercent = ((newRate - oldRate) / oldRate * 100).toFixed(2);
    
    console.log(`✅ Exchange rate updated manually:`);
    console.log(`   Old: 1 SUI = ₦${oldRate}`);
    console.log(`   New: 1 SUI = ₦${newRate}`);
    console.log(`   Change: ${changePercent > 0 ? '+' : ''}${changePercent}%`);
    console.log(`   Source: ${source}`);
    
    return { success: true, oldRate, newRate, changePercent, source };
}

/**
 * Get current currency configuration
 */
export function getCurrencyConfig() {
    return {
        ...CURRENCY_CONFIG,
        currentRate: getCurrentRate(),
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amountNGN) {
    if (typeof amountNGN !== 'number' || amountNGN <= 0) {
        return { valid: false, error: 'Amount must be a positive number' };
    }
    
    if (amountNGN < CURRENCY_CONFIG.MIN_PAYMENT_NGN) {
        return { 
            valid: false, 
            error: `Minimum payment is ₦${CURRENCY_CONFIG.MIN_PAYMENT_NGN}` 
        };
    }
    
    if (amountNGN > CURRENCY_CONFIG.MAX_PAYMENT_NGN) {
        return { 
            valid: false, 
            error: `Maximum payment is ₦${CURRENCY_CONFIG.MAX_PAYMENT_NGN.toLocaleString()}` 
        };
    }
    
    return { valid: true };
}

/**
 * Stop auto-update (cleanup function)
 */
export function stopAutoRateUpdate() {
    if (global.currencyUpdateInterval) {
        clearInterval(global.currencyUpdateInterval);
        global.currencyUpdateInterval = null;
        console.log('🛑 Auto-update stopped');
    }
}

// Export configuration object
export { CURRENCY_CONFIG };

// Export default object with all functions
export default {
    initializeCurrencySystem,
    updateRateFromAPI,
    updateExchangeRateManually,
    getCurrencyConfig,
    validatePaymentAmount,
    stopAutoRateUpdate,
    CURRENCY_CONFIG
};
