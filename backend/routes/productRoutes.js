import express from 'express';
import { createProduct, getProductById, getAllProducts, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Admin adds a product
router.post('/', createProduct);

// List all products
router.get('/', getAllProducts);

// Get product details
router.get('/:id', getProductById);

// Delete product
router.delete('/:id', deleteProduct);

export default router; 