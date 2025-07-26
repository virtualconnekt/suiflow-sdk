import express from 'express';
import { createWidgetPayment, verifyWidgetPayment } from '../controllers/widgetPaymentController.js';

const router = express.Router();

router.post('/create', createWidgetPayment);
router.post('/verify/:id', verifyWidgetPayment);

export default router; 