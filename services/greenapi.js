const axios = require('axios');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');

class GreenAPIService {
  constructor() {
    this.config = {
      instanceId: process.env.GREENAPI_ID_INSTANCE,
      apiToken: process.env.GREENAPI_API_TOKEN_INSTANCE,
      baseUrl: process.env.GREENAPI_API_URL,
      mediaUrl: process.env.GREENAPI_MEDIA_URL,
      botPhone: process.env.GREENAPI_BOT_PHONE,
      webhookUrl: process.env.GREENAPI_WEBHOOK_URL,
      webhookSecret: process.env.GREENAPI_WEBHOOK_SECRET,
      enableQueue: process.env.GREENAPI_ENABLE_QUEUE === 'true',
      queueDelay: parseInt(process.env.GREENAPI_QUEUE_DELAY) || 2000,
      maxRetries: parseInt(process.env.GREENAPI_MAX_RETRY_ATTEMPTS) || 3,
      messageTimeout: parseInt(process.env.GREENAPI_MESSAGE_TIMEOUT) || 10000,
      rateLimitPerMinute: parseInt(process.env.GREENAPI_RATE_LIMIT_PER_MINUTE) || 30
    };

    this.messageQueue = [];
    this.isProcessingQueue = false;
    this.rateLimitCounter = 0;
    this.rateLimitResetTime = Date.now() + 60000; // Reset every minute

    // Validate configuration
    this.validateConfig();
  }

