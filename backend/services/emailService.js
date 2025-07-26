import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Try multiple SMTP configurations for virtualconnekt.com.ng
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Try Gmail SMTP first
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      // Try alternative configuration
      try {
        this.transporter = nodemailer.createTransport({
          host: 'mail.virtualconnekt.com.ng', // Try domain-specific SMTP
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        await this.transporter.verify();
        console.log('Email service connected with domain SMTP');
        return true;
      } catch (altError) {
        console.error('Alternative SMTP also failed:', altError);
        return false;
      }
    }
  }

  async sendOTP(email, otp, purpose = 'registration') {
    console.log(`Attempting to send OTP to: ${email}`);
    
    const subject = purpose === 'registration' 
      ? 'Verify Your Email - SuiFlow Registration'
      : 'Password Reset OTP - SuiFlow';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">SuiFlow ${purpose === 'registration' ? 'Registration' : 'Password Reset'}</h2>
        <p>Hello,</p>
        <p>${purpose === 'registration' 
          ? 'Thank you for registering with SuiFlow. Please use the following OTP to verify your email address:' 
          : 'You have requested to reset your password. Please use the following OTP:'}</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4A90E2; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">SuiFlow - Secure Payment Processing</p>
      </div>
    `;

    const mailOptions = {
      from: `"SuiFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    try {
      console.log('Sending email with options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // If the error is authentication-related, provide helpful message
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        throw new Error('Email authentication failed. Please check your email credentials or enable app passwords.');
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, businessName) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Welcome to SuiFlow!</h2>
        <p>Hello ${businessName},</p>
        <p>Your merchant account has been successfully created and verified.</p>
        <p>You can now start accepting payments through the SuiFlow platform.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-left: 4px solid #4A90E2;">
          <h3>Getting Started:</h3>
          <ul>
            <li>Log in to your dashboard to configure your payment settings</li>
            <li>Set up your webhook URL for payment notifications</li>
            <li>Create your first payment link or product</li>
          </ul>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">SuiFlow - Secure Payment Processing</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SuiFlow - Account Created Successfully',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendPaymentReceipt({ senderEmail, merchantEmail, merchantName, amount, txHash, paymentId, timestamp }) {
    const formatDate = (date) => {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };

    const formatTxHash = (hash) => {
      return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
    };

    // Email content for the sender (customer)
    const senderHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a085; margin: 0;">Payment Successful! ✅</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Thank you for your payment</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 20px 0; font-size: 24px;">Payment Receipt</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: bold;">Amount Paid:</span>
            <span style="font-size: 18px; font-weight: bold;">${amount} SUI</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Merchant:</span>
            <span>${merchantName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Date & Time:</span>
            <span>${formatDate(timestamp)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Payment ID:</span>
            <span style="font-family: monospace;">${paymentId}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Transaction Hash:</span>
            <span style="font-family: monospace;">${formatTxHash(txHash)}</span>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #16a085; margin: 0 0 15px 0;">Transaction Details</h3>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a085;">✅ Success</span></p>
          <p style="margin: 5px 0;"><strong>Network:</strong> Sui Blockchain</p>
          <p style="margin: 5px 0;"><strong>Full Tx Hash:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 12px; word-break: break-all;">${txHash}</code></p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #e8f5e8; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #16a085; margin: 0 0 10px 0;">Thank You!</h3>
          <p style="margin: 0; color: #666;">Your payment has been successfully processed and confirmed on the Sui blockchain.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">This is an automated receipt from SuiFlow</p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">For support, please contact the merchant directly</p>
        </div>
      </div>
    `;

    // Email content for the merchant
    const merchantHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4A90E2; margin: 0;">New Payment Received! 💰</h1>
          <p style="color: #666; margin: 10px 0 0 0;">You have received a new payment</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #4A90E2 0%, #6c5ce7 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 20px 0; font-size: 24px;">Payment Notification</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="font-weight: bold;">Amount Received:</span>
            <span style="font-size: 18px; font-weight: bold;">${amount} SUI</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Customer Email:</span>
            <span>${senderEmail}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Date & Time:</span>
            <span>${formatDate(timestamp)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>Payment ID:</span>
            <span style="font-family: monospace;">${paymentId}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Transaction Hash:</span>
            <span style="font-family: monospace;">${formatTxHash(txHash)}</span>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #4A90E2; margin: 0 0 15px 0;">Transaction Details</h3>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a085;">✅ Confirmed</span></p>
          <p style="margin: 5px 0;"><strong>Network:</strong> Sui Blockchain</p>
          <p style="margin: 5px 0;"><strong>Full Tx Hash:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 12px; word-break: break-all;">${txHash}</code></p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #e3f2fd; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #4A90E2; margin: 0 0 10px 0;">Payment Confirmed</h3>
          <p style="margin: 0; color: #666;">The payment has been verified on the blockchain and funds have been transferred to your wallet.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">SuiFlow Payment Notification</p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Manage your payments at your SuiFlow dashboard</p>
        </div>
      </div>
    `;

    try {
      // Send receipt to customer
      await this.transporter.sendMail({
        from: `"SuiFlow" <${process.env.EMAIL_USER}>`,
        to: senderEmail,
        subject: `Payment Receipt - ${amount} SUI to ${merchantName}`,
        html: senderHtmlContent
      });

      // Send notification to merchant
      await this.transporter.sendMail({
        from: `"SuiFlow" <${process.env.EMAIL_USER}>`,
        to: merchantEmail,
        subject: `New Payment Received - ${amount} SUI from ${senderEmail}`,
        html: merchantHtmlContent
      });

      console.log(`Payment receipt emails sent successfully for payment ${paymentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending payment receipt emails:', error);
      throw new Error(`Failed to send payment receipt emails: ${error.message}`);
    }
  }
}

export default new EmailService();
