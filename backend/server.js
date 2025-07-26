import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import widgetPaymentRoutes from './routes/widgetPaymentRoutes.js';
import { initializeCurrencySystem } from './currencyConfig.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/widget-payments', widgetPaymentRoutes);
app.use('/api', debugRoutes); // Add debug routes

mongoose.connect(config.mongoUri)
  .then(() => {
    // Initialize currency conversion system
    initializeCurrencySystem();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log('🚀 SuiFlow backend with currency conversion ready!');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });