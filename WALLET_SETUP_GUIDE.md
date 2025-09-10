# 🏦 Kijumbe Wallet Feature - Complete Setup Guide

## 🎯 Overview

The Kijumbe Wallet feature is a comprehensive digital wallet system integrated with Selcom payment gateway, providing secure financial transactions for the rotational savings platform.

## ✨ Features Implemented

### 🔐 Security Features
- **PIN Protection**: 4-6 digit PIN for wallet security
- **Transaction Limits**: Daily and monthly spending limits
- **Secure Authentication**: JWT-based authentication
- **Webhook Verification**: Selcom signature validation

### 💰 Payment Methods
- **Mobile Money**: M-Pesa, Airtel Money, Tigo Pesa, HaloPesa
- **Bank Transfer**: CRDB, NMB, Equity Bank, Exim Bank
- **Card Payments**: Visa, Mastercard, American Express

### 📊 Wallet Management
- **Balance Tracking**: Real-time balance updates
- **Transaction History**: Complete transaction records
- **Statistics Dashboard**: Spending analytics
- **Export Functionality**: CSV export of transactions

### 🎨 User Interface
- **Modern Design**: Beautiful, responsive UI with Tailwind CSS
- **Mobile-First**: Optimized for mobile devices
- **Real-time Updates**: Live balance and transaction updates
- **Intuitive Navigation**: Easy-to-use interface

## 🏗️ Architecture

### Backend Components
```
src/
├── services/
│   ├── selcom.js          # Selcom payment gateway integration
│   └── wallet.js          # Wallet business logic
├── routes/
│   └── wallet.js          # Wallet API endpoints
└── config/
    └── appwrite-fixed.js  # Database configuration
```

### Frontend Components
```
frontend/src/
├── contexts/
│   └── WalletContext.jsx  # Wallet state management
├── pages/
│   └── Wallet.jsx         # Main wallet page
└── components/wallet/
    ├── DepositTab.jsx     # Deposit functionality
    ├── WithdrawTab.jsx    # Withdrawal functionality
    ├── HistoryTab.jsx     # Transaction history
    └── SettingsTab.jsx    # Wallet settings
```

## 🚀 Installation & Setup

### 1. Environment Configuration

Update your `.env` file with the following Selcom configuration:

```env
# Selcom Payment Gateway Configuration
SELCOM_BASE_URL=https://pay.selcom.co.tz
SELCOM_API_KEY=your_selcom_api_key
SELCOM_API_SECRET=your_selcom_api_secret
SELCOM_MERCHANT_ID=your_selcom_merchant_id
BASE_URL=http://localhost:3000

# Database Collections (add to existing)
COLLECTION_WALLETS=wallets
COLLECTION_WALLET_TRANSACTIONS=wallet_transactions
COLLECTION_WALLET_PAYMENTS=wallet_payments
```

### 2. Database Setup

Create the following collections in your Appwrite database:

