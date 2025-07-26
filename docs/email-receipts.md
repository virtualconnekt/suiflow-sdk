# Email Receipt Feature Documentation

## Overview
SuiFlow now automatically sends professional email receipts to both customers and merchants when payments are completed and verified on the Sui blockchain.

## Features

### 📧 Automatic Email Receipts
- **Customer Receipt**: Detailed payment confirmation with transaction details
- **Merchant Notification**: Payment received notification with customer information
- **Professional Design**: Clean, branded email templates
- **Blockchain Verification**: Includes transaction hash and verification status

### 🔒 Email Validation
- Required email field during checkout
- Real-time email format validation
- Error handling for invalid emails

### 📄 Receipt Content
Each email receipt includes:
- **Payment Amount** in SUI
- **Merchant Name** and business information
- **Transaction Hash** (full and shortened formats)
- **Date & Time** of payment
- **Payment ID** for reference
- **Status** confirmation (Success/Completed)
- **Thank you message** and support information

## Implementation

### Frontend Changes

#### Checkout Component (`SuiFlowCheckout.jsx`)
- Added email input field in step 1
- Email validation with visual feedback
- Email included in payment verification request
- Success message confirms receipt email sent

#### Widget Component (`WidgetPay.jsx`)
- Added email field to widget payment form
- Enhanced UI with better styling
- Email validation before payment processing
- Success confirmation includes email notification

### Backend Changes

#### Email Service (`emailService.js`)
- New `sendPaymentReceipt()` function
- Professional HTML email templates
- Sends to both customer and merchant
- Error handling for email failures

#### Payment Controllers
- Updated `verifyPayment()` to send emails automatically
- Added `customerEmail` parameter to verification
- Enhanced widget payment verification
- Non-blocking email sending (payment doesn't fail if email fails)

#### New API Endpoint
- `POST /api/payments/send-receipt` - Manual receipt sending
- Validates payment status and email format
- Can be used for resending receipts

### Email Templates

#### Customer Receipt
- Payment success confirmation
- Transaction details with blockchain verification
- Professional branding with SuiFlow logo
- Clear amount and merchant information
- Thank you message

#### Merchant Notification
- New payment received alert
- Customer email and payment details
- Transaction verification confirmation
- Dashboard management reminder

## Usage

### Basic Integration
```javascript
// The email field is now automatically included in checkout
// No additional code needed - just ensure users enter valid emails

// For widget payments:
Suiflow.payWithWidget({
  merchantId: 'YOUR_MERCHANT_ID',
  amount: amount,
  onSuccess: function(txHash, paidAmount) {
    // Emails are automatically sent after verification
    console.log('Payment successful and receipts sent!');
  }
});
```

### Manual Receipt Sending
```javascript
// Send receipt manually (backend)
const response = await fetch('/api/payments/send-receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    senderEmail: 'customer@example.com',
    paymentId: 'payment_id_here'
  })
});
```

## Testing

### Test Email Functionality
```bash
# Run email service test
cd backend
node testEmailReceipt.js
```

### Test Payment Flow
1. Open `test-email-receipts.html` in browser
2. Enter valid email address
3. Enter payment amount
4. Complete payment flow
5. Check both customer and merchant emails

## Configuration

### Environment Variables
```bash
# Required for email functionality
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

### Email Service Setup
- Uses Nodemailer with Gmail SMTP
- Supports app passwords for authentication
- Fallback SMTP configuration available
- Connection testing included

## Error Handling

### Email Validation
- Frontend validates email format in real-time
- Backend validates before sending
- Clear error messages for invalid emails

### Email Delivery
- Email failures don't block payment processing
- Errors logged for debugging
- Graceful fallback if email service unavailable

### Payment Verification
- Emails only sent for confirmed payments
- Duplicate email prevention
- Comprehensive error logging

## Benefits

### For Customers
- Instant payment confirmation
- Professional receipt for records
- Transaction details for verification
- Clear merchant information

### For Merchants
- Immediate payment notifications
- Customer contact information
- Transaction tracking
- Professional business image

### For Developers
- Easy integration (no code changes needed)
- Professional email templates
- Reliable delivery system
- Comprehensive error handling

## Security Considerations

### Email Privacy
- Customer emails only used for receipts
- No email storage beyond payment records
- GDPR-compliant data handling

### Email Security
- Secure SMTP connections (TLS)
- App-specific passwords recommended
- Input validation and sanitization
- Protection against email injection

## Support

### Common Issues
1. **Emails not sending**: Check EMAIL_USER and EMAIL_PASS environment variables
2. **Invalid email format**: Ensure proper email validation on frontend
3. **Missing receipts**: Verify payment status is 'paid' or 'completed'

### Testing Tools
- `testEmailReceipt.js` - Test email service
- `test-email-receipts.html` - Full payment flow test
- Browser console logs for debugging

### Contact
For technical support or feature requests, please check the SuiFlow documentation or contact the development team.
