const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const greenAPI = require('./greenapi');

// Node.js Bot Integration
let nodejsBot = null;
try {
  const KijumbeWhatsAppBot = require('./whatsapp-bot-nodejs');
  // Initialize the new Node.js bot but don't start it here
  // It will be started separately via bot-main.js
  console.log('✅ Node.js WhatsApp Bot integration loaded');
} catch (error) {
  console.warn('⚠️ Node.js WhatsApp Bot not available:', error.message);
}

class WhatsAppAutomationService {
  constructor() {
    this.conversationFlows = new Map();
    this.userSessions = new Map();
    this.automationRules = this.initializeAutomationRules();
    this.messageTemplates = this.initializeMessageTemplates();
  }

  // Initialize automation rules
  initializeAutomationRules() {
    return {
      // Welcome flow for new users
      welcome: {
        triggers: ['hi', 'hello', 'habari', 'mambo', 'jambo'],
        actions: ['send_welcome', 'ask_for_role'],
        nextFlow: 'role_selection'
      },

      // Role-based flows
      role_selection: {
        triggers: ['kiongozi', 'leader', 'mwanachama', 'member'],
        actions: ['store_role', 'send_role_specific_info'],
        nextFlow: 'main_menu'
      },

      // Group management flows
      group_creation: {
        triggers: ['unda', 'create', 'create group'],
        conditions: { role: 'kiongozi' },
        actions: ['send_creation_guide', 'start_creation_process'],
        nextFlow: 'group_setup'
      },

      group_joining: {
        triggers: ['jiunga', 'join', 'join group'],
        actions: ['send_joining_guide', 'ask_for_group_id'],
        nextFlow: 'group_verification'
      },

      // Financial flows
      contribution: {
        triggers: ['toa', 'contribute', 'mchango', 'deposit'],
        actions: ['validate_user', 'ask_for_amount'],
        nextFlow: 'amount_confirmation'
      },

      balance_check: {
        triggers: ['salio', 'balance', 'pesa', 'money'],
        actions: ['fetch_balance', 'send_balance_info'],
        nextFlow: 'main_menu'
      },

      // Support flows
      help: {
        triggers: ['msaada', 'help', 'aid', 'tusaidie'],
        actions: ['send_help_menu', 'show_available_commands'],
        nextFlow: 'help_selection'
      },

      // Status flows
      status_check: {
        triggers: ['status', 'hali', 'state', 'progress'],
        actions: ['fetch_user_status', 'send_status_report'],
        nextFlow: 'main_menu'
      }
    };
  }

  // Initialize message templates
  initializeMessageTemplates() {
    return {
      welcome: (userName = 'Mpendwa') => 
        `🎉 Karibu kwenye Kijumbe Rotational Savings, ${userName}!\n\n` +
        `Tunakusaidia kusimamia vikundi vya akiba na mikopo.\n\n` +
        `Unaweza:\n` +
        `1️⃣ Kuunda kikundi - andika "UNDA"\n` +
        `2️⃣ Kujiunga na kikundi - andika "JIUNGA"\n` +
        `3️⃣ Kuona msaada - andika "MSAADA"\n` +
        `4️⃣ Kuona hali yako - andika "STATUS"\n\n` +
        `Kwa msaada zaidi, andika "HELP" au "MSAADA"`,

      roleSelection: () =>
        `👤 Chagua Nafasi Yako:\n\n` +
        `🔹 Kiongozi - Unaweza kuunda na kusimamia vikundi\n` +
        `🔹 Mwanachama - Unaweza kujiunga na vikundi na kutoa michango\n\n` +
        `Andika "KIONGOZI" au "MWANACHAMA"`,

      helpMenu: () =>
        `📚 Msaada wa Kijumbe:\n\n` +
        `🔹 Status - Kuona hali yako\n` +
        `🔹 Vikundi - Kuona vikundi vyako\n` +
        `🔹 Toa [amount] - Kutoa mchango\n` +
        `🔹 Salio - Kuona salio yako\n` +
        `🔹 Historia - Kuona miamala yako\n` +
        `🔹 Msaada - Kuona msaada huu\n` +
        `🔹 Unda - Kuunda kikundi (Kiongozi tu)\n` +
        `🔹 Jiunga - Kujiunga na kikundi\n\n` +
        `Kwa msaada zaidi, wasiliana na admin.`,

      errorMessage: () =>
        `Samahani, kuna tatizo. Tafadhali jaribu tena baada ya muda au wasiliana na admin.`,

      invalidAmount: () =>
        `Kiasi si sahihi. Tafadhali andika kiasi sahihi. Mfano: "toa 50000"`,

      noGroups: () =>
        `Huna vikundi bado. Unda kikundi au jiunge na kikundi cha mtu mwingine.`,

      processing: () =>
        `⏳ Inachakata... Tafadhali subiri kidogo.`
    };
  }