  validateConfig() {
    const required = ['instanceId', 'apiToken', 'baseUrl', 'botPhone'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️  Warning: Missing Green API configuration: ${missing.join(', ')}`);
      console.warn('   WhatsApp functionality will be limited. Please check your .env file.');
    }
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now > this.rateLimitResetTime) {
      this.rateLimitCounter = 0;
      this.rateLimitResetTime = now + 60000;
    }

    if (this.rateLimitCounter >= this.config.rateLimitPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before sending more messages.');
    }

    this.rateLimitCounter++;
    return true;
  }

  // Add message to queue
  addToQueue(phoneNumber, message, options = {}) {
    if (!this.config.enableQueue) {
      return this.sendMessage(phoneNumber, message, options);
    }

    this.messageQueue.push({
      phoneNumber,
      message,
      options,
      timestamp: Date.now(),
      retryCount: 0
    });

    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return Promise.resolve({ queued: true, queuePosition: this.messageQueue.length });
  }

  // Process message queue
  async processQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const messageData = this.messageQueue.shift();
      
      try {
        await this.sendMessage(
          messageData.phoneNumber, 
          messageData.message, 
          messageData.options
        );
        
        // Wait between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, this.config.queueDelay));
        
      } catch (error) {
        console.error(`❌ Queue message failed for ${messageData.phoneNumber}:`, error.message);
        
        // Retry logic
        if (messageData.retryCount < this.config.maxRetries) {
          messageData.retryCount++;
          messageData.timestamp = Date.now();
          this.messageQueue.unshift(messageData);
        } else {
          // Store failed message
          await this.storeFailedMessage(messageData.phoneNumber, messageData.message, error.message);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Send text message
  async sendMessage(phoneNumber, message, options = {}) {
    try {
      this.checkRateLimit();

      const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message
      };

      if (options.quotedMessageId) {
        payload.quotedMessageId = options.quotedMessageId;
      }

      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/SendMessage/${this.config.apiToken}`,
        payload,
        {
          timeout: this.config.messageTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
      
      // Store successful message
      await this.storeOutgoingMessage(phoneNumber, message, 'sent', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ WhatsApp send error to ${phoneNumber}:`, error.message);
      
      // Store failed message
      await this.storeOutgoingMessage(phoneNumber, message, 'failed', null, error.message);
      throw error;
    }
  }

  // Send media message
  async sendMediaMessage(phoneNumber, mediaUrl, caption = '', options = {}) {
    try {
      this.checkRateLimit();

      const payload = {
        chatId: `${phoneNumber}@c.us`,
        urlFile: mediaUrl,
        fileName: options.fileName || `kijumbe_${Date.now()}.${options.mediaType || 'jpg'}`,
        caption: caption
      };

      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/SendFileByUrl/${this.config.apiToken}`,
        payload,
        {
          timeout: this.config.messageTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Media message sent to ${phoneNumber}`);
      
      // Store successful media message
      await this.storeOutgoingMessage(phoneNumber, `[MEDIA] ${caption}`, 'sent', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Media message error to ${phoneNumber}:`, error.message);
      
      // Store failed message
      await this.storeOutgoingMessage(phoneNumber, `[MEDIA] ${caption}`, 'failed', null, error.message);
      throw error;
    }
  }

  // Send interactive buttons
  async sendInteractiveButtons(phoneNumber, message, buttons, options = {}) {
    try {
      this.checkRateLimit();

      const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message,
        buttons: buttons.map(button => ({
          buttonText: button.text || button.buttonText,
          buttonId: button.id || button.buttonId || `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };

      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/SendButtons/${this.config.apiToken}`,
        payload,
        {
          timeout: this.config.messageTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Interactive buttons sent to ${phoneNumber}`);
      
      // Store successful interactive message
      await this.storeOutgoingMessage(phoneNumber, `[INTERACTIVE] ${message}`, 'sent', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Interactive buttons error to ${phoneNumber}:`, error.message);
      
      // Store failed message
      await this.storeOutgoingMessage(phoneNumber, `[INTERACTIVE] ${message}`, 'failed', null, error.message);
      throw error;
    }
  }

  // Send list message
  async sendListMessage(phoneNumber, message, sections, options = {}) {
    try {
      this.checkRateLimit();

      const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message,
        sections: sections
      };

      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/SendList/${this.config.apiToken}`,
        payload,
        {
          timeout: this.config.messageTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ List message sent to ${phoneNumber}`);
      
      // Store successful list message
      await this.storeOutgoingMessage(phoneNumber, `[LIST] ${message}`, 'sent', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ List message error to ${phoneNumber}:`, error.message);
      
      // Store failed message
      await this.storeOutgoingMessage(phoneNumber, `[LIST] ${message}`, 'failed', null, error.message);
      throw error;
    }
  }

  // Get instance status
  async getInstanceStatus() {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/getStateInstance/${this.config.apiToken}`
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Get instance status error:', error.message);
      throw error;
    }
  }

  // Get instance settings
  async getInstanceSettings() {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/getSettings/${this.config.apiToken}`
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Get instance settings error:', error.message);
      throw error;
    }
  }

  // Set webhook URL
  async setWebhookUrl(webhookUrl) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/setWebhook/${this.config.apiToken}`,
        { webhookUrl }
      );
      
      console.log(`✅ Webhook URL updated to: ${webhookUrl}`);
      return response.data;
    } catch (error) {
      console.error('❌ Set webhook URL error:', error.message);
      throw error;
    }
  }

  // Get chat history
  async getChatHistory(phoneNumber, count = 100) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/getChatHistory/${this.config.apiToken}`,
        {
          params: {
            chatId: `${phoneNumber}@c.us`,
            count: count
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`❌ Get chat history error for ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(phoneNumber, messageId) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/readChat/${this.config.apiToken}`,
        {
          chatId: `${phoneNumber}@c.us`,
          idMessage: messageId
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`❌ Mark message as read error for ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  // Store outgoing message
  async storeOutgoingMessage(phoneNumber, message, status, responseData = null, error = null) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WHATSAPP_MESSAGES || 'whatsapp_messages',
        'unique()',
        {
          phone_number: phoneNumber,
          message: message,
          type: 'outgoing',
          status: status,
          response_data: responseData,
          error: error,
          timestamp: new Date().toISOString(),
          instance_id: this.config.instanceId
        }
      );
    } catch (error) {
      console.error('Failed to store outgoing message:', error.message);
    }
  }

  // Store failed message
  async storeFailedMessage(phoneNumber, message, error) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WHATSAPP_MESSAGES || 'whatsapp_messages',
        'unique()',
        {
          phone_number: phoneNumber,
          message: message,
          type: 'outgoing',
          status: 'failed',
          error: error,
          timestamp: new Date().toISOString(),
          instance_id: this.config.instanceId
        }
      );
    } catch (error) {
      console.error('Failed to store failed message:', error.message);
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessingQueue,
      rateLimitCounter: this.rateLimitCounter,
      rateLimitResetTime: this.rateLimitResetTime
    };
  }

  // Clear message queue
  clearQueue() {
    const clearedCount = this.messageQueue.length;
    this.messageQueue = [];
    console.log(`🧹 Message queue cleared. ${clearedCount} messages removed.`);
    return clearedCount;
  }
}

module.exports = new GreenAPIService();
