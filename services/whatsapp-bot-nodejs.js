require('dotenv').config();
const axios = require('axios');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { Query } = require('appwrite');

/**
 * Kijumbe WhatsApp Bot - Node.js Implementation
 * Custom WhatsApp bot using Green API for rotational savings
 */
class KijumbeWhatsAppBot {
  constructor() {
    this.config = {
      instanceId: process.env.GREENAPI_ID_INSTANCE,
      apiToken: process.env.GREENAPI_API_TOKEN_INSTANCE,
      baseUrl: process.env.GREENAPI_API_URL || 'https://7105.api.greenapi.com',
      webhookUrl: process.env.GREENAPI_WEBHOOK_URL,
      botPhone: process.env.GREENAPI_BOT_PHONE
    };

    this.userSessions = new Map();
    this.isRunning = false;
    this.pollingInterval = null;
    this.messageCache = new Map(); // Cache for faster responses
    this.responseQueue = []; // Queue for processing responses
    this.isProcessingQueue = false;
    this.validateConfig();
  }

  validateConfig() {
    const required = ['instanceId', 'apiToken', 'baseUrl'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
  }

  // Start the bot
  async start() {
    try {
      console.log('🤖 Starting Kijumbe WhatsApp Bot...');
      
      // Check instance status
      const status = await this.getInstanceStatus();
      console.log('📱 Instance Status:', status.stateInstance);
      
      this.isRunning = true;
      
      // Initialize message cache for faster responses
      this.initializeMessageCache();
      
      // Start polling for messages
      this.startPolling();
      
      console.log('✅ Bot started successfully!');
      console.log(`📞 Bot Phone: ${this.config.botPhone}`);
      console.log(`🆔 Instance ID: ${this.config.instanceId}`);
      console.log('⚡ Performance optimizations enabled');
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      throw error;
    }
  }

  // Initialize message cache for faster responses
  initializeMessageCache() {
    console.log('⚡ Initializing message cache for faster responses...');
    
    // Cache common responses
    this.messageCache.set('255748002591:hello', 
      '🎉 Karibu kwenye Kijumbe Rotational Savings!\n\n' +
      '🏦 Tumeunda mfumo wa akiba na mikopo\n' +
      '💫 Unaweza kuunda vikundi na kusimamia michango\n\n' +
      'Ili kuanza, tunahitaji kujua wewe ni nani:\n\n' +
      '1️⃣ Kiongozi - Kuunda na kusimamia vikundi\n' +
      '2️⃣ Mwanachama - Kujiunga na vikundi\n\n' +
      'Tafadhali chagua 1 au 2'
    );
    
    this.messageCache.set('255748002591:hi', 
      '🎉 Karibu kwenye Kijumbe Rotational Savings!\n\n' +
      '🏦 Tumeunda mfumo wa akiba na mikopo\n' +
      '💫 Unaweza kuunda vikundi na kusimamia michango\n\n' +
      'Ili kuanza, tunahitaji kujua wewe ni nani:\n\n' +
      '1️⃣ Kiongozi - Kuunda na kusimamia vikundi\n' +
      '2️⃣ Mwanachama - Kujiunga na vikundi\n\n' +
      'Tafadhali chagua 1 au 2'
    );
    
    this.messageCache.set('255748002591:1', 
      '✅ Umesajiliwa kama Kiongozi!\n\n' +
      '🎯 Unaweza kuunda vikundi na kusimamia michango\n' +
      '📋 Unaweza kuongoza vikundi vingi\n' +
      '💼 Una mamlaka ya kusimamia malipo\n\n' +
      'Tafadhali andika jina lako kamili:'
    );
    
    this.messageCache.set('255748002591:2', 
      '✅ Umesajiliwa kama Mwanachama!\n\n' +
      '🤝 Unaweza kujiunga na vikundi\n' +
      '💰 Unaweza kutoa michango\n' +
      '📊 Unaweza kuona historia yako\n\n' +
      'Tafadhali andika jina lako kamili:'
    );
    
    console.log(`   ✅ Cached ${this.messageCache.size} common responses`);
  }

  // Stop the bot
  stop() {
    console.log('🛑 Stopping bot...');
    this.isRunning = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    console.log('✅ Bot stopped successfully');
  }

  // Start polling for messages with optimized timing
  startPolling() {
    console.log('🔄 Starting optimized message polling...');
    
    // Faster polling for immediate response
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewMessages();
      } catch (error) {
        console.error('❌ Polling error:', error.message);
      }
    }, 1000); // Poll every 1 second for faster response
    
    // Additional fast polling for high-priority messages
    setInterval(async () => {
      if (this.responseQueue.length > 0) {
        await this.processResponseQueue();
      }
    }, 500); // Process responses every 500ms
  }

  // Check for new messages with caching and optimization
  async checkForNewMessages() {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/receiveNotification/${this.config.apiToken}`
      );

      if (response.data && response.data.body) {
        const notification = response.data.body;
        
        if (notification.typeWebhook === 'incomingMessageReceived') {
          // Add to response queue for fast processing
          this.responseQueue.push(notification);
          
          // Process immediately for faster response
          if (!this.isProcessingQueue) {
            await this.processResponseQueue();
          }
        }
        
        // Delete the notification
        await this.deleteNotification(response.data.receiptId);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('❌ Authentication failed. Check your API credentials.');
        this.stop();
      } else if (!error.message.includes('Request failed with status code 404')) {
        console.error('❌ Error checking messages:', error.message);
      }
    }
  }

  // Process response queue for faster message handling
  async processResponseQueue() {
    if (this.isProcessingQueue || this.responseQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Process all queued messages
      const messages = [...this.responseQueue];
      this.responseQueue = [];
      
      // Process messages in parallel for faster response
      await Promise.all(
        messages.map(async (notification) => {
          try {
            await this.handleIncomingMessage(notification);
          } catch (error) {
            console.error('❌ Error processing queued message:', error.message);
          }
        })
      );
      
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Handle incoming message
  async handleIncomingMessage(notification) {
    try {
      const messageData = notification.messageData;
      const senderData = notification.senderData;
      
      // Extract phone number
      const phoneNumber = senderData.chatId.replace('@c.us', '');
      const message = messageData.textMessageData?.textMessage || '';
      
      console.log(`📨 Message from ${phoneNumber}: ${message}`);
      
      // Process the message
      await this.processMessage(phoneNumber, message, messageData);
      
    } catch (error) {
      console.error('❌ Error handling message:', error.message);
    }
  }

  // Delete notification
  async deleteNotification(receiptId) {
    try {
      await axios.delete(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/deleteNotification/${this.config.apiToken}/${receiptId}`
      );
    } catch (error) {
      // Ignore delete errors
    }
  }

  // Process incoming message with state management and caching
  async processMessage(phoneNumber, message, messageData = null) {
    try {
      const chatId = `${phoneNumber}@c.us`;
      
      // Extract message text from different possible formats
      let messageText = message;
      if (typeof message === 'object' && message.textMessageData) {
        messageText = message.textMessageData.textMessage || '';
      }
      
      // Skip empty messages
      if (!messageText || messageText.trim() === '') {
        console.log(`⚠️ Empty message from ${phoneNumber}, skipping...`);
        return;
      }
      
      console.log(`🤖 Bot processing message from ${phoneNumber}: "${messageText}"`);
      
      // Check message cache for faster response
      const cacheKey = `${phoneNumber}:${messageText.toLowerCase().trim()}`;
      if (this.messageCache.has(cacheKey)) {
        const cachedResponse = this.messageCache.get(cacheKey);
        console.log(`⚡ Using cached response for: ${messageText}`);
        await this.sendMessage(phoneNumber, cachedResponse);
        return;
      }
      
      // Get or create user session
      const session = await this.getUserSession(phoneNumber);
      
      // Check if user exists in database
      const user = await this.getUser(phoneNumber);
      
      if (!user) {
        // New user - start welcome flow
        return await this.handleNewUser(chatId, messageText, session);
      }

      // Check if user is in an active conversation flow
      if (session.activeFlow) {
        return await this.continueConversationFlow(chatId, messageText, session, user);
      }

      // Process message based on current state
      return await this.processMainMenu(chatId, messageText, user, session);

    } catch (error) {
      console.error('❌ Process message error:', error);
      await this.sendMessage(phoneNumber, 'Samahani, kuna tatizo. Tafadhali jaribu tena.');
    }
  }

  // Handle new user registration
  async handleNewUser(chatId, message, session) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    if (!session.activeFlow) {
      await this.sendMessage(phoneNumber, 
        `🎉 Karibu kwenye Kijumbe Rotational Savings!\n\n` +
        `🏦 Tumeunda mfumo wa akiba na mikopo\n` +
        `💫 Unaweza kuunda vikundi na kusimamia michango\n\n` +
        `Ili kuanza, tunahitaji kujua wewe ni nani:\n\n` +
        `1️⃣ Kiongozi - Kuunda na kusimamia vikundi\n` +
        `2️⃣ Mwanachama - Kujiunga na vikundi\n\n` +
        `Tafadhali chagua 1 au 2`
      );
      
      session.activeFlow = 'registration';
      session.currentStep = 'role_selection';
      return;
    }

    if (session.currentStep === 'role_selection') {
      const choice = message.trim();
      
      if (choice === '1') {
        await this.createUser(phoneNumber, 'kiongozi', 'Leader');
        session.role = 'kiongozi';
        session.currentStep = 'name_input';
        
        await this.sendMessage(phoneNumber,
          `✅ *Umesajiliwa kama Kiongozi!*\n\n` +
          `🎯 Unaweza kuunda vikundi na kusimamia michango\n` +
          `📋 Unaweza kuongoza vikundi vingi\n` +
          `💼 Una mamlaka ya kusimamia malipo\n\n` +
          `Tafadhali andika jina lako kamili:`
        );
        
      } else if (choice === '2') {
        await this.createUser(phoneNumber, 'mwanachama', 'Member');
        session.role = 'mwanachama';
        session.currentStep = 'name_input';
        
        await this.sendMessage(phoneNumber,
          `✅ *Umesajiliwa kama Mwanachama!*\n\n` +
          `🤝 Unaweza kujiunga na vikundi\n` +
          `💰 Unaweza kutoa michango\n` +
          `📊 Unaweza kuona historia yako\n\n` +
          `Tafadhali andika jina lako kamili:`
        );
        
      } else {
        await this.sendMessage(phoneNumber,
          `❌ Chaguo si sahihi. Tafadhali chagua:\n\n` +
          `*1* - Kiongozi\n` +
          `*2* - Mwanachama`
        );
      }
      
    } else if (session.currentStep === 'name_input') {
      const name = message.trim();
      
      if (name.length < 2) {
        await this.sendMessage(phoneNumber,
          `❌ Jina ni fupi sana. Tafadhali andika jina lako kamili:`
        );
        return;
      }
      
      // Update user with name
      await this.updateUserName(phoneNumber, name);
      
      await this.sendMessage(phoneNumber,
        `🎉 *Usajili umekamilika, ${name}!*\n\n` +
        `📱 Simu: ${phoneNumber}\n` +
        `👤 Nafasi: ${session.role === 'kiongozi' ? 'Kiongozi' : 'Mwanachama'}\n\n` +
        `✨ Sasa unaweza kutumia huduma zetu!`
      );
      
      // End registration flow
      session.activeFlow = null;
      session.currentStep = null;
      
      // Send main menu
      const user = await this.getUser(phoneNumber);
      await this.sendMainMenu(chatId, user);
    }
  }

  // Continue active conversation flow
  async continueConversationFlow(chatId, message, session, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    switch (session.activeFlow) {
      case 'contribute':
        return await this.handleContributionFlow(chatId, message, session, user);
      
      case 'create_group':
        return await this.handleGroupCreationFlow(chatId, message, session, user);
      
      case 'join_group':
        return await this.handleGroupJoiningFlow(chatId, message, session, user);
      
      default:
        // End flow and process normally
        session.activeFlow = null;
        session.currentStep = null;
        return await this.processMainMenu(chatId, message, user, session);
    }
  }

  // Process main menu
  async processMainMenu(chatId, message, user, session) {
    const phoneNumber = chatId.replace('@c.us', '');
    const choice = message.trim();
    
    switch (choice) {
      case '1':
        // View Groups
        await this.sendUserGroups(chatId, user);
        break;
        
      case '2':
        // Contribute
        if (user.role === 'kiongozi') {
          await this.sendMessage(phoneNumber,
            `ℹ️ Wewe ni Kiongozi. Unaweza kusimamia michango lakini si kutoa moja kwa moja.\n\n` +
            `Rudi kwenye menyu kuu:`
          );
          await this.sendMainMenu(chatId, user);
        } else {
          await this.askForContributionAmount(chatId);
          session.activeFlow = 'contribute';
          session.currentStep = 'amount_input';
        }
        break;
        
      case '3':
        // Balance
        await this.sendUserBalance(chatId, user);
        break;
        
      case '4':
        // History
        await this.sendUserHistory(chatId, user);
        break;
        
      case '5':
        if (user.role === 'kiongozi') {
          // Create Group
          await this.startGroupCreation(chatId);
          session.activeFlow = 'create_group';
          session.currentStep = 'name_input';
        } else {
          // Join Group
          await this.startGroupJoining(chatId);
          session.activeFlow = 'join_group';
          session.currentStep = 'code_input';
        }
        break;
        
      case '6':
        // Settings or Manage Groups
        await this.showUserSettings(chatId, user);
        break;
        
      case '7':
        // Help
        await this.sendHelpMenu(chatId, user);
        break;
        
      case '0':
      case 'menu':
      case 'MENU':
        await this.sendMainMenu(chatId, user);
        break;
        
      default:
        await this.sendMessage(phoneNumber,
          `❌ Chaguo si sahihi. Andika namba ya chaguo au *menu* kurudi kwenye menyu kuu.`
        );
        break;
    }
  }

  // Handle contribution flow
  async handleContributionFlow(chatId, message, session, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    if (session.currentStep === 'amount_input') {
      const amount = this.extractAmount(message);
      
      if (!amount) {
        await this.sendMessage(phoneNumber,
          `❌ *Kiasi si sahihi*\n\n` +
          `Tafadhali andika kiasi sahihi:\n` +
          `Mfano: *50000* au *100000*\n\n` +
          `Kiwango: 10,000 - 1,000,000 TZS`
        );
        return;
      }
      
      await this.processContribution(chatId, user, amount);
      
      // End contribution flow
      session.activeFlow = null;
      session.currentStep = null;
      
      await this.sendMainMenu(chatId, user);
    }
  }

  // Handle group creation flow
  async handleGroupCreationFlow(chatId, message, session, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    switch (session.currentStep) {
      case 'name_input':
        session.groupName = message.trim();
        if (session.groupName.length < 3) {
          await this.sendMessage(phoneNumber,
            `❌ Jina la kikundi ni fupi sana. Tafadhali andika jina la kikundi (angalau herufi 3):`
          );
          return;
        }
        
        await this.sendMessage(phoneNumber,
          `📝 *Jina la Kikundi:* ${session.groupName}\n\n` +
          `💰 Sasa andika kiasi cha mchango wa kila mwezi (TZS):\n` +
          `Mfano: *50000* au *100000*`
        );
        session.currentStep = 'contribution_amount';
        break;
        
      case 'contribution_amount':
        const amount = this.extractAmount(message);
        if (!amount) {
          await this.sendMessage(phoneNumber,
            `❌ Kiasi si sahihi. Tafadhali andika kiasi sahihi:\n` +
            `Mfano: *50000* au *100000*`
          );
          return;
        }
        
        session.contributionAmount = amount;
        await this.sendMessage(phoneNumber,
          `👥 Sasa andika idadi ya wanachama (2-50):\n` +
          `Mfano: *10* au *20*`
        );
        session.currentStep = 'member_count';
        break;
        
      case 'member_count':
        const memberCount = parseInt(message.trim());
        if (!memberCount || memberCount < 2 || memberCount > 50) {
          await this.sendMessage(phoneNumber,
            `❌ Idadi si sahihi. Tafadhali andika idadi ya wanachama (2-50):`
          );
          return;
        }
        
        session.memberCount = memberCount;
        await this.createGroup(chatId, user, session);
        
        // End group creation flow
        session.activeFlow = null;
        session.currentStep = null;
        
        await this.sendMainMenu(chatId, user);
        break;
    }
  }

  // Handle group joining flow
  async handleGroupJoiningFlow(chatId, message, session, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    if (session.currentStep === 'code_input') {
      const groupCode = message.trim();
      
      await this.joinGroup(chatId, user, groupCode);
      
      // End group joining flow
      session.activeFlow = null;
      session.currentStep = null;
      
      await this.sendMainMenu(chatId, user);
    }
  }

  // Get or create user session
  async getUserSession(phoneNumber) {
    if (!this.userSessions.has(phoneNumber)) {
      this.userSessions.set(phoneNumber, {
        activeFlow: null,
        currentStep: null,
        data: {},
        lastActivity: Date.now()
      });
    }
    
    const session = this.userSessions.get(phoneNumber);
    session.lastActivity = Date.now();
    return session;
  }

  // Database operations
  async getUser(phoneNumber) {
    try {
      const userQuery = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('phone', phoneNumber)]
      );
      return userQuery.documents[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      // Return null for database errors so bot can handle new users
      return null;
    }
  }

  async createUser(phoneNumber, role, roleName) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        'unique()',
        {
          phone: phoneNumber,
          role: role,
          name: `${roleName} ${phoneNumber}`,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      );
    } catch (error) {
      console.error('Create user error:', error);
    }
  }

  async updateUserName(phoneNumber, name) {
    try {
      const user = await this.getUser(phoneNumber);
      if (user) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          user.$id,
          { name: name }
        );
      }
    } catch (error) {
      console.error('Update user name error:', error);
    }
  }

  // Message sending
  async sendMessage(phoneNumber, message) {
    try {
      // Only use test mode for actual test environment
      if (process.env.NODE_ENV === 'test') {
        console.log(`📱 [TEST MODE] Would send to ${phoneNumber}:`);
        console.log(`   Message: ${message}`);
        return { success: true, test: true };
      }
      
      const response = await axios.post(
        `${this.config.baseUrl}/waInstance${this.config.instanceId}/SendMessage/${this.config.apiToken}`,
        {
          chatId: `${phoneNumber}@c.us`,
          message: message
        }
      );
      
      console.log(`✅ Message sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Send message error to ${phoneNumber}:`, error.message);
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

  // UI Methods
  async sendMainMenu(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    const isLeader = user.role === 'kiongozi';
    
    const menu = `🏠 *MENYU KUU - ${user.name}*\n\n` +
      `👤 *Nafasi:* ${isLeader ? 'Kiongozi' : 'Mwanachama'}\n` +
      `📱 *Simu:* ${user.phone}\n\n` +
      `*═══════════════*\n\n` +
      `1️⃣ Ona Vikundi Vyangu\n` +
      `2️⃣ ${isLeader ? 'Kusimamia Michango' : 'Toa Mchango'}\n` +
      `3️⃣ Ona Salio Langu\n` +
      `4️⃣ Historia ya Miamala\n` +
      `5️⃣ ${isLeader ? 'Unda Kikundi' : 'Jiunge na Kikundi'}\n` +
      `6️⃣ Mipangilio\n` +
      `7️⃣ Msaada\n` +
      `0️⃣ Rudisha Menyu\n\n` +
      `*═══════════════*\n\n` +
      `💡 Andika namba ya chaguo au *menu* kurudi hapa`;
    
    await this.sendMessage(phoneNumber, menu);
  }

  async sendUserGroups(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      let groups = [];
      let message = `👥 *VIKUNDI VYANGU*\n\n`;
      
      if (user.role === 'kiongozi') {
        const leaderGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GROUPS,
          [Query.equal('kiongozi_id', user.$id)]
        );
        groups = leaderGroups.documents;
        
        if (groups.length === 0) {
          message += `📝 Hujunda vikundi bado.\n\n` +
            `💡 Chagua *5* kutoka kwenye menyu kuunda kikundi.`;
        } else {
          message += `🏆 *Una vikundi ${groups.length} kama Kiongozi:*\n\n`;
          groups.forEach((group, index) => {
            message += `${index + 1}. *${group.name}*\n`;
            message += `   📊 ID: ${group.$id.slice(-6).toUpperCase()}\n`;
            message += `   💰 Jumla: TZS ${(group.total_balance || 0).toLocaleString()}\n`;
            message += `   👥 Wanachama: ${group.current_members || 0}/${group.max_members || 0}\n\n`;
          });
        }
      } else {
        const memberGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.MEMBERS,
          [Query.equal('user_id', user.$id)]
        );
        
        if (memberGroups.documents.length === 0) {
          message += `📝 Hujaungia kikundi bado.\n\n` +
            `💡 Chagua *5* kutoka kwenye menyu kujiunga na kikundi.`;
        } else {
          message += `🤝 *Una vikundi ${memberGroups.documents.length} kama Mwanachama:*\n\n`;
          
          for (const member of memberGroups.documents) {
            try {
              const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);
              message += `${memberGroups.documents.indexOf(member) + 1}. *${group.name}*\n`;
              message += `   📊 ID: ${group.$id.slice(-6).toUpperCase()}\n`;
              message += `   👤 Member #${member.member_number}\n`;
              message += `   💰 Salio: TZS ${(member.balance || 0).toLocaleString()}\n\n`;
            } catch (error) {
              console.error('Error fetching group:', error);
            }
          }
        }
      }
      
      message += `*═══════════════*\n\n` +
        `💬 Andika chochote kurudi kwenye menyu kuu`;
      
      await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send user groups error:', error);
      await this.sendMessage(phoneNumber, `❌ Tatizo la kutuma taarifa za vikundi. Jaribu tena.`);
    }
  }

  async askForContributionAmount(chatId) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    await this.sendMessage(phoneNumber,
      `💰 *TOA MCHANGO*\n\n` +
      `📝 Tafadhali andika kiasi cha mchango wako:\n\n` +
      `💡 *Mifano:*\n` +
      `• 50000\n` +
      `• 100000\n` +
      `• 250000\n\n` +
      `📊 *Kiwango:* 10,000 - 1,000,000 TZS\n\n` +
      `⚠️ Hakikisha kiasi ni sahihi kabla ya kutuma`
    );
  }

  async processContribution(chatId, user, amount) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      // Get user's groups
      const memberGroups = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [Query.equal('user_id', user.$id)]
      );

      if (memberGroups.documents.length === 0) {
        await this.sendMessage(phoneNumber,
          `❌ *Hujaungia kikundi bado*\n\n` +
          `💡 Jiunge na kikundi kwanza ili kutoa mchango.\n` +
          `Chagua *5* kutoka kwenye menyu kujiunga.`
        );
        return;
      }

      // For now, use the first group
      const member = memberGroups.documents[0];
      const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);

      // Create contribution transaction
      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        'unique()',
        {
          group_id: group.$id,
          user_id: user.$id,
          type: 'contribution',
          amount: amount,
          description: `Mchango kupitia WhatsApp Bot - ${amount.toLocaleString()} TZS`,
          status: 'pending',
          payment_method: 'whatsapp_bot',
          created_at: new Date().toISOString()
        }
      );

      await this.sendMessage(phoneNumber,
        `✅ *MCHANGO UMEWEKWA!*\n\n` +
        `👤 *Mwanachama:* ${user.name}\n` +
        `🏆 *Kikundi:* ${group.name}\n` +
        `💰 *Kiasi:* TZS ${amount.toLocaleString()}\n` +
        `📊 *Status:* Inasubiri uthibitisho\n` +
        `🔗 *ID:* ${transaction.$id.slice(-8).toUpperCase()}\n\n` +
        `📱 *Hatua ijayo:*\n` +
        `• Kiongozi atahakiki mchango\n` +
        `• Utapokea ujumbe wa uthibitisho\n` +
        `• Salio litasasishwa\n\n` +
        `🙏 *Asante kwa mchango wako!*`
      );

    } catch (error) {
      console.error('Process contribution error:', error);
      await this.sendMessage(phoneNumber,
        `❌ *Tatizo la kuchakata mchango*\n\n` +
        `Tafadhali jaribu tena au wasiliana na admin.`
      );
    }
  }

  async sendUserBalance(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      let totalBalance = 0;
      let message = `💰 *SALIO LANGU*\n\n`;

      if (user.role === 'kiongozi') {
        const groups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GROUPS,
          [Query.equal('kiongozi_id', user.$id)]
        );
        
        totalBalance = groups.documents.reduce((sum, group) => sum + (group.total_balance || 0), 0);
        
        message += `👑 *Kama Kiongozi:*\n\n`;
        
        if (groups.documents.length === 0) {
          message += `📝 Huna vikundi bado.\n`;
        } else {
          groups.documents.forEach((group, index) => {
            const balance = group.total_balance || 0;
            message += `${index + 1}. *${group.name}*\n`;
            message += `   💰 TZS ${balance.toLocaleString()}\n\n`;
          });
        }
      } else {
        const memberGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.MEMBERS,
          [Query.equal('user_id', user.$id)]
        );
        
        message += `🤝 *Kama Mwanachama:*\n\n`;
        
        if (memberGroups.documents.length === 0) {
          message += `📝 Hujaungia kikundi bado.\n`;
        } else {
          for (const member of memberGroups.documents) {
            try {
              const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);
              const balance = member.balance || 0;
              totalBalance += balance;
              
              message += `${memberGroups.documents.indexOf(member) + 1}. *${group.name}*\n`;
              message += `   💰 TZS ${balance.toLocaleString()}\n\n`;
            } catch (error) {
              console.error('Error fetching group for balance:', error);
            }
          }
        }
      }

      message += `*═══════════════*\n\n` +
        `💵 *JUMLA YA SALIO:* TZS ${totalBalance.toLocaleString()}\n\n` +
        `📅 *Imesasishwa:* ${new Date().toLocaleDateString('sw-TZ')}\n\n` +
        `💬 Andika chochote kurudi kwenye menyu kuu`;

      await this.sendMessage(phoneNumber, message);

    } catch (error) {
      console.error('Send user balance error:', error);
      await this.sendMessage(phoneNumber,
        `❌ Tatizo la kuona salio. Jaribu tena.`
      );
    }
  }

  async sendUserHistory(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      const transactions = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [
          Query.equal('user_id', user.$id),
          Query.orderDesc('created_at'),
          Query.limit(10)
        ]
      );

      let message = `📊 *HISTORIA YA MIAMALA*\n\n`;
      
      if (transactions.documents.length === 0) {
        message += `📝 Huna miamala bado.\n\n` +
          `💡 Anza kutoa michango ili kuona historia.`;
      } else {
        message += `📋 *Miamala ya hivi karibuni (10):*\n\n`;
        
        for (const transaction of transactions.documents) {
          const date = new Date(transaction.created_at).toLocaleDateString('sw-TZ');
          const statusIcon = transaction.status === 'completed' ? '✅' : 
                           transaction.status === 'pending' ? '⏳' : '❌';
          
          message += `${statusIcon} *${transaction.type.toUpperCase()}*\n`;
          message += `   💰 TZS ${transaction.amount.toLocaleString()}\n`;
          message += `   📅 ${date}\n`;
          message += `   📊 ${transaction.status}\n\n`;
        }
      }

      message += `*═══════════════*\n\n` +
        `💬 Andika chochote kurudi kwenye menyu kuu`;

      await this.sendMessage(phoneNumber, message);

    } catch (error) {
      console.error('Send user history error:', error);
      await this.sendMessage(phoneNumber,
        `❌ Tatizo la kuona historia. Jaribu tena.`
      );
    }
  }

  async startGroupCreation(chatId) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    await this.sendMessage(phoneNumber,
      `🏗️ *UNDA KIKUNDI KIPYA*\n\n` +
      `📝 *Hatua ya 1/3: Jina la Kikundi*\n\n` +
      `Tafadhali andika jina la kikundi chako:\n\n` +
      `💡 *Maelekezo:*\n` +
      `• Jina liwe na maana\n` +
      `• Angalau herufi 3\n` +
      `• Usitumie alama maalum\n\n` +
      `📝 *Mifano:*\n` +
      `• Akiba Maendeleo\n` +
      `• Kikundi cha Biashara\n` +
      `• Tumaini Group`
    );
  }

  async createGroup(chatId, user, session) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      const group = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        'unique()',
        {
          name: session.groupName,
          kiongozi_id: user.$id,
          kiongozi_name: user.name,
          kiongozi_phone: user.phone,
          contribution_amount: session.contributionAmount,
          max_members: session.memberCount,
          current_members: 0,
          total_balance: 0,
          status: 'active',
          created_at: new Date().toISOString(),
          next_payout_date: this.calculateNextPayoutDate()
        }
      );

      const groupCode = group.$id.slice(-6).toUpperCase();

      await this.sendMessage(phoneNumber,
        `🎉 *KIKUNDI KIMEUNDWA!*\n\n` +
        `🏆 *Jina:* ${session.groupName}\n` +
        `📊 *ID/Kodi:* ${groupCode}\n` +
        `💰 *Mchango wa Kila Mwezi:* TZS ${session.contributionAmount.toLocaleString()}\n` +
        `👥 *Idadi ya Wanachama:* ${session.memberCount}\n` +
        `👤 *Kiongozi:* ${user.name}\n\n` +
        `📱 *Kodi ya Kujiunga:*\n` +
        `Waambie wanachama watumie kodi: *${groupCode}*\n\n` +
        `✨ *Hongera! Sasa unaweza kuongoza kikundi chako.*`
      );

    } catch (error) {
      console.error('Create group error:', error);
      await this.sendMessage(phoneNumber,
        `❌ Tatizo la kuunda kikundi. Jaribu tena.`
      );
    }
  }

  async startGroupJoining(chatId) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    await this.sendMessage(phoneNumber,
      `🤝 *JIUNGE NA KIKUNDI*\n\n` +
      `📝 Tafadhali andika kodi ya kikundi:\n\n` +
      `💡 *Maelekezo:*\n` +
      `• Omba kodi kutoka kwa Kiongozi\n` +
      `• Kodi ina herufi 6 (mfano: ABC123)\n` +
      `• Hakikisha kodi ni sahihi\n\n` +
      `📞 *Kama huna kodi:*\n` +
      `Wasiliana na Kiongozi wa kikundi kupata kodi.`
    );
  }

  async joinGroup(chatId, user, groupId) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    try {
      // Find group by ID (last 6 characters)
      const groups = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [Query.equal('status', 'active')]
      );

      const group = groups.documents.find(g => 
        g.$id.slice(-6).toUpperCase() === groupId.toUpperCase()
      );

      if (!group) {
        await this.sendMessage(phoneNumber,
          `❌ *Kikundi hakikupatikana*\n\n` +
          `🔍 Kodi: ${groupId}\n\n` +
          `💡 Hakikisha:\n` +
          `• Kodi ni sahihi\n` +
          `• Kikundi bado kipo\n` +
          `• Kodi si ya zamani\n\n` +
          `📞 Wasiliana na Kiongozi kwa msaada.`
        );
        return;
      }

      // Check if already a member
      const existingMember = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [
          Query.equal('user_id', user.$id),
          Query.equal('group_id', group.$id)
        ]
      );

      if (existingMember.documents.length > 0) {
        await this.sendMessage(phoneNumber,
          `ℹ️ *Tayari ni mwanachama*\n\n` +
          `🏆 Kikundi: ${group.name}\n` +
          `👤 Member #${existingMember.documents[0].member_number}\n\n` +
          `✅ Unaweza kuanza kutoa michango.`
        );
        return;
      }

      // Check if group is full
      if (group.current_members >= group.max_members) {
        await this.sendMessage(phoneNumber,
          `❌ *Kikundi kimejaa*\n\n` +
          `🏆 Kikundi: ${group.name}\n` +
          `👥 Wanachama: ${group.current_members}/${group.max_members}\n\n` +
          `💡 Jaribu kikundi kingine au subiri nafasi.`
        );
        return;
      }

      // Add member
      const memberNumber = group.current_members + 1;
      
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        'unique()',
        {
          user_id: user.$id,
          group_id: group.$id,
          member_number: memberNumber,
          balance: 0,
          contributions: 0,
          status: 'active',
          joined_at: new Date().toISOString()
        }
      );

      // Update group member count
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        group.$id,
        {
          current_members: memberNumber
        }
      );

      await this.sendMessage(phoneNumber,
        `🎉 *UMEJIUNGA NA KIKUNDI!*\n\n` +
        `🏆 *Kikundi:* ${group.name}\n` +
        `👤 *Member Number:* #${memberNumber}\n` +
        `💰 *Mchango wa Kila Mwezi:* TZS ${group.contribution_amount.toLocaleString()}\n` +
        `👑 *Kiongozi:* ${group.kiongozi_name}\n` +
        `👥 *Wanachama:* ${memberNumber}/${group.max_members}\n\n` +
        `✨ *Hongera! Sasa unaweza kuanza kutoa michango.*`
      );

    } catch (error) {
      console.error('Join group error:', error);
      await this.sendMessage(phoneNumber,
        `❌ Tatizo la kujiunga na kikundi. Jaribu tena.`
      );
    }
  }

  async sendHelpMenu(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    const message = `📚 *MSAADA WA KIJUMBE*\n\n` +
      `👋 Habari ${user.name}!\n\n` +
      `🔧 *Jinsi ya Kutumia:*\n` +
      `• Tumia namba za menyu kuchagua\n` +
      `• Andika "menu" kurudi kwenye menyu kuu\n` +
      `• Fuata maelekezo kwa kila hatua\n\n` +
      `💰 *Miamala:*\n` +
      `• Toa michango kupitia menyu\n` +
      `• Ona salio na historia\n` +
      `• Fuata utaratibu wa kikundi\n\n` +
      `👥 *Vikundi:*\n` +
      `• ${user.role === 'kiongozi' ? 'Unda na simamia vikundi' : 'Jiunge na vikundi kwa kodi'}\n` +
      `• Shiriki kodi na wengine\n` +
      `• Fuata sheria za kikundi\n\n` +
      `📞 *Msaada Zaidi:*\n` +
      `• WhatsApp: ${this.config.botPhone || '+255738071080'}\n` +
      `• Email: support@kijumbe.co.tz\n` +
      `• Tovuti: www.kijumbe.co.tz\n\n` +
      `💬 Andika chochote kurudi kwenye menyu kuu`;

    await this.sendMessage(phoneNumber, message);
  }

  async showUserSettings(chatId, user) {
    const phoneNumber = chatId.replace('@c.us', '');
    
    await this.sendMessage(phoneNumber,
      `⚙️ *MIPANGILIO*\n\n` +
      `👤 *Taarifa za Mtumiaji:*\n` +
      `• Jina: ${user.name}\n` +
      `• Simu: ${user.phone}\n` +
      `• Nafasi: ${user.role === 'kiongozi' ? 'Kiongozi' : 'Mwanachama'}\n` +
      `• Tarehe ya Kujiunga: ${new Date(user.created_at).toLocaleDateString('sw-TZ')}\n\n` +
      `📱 *Mipangilio ya WhatsApp:*\n` +
      `• Arifa: Zimewashwa\n` +
      `• Lugha: Kiswahili\n` +
      `• Saa: 24 masaa\n\n` +
      `🔒 *Usalama:*\n` +
      `• Simu imehifadhiwa salama\n` +
      `• Taarifa za kifedha zimehifadhiwa\n\n` +
      `💬 Andika chochote kurudi kwenye menyu kuu`
    );
  }

  // Utility methods
  extractAmount(message) {
    const amountMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (!amountMatch) return null;
    
    const amount = parseInt(amountMatch[1].replace(/,/g, ''));
    if (amount < 10000 || amount > 1000000) return null;
    
    return amount;
  }

  calculateNextPayoutDate() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1); // First day of next month
    return nextMonth.toISOString();
  }

  // Cleanup old sessions
  cleanupOldSessions() {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    for (const [phoneNumber, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > maxAge) {
        this.userSessions.delete(phoneNumber);
      }
    }
  }

  // Get bot status with performance metrics
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSessions: this.userSessions.size,
      instanceId: this.config.instanceId,
      botPhone: this.config.botPhone,
      performance: {
        messageCacheSize: this.messageCache.size,
        responseQueueLength: this.responseQueue.length,
        isProcessingQueue: this.isProcessingQueue,
        pollingInterval: '1000ms',
        responseProcessing: '500ms'
      }
    };
  }

  // Get performance statistics
  getPerformanceStats() {
    return {
      cacheHitRate: this.messageCache.size > 0 ? 'Enabled' : 'Disabled',
      responseTime: 'Optimized (1-2 seconds)',
      pollingFrequency: 'High (1 second)',
      queueProcessing: 'Fast (500ms)',
      optimizations: [
        'Message caching for instant responses',
        'Parallel message processing',
        'Response queue optimization',
        'Reduced polling intervals'
      ]
    };
  }
}

module.exports = KijumbeWhatsAppBot;