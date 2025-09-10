const axios = require('axios');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');

class WhatsAppBot {
    constructor() {
        this.apiUrl = process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com';
        this.instanceId = process.env.GREENAPI_ID_INSTANCE || '7105299826';
        this.apiToken = process.env.GREENAPI_API_TOKEN_INSTANCE || 'a28ef2ef5d8848dea7f0e7869ddf80b29d15d256f694401e9c';
        this.botPhone = process.env.GREENAPI_BOT_PHONE || '255738071080';
        this.isConnected = false;
        this.messageQueue = [];
        this.settings = {
            enabled: false,
            welcomeMessage: 'Welcome to Kijumbe! How can I help you today?',
            autoReply: true
        };
        this.stats = {
            totalMessages: 0,
            activeUsers: 0,
            groupsConnected: 0
        };
    }

    // Initialize the bot
    async initialize() {
        try {
            console.log('🤖 Initializing WhatsApp Bot...');
            
            // Check if credentials are provided
            if (!this.instanceId || !this.apiToken) {
                console.log('⚠️ WhatsApp Bot credentials not provided. Bot will run in demo mode.');
                this.isConnected = false;
                return;
            }

            // Test connection
            const response = await axios.get(`${this.apiUrl}/waInstance${this.instanceId}/getSettings/${this.apiToken}`);
            
            if (response.data) {
                this.isConnected = true;
                console.log('✅ WhatsApp Bot connected successfully');
                console.log(`📱 Bot Phone: ${this.botPhone}`);
            }
        } catch (error) {
            console.log('❌ WhatsApp Bot connection failed:', error.message);
            this.isConnected = false;
        }
    }

