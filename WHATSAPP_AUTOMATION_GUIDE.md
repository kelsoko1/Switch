# WhatsApp Automation System Guide

## Overview

Your Kijumbe WhatsApp automation system is now fully operational! This guide explains how the automation works, how to customize it, and how to monitor its performance.

## 🚀 What's Already Working

### ✅ **Inbound Message Processing**
- **Webhook Integration**: Green API sends messages to `/backend/whatsapp/webhook`
- **Natural Language Understanding**: Bot understands Swahili and English commands
- **User Registration**: New users are automatically registered via WhatsApp
- **Session Management**: Conversations are tracked and managed

### ✅ **Automated Responses**
- **Welcome Messages**: New users get guided onboarding
- **Role Selection**: Users can choose between Kiongozi (Leader) and Mwanachama (Member)
- **Help System**: Comprehensive help menu with available commands
- **Status Reports**: Users can check their balance, groups, and transaction history
- **Contribution Processing**: Users can make contributions via WhatsApp

### ✅ **Advanced Features**
- **Conversation Flows**: Multi-step conversations for complex tasks
- **Rate Limiting**: Prevents spam and respects API limits
- **Error Handling**: Graceful error messages and recovery
- **Message Queue**: Reliable message delivery with retry logic
- **Database Integration**: All interactions are stored in Appwrite

## 📱 How Users Interact

### **New User Flow**
1. User sends "Hi" or "Hello" to WhatsApp bot
2. Bot responds with welcome message and role selection
3. User chooses "KIONGOZI" or "MWANACHAMA"
4. User is registered and can start using the system

### **Available Commands**
```
🔹 Status / Hali - Check your status and balance
🔹 Vikundi / Groups - View your groups
🔹 Toa [amount] - Make a contribution (e.g., "toa 50000")
🔹 Salio / Balance - Check your balance
🔹 Historia / History - View transaction history
🔹 Msaada / Help - Get help menu
🔹 Unda / Create - Create a group (Leaders only)
🔹 Jiunga / Join - Join a group
```

## 🔧 Configuration

### **Environment Variables**
Make sure these are set in your `.env` file:

```env
# Green API Configuration
GREENAPI_ID_INSTANCE=your_instance_id
GREENAPI_API_TOKEN_INSTANCE=your_api_token
GREENAPI_API_URL=https://api.green-api.com
GREENAPI_BOT_PHONE=your_bot_phone_number
GREENAPI_WEBHOOK_URL=https://yourdomain.com/backend/whatsapp/webhook

# Automation Settings
GREENAPI_ENABLE_QUEUE=true
GREENAPI_QUEUE_DELAY=2000
GREENAPI_MAX_RETRY_ATTEMPTS=3
GREENAPI_RATE_LIMIT_PER_MINUTE=30
```

### **Customizing Messages**
Edit `config/automation-config.js` to customize:
- Message templates
- Automation rules
- Validation rules
- Error messages

## 📊 Monitoring & Analytics

### **Check Bot Status**
```bash
GET /backend/whatsapp/status
```

### **View Statistics**
```bash
GET /backend/whatsapp/statistics
```

### **Monitor Automation**
```bash
GET /backend/whatsapp/automation/stats
GET /backend/whatsapp/automation/sessions
```

### **View Recent Messages**
```bash
GET /backend/whatsapp/messages?limit=50
```

## 🛠️ Advanced Customization

### **Adding New Commands**

1. **Update Automation Rules** in `config/automation-config.js`:

```javascript
rules: {
  new_command: {
    triggers: ['keyword1', 'keyword2'],
    actions: ['action1', 'action2'],
    nextFlow: 'flow_name',
    priority: 1
  }
}
```

2. **Add Message Template**:

```javascript
templates: {
  newCommand: () => 'Your custom message here'
}
```

3. **Implement Handler** in `services/whatsapp-automation.js`:

```javascript
async handleNewCommandFlow(phoneNumber, message, session) {
  // Your custom logic here
}
```

### **Custom Conversation Flows**

