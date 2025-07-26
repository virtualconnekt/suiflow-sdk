/**
 * SuiFlow - Live Naira to SUI Conversion Utility
 * 
 * Description: Converts Nigerian Naira (₦) to SUI using real-time crypto prices
 * from Binance API and merchant-configured USDT to Naira exchange rates.
 * 
 * Flow: NGN -> USDT -> SUI (using live SUI/USDT price)
 * 
 * This utility provides:
 * - Live SUI/USDT price from Binance API
 * - Merchant-configurable USDT to NGN rate
 * - Precise conversion to 6 decimal places
 * - Input validation and error handling
 * - Fallback rates for API failures
 */

import { fetchSUIUSDTPrice } from '../services/livePriceService.js';

// Default rates (fallback values)
let DEFAULT_USDT_TO_NGN_RATE = 1500; // 1 USDT = 1500 NGN (merchant configurable)

// Static rate for backward compatibility (fallback)
let EXCHANGE_RATE_SUI_TO_NGN = 1500; // 1 SUI = 1500 NGN (static fallback rate)
let MERCHANT_USDT_RATES = new Map(); // Store per-merchant USDT rates

/**
 * Sets the default USDT to NGN rate (global fallback)
 * @param {number} rate - USDT to NGN exchange rate
 */
export function setDefaultUSDTRate(rate) {
    if (typeof rate !== 'number' || rate <= 0) {
        throw new Error('USDT rate must be a positive number');
    }
    DEFAULT_USDT_TO_NGN_RATE = rate;
    console.log(`💱 Default USDT rate updated: 1 USDT = ₦${rate}`);
}

/**
 * Sets USDT to NGN rate for a specific merchant
 * @param {string} merchantId - Merchant ID
 * @param {number} rate - USDT to NGN exchange rate
 */
export function setMerchantUSDTRate(merchantId, rate) {
    if (typeof rate !== 'number' || rate <= 0) {
        throw new Error('USDT rate must be a positive number');
    }
    MERCHANT_USDT_RATES.set(merchantId, rate);
    console.log(`💱 Merchant ${merchantId} USDT rate: 1 USDT = ₦${rate}`);
}

/**
 * Gets USDT rate for a merchant (or default if not set)
 * @param {string} merchantId - Merchant ID (optional)
 * @returns {number} USDT to NGN rate
 */
export function getUSDTRate(merchantId = null) {
    if (merchantId && MERCHANT_USDT_RATES.has(merchantId)) {
        return MERCHANT_USDT_RATES.get(merchantId);
    }
    return DEFAULT_USDT_TO_NGN_RATE;
}

/**
 * Converts Nigerian Naira to SUI using live prices
 * @param {number} amountInNaira - Amount in Nigerian Naira (₦)
 * @param {string} merchantId - Merchant ID for custom USDT rate (optional)
 * @returns {Promise<number>} Amount in SUI (rounded to 6 decimal places)
 */
export async function convertNairaToSUILive(amountInNaira, merchantId = null) {
    // Input validation
    if (typeof amountInNaira !== 'number') {
        throw new Error('Amount must be a number');
    }
    
    if (amountInNaira < 0) {
        throw new Error('Amount cannot be negative');
    }
    
    if (!isFinite(amountInNaira)) {
        throw new Error('Amount must be a finite number');
    }

    try {
        // Step 1: Get live SUI/USDT price
        const suiUsdtPrice = await fetchSUIUSDTPrice();
        
        // Step 2: Get USDT/NGN rate for this merchant
        const usdtNgnRate = getUSDTRate(merchantId);
        
        // Step 3: Convert NGN -> USDT -> SUI
        const amountInUSDT = amountInNaira / usdtNgnRate;
        const amountInSUI = amountInUSDT / suiUsdtPrice;
        
        // Round to 6 decimal places
        const result = Math.round(amountInSUI * 1000000) / 1000000;
        
        console.log(`💰 Live conversion: ₦${amountInNaira} -> $${amountInUSDT.toFixed(4)} USDT -> ${result} SUI`);
        console.log(`📊 Rates used: 1 USDT = ₦${usdtNgnRate}, 1 SUI = $${suiUsdtPrice} USDT`);
        
        return result;

    } catch (error) {
        console.error('❌ Live conversion failed:', error.message);
        
        // Fallback to static rate
        console.log('⚠️ Using fallback conversion...');
        return convertNairaToSUI(amountInNaira);
    }
}

/**
 * Converts SUI to Nigerian Naira using live prices
 * @param {number} amountInSUI - Amount in SUI
 * @param {string} merchantId - Merchant ID for custom USDT rate (optional)
 * @returns {Promise<number>} Amount in Nigerian Naira
 */
export async function convertSUIToNairaLive(amountInSUI, merchantId = null) {
    // Input validation
    if (typeof amountInSUI !== 'number') {
        throw new Error('Amount must be a number');
    }
    
    if (amountInSUI < 0) {
        throw new Error('Amount cannot be negative');
    }
    
    if (!isFinite(amountInSUI)) {
        throw new Error('Amount must be a finite number');
    }

    try {
        // Step 1: Get live SUI/USDT price
        const suiUsdtPrice = await fetchSUIUSDTPrice();
        
        // Step 2: Get USDT/NGN rate for this merchant
        const usdtNgnRate = getUSDTRate(merchantId);
        
        // Step 3: Convert SUI -> USDT -> NGN
        const amountInUSDT = amountInSUI * suiUsdtPrice;
        const amountInNaira = amountInUSDT * usdtNgnRate;
        
        // Round to 2 decimal places for currency
        const result = Math.round(amountInNaira * 100) / 100;
        
        console.log(`💰 Live conversion: ${amountInSUI} SUI -> $${amountInUSDT.toFixed(4)} USDT -> ₦${result}`);
        
        return result;

    } catch (error) {
        console.error('❌ Live conversion failed:', error.message);
        
        // Fallback to static rate
        console.log('⚠️ Using fallback conversion...');
        return convertSUIToNaira(amountInSUI);
    }
}

