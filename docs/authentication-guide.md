# Email-Based OTP Authentication System

## Overview
The SuiFlow platform now includes a secure email-based OTP (One-Time Password) authentication system for merchant registration and login.

## Authentication Flow

### 1. Merchant Registration Process

#### Step 1: Email Verification
- Merchant enters their email address
- System sends a 6-digit OTP to the email
- OTP expires after 10 minutes

#### Step 2: OTP Verification
- Merchant enters the received OTP
- System validates the OTP

#### Step 3: Account Creation
- Merchant provides:
  - Password (minimum 6 characters)
  - Business name
  - SUI wallet address
  - Webhook URL (optional)
- Account is created with email verification status set to true
- Welcome email is sent
- JWT token is generated for immediate login

### 2. Login Process
- Merchant enters email and password
- System verifies credentials and email verification status
- JWT token is generated upon successful authentication

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/send-otp`
Sends OTP to email for registration
```json
{
  "email": "merchant@example.com"
}
```

#### POST `/verify-otp-register`
Verifies OTP and completes registration
```json
{
  "email": "merchant@example.com",
  "otp": "123456",
  "password": "securepassword",
  "businessName": "My Business",
  "walletAddress": "0x...",
  "webhookUrl": "https://mybusiness.com/webhook"
}
```

#### POST `/login`
Authenticates merchant
```json
{
  "email": "merchant@example.com",
  "password": "securepassword"
}
```

#### POST `/resend-otp`
Resends OTP for registration
```json
{
  "email": "merchant@example.com"
}
```

#### GET `/profile`
Gets merchant profile (requires authentication)
```
Authorization: Bearer <jwt_token>
```

## Environment Variables

Add these to your `.env` file:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
JWT_SECRET=your_strong_jwt_secret
```

### Email Configuration
For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## Frontend Components

### AuthWrapper
Main authentication component that switches between Login and Registration

### Registration
Multi-step registration form:
1. Email input
2. OTP verification
3. Account details

### Login
Simple login form with email and password

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days
- OTPs expire after 10 minutes
- Email verification required before login
- Automatic token validation on protected routes
- Secure password requirements (minimum 6 characters)

## Usage

1. Start the backend server: `npm start`
2. Start the frontend: `npm run dev`
3. Navigate to the homepage to register or login
4. Complete the email verification process
5. Access the admin dashboard after authentication

## Notes

- The system uses MongoDB to store OTPs with automatic expiration
- Merchants can only have one active OTP at a time
- Used OTPs are marked and cannot be reused
- Welcome emails are sent after successful registration
