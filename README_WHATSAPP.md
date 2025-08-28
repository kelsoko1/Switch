# 📱 WhatsApp Bot Integration for Kijumbe

This document describes the comprehensive WhatsApp bot integration built for the Kijumbe Rotational Savings Platform using the Green-API service.

## 🚀 Features Overview

### 🤖 Automated Bot Responses
- **Smart Command Processing**: Understands natural language commands in Swahili and English
- **Context-Aware Responses**: Provides relevant information based on user status and role
- **Multi-Language Support**: Swahili and English language support
- **Template-Based Messages**: Predefined message templates for consistency

### 💬 Message Management
- **Individual Messaging**: Send messages to specific users
- **Bulk Messaging**: Send notifications to multiple users simultaneously
- **Message Templates**: Customizable templates for different scenarios
- **Message History**: Track all incoming and outgoing messages

### 📊 Real-Time Monitoring
- **Bot Status Dashboard**: Monitor WhatsApp connection status
- **Message Statistics**: Track success rates and message counts
- **Live Message Feed**: View recent conversations in real-time
- **Performance Metrics**: Monitor bot performance and health

### 🔧 Management Interface
- **Web-Based Dashboard**: Full management interface at `/backend`
- **WhatsApp Management Section**: Dedicated bot management tools
- **Configuration Management**: Update webhook URLs and settings
- **Test Tools**: Built-in testing and debugging capabilities

## 🎯 Bot Commands

### User Commands
| Command | Description | Example |
|---------|-------------|---------|
| `HELP` / `MSAADA` | Show help menu | "msaada" |
| `STATUS` / `HALI` | View account status | "status" |
| `VIKUNDI` / `GROUPS` | List user's groups | "vikundi" |
| `TOA [amount]` | Make contribution | "toa 50000" |
| `SALIO` | Check balance | "salio" |
| `HISTORIA` | View transactions | "historia" |

### Admin Commands
- **Test Bot**: Verify bot connectivity
- **Send Message**: Send individual messages
- **Bulk Message**: Send to multiple users
- **Monitor Status**: Real-time bot monitoring

## 🏗️ Architecture

### Components
1. **WhatsApp Routes** (`routes/whatsapp.js`)
   - Message processing logic
   - Webhook handling
   - API endpoints

2. **Management Interface** (`backend/index.html`)
   - Bot status dashboard
   - Message management tools
   - Configuration interface

3. **Message Templates** (`routes/whatsapp.js`)
   - Predefined response templates
   - Multi-language support
   - Customizable content

4. **Database Integration**
   - Message logging
   - User interaction tracking
   - Performance metrics

### Data Flow
```
WhatsApp → Green-API → Webhook → Server → Database
    ↓
Response ← Template Engine ← Business Logic ← User Data
```

## 🔧 Setup Instructions

### 1. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Configure Green-API settings
GREENAPI_API_URL=https://your-instance.api.greenapi.com
GREENAPI_ID_INSTANCE=your_instance_id
GREENAPI_API_TOKEN_INSTANCE=your_api_token
GREENAPI_BOT_PHONE=your_bot_phone_number
GREENAPI_WEBHOOK_URL=https://your-domain.com/backend/whatsapp/webhook
```

### 2. Green-API Setup
1. Create account at [green-api.com](https://green-api.com)
2. Create WhatsApp instance
3. Get API token and instance ID
4. Connect WhatsApp number
5. Configure webhook URL

### 3. Start Server
```bash
# Start with WhatsApp bot
npm start

# Or use the dedicated script
start-whatsapp.bat
```

### 4. Access Management Interface
- **URL**: `http://localhost:3000/backend`
- **Login**: Use admin credentials
- **Navigation**: Click "WhatsApp Bot" in sidebar

## 📱 Using the Bot

### For Users
1. **Send Message**: Message the bot phone number
2. **Use Commands**: Type commands like "help" or "status"
3. **Get Responses**: Receive automated, helpful responses
4. **Make Contributions**: Use "toa [amount]" to contribute