/**
 * Gets comprehensive conversion rates
 * @param {string} merchantId - Merchant ID (optional)
 * @returns {Promise<Object>} Current rates and conversion info
 */
export async function getConversionRates(merchantId = null) {
    try {
        const suiUsdtPrice = await fetchSUIUSDTPrice();
        const usdtNgnRate = getUSDTRate(merchantId);
        const suiNgnRate = suiUsdtPrice * usdtNgnRate;
        
        return {
            live: true,
            timestamp: new Date().toISOString(),
            rates: {
                suiUsdt: suiUsdtPrice,
                usdtNgn: usdtNgnRate,
                suiNgn: suiNgnRate
            },
            merchantId: merchantId,
            source: 'Binance API + Merchant Rate'
        };
    } catch (error) {
        return {
            live: false,
            timestamp: new Date().toISOString(),
            rates: {
                suiUsdt: null,
                usdtNgn: getUSDTRate(merchantId),
                suiNgn: getUSDTRate(merchantId) // Fallback
            },
            merchantId: merchantId,
            source: 'Fallback',
            error: error.message
        };
    }
}

/**
 * Converts Nigerian Naira amount to SUI equivalent
 * @param {number} amountInNaira - Amount in Nigerian Naira (₦)
 * @returns {number} Amount in SUI (rounded to 6 decimal places)
 * @throws {Error} If input is invalid
 */
export function convertNairaToSUI(amountInNaira) {
    // Input validation
    if (typeof amountInNaira !== 'number') {
        throw new Error('Amount must be a number');
    }
    
    if (amountInNaira < 0) {
        throw new Error('Amount cannot be negative');
    }
    
    if (!isFinite(amountInNaira)) {
        throw new Error('Amount must be a finite number');
    }
    
    // Convert Naira to SUI
    const amountInSUI = amountInNaira / EXCHANGE_RATE_SUI_TO_NGN;
    
    // Round to 6 decimal places for precision
    return Math.round(amountInSUI * 1000000) / 1000000;
}

/**
 * Sets the global exchange rate for SUI to NGN conversion
 * @param {number} newRate - New exchange rate (1 SUI = newRate NGN)
 * @throws {Error} If rate is invalid
 */
export function setExchangeRate(newRate) {
    // Input validation
    if (typeof newRate !== 'number') {
        throw new Error('Exchange rate must be a number');
    }
    
    if (newRate <= 0) {
        throw new Error('Exchange rate must be positive');
    }
    
    if (!isFinite(newRate)) {
        throw new Error('Exchange rate must be a finite number');
    }
    
    EXCHANGE_RATE_SUI_TO_NGN = newRate;
    console.log(`Exchange rate updated: 1 SUI = ${newRate} NGN`);
}

/**
 * Gets the current exchange rate
 * @returns {number} Current exchange rate (1 SUI = X NGN)
 */
export function getCurrentRate() {
    return EXCHANGE_RATE_SUI_TO_NGN;
}

/**
 * Converts SUI amount back to Nigerian Naira
 * @param {number} amountInSUI - Amount in SUI
 * @returns {number} Amount in Nigerian Naira (rounded to 2 decimal places)
 * @throws {Error} If input is invalid
 */
export function convertSUIToNaira(amountInSUI) {
    // Input validation
    if (typeof amountInSUI !== 'number') {
        throw new Error('Amount must be a number');
    }
    
    if (amountInSUI < 0) {
        throw new Error('Amount cannot be negative');
    }
    
    if (!isFinite(amountInSUI)) {
        throw new Error('Amount must be a finite number');
    }
    
    // Convert SUI to Naira
    const amountInNaira = amountInSUI * EXCHANGE_RATE_SUI_TO_NGN;
    
    // Round to 2 decimal places for currency precision
    return Math.round(amountInNaira * 100) / 100;
}

/**
 * Formats amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency type ('NGN' or 'SUI')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'NGN') {
    if (currency === 'NGN') {
        return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === 'SUI') {
        return `${amount.toFixed(6)} SUI`;
    } else {
        return `${amount} ${currency}`;
    }
}

/**
 * Batch conversion for multiple amounts
 * @param {number[]} amounts - Array of amounts in Naira
 * @returns {number[]} Array of amounts in SUI
 */
export function batchConvertNairaToSUI(amounts) {
    if (!Array.isArray(amounts)) {
        throw new Error('Input must be an array');
    }
    
    return amounts.map(amount => convertNairaToSUI(amount));
}

// Default export for convenience
export default {
    // Live conversion functions (NEW)
    convertNairaToSUILive,
    convertSUIToNairaLive,
    getConversionRates,
    setDefaultUSDTRate,
    setMerchantUSDTRate,
    getUSDTRate,
    
    // Static conversion functions (backward compatibility)
    convertNairaToSUI,
    convertSUIToNaira,
    setExchangeRate,
    getCurrentRate,
    formatCurrency,
    batchConvertNairaToSUI
};
