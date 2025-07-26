import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Merchant from '../models/Merchant.js';
import OTP from '../models/OTP.js';
import emailService from '../services/emailService.js';
import crypto from 'crypto';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate API key
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Step 1: Send OTP to email for registration
export const sendRegistrationOTP = [
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      console.log('Received OTP request for:', req.body.email);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ email });
      if (existingMerchant) {
        console.log('Merchant already exists:', email);
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Test email connection first
      console.log('Testing email connection...');
      const emailConnected = await emailService.testConnection();
      if (!emailConnected) {
        console.error('Email service not available');
        return res.status(500).json({ message: 'Email service temporarily unavailable. Please try again later.' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log('Generated OTP for', email, ':', otp);

      // Save OTP to database
      await OTP.findOneAndUpdate(
        { email, purpose: 'registration' },
        { otp, expiresAt, isUsed: false },
        { upsert: true, new: true }
      );

      console.log('OTP saved to database');

      // Send OTP email
      await emailService.sendOTP(email, otp, 'registration');
      console.log('OTP email sent successfully');

      res.status(200).json({ 
        message: 'OTP sent to your email address',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for security
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
  }
];

// Step 2: Verify OTP and complete registration
export const verifyOTPAndRegister = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('password').isLength({ min: 6 }),
  body('businessName').notEmpty().trim(),
  body('walletAddress').notEmpty().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp, password, businessName, walletAddress, webhookUrl } = req.body;

      // Find and verify OTP
      const otpRecord = await OTP.findOne({
        email,
        purpose: 'registration',
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Check if merchant already exists (double check)
      const existingMerchant = await Merchant.findOne({ email });
      if (existingMerchant) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate API key
      const apiKey = generateApiKey();

      // Create merchant
      const merchant = new Merchant({
        email,
        password: hashedPassword,
        businessName,
        walletAddress,
        webhookUrl,
        apiKey,
        isEmailVerified: true
      });

      await merchant.save();

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      // Send welcome email
      await emailService.sendWelcomeEmail(email, businessName);

      // Generate JWT token
      const token = jwt.sign(
        { merchantId: merchant._id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Merchant account created successfully',
        token,
        merchant: {
          id: merchant._id,
          email: merchant.email,
          businessName: merchant.businessName,
          apiKey: merchant.apiKey,
          isEmailVerified: merchant.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Error creating merchant:', error);
      res.status(500).json({ message: 'Error creating merchant account', error: error.message });
    }
  }
];

// Login endpoint
export const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find merchant
      const merchant = await Merchant.findOne({ email });
      if (!merchant) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!merchant.isEmailVerified) {
        return res.status(401).json({ message: 'Please verify your email address first' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, merchant.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { merchantId: merchant._id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        merchant: {
          id: merchant._id,
          email: merchant.email,
          businessName: merchant.businessName,
          apiKey: merchant.apiKey,
          isEmailVerified: merchant.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  }
];

// Resend OTP
export const resendOTP = [
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ email });
      if (existingMerchant) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update OTP in database
      await OTP.findOneAndUpdate(
        { email, purpose: 'registration' },
        { otp, expiresAt, isUsed: false },
        { upsert: true, new: true }
      );

      // Send OTP email
      await emailService.sendOTP(email, otp, 'registration');

      res.status(200).json({ 
        message: 'OTP resent to your email address',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
  }
];

// Get merchant profile (protected route)
export const getProfile = async (req, res) => {
  try {
    // req.merchant is now the actual merchant object from the database
    const merchant = req.merchant;
    
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Return merchant data without password
    const { password, ...merchantData } = merchant.toObject();
    
    res.status(200).json({ merchant: merchantData });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
