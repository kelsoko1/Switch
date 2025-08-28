# WhatsApp Bot Setup Guide for Kijumbe

This guide will help you set up and configure the WhatsApp bot integration using Green-API for the Kijumbe Rotational Savings Platform.

## 🚀 Quick Start

### 1. Prerequisites
- Green-API account (free tier available)
- WhatsApp Business API access
- Public domain with HTTPS (for webhooks)
- Node.js server running

### 2. Environment Configuration
Copy the following variables to your `.env` file:

```bash
# GreenAPI WhatsApp Business API
GREENAPI_API_URL=https://your-instance.api.greenapi.com
GREENAPI_MEDIA_URL=https://your-instance.media.greenapi.com
GREENAPI_ID_INSTANCE=your_instance_id
GREENAPI_API_TOKEN_INSTANCE=your_api_token
GREENAPI_BOT_PHONE=your_bot_phone_number
GREENAPI_WEBHOOK_URL=https://your-domain.com/backend/whatsapp/webhook
```

## 📱 Green-API Setup

### Step 1: Create Green-API Account
1. Visit [green-api.com](https://green-api.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create WhatsApp Instance
1. Go to Console → Instances
2. Click "Create Instance"
3. Choose "WhatsApp" as the service
4. Set instance name (e.g., "KijumbeBot")
5. Note down your Instance ID

### Step 3: Get API Token
1. Go to your instance settings
2. Copy the API Token
3. Keep this token secure

### Step 4: Connect WhatsApp Number
1. In your instance, click "Connect WhatsApp"
2. Scan the QR code with your WhatsApp
3. Wait for authorization
4. Verify the connection status shows "authorized"

## 🔗 Webhook Configuration

### Step 1: Set Webhook URL
Your webhook URL should point to:
```
https://your-domain.com/backend/whatsapp/webhook
```

### Step 2: Update Environment
Set the webhook URL in your `.env` file:
```bash
GREENAPI_WEBHOOK_URL=https://your-domain.com/backend/whatsapp/webhook
```

### Step 3: Test Webhook
1. Send a message to your bot
2. Check the webhook endpoint in your server logs
3. Verify the message is processed

## 🤖 Bot Features

### Automated Responses
The bot automatically responds to these commands:

| Command | Description | Response |
|---------|-------------|----------|
| `HELP` or `MSAADA` | Show help menu | List of available commands |
| `STATUS` or `HALI` | User status | Account information and groups |
| `VIKUNDI` or `GROUPS` | User groups | List of user's groups |
| `TOA [amount]` | Make contribution | Process contribution request |
| `SALIO` | Check balance | User's financial status |
| `HISTORIA` | Transaction history | Recent transactions |

### Message Templates
The bot uses predefined templates for:
- Welcome messages for new users
- Help and support messages
- Group creation/joining instructions
- Error messages

### Smart Processing
- Natural language understanding
- Context-aware responses
- Multi-language support (Swahili/English)
- Automatic retry on failures

## 📊 Management Interface

### Access the Dashboard
Navigate to: `http://localhost:3000/backend`

### WhatsApp Management Section
1. **Bot Status**: Monitor connection status
2. **Message Statistics**: View incoming/outgoing message counts
3. **Recent Messages**: Browse latest conversations
4. **Message Templates**: Preview and manage templates
5. **Quick Actions**: Send individual or bulk messages

### Key Features
- Real-time bot status monitoring
- Message success rate tracking
- Webhook configuration management
- Test connection functionality
- Bulk messaging capabilities

## 🔧 Advanced Configuration

### Message Rate Limiting
```bash
GREENAPI_DELAY_BETWEEN_MESSAGES=1000  # 1 second between messages
GREENAPI_MAX_RETRY_ATTEMPTS=3         # Retry failed messages
GREENAPI_MESSAGE_TIMEOUT=10000        # 10 second timeout
```

### Custom Message Templates
Edit the `MESSAGE_TEMPLATES` object in `routes/whatsapp.js` to customize:
- Welcome messages
- Help text
- Group instructions
- Error messages

### Webhook Security
For production, consider:
- Webhook authentication
- Rate limiting
- IP whitelisting
- Request validation

## 📱 Testing Your Bot

### Test Connection
1. Go to WhatsApp Management
2. Click "Test Bot"
3. Enter a test phone number
4. Verify the test message is received

### Send Test Message
1. Use "Send Message" feature
2. Enter phone number and message
3. Check delivery status
4. Monitor in Recent Messages

### Monitor Webhooks
Check your server logs for:
- Incoming webhook requests
- Message processing
- Error handling
- Success confirmations

## 🚨 Troubleshooting

### Common Issues

#### Bot Not Responding
- Check instance status in Green-API console
- Verify webhook URL is accessible
- Check server logs for errors
- Ensure WhatsApp is connected

#### Messages Not Delivered
- Verify phone number format (+country code)
- Check message content for violations
- Monitor success rate in dashboard
- Review error logs

#### Webhook Not Receiving
- Verify HTTPS is enabled
- Check firewall settings
- Test webhook endpoint manually
- Verify Green-API webhook configuration

### Debug Steps
1. Check Green-API instance status
2. Verify environment variables
3. Monitor server logs
4. Test webhook endpoint
5. Check message delivery status

## 📈 Monitoring & Analytics

### Dashboard Metrics
- Total messages (incoming/outgoing)
- Success rate percentage
- Bot connection status
- Recent message activity

### Log Analysis
Monitor these log types:
- Webhook requests
- Message processing
- Error occurrences
- Performance metrics

### Performance Optimization
- Implement message queuing
- Add retry mechanisms
- Monitor response times
- Optimize webhook processing

## 🔒 Security Considerations

### API Token Security
- Never expose API tokens in client-side code
- Use environment variables
- Rotate tokens regularly
- Monitor token usage

### Webhook Security
- Validate webhook requests
- Implement rate limiting
- Use HTTPS only
- Monitor for abuse

### Data Privacy
- Encrypt sensitive data
- Implement user consent
- Follow GDPR guidelines
- Regular security audits

## 🚀 Production Deployment

### Environment Setup
1. Update all environment variables
2. Set production webhook URL
3. Configure SSL certificates
4. Set up monitoring

### Scaling Considerations
- Implement message queuing
- Add load balancing
- Monitor resource usage
- Set up alerts

### Backup & Recovery
- Regular database backups
- Message log archiving
- Configuration backups
- Disaster recovery plan

## 📚 Additional Resources

### Green-API Documentation
- [Official Documentation](https://green-api.com/en/docs/)
- [API Reference](https://green-api.com/en/docs/api/)
- [Webhook Guide](https://green-api.com/en/docs/webhook/)
- [SDK Libraries](https://green-api.com/en/docs/sdk/)

### WhatsApp Business API
- [WhatsApp Business Guidelines](https://developers.facebook.com/docs/whatsapp/policy)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Best Practices](https://developers.facebook.com/docs/whatsapp/best-practices)

### Support Channels
- Green-API Support: support@greenapi.com
- WhatsApp Support: [WhatsApp Business Support](https://business.whatsapp.com/support)
- Community Forums: [Green-API Community](https://github.com/green-api)

## 🎯 Next Steps

After setup, consider implementing:
1. **Advanced Analytics**: Message insights and user behavior
2. **A/B Testing**: Message template optimization
3. **Integration**: Connect with CRM systems
4. **Automation**: Scheduled messages and reminders
5. **Multi-language**: Support for additional languages

---

**Need Help?** Contact the Kijumbe development team or refer to the Green-API documentation for technical support.