#### Wallets Collection
```json
{
  "user_id": "string",
  "balance": "number",
  "currency": "string",
  "status": "string",
  "pin_hash": "string",
  "pin_set": "boolean",
  "daily_limit": "number",
  "monthly_limit": "number",
  "daily_spent": "number",
  "monthly_spent": "number",
  "last_reset_date": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Wallet Transactions Collection
```json
{
  "user_id": "string",
  "type": "string",
  "amount": "number",
  "description": "string",
  "reference": "string",
  "status": "string",
  "metadata": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Wallet Payments Collection
```json
{
  "user_id": "string",
  "transaction_id": "string",
  "payment_method": "string",
  "payment_data": "string",
  "selcom_order_id": "string",
  "status": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### 3. Install Dependencies

```bash
# Backend dependencies (already included)
npm install

# Frontend dependencies (already included)
cd frontend
npm install
```

### 4. Start the Application

```bash
# Start backend
npm start

# Start frontend (in another terminal)
cd frontend
npm run dev
```

## 🔧 Selcom Integration Setup

### 1. Selcom Account Setup

1. **Register with Selcom**: Visit [Selcom Developer Portal](https://developers.selcommobile.com)
2. **Get API Credentials**: Obtain your API key, secret, and merchant ID
3. **Configure Webhooks**: Set webhook URL to `https://yourdomain.com/backend/wallet/selcom/webhook`

### 2. Test Environment

For testing, use Selcom's sandbox environment:
```env
SELCOM_BASE_URL=https://sandbox.selcom.co.tz
```

### 3. Production Environment

For production, use Selcom's live environment:
```env
SELCOM_BASE_URL=https://pay.selcom.co.tz
```

## 📱 API Endpoints

### Wallet Management
- `GET /backend/wallet` - Get user wallet
- `POST /backend/wallet/pin` - Set wallet PIN
- `POST /backend/wallet/pin/verify` - Verify wallet PIN
- `GET /backend/wallet/stats` - Get wallet statistics

### Transactions
- `POST /backend/wallet/deposit` - Deposit funds
- `POST /backend/wallet/withdraw` - Withdraw funds
- `GET /backend/wallet/transactions` - Get transaction history
- `POST /backend/wallet/verify-payment` - Verify payment status

### Payment Methods
- `GET /backend/wallet/payment-methods` - Get supported payment methods

### Webhooks
- `POST /backend/wallet/selcom/webhook` - Selcom payment callback

## 🧪 Testing

### 1. Test Wallet Creation
```bash
curl -X GET http://localhost:3000/backend/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test PIN Setting
```bash
curl -X POST http://localhost:3000/backend/wallet/pin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234", "confirmPin": "1234"}'
```

### 3. Test Deposit
```bash
curl -X POST http://localhost:3000/backend/wallet/deposit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "paymentMethod": "mobile_money",
    "paymentData": {
      "phoneNumber": "+255123456789",
      "provider": "mpesa"
    }
  }'
```

## 🔒 Security Considerations

### 1. PIN Security
- PINs are hashed using bcrypt with salt rounds of 12
- PINs are never stored in plain text
- PIN verification is required for withdrawals

### 2. Transaction Limits
- Daily limits prevent large unauthorized transactions
- Monthly limits provide additional security
- Limits are enforced at the service level

### 3. Webhook Security
- Selcom webhooks are verified using HMAC signatures
- Invalid signatures are rejected
- Webhook payloads are validated

### 4. API Security
- All endpoints require JWT authentication
- Input validation using express-validator
- Rate limiting should be implemented in production

## 🚀 Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
SELCOM_BASE_URL=https://pay.selcom.co.tz
SELCOM_API_KEY=your_production_api_key
SELCOM_API_SECRET=your_production_api_secret
SELCOM_MERCHANT_ID=your_production_merchant_id
BASE_URL=https://yourdomain.com
```

### 2. SSL Certificate
- Ensure your domain has a valid SSL certificate
- Selcom requires HTTPS for webhook callbacks
- Update webhook URL in Selcom dashboard

### 3. Database Security
- Use strong database credentials
- Enable database encryption
- Regular backups

### 4. Monitoring
- Set up logging for all wallet transactions
- Monitor failed payments
- Track API response times

## 📊 Monitoring & Analytics

### 1. Transaction Monitoring
- Monitor successful/failed transactions
- Track payment method usage
- Monitor daily/monthly limits

### 2. Performance Metrics
- API response times
- Database query performance
- Webhook processing times

### 3. Error Tracking
- Failed payment attempts
- Invalid PIN attempts
- Webhook failures

## 🔧 Troubleshooting

### Common Issues

1. **Wallet not created**
   - Check user authentication
   - Verify database connection
   - Check Appwrite permissions

2. **Payment failures**
   - Verify Selcom credentials
   - Check webhook URL configuration
   - Validate payment data

3. **PIN issues**
   - Ensure PIN is 4-6 digits
   - Check bcrypt configuration
   - Verify PIN hashing

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=wallet:*
```

## 📞 Support

For technical support:
- Check the logs for error messages
- Verify environment configuration
- Test with Selcom sandbox first
- Contact Selcom support for payment gateway issues

## 🎉 Conclusion

The Kijumbe Wallet feature is now fully integrated and ready for production use. It provides a secure, user-friendly digital wallet experience with comprehensive payment options and robust security features.

Key benefits:
- ✅ Secure PIN-protected wallet
- ✅ Multiple payment methods
- ✅ Real-time transaction tracking
- ✅ Comprehensive security features
- ✅ Beautiful, responsive UI
- ✅ Production-ready architecture

The wallet system is designed to scale and can handle high transaction volumes while maintaining security and performance.
