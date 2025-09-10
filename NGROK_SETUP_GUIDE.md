# Ngrok Setup Guide for WhatsApp Webhook

This guide helps you set up ngrok tunneling for your WhatsApp bot webhook during development.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
npm run dev:tunnel
```

### Option 2: Windows Batch File
```bash
start-dev-tunnel.bat
```

### Option 3: PowerShell Script
```powershell
.\start-dev-tunnel.ps1
```

## 📋 What This Does

1. **Starts ngrok tunnel** on port 3000
2. **Displays webhook URL** for GreenAPI configuration
3. **Automatically updates .env** with the webhook URL
4. **Starts your development server** with the correct configuration

## 🔗 Getting Your Webhook URL

When you run the setup, you'll see output like this:

```
🔗 Your ngrok URL: https://abc123.ngrok-free.app
📱 Webhook URL for GreenAPI: https://abc123.ngrok-free.app/backend/whatsapp/webhook

📋 Copy this webhook URL to your GreenAPI console:
   https://abc123.ngrok-free.app/backend/whatsapp/webhook
```

## 🔧 GreenAPI Configuration

1. **Copy the webhook URL** from the console output
2. **Go to your GreenAPI console** (https://console.green-api.com)
3. **Navigate to your instance settings**
4. **Paste the webhook URL** in the webhook field
5. **Save the configuration**

## 📱 Testing Your Webhook

1. **Start the development server** with ngrok:
   ```bash
   npm run dev:tunnel
   ```

2. **Send a test message** to your WhatsApp bot number

3. **Check the server logs** to see if the webhook is receiving messages

4. **Verify in GreenAPI console** that webhook calls are being received

## 🛠️ Manual Setup (Alternative)

If you prefer to set up ngrok manually:

1. **Start ngrok** in one terminal:
   ```bash
   ngrok http 3000
   ```

2. **Copy the HTTPS URL** from ngrok output (e.g., `https://abc123.ngrok-free.app`)

3. **Update your .env file**:
   ```env
   GREENAPI_WEBHOOK_URL=https://abc123.ngrok-free.app/backend/whatsapp/webhook
   ```

4. **Start your server** in another terminal:
   ```bash
   npm run dev
   ```

## 🔍 Troubleshooting

### Ngrok Not Starting
- Make sure ngrok is installed: `ngrok version`
- Check if port 3000 is available
- Try restarting your terminal

### Webhook Not Receiving Messages
- Verify the webhook URL in GreenAPI console
- Check that your server is running on port 3000
- Ensure ngrok tunnel is active

### Environment Not Updating
- Check that `.env` file exists
- Verify file permissions
- Try running the script as administrator

## 📊 Monitoring

- **Ngrok Web Interface**: http://localhost:4040
- **Server Health Check**: http://localhost:3000/backend/health
- **WhatsApp Webhook**: http://localhost:3000/backend/whatsapp/webhook

## 🔒 Security Notes

- **Development Only**: This setup is for development only
- **Free Tier**: ngrok free tier has limitations
- **HTTPS**: ngrok provides HTTPS automatically
- **Temporary URLs**: ngrok URLs change each restart (unless you have a paid account)

## 🎯 Next Steps

1. **Configure GreenAPI** with your webhook URL
2. **Test message flow** with your WhatsApp bot
3. **Set up production webhook** when ready to deploy
4. **Monitor webhook logs** for debugging

---

**Need Help?** Check the main README.md or contact the development team.
