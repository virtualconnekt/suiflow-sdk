/**
 * Live Price Service - Fetches real-time cryptocurrency prices
 * Integrates with Binance API for live SUI/USDT pricing
 */

import fetch from 'node-fetch';

// Cache configuration
const PRICE_CACHE = {
  suiUsdtPrice: null,
  lastUpdated: null,
  cacheValidityMs: 30000 // 30 seconds cache
};

/**
 * Fetches live SUI price in USDT from Binance API
 * @returns {Promise<number>} SUI price in USDT
 */
export async function fetchSUIUSDTPrice() {
  try {
    // Check cache first
    if (PRICE_CACHE.suiUsdtPrice && PRICE_CACHE.lastUpdated) {
      const cacheAge = Date.now() - PRICE_CACHE.lastUpdated;
      if (cacheAge < PRICE_CACHE.cacheValidityMs) {
        console.log(`📊 Using cached SUI price: $${PRICE_CACHE.suiUsdtPrice} USDT`);
        return PRICE_CACHE.suiUsdtPrice;
      }
    }

    console.log('🔄 Fetching live SUI price from Binance API...');
    
    // Binance API endpoint for SUI/USDT ticker
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SUIUSDT', {
      method: 'GET',
      headers: {
        'User-Agent': 'SuiFlow-Payment-System/1.0'
      },
      timeout: 5000 // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.price) {
      throw new Error('Invalid response from Binance API - no price data');
    }

    const suiPrice = parseFloat(data.price);
    
    if (isNaN(suiPrice) || suiPrice <= 0) {
      throw new Error(`Invalid SUI price received: ${data.price}`);
    }

    // Update cache
    PRICE_CACHE.suiUsdtPrice = suiPrice;
    PRICE_CACHE.lastUpdated = Date.now();

    console.log(`✅ Live SUI price: $${suiPrice} USDT`);
    return suiPrice;

  } catch (error) {
    console.error('❌ Failed to fetch SUI price:', error.message);
    
    // Return cached price if available
    if (PRICE_CACHE.suiUsdtPrice) {
      console.log(`⚠️ Using stale cached price: $${PRICE_CACHE.suiUsdtPrice} USDT`);
      return PRICE_CACHE.suiUsdtPrice;
    }
    
    // Fallback price if no cache available
    const fallbackPrice = 2.50; // Reasonable fallback for SUI
    console.log(`⚠️ Using fallback price: $${fallbackPrice} USDT`);
    return fallbackPrice;
  }
}

/**
 * Fetches multiple crypto prices (for future expansion)
 * @param {string[]} symbols - Array of symbols like ['SUIUSDT', 'BTCUSDT']
 * @returns {Promise<Object>} Object with symbol -> price mapping
 */
export async function fetchMultiplePrices(symbols = ['SUIUSDT']) {
  try {
    const symbolsParam = symbols.map(s => `"${s}"`).join(',');
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${symbolsParam}]`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SuiFlow-Payment-System/1.0'
      },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    const prices = {};
    
    data.forEach(ticker => {
      prices[ticker.symbol] = parseFloat(ticker.price);
    });

    return prices;

  } catch (error) {
    console.error('Failed to fetch multiple prices:', error.message);
    return { SUIUSDT: await fetchSUIUSDTPrice() };
  }
}

/**
 * Gets comprehensive price information including trends
 * @returns {Promise<Object>} Detailed price information
 */
export async function getSUIPriceInfo() {
  try {
    // Get 24hr ticker statistics
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SUIUSDT', {
      method: 'GET',
      headers: {
        'User-Agent': 'SuiFlow-Payment-System/1.0'
      },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      symbol: 'SUI/USDT',
      currentPrice: parseFloat(data.lastPrice),
      priceChange24h: parseFloat(data.priceChange),
      priceChangePercent24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume24h: parseFloat(data.volume),
      lastUpdated: new Date().toISOString(),
      source: 'Binance API'
    };

  } catch (error) {
    console.error('Failed to fetch SUI price info:', error.message);
    
    // Return basic info with current price
    const currentPrice = await fetchSUIUSDTPrice();
    return {
      symbol: 'SUI/USDT',
      currentPrice,
      priceChange24h: null,
      priceChangePercent24h: null,
      high24h: null,
      low24h: null,
      volume24h: null,
      lastUpdated: new Date().toISOString(),
      source: 'Fallback',
      error: error.message
    };
  }
}

/**
 * Clears the price cache (useful for testing)
 */
export function clearPriceCache() {
  PRICE_CACHE.suiUsdtPrice = null;
  PRICE_CACHE.lastUpdated = null;
  console.log('🗑️ Price cache cleared');
}

/**
 * Gets cache status
 */
export function getCacheStatus() {
  return {
    hasCache: !!PRICE_CACHE.suiUsdtPrice,
    lastUpdated: PRICE_CACHE.lastUpdated,
    cacheAge: PRICE_CACHE.lastUpdated ? Date.now() - PRICE_CACHE.lastUpdated : null,
    isValid: PRICE_CACHE.lastUpdated ? (Date.now() - PRICE_CACHE.lastUpdated) < PRICE_CACHE.cacheValidityMs : false
  };
}

export default {
  fetchSUIUSDTPrice,
  fetchMultiplePrices,
  getSUIPriceInfo,
  clearPriceCache,
  getCacheStatus
};