  // Process incoming message with advanced automation
  async processMessage(phoneNumber, message, messageType = 'text') {
    try {
      console.log(`🤖 Processing message from ${phoneNumber}: ${message}`);

      // Get or create user session
      const session = await this.getUserSession(phoneNumber);
      
      // Check if user exists in database
      const user = await this.getUser(phoneNumber);
      
      if (!user) {
        // New user - start welcome flow
        return await this.handleNewUser(phoneNumber, message);
      }

      // Check if user is in an active conversation flow
      if (session.activeFlow) {
        return await this.continueConversationFlow(phoneNumber, message, session);
      }

      // Process message based on automation rules
      return await this.processAutomationRules(phoneNumber, message, user, session);

    } catch (error) {
      console.error('❌ Process message error:', error);
      await this.sendMessage(phoneNumber, this.messageTemplates.errorMessage());
    }
  }

  // Handle new user registration
  async handleNewUser(phoneNumber, message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if it's a welcome message
    if (this.isWelcomeMessage(lowerMessage)) {
      await this.sendMessage(phoneNumber, this.messageTemplates.welcome());
      await this.startConversationFlow(phoneNumber, 'welcome');
      return;
    }

    // Default welcome for any message from new user
    await this.sendMessage(phoneNumber, this.messageTemplates.welcome());
    await this.startConversationFlow(phoneNumber, 'welcome');
  }

  // Process automation rules
  async processAutomationRules(phoneNumber, message, user, session) {
    const lowerMessage = message.toLowerCase().trim();

    // Check each automation rule
    for (const [flowName, rule] of Object.entries(this.automationRules)) {
      if (this.matchesTriggers(lowerMessage, rule.triggers)) {
        // Check conditions if any
        if (rule.conditions && !this.checkConditions(user, rule.conditions)) {
          continue;
        }

        // Execute actions
        await this.executeActions(phoneNumber, message, user, rule.actions);
        
        // Set next flow if specified
        if (rule.nextFlow) {
          await this.startConversationFlow(phoneNumber, rule.nextFlow);
        }

        return;
      }
    }

    // No matching rule - send default response
    await this.sendDefaultResponse(phoneNumber, user);
  }

  // Continue active conversation flow
  async continueConversationFlow(phoneNumber, message, session) {
    const flow = session.activeFlow;
    const step = session.currentStep || 0;

    switch (flow) {
      case 'welcome':
        return await this.handleWelcomeFlow(phoneNumber, message, session);
      
      case 'role_selection':
        return await this.handleRoleSelectionFlow(phoneNumber, message, session);
      
      case 'group_creation':
        return await this.handleGroupCreationFlow(phoneNumber, message, session);
      
      case 'group_joining':
        return await this.handleGroupJoiningFlow(phoneNumber, message, session);
      
      case 'contribution':
        return await this.handleContributionFlow(phoneNumber, message, session);
      
      case 'help_selection':
        return await this.handleHelpSelectionFlow(phoneNumber, message, session);
      
      default:
        // End flow and process normally
        await this.endConversationFlow(phoneNumber);
        return await this.processMessage(phoneNumber, message);
    }
  }

  // Handle welcome flow
  async handleWelcomeFlow(phoneNumber, message, session) {
    const lowerMessage = message.toLowerCase().trim();
    
    if (this.isRoleSelectionMessage(lowerMessage)) {
      await this.sendMessage(phoneNumber, this.messageTemplates.roleSelection());
      session.currentStep = 1;
      return;
    }

    // Default response for welcome flow
    await this.sendMessage(phoneNumber, 
      'Karibu! Unaweza kuunda kikundi au kujiunga na kikundi. Andika "MSAADA" kwa msaada.'
    );
  }

  // Handle role selection flow
  async handleRoleSelectionFlow(phoneNumber, message, session) {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('kiongozi') || lowerMessage.includes('leader')) {
      await this.createUser(phoneNumber, 'kiongozi');
      await this.sendMessage(phoneNumber, 
        '✅ Umesajiliwa kama Kiongozi!\n\nUnaweza kuunda vikundi na kusimamia michango.'
      );
      await this.endConversationFlow(phoneNumber);
      return;
    }
    
