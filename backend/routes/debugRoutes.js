import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Debug endpoint to check and clean products
router.get('/debug/products', async (req, res) => {
  try {
    const products = await Product.find();
    
    const productInfo = products.map(product => ({
      id: product._id,
      name: product.name,
      priceInSui: product.priceInSui,
      priceType: typeof product.priceInSui,
      isValid: typeof product.priceInSui === 'number' && !isNaN(product.priceInSui) && product.priceInSui >= 0
    }));
    
    res.json({
      totalProducts: products.length,
      products: productInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean up invalid products
router.delete('/debug/cleanup-products', async (req, res) => {
  try {
    const products = await Product.find();
    const toDelete = [];
    
    for (const product of products) {
      if (typeof product.priceInSui !== 'number' || isNaN(product.priceInSui) || product.priceInSui < 0) {
        toDelete.push(product);
      }
    }
    
    // Delete invalid products
    for (const product of toDelete) {
      await Product.findByIdAndDelete(product._id);
    }
    
    const remaining = await Product.find();
    
    res.json({
      message: `Cleaned up ${toDelete.length} invalid products`,
      deletedProducts: toDelete.map(p => ({ name: p.name, priceInSui: p.priceInSui })),
      remainingProducts: remaining.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