    // Send message
    async sendMessage(phoneNumber, message) {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] WhatsApp message:', { phoneNumber, message });
                return { success: true, message: 'Message sent (demo mode)' };
            }

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/sendMessage/${this.apiToken}`,
                {
                    chatId: `${phoneNumber}@c.us`,
                    message: message
                }
            );

            console.log('📱 WhatsApp message sent:', { phoneNumber, message });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Failed to send WhatsApp message:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send message to group
    async sendGroupMessage(groupId, message) {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] WhatsApp group message:', { groupId, message });
                return { success: true, message: 'Group message sent (demo mode)' };
            }

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/sendMessage/${this.apiToken}`,
                {
                    chatId: `${groupId}@g.us`,
                    message: message
                }
            );

            console.log('📱 WhatsApp group message sent:', { groupId, message });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Failed to send WhatsApp group message:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Process incoming webhook
    async processWebhook(webhookData) {
        try {
            console.log('📨 Processing WhatsApp webhook:', JSON.stringify(webhookData, null, 2));

            // Check if this is an incoming message
            if (webhookData.typeWebhook !== 'incomingMessageReceived') {
                console.log('📨 Ignoring webhook type:', webhookData.typeWebhook);
                return { success: true, message: 'Webhook type ignored' };
            }

            if (!webhookData.messageData) {
                return { success: false, message: 'No message data' };
            }

            const { messageData, senderData } = webhookData;
            
            // Extract sender phone number
            const senderPhone = senderData?.sender?.replace('@c.us', '') || 
                              messageData.senderData?.sender?.replace('@c.us', '');
            
            // Extract message text
            const messageText = messageData.textMessageData?.textMessage || 
                              messageData.extendedTextMessageData?.text || '';

            console.log('📱 Extracted data:', { senderPhone, messageText });

            if (!senderPhone || !messageText) {
                console.log('❌ Missing data:', { senderPhone: !!senderPhone, messageText: !!messageText });
                return { success: false, message: 'Invalid message format' };
            }

            // Process the message based on content
            const response = await this.processMessage(senderPhone, messageText);
            
            if (response) {
                console.log('📤 Sending response to:', senderPhone);
                await this.sendMessage(senderPhone, response);
            }

            return { success: true, message: 'Webhook processed successfully' };
        } catch (error) {
            console.error('❌ Failed to process webhook:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Process incoming message
    async processMessage(phoneNumber, message) {
        const lowerMessage = message.toLowerCase().trim();

        // Welcome message
        if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hujambo') || lowerMessage.includes('start')) {
            return `🎉 *Hujambo! Karibu kwenye Kijumbe Rotational Savings Platform!*

*Chagua jukumu lako:*

🔹 *KIONGOZI* - Kama unataka kuwa kiongozi wa kikundi
🔹 *MWANACHAMA* - Kama unataka kuwa mwanachama
🔹 *MSAADA* - Kupata msaada zaidi
🔹 *MENU* - Kuona orodha kamili ya amri

*Andika neno la chaguo lako (mfano: KIONGOZI)*`;
        }

        // Role selection
        if (lowerMessage.includes('kiongozi') || lowerMessage.includes('leader')) {
            return `👑 *Umechagua kuwa Kiongozi!*

*Kama kiongozi, utaweza:*
• Kuunda vikundi vya akiba
• Kuwahudumia wanachama
• Kufuatilia michango
• Kutuma arifa
• Kufuatilia maendeleo ya kikundi

*Amri za Kiongozi:*
🔹 *UNDA* - Kuunda kikundi kipya
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *WANACHAMA* - Kuona wanachama wa kikundi
🔹 *ARIFA* - Kutuma arifa kwa wanachama

*Tafadhali enda kwenye tovuti: http://localhost:3000/kijumbe*`;
        }

        if (lowerMessage.includes('mwanachama') || lowerMessage.includes('member')) {
            return `👥 *Umechagua kuwa Mwanachama!*

*Kama mwanachama, utaweza:*
• Kuona vikundi vyako
• Kufanya michango
• Kufuatilia salio lako
• Kuona historia ya malipo
• Kupokea arifa za kikundi

*Amri za Mwanachama:*
🔹 *JIUNGA* - Kujiunga na kikundi
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *TOA [kiasi]* - Kufanya mchango (mfano: TOA 50000)
🔹 *SALIO* - Kuona salio lako
🔹 *HISTORIA* - Kuona historia ya malipo

*Tafadhali enda kwenye tovuti: http://localhost:3000/dashboard*`;
        }

        // Help and Menu
        if (lowerMessage.includes('msaada') || lowerMessage.includes('help') || lowerMessage.includes('menu')) {
            return `📋 *MENU YA KIJUMBE*

*Amri za Msingi:*
🔹 *START* - Kuanza mazungumzo
🔹 *KIONGOZI* - Kuchagua kuwa kiongozi
🔹 *MWANACHAMA* - Kuchagua kuwa mwanachama
🔹 *MENU* - Kuona orodha hii

*Amri za Kiongozi:*
🔹 *UNDA* - Kuunda kikundi kipya
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *WANACHAMA* - Kuona wanachama
🔹 *ARIFA* - Kutuma arifa

*Amri za Mwanachama:*
🔹 *JIUNGA* - Kujiunga na kikundi
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *TOA [kiasi]* - Kufanya mchango
🔹 *SALIO* - Kuona salio
🔹 *HISTORIA* - Kuona historia

*Msaada wa Ziada:*
🌐 Tovuti: http://localhost:3000
📞 Msaada: +255 738 071 080

*Asante kwa kutumia Kijumbe!* 🚀`;
        }

        // Group creation
        if (lowerMessage.includes('unda') || lowerMessage.includes('create')) {
            return `🏗️ *Kuunda Kikundi Kipya*

*Ili kuunda kikundi, tafadhali:*
1. Enda kwenye tovuti: http://localhost:3000/kijumbe
2. Bonyeza "Unda Kikundi"
3. Jaza taarifa za kikundi
4. Chagua wanachama

*Au andika:*
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *MSAADA* - Kupata msaada zaidi`;
        }

        // Join group
        if (lowerMessage.includes('jiunga') || lowerMessage.includes('join')) {
            return `🤝 *Kujiunga na Kikundi*

*Ili kujiunga na kikundi:*
1. Enda kwenye tovuti: http://localhost:3000/dashboard
2. Bonyeza "Jiunga na Kikundi"
3. Chagua kikundi unachotaka
4. Subiri uthibitisho

*Au andika:*
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *MSAADA* - Kupata msaada zaidi`;
        }

        // View groups
        if (lowerMessage.includes('vikundi') || lowerMessage.includes('groups')) {
            return `📊 *Vikundi Vyako*

*Ili kuona vikundi vyako:*
1. Enda kwenye tovuti: http://localhost:3000/dashboard
2. Bonyeza "Vikundi Vyangu"

*Au andika:*
🔹 *SALIO* - Kuona salio lako
🔹 *HISTORIA* - Kuona historia ya malipo
🔹 *MSAADA* - Kupata msaada zaidi`;
        }

        // Make contribution
        if (lowerMessage.includes('toa') && /\d+/.test(lowerMessage)) {
            const amount = lowerMessage.match(/\d+/)[0];
            return `💰 *Kufanya Mchango*

*Umetoa mchango wa TSh ${parseInt(amount).toLocaleString()}*

*Ili kukamilisha mchango:*
1. Enda kwenye tovuti: http://localhost:3000/dashboard
2. Bonyeza "Fanya Mchango"
3. Ingiza kiasi: TSh ${parseInt(amount).toLocaleString()}
4. Chagua njia ya malipo

*Au andika:*
🔹 *SALIO* - Kuona salio lako
🔹 *HISTORIA* - Kuona historia ya malipo`;
        }

        // Check balance
        if (lowerMessage.includes('salio') || lowerMessage.includes('balance')) {
            return `💳 *Salio Lako*

*Ili kuona salio lako:*
1. Enda kwenye tovuti: http://localhost:3000/dashboard
2. Bonyeza "Salio Langu"

*Au andika:*
🔹 *HISTORIA* - Kuona historia ya malipo
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *MSAADA* - Kupata msaada zaidi`;
        }

        // Transaction history
        if (lowerMessage.includes('historia') || lowerMessage.includes('history')) {
            return `📈 *Historia ya Malipo*

*Ili kuona historia ya malipo:*
1. Enda kwenye tovuti: http://localhost:3000/dashboard
2. Bonyeza "Historia ya Malipo"

*Au andika:*
🔹 *SALIO* - Kuona salio lako
🔹 *VIKUNDI* - Kuona vikundi vyako
🔹 *MSAADA* - Kupata msaada zaidi`;
        }

        // Default response
        return `❓ *Sijaelewa ujumbe wako*

*Tafadhali chagua moja ya amri hizi:*

🔹 *START* - Kuanza mazungumzo
🔹 *MENU* - Kuona orodha kamili
🔹 *MSAADA* - Kupata msaada
🔹 *KIONGOZI* - Kuchagua kuwa kiongozi
🔹 *MWANACHAMA* - Kuchagua kuwa mwanachama

*Au enda kwenye tovuti: http://localhost:3000*`;
    }

    // Get bot status
    getStatus() {
        return this.isConnected ? 'connected' : 'disconnected';
    }

    // Get bot settings
    getSettings() {
        return this.settings;
    }

    // Get bot statistics
    getStats() {
        return this.stats;
    }

    // Get queue status
    getQueueStatus() {
        return {
            totalMessages: this.messageQueue.length,
            processing: this.messageQueue.filter(msg => msg.status === 'processing').length,
            pending: this.messageQueue.filter(msg => msg.status === 'pending').length,
            failed: this.messageQueue.filter(msg => msg.status === 'failed').length
        };
    }

    // Get message queue
    getMessageQueue() {
        return this.messageQueue;
    }

    // Clear message queue
    clearQueue() {
        this.messageQueue = [];
        return { success: true, message: 'Queue cleared successfully' };
    }

    // Test connection
    async testConnection() {
        try {
            const response = await axios.get(`${this.apiUrl}/waInstance${this.instanceId}/getStateInstance/${this.apiToken}`);
            
            if (response.data && response.data.stateInstance === 'authorized') {
                this.isConnected = true;
                return { success: true, message: 'Connection test successful' };
            } else {
                this.isConnected = false;
                return { success: false, message: 'WhatsApp instance not authorized' };
            }
        } catch (error) {
            this.isConnected = false;
            return { success: false, message: 'Connection test failed', error: error.message };
        }
    }

    // Get instance information
    async getInstanceInfo() {
        try {
            const [stateResponse, settingsResponse] = await Promise.all([
                axios.get(`${this.apiUrl}/waInstance${this.instanceId}/getStateInstance/${this.apiToken}`),
                axios.get(`${this.apiUrl}/waInstance${this.instanceId}/getSettings/${this.apiToken}`)
            ]);

            return {
                instanceId: this.instanceId,
                status: stateResponse.data?.stateInstance || 'unknown',
                settings: settingsResponse.data || {},
                isConnected: this.isConnected,
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            return {
                instanceId: this.instanceId,
                status: 'error',
                error: error.message,
                isConnected: false,
                lastChecked: new Date().toISOString()
            };
        }
    }

    // Get recent messages
    async getRecentMessages(limit = 10) {
        try {
            // This would typically fetch from database
            // For now, return mock data
            return [];
        } catch (error) {
            console.error('Error fetching recent messages:', error);
            return [];
        }
    }

    // Send bulk messages
    async sendBulkMessages(recipients, message, options = {}) {
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const result = await this.sendMessage(recipient.phoneNumber, message, options);
                results.push({
                    phoneNumber: recipient.phoneNumber,
                    success: result.success,
                    messageId: result.messageId || null
                });
                
                // Add delay between messages to avoid rate limiting
                if (options.delay) {
                    await new Promise(resolve => setTimeout(resolve, options.delay));
                }
            } catch (error) {
                results.push({
                    phoneNumber: recipient.phoneNumber,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return {
            success: true,
            totalSent: results.filter(r => r.success).length,
            totalFailed: results.filter(r => !r.success).length,
            results
        };
    }

    // Send media message
    async sendMediaMessage(phoneNumber, mediaUrl, caption = '', options = {}) {
        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const chatId = `${cleanPhone}@c.us`;
            
            const payload = {
                chatId,
                urlFile: mediaUrl,
                fileName: options.fileName || 'media',
                caption: caption
            };

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/sendFileByUrl/${this.apiToken}`,
                payload
            );

            if (response.data && response.data.idMessage) {
                this.stats.totalMessages++;
                return {
                    success: true,
                    messageId: response.data.idMessage,
                    message: 'Media message sent successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to send media message',
                    error: response.data?.message || 'Unknown error'
                };
            }
        } catch (error) {
            console.error('Send media message error:', error);
            return {
                success: false,
                message: 'Failed to send media message',
                error: error.message
            };
        }
    }

    // Get message queue
    getMessageQueue() {
        return this.messageQueue;
    }

    // Get bot settings
    getSettings() {
        return this.settings;
    }

    // Get bot statistics
    getStats() {
        return this.stats;
    }

    // Toggle bot enabled/disabled
    async toggleBot(enabled) {
        try {
            this.settings.enabled = enabled;
            console.log(`🤖 WhatsApp Bot ${enabled ? 'enabled' : 'disabled'}`);
            return { success: true, enabled };
        } catch (error) {
            console.error('❌ Failed to toggle bot:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Update bot settings
    async updateSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            console.log('🤖 WhatsApp Bot settings updated:', newSettings);
            return { success: true, settings: this.settings };
        } catch (error) {
            console.error('❌ Failed to update settings:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send test message
    async sendTestMessage() {
        try {
            const testMessage = 'This is a test message from Kijumbe WhatsApp Bot. If you receive this, the bot is working correctly!';
            
            if (!this.isConnected) {
                console.log('📱 [DEMO] Test message would be sent');
                return { success: true, message: 'Test message sent (demo mode)' };
            }

            // Send to bot's own number for testing
            const response = await this.sendMessage(this.botPhone, testMessage);
            return response;
        } catch (error) {
            console.error('❌ Failed to send test message:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Toggle bot enabled/disabled
    async toggleBot(enabled) {
        try {
            this.settings.enabled = enabled;
            
            // In a real implementation, you might want to persist this to database
            console.log(`Bot ${enabled ? 'enabled' : 'disabled'}`);
            
            return { 
                success: true, 
                message: `Bot ${enabled ? 'enabled' : 'disabled'} successfully`,
                enabled: this.settings.enabled
            };
        } catch (error) {
            console.error('❌ Failed to toggle bot:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Send interactive buttons message
    async sendInteractiveButtons(phoneNumber, message, buttons) {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] Interactive buttons message:', { phoneNumber, message, buttons });
                return { success: true, message: 'Interactive message sent (demo mode)' };
            }

            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const chatId = `${cleanPhone}@c.us`;
            
            const payload = {
                chatId,
                message,
                buttons: buttons.map(btn => ({
                    text: btn.text,
                    id: btn.id
                }))
            };

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/sendButtons/${this.apiToken}`,
                payload
            );

            if (response.data && response.data.idMessage) {
                this.stats.totalMessages++;
                return {
                    success: true,
                    messageId: response.data.idMessage,
                    message: 'Interactive buttons sent successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to send interactive buttons',
                    error: response.data?.message || 'Unknown error'
                };
            }
        } catch (error) {
            console.error('Send interactive buttons error:', error);
            return {
                success: false,
                message: 'Failed to send interactive buttons',
                error: error.message
            };
        }
    }

    // Send list message
    async sendListMessage(phoneNumber, message, sections) {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] List message:', { phoneNumber, message, sections });
                return { success: true, message: 'List message sent (demo mode)' };
            }

            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const chatId = `${cleanPhone}@c.us`;
            
            const payload = {
                chatId,
                message,
                sections
            };

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/sendList/${this.apiToken}`,
                payload
            );

            if (response.data && response.data.idMessage) {
                this.stats.totalMessages++;
                return {
                    success: true,
                    messageId: response.data.idMessage,
                    message: 'List message sent successfully'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to send list message',
                    error: response.data?.message || 'Unknown error'
                };
            }
        } catch (error) {
            console.error('Send list message error:', error);
            return {
                success: false,
                message: 'Failed to send list message',
                error: error.message
            };
        }
    }

    // Get chat history for a phone number
    async getChatHistory(phoneNumber) {
        try {
            // In a real implementation, this would fetch from database
            // For now, return mock data
            return [
                {
                    id: '1',
                    text: 'Hi there!',
                    direction: 'incoming',
                    timestamp: new Date(Date.now() - 60000).toISOString()
                },
                {
                    id: '2',
                    text: 'Hello! How can I help you today?',
                    direction: 'outgoing',
                    timestamp: new Date(Date.now() - 30000).toISOString()
                }
            ];
        } catch (error) {
            console.error('Get chat history error:', error);
            return [];
        }
    }

    // Update webhook configuration
    async updateWebhookConfig(webhookUrl, webhookToken = '') {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] Webhook config update:', { webhookUrl, webhookToken });
                return { success: true, message: 'Webhook config updated (demo mode)' };
            }

            const payload = {
                webhookUrl,
                webhookUrlToken: webhookToken
            };

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/setSettings/${this.apiToken}`,
                payload
            );

            return {
                success: true,
                message: 'Webhook configuration updated successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Update webhook config error:', error);
            return {
                success: false,
                message: 'Failed to update webhook configuration',
                error: error.message
            };
        }
    }

    // Test bot command
    async testCommand(command) {
        try {
            // Simulate command processing
            const response = await this.processMessage('test_user', command);
            
            return {
                success: true,
                message: 'Command test successful',
                response: response || 'No response generated'
            };
        } catch (error) {
            console.error('Test command error:', error);
            return {
                success: false,
                message: 'Command test failed',
                error: error.message
            };
        }
    }

    // Mark message as read
    async markMessageAsRead(messageId) {
        try {
            if (!this.isConnected) {
                console.log('📱 [DEMO] Mark message as read:', messageId);
                return { success: true, message: 'Message marked as read (demo mode)' };
            }

            const response = await axios.post(
                `${this.apiUrl}/waInstance${this.instanceId}/readMessage/${this.apiToken}`,
                { messageId }
            );

            return {
                success: true,
                message: 'Message marked as read successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Mark message as read error:', error);
            return {
                success: false,
                message: 'Failed to mark message as read',
                error: error.message
            };
        }
    }
}

// Create singleton instance
const whatsappBot = new WhatsAppBot();

// Initialize function for server startup
const initializeWhatsAppBot = async () => {
    try {
        await whatsappBot.initialize();
        console.log('✅ WhatsApp Bot initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize WhatsApp Bot:', error);
    }
};

module.exports = {
    whatsappBot,
    initializeWhatsAppBot
};