    if (lowerMessage.includes('mwanachama') || lowerMessage.includes('member')) {
      await this.createUser(phoneNumber, 'mwanachama');
      await this.sendMessage(phoneNumber, 
        '✅ Umesajiliwa kama Mwanachama!\n\nUnaweza kujiunga na vikundi na kutoa michango.'
      );
      await this.endConversationFlow(phoneNumber);
      return;
    }

    // Invalid role selection
    await this.sendMessage(phoneNumber, 
      'Tafadhali chagua "KIONGOZI" au "MWANACHAMA"'
    );
  }

  // Handle group creation flow
  async handleGroupCreationFlow(phoneNumber, message, session) {
    const step = session.currentStep || 0;
    
    switch (step) {
      case 0:
        await this.sendMessage(phoneNumber, 
          '🏗️ Kuunda Kikundi:\n\n' +
          '1️⃣ Nenda kwenye tovuti yetu\n' +
          '2️⃣ Jisajili kama Kiongozi\n' +
          '3️⃣ Unda kikundi chako\n' +
          '4️⃣ Pata Group ID na Bot Phone\n\n' +
          'Baada ya kuunda, utapata Group ID na unaweza kuanza kukaribisha wanachama.'
        );
        session.currentStep = 1;
        break;
      
      case 1:
        await this.sendMessage(phoneNumber, 
          'Kikundi kimeundwa! Unaweza kuanza kukaribisha wanachama.'
        );
        await this.endConversationFlow(phoneNumber);
        break;
    }
  }

  // Handle group joining flow
  async handleGroupJoiningFlow(phoneNumber, message, session) {
    const step = session.currentStep || 0;
    
    switch (step) {
      case 0:
        await this.sendMessage(phoneNumber, 
          '👥 Kujiunga na Kikundi:\n\n' +
          '1️⃣ Pata Group ID kutoka kwa Kiongozi\n' +
          '2️⃣ Nenda kwenye tovuti yetu\n' +
          '3️⃣ Jisajili kama Member\n' +
          '4️⃣ Jiunge na kikundi kwa Group ID\n\n' +
          'Baada ya kujiunga, utapata Member Number yako.'
        );
        session.currentStep = 1;
        break;
      
      case 1:
        await this.sendMessage(phoneNumber, 
          'Umejiunga na kikundi! Unaweza kuanza kutoa michango.'
        );
        await this.endConversationFlow(phoneNumber);
        break;
    }
  }

  // Handle contribution flow
  async handleContributionFlow(phoneNumber, message, session) {
    const step = session.currentStep || 0;
    
    switch (step) {
      case 0:
        // Extract amount from message
        const amount = this.extractAmount(message);
        if (!amount) {
          await this.sendMessage(phoneNumber, this.messageTemplates.invalidAmount());
          return;
        }
        
        session.contributionAmount = amount;
        await this.sendMessage(phoneNumber, 
          `💰 Mchango wa ${amount.toLocaleString()} TZS\n\n` +
          'Tafadhali subiri kidogo, tunachakata...'
        );
        session.currentStep = 1;
        
        // Process contribution
        await this.processContribution(phoneNumber, amount);
        break;
      
      case 1:
        await this.sendMessage(phoneNumber, 
          '✅ Mchango umewekwa! Unaweza kuona hali yake kwenye tovuti.'
        );
        await this.endConversationFlow(phoneNumber);
        break;
    }
  }

  // Handle help selection flow
  async handleHelpSelectionFlow(phoneNumber, message, session) {
    await this.sendMessage(phoneNumber, this.messageTemplates.helpMenu());
    await this.endConversationFlow(phoneNumber);
  }

  // Utility methods
  async getUserSession(phoneNumber) {
    if (!this.userSessions.has(phoneNumber)) {
      this.userSessions.set(phoneNumber, {
        activeFlow: null,
        currentStep: 0,
        data: {},
        lastActivity: Date.now()
      });
    }
    return this.userSessions.get(phoneNumber);
  }

  async getUser(phoneNumber) {
    try {
      const userQuery = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [databases.queries.equal('phone', phoneNumber)]
      );
      return userQuery.documents[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async createUser(phoneNumber, role) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        'unique()',
        {
          phone: phoneNumber,
          role: role,
          name: `User ${phoneNumber}`,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Create user error:', error);
    }
  }

  async startConversationFlow(phoneNumber, flowName) {
    const session = await this.getUserSession(phoneNumber);
    session.activeFlow = flowName;
    session.currentStep = 0;
    session.lastActivity = Date.now();
  }

  async endConversationFlow(phoneNumber) {
    const session = await this.getUserSession(phoneNumber);
    session.activeFlow = null;
    session.currentStep = 0;
    session.data = {};
  }

  async sendMessage(phoneNumber, message) {
    try {
      await greenAPI.addToQueue(phoneNumber, message);
    } catch (error) {
      console.error('Send message error:', error);
    }
  }

  isWelcomeMessage(message) {
    const welcomeWords = ['hi', 'hello', 'habari', 'mambo', 'jambo', 'karibu'];
    return welcomeWords.some(word => message.includes(word));
  }

  isRoleSelectionMessage(message) {
    const roleWords = ['kiongozi', 'leader', 'mwanachama', 'member', 'role', 'nafasi'];
    return roleWords.some(word => message.includes(word));
  }

  matchesTriggers(message, triggers) {
    return triggers.some(trigger => message.includes(trigger));
  }

  checkConditions(user, conditions) {
    if (conditions.role && user.role !== conditions.role) {
      return false;
    }
    return true;
  }

  async executeActions(phoneNumber, message, user, actions) {
    for (const action of actions) {
      switch (action) {
        case 'send_welcome':
          await this.sendMessage(phoneNumber, this.messageTemplates.welcome());
          break;
        
        case 'ask_for_role':
          await this.sendMessage(phoneNumber, this.messageTemplates.roleSelection());
          break;
        
        case 'send_help_menu':
          await this.sendMessage(phoneNumber, this.messageTemplates.helpMenu());
          break;
        
        case 'fetch_balance':
          await this.sendUserBalance(phoneNumber, user);
          break;
        
        case 'fetch_user_status':
          await this.sendUserStatus(phoneNumber, user);
          break;
        
        case 'validate_user':
          // User validation logic
          break;
        
        case 'ask_for_amount':
          await this.sendMessage(phoneNumber, 'Tafadhali andika kiasi cha mchango:');
          break;
        
        default:
          console.log(`Unknown action: ${action}`);
      }
    }
  }

  async sendDefaultResponse(phoneNumber, user) {
    const message = 
      `👋 Habari ${user.name}!\n\n` +
      `Unaweza:\n` +
      `🔹 Andika "Status" au "Hali" kuona hali yako\n` +
      `🔹 Andika "Vikundi" kuona vikundi vyako\n` +
      `🔹 Andika "Toa [amount]" kutoa mchango\n` +
      `🔹 Andika "Salio" kuona salio yako\n` +
      `🔹 Andika "Historia" kuona miamala yako\n` +
      `🔹 Andika "Help" au "Msaada" kuona msaada\n\n` +
      `Kwa msaada zaidi, tumia tovuti yetu au wasiliana na admin.`;
    
    await this.sendMessage(phoneNumber, message);
  }

  extractAmount(message) {
    const amountMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (!amountMatch) return null;
    
    const amount = parseInt(amountMatch[1].replace(/,/g, ''));
    if (amount < 1000 || amount > 1000000) return null;
    
    return amount;
  }

  async processContribution(phoneNumber, amount) {
    try {
      const user = await this.getUser(phoneNumber);
      if (!user) return;

      // Get user's groups
      const memberGroups = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [databases.queries.equal('user_id', user.$id)]
      );

      if (memberGroups.documents.length === 0) {
        await this.sendMessage(phoneNumber, this.messageTemplates.noGroups());
        return;
      }

      // For now, use the first group
      const member = memberGroups.documents[0];
      const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);

      // Create contribution transaction
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        'unique()',
        {
          group_id: group.$id,
          user_id: user.$id,
          type: 'contribution',
          amount: amount,
          description: `Mchango kupitia WhatsApp - ${amount.toLocaleString()} TZS`,
          status: 'pending',
          payment_method: 'whatsapp',
          created_at: new Date().toISOString()
        }
      );

      await this.sendMessage(phoneNumber, 
        `✅ Mchango wa ${amount.toLocaleString()} TZS umewekwa kwenye kikundi "${group.name}"\n\n` +
        `📊 Status: Inasubiri uthibitisho\n` +
        `📱 Unaweza kuona hali yake kwenye tovuti\n\n` +
        `Asante kwa mchango wako!`
      );

    } catch (error) {
      console.error('Process contribution error:', error);
      await this.sendMessage(phoneNumber, this.messageTemplates.errorMessage());
    }
  }

  async sendUserBalance(phoneNumber, user) {
    try {
      let totalBalance = 0;
      let groupBalances = [];

      if (user.role === 'kiongozi') {
        const groups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GROUPS,
          [databases.queries.equal('kiongozi_id', user.$id)]
        );
        
        totalBalance = groups.documents.reduce((sum, group) => sum + (group.total_balance || 0), 0);
        groupBalances = groups.documents.map(group => ({
          name: group.name,
          balance: group.total_balance || 0
        }));
      } else {
        const memberGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.MEMBERS,
          [databases.queries.equal('user_id', user.$id)]
        );
        
        for (const member of memberGroups.documents) {
          const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);
          const balance = member.balance || 0;
          totalBalance += balance;
          groupBalances.push({
            name: group.name,
            balance: balance
          });
        }
      }

      let message = `💰 Salio Yako:\n\n` +
        `👤 Jina: ${user.name}\n` +
        `💵 Jumla ya Salio: TZS ${totalBalance.toLocaleString()}\n\n`;

      if (groupBalances.length > 0) {
        message += `📊 Salio kwa Vikundi:\n`;
        groupBalances.forEach((group, index) => {
          message += `${index + 1}. ${group.name}: TZS ${group.balance.toLocaleString()}\n`;
        });
      }

      await this.sendMessage(phoneNumber, message);

    } catch (error) {
      console.error('Send user balance error:', error);
      await this.sendMessage(phoneNumber, 'Samahani, haikuweza kuona salio yako. Jaribu tena.');
    }
  }

  async sendUserStatus(phoneNumber, user) {
    try {
      let groups = [];
      let totalBalance = 0;
      
      if (user.role === 'kiongozi') {
        const kiongoziGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.GROUPS,
          [databases.queries.equal('kiongozi_id', user.$id)]
        );
        groups = kiongoziGroups.documents;
        totalBalance = groups.reduce((sum, group) => sum + (group.total_balance || 0), 0);
      } else {
        const memberGroups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.MEMBERS,
          [databases.queries.equal('user_id', user.$id)]
        );
        
        groups = await Promise.all(
          memberGroups.documents.map(async (member) => {
            try {
              const group = await databases.getDocument(DATABASE_ID, COLLECTIONS.GROUPS, member.group_id);
              return { ...group, member_info: member };
            } catch (error) {
              return null;
            }
          })
        );
        groups = groups.filter(Boolean);
        totalBalance = groups.reduce((sum, group) => sum + (group.member_info.balance || 0), 0);
      }

      let message = `👤 Hali Yako:\n\n` +
        `📝 Jina: ${user.name}\n` +
        `📱 Simu: ${user.phone}\n` +
        `👑 Nafasi: ${user.role === 'kiongozi' ? 'Kiongozi' : 'Mwanachama'}\n` +
        `💰 Jumla ya Salio: TZS ${totalBalance.toLocaleString()}\n` +
        `📊 Vikundi: ${groups.length}\n\n`;

      if (groups.length > 0) {
        message += `🏷️ Vikundi Vyako:\n`;
        groups.forEach((group, index) => {
          if (user.role === 'kiongozi') {
            message += `${index + 1}. ${group.name} (ID: ${group.$id})\n`;
            message += `   💰 Jumla: TZS ${(group.total_balance || 0).toLocaleString()}\n`;
          } else {
            message += `${index + 1}. ${group.name} - Mwanachama #${group.member_info.member_number}\n`;
            message += `   💰 Salio: TZS ${(group.member_info.balance || 0).toLocaleString()}\n`;
          }
        });
      }

      await this.sendMessage(phoneNumber, message);

    } catch (error) {
      console.error('Send user status error:', error);
      await this.sendMessage(phoneNumber, 'Samahani, haikuweza kuona hali yako. Jaribu tena.');
    }
  }

  // Get automation statistics
  getAutomationStats() {
    return {
      activeSessions: this.userSessions.size,
      conversationFlows: this.conversationFlows.size,
      automationRules: Object.keys(this.automationRules).length
    };
  }

  // Clear old sessions (cleanup)
  clearOldSessions(maxAge = 30 * 60 * 1000) { // 30 minutes
    const now = Date.now();
    for (const [phoneNumber, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > maxAge) {
        this.userSessions.delete(phoneNumber);
      }
    }
  }
}

module.exports = new WhatsAppAutomationService();
