# Enhanced WhatsApp Integration Guide for Kijumbe

This guide covers the complete WhatsApp integration using Green API for the Kijumbe Rotational Savings Platform, including all the latest features and improvements.

## 🚀 Overview

The WhatsApp integration has been completely overhauled to provide:
- **Message Queuing**: Prevents rate limiting and ensures reliable delivery
- **Enhanced Webhook Handling**: Supports all Green API webhook types
- **Advanced Message Types**: Interactive buttons, list messages, and media support
- **Comprehensive Monitoring**: Real-time status, queue management, and analytics
- **Security Features**: Webhook signature verification and rate limiting

## 🏗️ Architecture

### 1. Green API Service (`services/greenapi.js`)
A centralized service class that handles all WhatsApp operations:

```javascript
const greenAPI = require('../services/greenapi');

// Send text message with queue support
await greenAPI.addToQueue(phoneNumber, message, options);

// Send media message
await greenAPI.sendMediaMessage(phoneNumber, mediaUrl, caption, options);

// Send interactive buttons
await greenAPI.sendInteractiveButtons(phoneNumber, message, buttons);

// Send list message
await greenAPI.sendListMessage(phoneNumber, message, sections);
```

### 2. Enhanced Routes (`routes/whatsapp.js`)
Updated routes with new endpoints and improved webhook handling:

- `/webhook` - Enhanced webhook processing
- `/queue-status` - Get message queue status
- `/clear-queue` - Clear pending messages
- `/instance-info` - Get Green API instance details
- `/send-list-message` - Send interactive list messages
- `/chat-history/:phoneNumber` - Get conversation history
- `/mark-read` - Mark messages as read

### 3. Admin Dashboard Integration
Enhanced backend admin panel with:
- Real-time queue monitoring
- Message statistics
- Instance information
- Queue management tools

## ⚙️ Configuration

### Environment Variables

```bash
# Core Green API Configuration
GREENAPI_API_URL=https://your-instance.api.greenapi.com
GREENAPI_MEDIA_URL=https://your-instance.media.greenapi.com
GREENAPI_ID_INSTANCE=your_instance_id
GREENAPI_API_TOKEN_INSTANCE=your_api_token
GREENAPI_BOT_PHONE=your_bot_phone_number
GREENAPI_WEBHOOK_URL=https://your-domain.com/backend/whatsapp/webhook

# Advanced Features
GREENAPI_ENABLE_QUEUE=true
GREENAPI_QUEUE_DELAY=2000
GREENAPI_MAX_RETRY_ATTEMPTS=3
GREENAPI_MESSAGE_TIMEOUT=10000
GREENAPI_RATE_LIMIT_PER_MINUTE=30

# Security & Monitoring
GREENAPI_WEBHOOK_SECRET=your_webhook_secret_key
GREENAPI_ENABLE_RATE_LIMITING=true
GREENAPI_ENABLE_LOGGING=true
GREENAPI_LOG_LEVEL=info

# Media Support
GREENAPI_ENABLE_MEDIA_MESSAGES=true
GREENAPI_MAX_MEDIA_SIZE=16777216
GREENAPI_SUPPORTED_MEDIA_TYPES=image,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,mp3,mp4,avi,mov
```

## 🔧 Setup Instructions