### For Administrators
1. **Monitor Status**: Check bot connection and health
2. **Send Messages**: Send individual or bulk notifications
3. **View Statistics**: Monitor message success rates
4. **Manage Templates**: Customize response messages

## 🔍 Testing

### Run Test Suite
```bash
# Execute comprehensive tests
node test-whatsapp.js

# Test specific endpoints
npm test
```

### Manual Testing
1. **Test Connection**: Use "Test Bot" button in dashboard
2. **Send Test Message**: Use "Send Message" feature
3. **Monitor Webhooks**: Check server logs for webhook activity
4. **Verify Responses**: Test bot commands with real WhatsApp

## 📊 Dashboard Features

### Bot Status Overview
- Connection status indicator
- Instance information
- Bot phone number display
- Webhook configuration

### Message Statistics
- Total message counts
- Success/failure rates
- Incoming vs outgoing
- Performance metrics

### Recent Messages
- Live message feed
- Message type indicators
- Status tracking
- Timestamp information

### Quick Actions
- Send individual messages
- Bulk messaging
- Test connections
- Template previews

## 🚨 Troubleshooting

### Common Issues

#### Bot Not Responding
- Check Green-API instance status
- Verify webhook URL accessibility
- Check server logs for errors
- Ensure WhatsApp is connected

#### Messages Not Delivered
- Verify phone number format
- Check message content
- Monitor success rates
- Review error logs

#### Webhook Issues
- Verify HTTPS configuration
- Check firewall settings
- Test endpoint manually
- Verify Green-API settings

### Debug Steps
1. Check environment variables
2. Monitor server logs
3. Test webhook endpoint
4. Verify Green-API status
5. Check message delivery

## 🔒 Security Features

### API Security
- Environment variable protection
- Token-based authentication
- Request validation
- Rate limiting

### Webhook Security
- HTTPS enforcement
- Request validation
- Error handling
- Logging and monitoring

### Data Privacy
- Message encryption
- User consent
- GDPR compliance
- Regular audits

## 📈 Performance Optimization

### Message Handling
- Asynchronous processing
- Retry mechanisms
- Rate limiting
- Queue management

### Database Optimization
- Efficient queries
- Indexing strategies
- Connection pooling
- Performance monitoring

### Monitoring
- Real-time metrics
- Performance alerts
- Resource usage tracking
- Bottleneck identification

## 🚀 Future Enhancements

### Planned Features
1. **Advanced Analytics**: Message insights and user behavior
2. **A/B Testing**: Message template optimization
3. **CRM Integration**: Connect with customer management systems
4. **Scheduled Messages**: Automated reminders and notifications
5. **Multi-language**: Additional language support

### Technical Improvements
1. **Message Queuing**: Redis-based message queuing
2. **Load Balancing**: Multiple bot instances
3. **Caching**: Response caching for performance
4. **WebSocket**: Real-time dashboard updates
5. **API Versioning**: Structured API evolution

## 📚 Documentation

### Related Files
- `WHATSAPP_SETUP_GUIDE.md`: Detailed setup instructions
- `routes/whatsapp.js`: Bot implementation code
- `backend/index.html`: Management interface
- `test-whatsapp.js`: Testing suite
- `env.example`: Environment configuration template

### External Resources
- [Green-API Documentation](https://green-api.com/en/docs/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## 🤝 Support

### Getting Help
1. **Documentation**: Check this README and setup guide
2. **Code Comments**: Review inline code documentation
3. **Test Suite**: Run tests to identify issues
4. **Logs**: Check server and application logs
5. **Community**: Reach out to development team

### Reporting Issues
When reporting issues, include:
- Error messages and logs
- Steps to reproduce
- Environment details
- Expected vs actual behavior
- Screenshots if applicable

---

**Built with ❤️ for the Kijumbe Rotational Savings Platform**

For technical support or questions, contact the development team or refer to the comprehensive setup guide.