Define multi-step conversations in `config/automation-config.js`:

```javascript
flows: {
  custom_flow: {
    steps: [
      {
        step: 0,
        action: 'send_question',
        nextStep: 1,
        conditions: []
      },
      {
        step: 1,
        action: 'process_answer',
        nextStep: 'end',
        conditions: ['is_valid_answer']
      }
    ]
  }
}
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Messages Not Being Received**
   - Check webhook URL in Green API dashboard
   - Verify server is accessible from internet
   - Check server logs for errors

2. **Bot Not Responding**
   - Check Green API instance status
   - Verify API credentials
   - Check message queue status

3. **Database Errors**
   - Verify Appwrite connection
   - Check collection permissions
   - Review error logs

### **Debug Commands**

```bash
# Test WhatsApp connection
POST /backend/whatsapp/test-connection
{
  "phoneNumber": "+255738071080"
}

# Clear message queue
POST /backend/whatsapp/clear-queue

# Get instance info
GET /backend/whatsapp/instance-info
```

## 📈 Performance Optimization

### **Rate Limiting**
- Default: 30 messages per minute
- Adjustable via `GREENAPI_RATE_LIMIT_PER_MINUTE`
- Queue system handles overflow

### **Session Management**
- Sessions timeout after 30 minutes
- Automatic cleanup of old sessions
- Memory-efficient storage

### **Message Queue**
- Reliable delivery with retry logic
- Configurable delays between messages
- Error tracking and reporting

## 🔐 Security Features

### **Webhook Verification**
- Optional webhook secret verification
- Request validation
- Error logging

### **User Validation**
- Phone number format validation
- Role-based access control
- Transaction limits

## 📱 Testing Your Bot

### **Test Scenarios**

1. **New User Registration**
   ```
   User: "Hi"
   Bot: Welcome message + role selection
   User: "KIONGOZI"
   Bot: Registration confirmation
   ```

2. **Contribution Flow**
   ```
   User: "toa 50000"
   Bot: Processing message + confirmation
   ```

3. **Help System**
   ```
   User: "msaada"
   Bot: Help menu with all commands
   ```

### **Test Phone Numbers**
- Use your own phone number for testing
- Add test numbers to Green API whitelist
- Monitor logs for debugging

## 🚀 Deployment Checklist

### **Production Setup**
- [ ] Configure Green API instance
- [ ] Set up webhook URL
- [ ] Configure environment variables
- [ ] Test all commands
- [ ] Monitor initial interactions
- [ ] Set up logging and monitoring

### **Monitoring**
- [ ] Set up health checks
- [ ] Configure error alerts
- [ ] Monitor message queue
- [ ] Track user engagement
- [ ] Monitor API usage

## 📞 Support

### **Getting Help**
1. Check server logs for errors
2. Test individual endpoints
3. Verify Green API configuration
4. Review this documentation

### **Useful Endpoints**
- Health Check: `GET /health`
- WhatsApp Status: `GET /backend/whatsapp/status`
- Automation Stats: `GET /backend/whatsapp/automation/stats`

## 🎯 Next Steps

### **Enhancement Ideas**
1. **AI Integration**: Add natural language processing
2. **Payment Integration**: Direct payment processing
3. **Notifications**: Automated reminders and alerts
4. **Analytics**: Detailed user behavior tracking
5. **Multi-language**: Support for more languages

### **Advanced Features**
1. **Group Management**: Direct group operations via WhatsApp
2. **Scheduled Messages**: Automated reminders
3. **File Sharing**: Document and image support
4. **Voice Messages**: Voice command support

---

## 🎉 Congratulations!

Your WhatsApp automation system is now fully operational! Users can interact with your Kijumbe platform entirely through WhatsApp, making it more accessible and user-friendly.

The system automatically handles:
- ✅ User registration and onboarding
- ✅ Role-based access control
- ✅ Financial transactions
- ✅ Group management
- ✅ Help and support
- ✅ Status and balance inquiries

Start testing with your phone number and watch your users engage with the platform through WhatsApp!
