const crypto = require('crypto');
const axios = require('axios');

class SelcomService {
  constructor() {
    this.baseURL = process.env.SELCOM_BASE_URL || 'https://apigw.selcommobile.com/v1';
    this.apiKey = process.env.SELCOM_API_KEY;
    this.apiSecret = process.env.SELCOM_API_SECRET;
    this.merchantId = process.env.SELCOM_MERCHANT_ID;
    
    if (!this.apiKey || !this.apiSecret || !this.merchantId) {
      console.warn('⚠️ Selcom credentials not configured. Wallet payments will not work.');
    }
  }

  /**
   * Generate Selcom signature for API requests
   * Based on Selcom API documentation: https://developers.selcommobile.com/#checkout-api
   */
  generateSignature(data, secret) {
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', secret)
      .update(queryString)
      .digest('base64');
  }

  /**
   * Generate Selcom headers for API requests
   */
  generateHeaders(data) {
    const timestamp = new Date().toISOString();
    const signedFields = Object.keys(data).sort().join(',');
    const digest = this.generateSignature(data, this.apiSecret);
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `SELCOM ${Buffer.from(this.apiKey).toString('base64')}`,
      'Digest-Method': 'HS256',
      'Digest': digest,
      'Timestamp': timestamp,
      'Signed-Fields': signedFields
    };
  }

  /**
   * Create a payment order using Selcom Checkout API
   * Based on: https://developers.selcommobile.com/#checkout-api
   */
  async createPaymentOrder(orderData) {
    try {
      const {
        amount,
        currency = 'TZS',
        orderId,
        customerPhone,
        customerEmail,
        customerName,
        description,
        callbackUrl,
        cancelUrl
      } = orderData;

      const payload = {
        vendor: this.merchantId,
        order_id: orderId,
        buyer_name: customerName,
        buyer_email: customerEmail,
        buyer_phone: customerPhone,
        amount: amount,
        currency: currency,
        no_of_items: 1,
        payment_methods: 'ALL',
        redirect_url: callbackUrl,
        cancel_url: cancelUrl,
        webhook: `${process.env.BASE_URL}/backend/wallet/selcom/webhook`,
        status: 'PENDING'
      };

      // Generate headers with proper Selcom authentication
      const headers = this.generateHeaders(payload);

      const response = await axios.post(`${this.baseURL}/checkout/create-order`, payload, {
        headers: headers
      });

      return {
        success: true,
        data: response.data,
        paymentUrl: response.data.data?.checkout_url
      };

    } catch (error) {
      console.error('Selcom payment order creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment order creation failed'
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(orderId) {
    try {
      const payload = {
        vendor: this.merchantId,
        order_id: orderId
      };

      const signature = this.generateSignature(payload, this.apiSecret);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/v1/checkout/query`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Selcom payment verification failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Process mobile money payment
   */
  async processMobileMoneyPayment(paymentData) {
    try {
      const {
        amount,
        phoneNumber,
        orderId,
        description
      } = paymentData;

      const payload = {
        vendor: this.merchantId,
        order_id: orderId,
        buyer_name: 'Wallet User',
        buyer_phone: phoneNumber,
        amount: amount,
        currency: 'TZS',
        payment_methods: 'MOBILE_MONEY',
        status: 'PENDING'
      };

      const signature = this.generateSignature(payload, this.apiSecret);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/v1/checkout/create-order`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Selcom mobile money payment failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Mobile money payment failed'
      };
    }
  }

  /**
   * Process bank transfer
   */
  async processBankTransfer(transferData) {
    try {
      const {
        amount,
        bankCode,
        accountNumber,
        accountName,
        orderId,
        description
      } = transferData;

      const payload = {
        vendor: this.merchantId,
        order_id: orderId,
        buyer_name: accountName,
        amount: amount,
        currency: 'TZS',
        payment_methods: 'BANK_TRANSFER',
        bank_code: bankCode,
        account_number: accountNumber,
        status: 'PENDING'
      };

      const signature = this.generateSignature(payload, this.apiSecret);
      payload.signature = signature;

      const response = await axios.post(`${this.baseURL}/v1/checkout/create-order`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Selcom bank transfer failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Bank transfer failed'
      };
    }
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods() {
    return {
      mobile_money: {
        name: 'Mobile Money',
        providers: ['Vodacom M-Pesa', 'Airtel Money', 'Tigo Pesa', 'HaloPesa'],
        icon: '📱'
      },
      bank_transfer: {
        name: 'Bank Transfer',
        providers: ['CRDB Bank', 'NMB Bank', 'Equity Bank', 'Exim Bank'],
        icon: '🏦'
      },
      card: {
        name: 'Card Payment',
        providers: ['Visa', 'Mastercard', 'American Express'],
        icon: '💳'
      }
    };
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature) {
    const expectedSignature = this.generateSignature(payload, this.apiSecret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

module.exports = new SelcomService();