### Step 1: Green API Account Setup
1. Visit [green-api.com](https://green-api.com)
2. Create a free account
3. Create a WhatsApp instance
4. Note your Instance ID and API Token

### Step 2: Environment Configuration
1. Copy `env.example` to `.env`
2. Update Green API credentials
3. Set your webhook URL
4. Configure advanced features

### Step 3: Webhook Configuration
1. Set webhook URL in Green API console
2. Configure webhook secret for security
3. Test webhook delivery

### Step 4: Test Integration
1. Start your server
2. Access `/backend` admin panel
3. Navigate to WhatsApp Management
4. Test bot connection

## 📱 Message Types Supported

### 1. Text Messages
```javascript
await greenAPI.sendMessage(phoneNumber, "Hello from Kijumbe!");
```

### 2. Media Messages
```javascript
await greenAPI.sendMediaMessage(
  phoneNumber, 
  "https://example.com/image.jpg", 
  "Check out this image!", 
  { mediaType: 'image' }
);
```

### 3. Interactive Buttons
```javascript
const buttons = [
  { text: 'View Status', id: 'status' },
  { text: 'My Groups', id: 'groups' },
  { text: 'Get Help', id: 'help' }
];

await greenAPI.sendInteractiveButtons(phoneNumber, "Choose an option:", buttons);
```

### 4. List Messages
```javascript
const sections = [{
  title: 'Select Group',
  rows: [
    { id: 'group1', title: 'Group 1', description: 'Savings Group' },
    { id: 'group2', title: 'Group 2', description: 'Investment Group' }
  ]
}];

await greenAPI.sendListMessage(phoneNumber, "Choose your group:", sections);
```

## 🔄 Message Queuing System

### Features
- **Automatic Rate Limiting**: Prevents API rate limit violations
- **Retry Logic**: Automatically retries failed messages
- **Queue Management**: Monitor and control message queue
- **Configurable Delays**: Set delays between messages

### Queue Status
```javascript
const queueStatus = greenAPI.getQueueStatus();
// Returns: { queueLength, isProcessing, rateLimitCounter, rateLimitResetTime }
```

### Queue Control
```javascript
// Clear all pending messages
const clearedCount = greenAPI.clearQueue();

// Add message to queue
await greenAPI.addToQueue(phoneNumber, message, options);
```

## 📊 Monitoring & Analytics

### Real-time Status
- Bot connection status
- Instance information
- Webhook configuration
- Queue status

### Message Statistics
- Total incoming/outgoing messages
- Success/failure rates
- Message types breakdown
- Performance metrics

### Queue Monitoring
- Queue length
- Processing status
- Rate limit counters
- Reset timers

## 🛡️ Security Features

### Webhook Verification
```javascript
// Verify webhook signature
if (greenAPI.config.webhookSecret) {
  const signature = req.headers['x-green-api-signature'];
  if (signature !== greenAPI.config.webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### Rate Limiting
- Per-minute message limits
- Automatic throttling
- Queue-based delivery

### Input Validation
- Phone number format validation
- Message content sanitization
- Media type restrictions

## 🔌 Webhook Types Supported

### 1. Message Events
- `incomingMessageReceived` - New incoming messages
- `outgoingMessageReceived` - Messages sent from phone
- `outgoingAPIMessageReceived` - API-sent messages
- `outgoingMessageStatus` - Message delivery status

### 2. System Events
- `stateInstanceChanged` - Instance state changes
- `deviceInfo` - Device information updates
- `incomingCall` - Incoming call notifications

### 3. Extended Events
- `incomingMessageReceivedExtended` - Enhanced message data
- `outgoingMessageReceivedExtended` - Enhanced outgoing data

## 🎯 Bot Commands & Responses

### User Commands
| Command | Description | Response |
|---------|-------------|----------|
| `HELP` / `MSAADA` | Show help menu | Interactive help with buttons |
| `STATUS` / `HALI` | User status | Account information and groups |
| `VIKUNDI` / `GROUPS` | User groups | List of user's groups with details |
| `TOA [amount]` | Make contribution | Process contribution with group selection |
| `SALIO` | Check balance | Financial status across all groups |
| `HISTORIA` | Transaction history | Recent transactions with details |

### Smart Processing
- Natural language understanding
- Context-aware responses
- Multi-language support (Swahili/English)
- Automatic fallbacks

## 🚀 Advanced Features

### 1. Bulk Messaging
```javascript
// Send to multiple users
await greenAPI.sendBulkNotification(phoneNumbers, message);
```

### 2. Chat History
```javascript
// Get conversation history
const history = await greenAPI.getChatHistory(phoneNumber, 100);
```

### 3. Message Status Tracking
```javascript
// Mark message as read
await greenAPI.markMessageAsRead(phoneNumber, messageId);
```

### 4. Instance Management
```javascript
// Get instance status
const status = await greenAPI.getInstanceStatus();

// Get instance settings
const settings = await greenAPI.getInstanceSettings();

// Update webhook URL
await greenAPI.setWebhookUrl(newWebhookUrl);
```

## 📱 Admin Dashboard Features

### WhatsApp Management Tab
1. **Status Overview**: Bot status, connection info, webhook URL
2. **Queue Status**: Queue length, processing status, rate limits
3. **Message Statistics**: Incoming/outgoing counts, success rates
4. **Recent Messages**: Latest conversations with details
5. **Test & Send**: Test bot connection and send messages
6. **Instance Info**: Detailed Green API instance information

### Quick Actions
- Test bot connection
- Send individual messages
- Send bulk notifications
- Update webhook URL
- Clear message queue
- View instance details

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Responding
1. Check instance status in Green API console
2. Verify webhook URL accessibility
3. Check server logs for errors
4. Ensure WhatsApp is connected

#### Messages Not Delivered
1. Verify phone number format (+country code)
2. Check message content for violations
3. Monitor success rate in dashboard
4. Review error logs

#### Webhook Not Receiving
1. Verify HTTPS is enabled
2. Check firewall settings
3. Test webhook endpoint manually
4. Verify Green API webhook configuration

#### Queue Issues
1. Check queue status in dashboard
2. Monitor rate limit counters
3. Clear queue if necessary
4. Adjust queue delay settings

### Debug Steps
1. Check Green API instance status
2. Verify environment variables
3. Monitor server logs
4. Test webhook endpoint
5. Check message delivery status
6. Review queue status

## 📈 Performance Optimization

### Queue Management
- Implement message prioritization
- Set appropriate delays between messages
- Monitor queue performance
- Optimize retry strategies

### Rate Limiting
- Configure appropriate limits
- Monitor API usage
- Implement backoff strategies
- Track success rates

### Error Handling
- Implement comprehensive error logging
- Set up error notifications
- Monitor failure patterns
- Implement automatic recovery

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Analytics**: Message insights and user behavior
2. **A/B Testing**: Message template optimization
3. **CRM Integration**: Connect with customer management systems
4. **Scheduled Messages**: Automated reminders and notifications
5. **Multi-language**: Support for additional languages
6. **AI Chatbot**: Natural language processing for better responses

### Integration Opportunities
1. **Payment Gateways**: Direct payment processing via WhatsApp
2. **SMS Fallback**: SMS notifications when WhatsApp unavailable
3. **Voice Messages**: Audio message support
4. **Video Calls**: Integration with video calling features
5. **Business Tools**: WhatsApp Business API features

## 📚 API Reference

### Green API Service Methods

#### Core Methods
- `sendMessage(phoneNumber, message, options)`
- `sendMediaMessage(phoneNumber, mediaUrl, caption, options)`
- `sendInteractiveButtons(phoneNumber, message, buttons, options)`
- `sendListMessage(phoneNumber, message, sections, options)`

#### Queue Management
- `addToQueue(phoneNumber, message, options)`
- `getQueueStatus()`
- `clearQueue()`

#### Instance Management
- `getInstanceStatus()`
- `getInstanceSettings()`
- `setWebhookUrl(webhookUrl)`

#### Utility Methods
- `getChatHistory(phoneNumber, count)`
- `markMessageAsRead(phoneNumber, messageId)`

### Route Endpoints

#### GET Endpoints
- `/status` - Bot status and configuration
- `/statistics` - Message statistics
- `/messages` - Recent messages
- `/queue-status` - Queue status
- `/instance-info` - Instance information

#### POST Endpoints
- `/webhook` - Webhook processing
- `/send-notification` - Send individual message
- `/send-bulk-notification` - Send bulk messages
- `/send-list-message` - Send list message
- `/test-connection` - Test bot connection
- `/clear-queue` - Clear message queue

#### PUT Endpoints
- `/webhook-url` - Update webhook URL

## 🎉 Conclusion

The enhanced WhatsApp integration provides a robust, scalable, and feature-rich solution for the Kijumbe platform. With message queuing, advanced message types, comprehensive monitoring, and security features, it's ready for production use and can handle high message volumes efficiently.

For support and questions, refer to:
- Green API Documentation: [green-api.com/en/docs/](https://green-api.com/en/docs/)
- Kijumbe Development Team
- Green API Support: support@greenapi.com

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Production Ready
