const express = require('express');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const greenAPI = require('../services/greenapi');
const automationService = require('../services/whatsapp-automation');

// Import the new Node.js WhatsApp Bot
let nodejsBot = null;
try {
  const KijumbeWhatsAppBot = require('../services/whatsapp-bot-nodejs');
  nodejsBot = new KijumbeWhatsAppBot();
  console.log('✅ Node.js WhatsApp Bot loaded for webhook integration');
} catch (error) {
  console.warn('⚠️ Node.js WhatsApp Bot not available for webhook:', error.message);
}

const router = express.Router();

// Message templates for different scenarios
const MESSAGE_TEMPLATES = {
  welcome: (userName) => 
    `🎉 Karibu kwenye Kijumbe Rotational Savings, ${userName}!\n\n` +
    `Unaweza:\n` +
    `1️⃣ Kuunda kikundi - andika "UNDA"\n` +
    `2️⃣ Kujiunga na kikundi - andika "JIUNGA"\n` +
    `3️⃣ Kuona msaada - andika "MSAADA"\n` +
    `4️⃣ Kuona hali yako - andika "STATUS"\n` +
    `5️⃣ Kuona vikundi vyako - andika "VIKUNDI"\n\n` +
    `Kwa msaada zaidi, andika "HELP" au "MSAADA"`,

  help: () =>
    `📚 Msaada wa Kijumbe:\n\n` +
    `🔹 Status - Kuona hali yako\n` +
    `🔹 Vikundi - Kuona vikundi vyako\n` +
    `🔹 Toa [amount] - Kutoa mchango\n` +
    `🔹 Msaada - Kuona msaada huu\n` +
    `🔹 Unda - Kuunda kikundi (Kiongozi tu)\n` +
    `🔹 Jiunga - Kujiunga na kikundi\n\n` +
    `Kwa msaada zaidi, wasiliana na admin.`,

  createGroup: () =>
    `🏗️ Kuunda Kikundi:\n\n` +
    `1️⃣ Nenda kwenye tovuti yetu\n` +
    `2️⃣ Jisajili kama Kiongozi\n` +
    `3️⃣ Unda kikundi chako\n` +
    `4️⃣ Pata Group ID na Bot Phone\n\n` +
    `Baada ya kuunda, utapata Group ID na unaweza kuanza kukaribisha wanachama.`,

  joinGroup: () =>
    `👥 Kujiunga na Kikundi:\n\n` +
    `1️⃣ Pata Group ID kutoka kwa Kiongozi\n` +
    `2️⃣ Nenda kwenye tovuti yetu\n` +
    `3️⃣ Jisajili kama Member\n` +
    `4️⃣ Jiunge na kikundi kwa Group ID\n\n` +
    `Baada ya kujiunga, utapata Member Number yako.`,

  contributionSuccess: (amount, groupName) =>
    `✅ Mchango wa ${amount.toLocaleString()} TZS umewekwa kwenye kikundi "${groupName}"\n\n` +
    `📊 Status: Inasubiri uthibitisho\n` +
    `📱 Unaweza kuona hali yake kwenye tovuti\n\n` +
    `Asante kwa mchango wako!`,

  errorMessage: () =>
    `Samahani, kuna tatizo. Tafadhali jaribu tena baada ya muda au wasiliana na admin.`
};

// Enhanced WhatsApp message sender using Green API service
const sendWhatsAppMessage = async (phoneNumber, message, options = {}) => {
  try {
    // Use the Green API service with queue support
    const result = await greenAPI.addToQueue(phoneNumber, message, options);
    return result;
  } catch (error) {
    console.error(`❌ WhatsApp send error to ${phoneNumber}:`, error.message);
    throw error;
  }
};

// Send media message (image, document, etc.)
const sendMediaMessage = async (phoneNumber, mediaUrl, caption = '', mediaType = 'image') => {
  try {
    const result = await greenAPI.sendMediaMessage(phoneNumber, mediaUrl, caption, {
      mediaType: mediaType,
      fileName: `kijumbe_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'pdf'}`
    });
    return result;
  } catch (error) {
    console.error(`❌ Media message error to ${phoneNumber}:`, error.message);
    throw error;
  }
};

// Send interactive buttons message
const sendInteractiveButtons = async (phoneNumber, message, buttons) => {
  try {
    const result = await greenAPI.sendInteractiveButtons(phoneNumber, message, buttons);
    return result;
  } catch (error) {
    console.error(`❌ Interactive buttons error to ${phoneNumber}:`, error.message);
    throw error;
  }
};

// Store outgoing message for tracking
const storeOutgoingMessage = async (phoneNumber, message, status, error = null) => {
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
        error: error,
        timestamp: new Date().toISOString(),
        instance_id: GREENAPI_CONFIG.instanceId
      }
    );
  } catch (error) {
    console.error('Failed to store outgoing message:', error.message);
  }
};

// Store incoming message for tracking
const storeIncomingMessage = async (phoneNumber, message, messageType = 'text') => {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.WHATSAPP_MESSAGES || 'whatsapp_messages',
      'unique()',
      {
        phone_number: phoneNumber,
        message: message,
        type: 'incoming',
        message_type: messageType,
        status: 'received',
        timestamp: new Date().toISOString(),
        instance_id: GREENAPI_CONFIG.instanceId
      }
    );
  } catch (error) {
    console.error('Failed to store incoming message:', error.message);
  }
};

// Enhanced webhook endpoint for receiving WhatsApp messages
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook secret if configured
    if (greenAPI.config.webhookSecret) {
      const signature = req.headers['x-green-api-signature'];
      if (!signature || signature !== greenAPI.config.webhookSecret) {
        console.warn('⚠️ Invalid webhook signature received');
        return res.status(401).json({ error: 'Unauthorized webhook request' });
      }
    }

    const { body } = req.body;

    if (!body) {
      console.log('⚠️ Empty webhook body received');
      return res.status(200).json({ status: 'OK', message: 'Empty webhook' });
    }

    console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Handle different webhook types
    switch (body.typeWebhook) {
      case 'incomingMessageReceived':
        await handleIncomingMessage(body);
        break;
      
      case 'outgoingMessageReceived':
        await handleOutgoingMessage(body);
        break;
      
      case 'outgoingAPIMessageReceived':
        await handleOutgoingAPIMessage(body);
        break;
      
      case 'outgoingMessageStatus':
        await handleMessageStatus(body);
        break;
      
      case 'stateInstanceChanged':
        await handleInstanceStateChange(body);
        break;
      
      case 'incomingMessageReceivedExtended':
        await handleIncomingMessageExtended(body);
        break;
      
      case 'outgoingMessageReceivedExtended':
        await handleOutgoingMessageExtended(body);
        break;
      
      case 'incomingCall':
        await handleIncomingCall(body);
        break;
      
      case 'deviceInfo':
        await handleDeviceInfo(body);
        break;
      
      default:
        console.log(`ℹ️ Unhandled webhook type: ${body.typeWebhook}`);
    }

    res.status(200).json({ status: 'OK', processed: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Handle incoming message
const handleIncomingMessage = async (webhookBody) => {
  try {
    const { chatId, senderData, messageData } = webhookBody;
    const phoneNumber = senderData.sender.replace('@c.us', '');
    const message = messageData.textMessageData?.textMessage || '';
    const messageType = messageData.typeMessage || 'text';

    console.log(`📱 Incoming ${messageType} message from ${phoneNumber}: ${message}`);

    // Store incoming message
    await storeIncomingMessage(phoneNumber, message, messageType);

    // Use the new Node.js bot if available, otherwise fallback to old automation
    if (nodejsBot) {
      console.log('🤖 Processing with Node.js Bot...');
      await nodejsBot.processMessage(phoneNumber, message, messageData);
    } else {
      console.log('🔄 Falling back to old automation service...');
      await automationService.processMessage(phoneNumber, message, messageType);
    }

  } catch (error) {
    console.error('❌ Handle incoming message error:', error);
    
    // Send error message to user
    try {
      await greenAPI.sendMessage(phoneNumber, 
        'Samahani, kuna tatizo la kimtambo. Tafadhali jaribu tena baada ya muda.'
      );
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
  }
};

// Handle outgoing message (sent from phone)
const handleOutgoingMessage = async (webhookBody) => {
  try {
    const { chatId, senderData, messageData } = webhookBody;
    const phoneNumber = senderData.sender.replace('@c.us', '');
    const message = messageData.textMessageData?.textMessage || '';

    console.log(`📤 Outgoing message from ${phoneNumber}: ${message}`);
    
    // Store outgoing message
    await storeOutgoingMessage(phoneNumber, message, 'sent');
  } catch (error) {
    console.error('❌ Handle outgoing message error:', error);
  }
};

// Handle outgoing API message
const handleOutgoingAPIMessage = async (webhookBody) => {
  try {
    const { chatId, messageData } = webhookBody;
    const phoneNumber = chatId.replace('@c.us', '');
    const message = messageData.textMessageData?.textMessage || '';

    console.log(`📤 API message sent to ${phoneNumber}: ${message}`);
    
    // Update message status
    await storeOutgoingMessage(phoneNumber, message, 'sent');
  } catch (error) {
    console.error('❌ Handle outgoing API message error:', error);
  }
};

// Handle message status updates
const handleMessageStatus = async (webhookBody) => {
  try {
    const { chatId, statusData } = webhookBody;
    const phoneNumber = chatId.replace('@c.us', '');
    const status = statusData.status;

    console.log(`📊 Message status for ${phoneNumber}: ${status}`);
    
    // Update message status in database
    // This would require tracking message IDs
  } catch (error) {
    console.error('❌ Handle message status error:', error);
  }
};

// Handle instance state changes
const handleInstanceStateChange = async (webhookBody) => {
  try {
    const { stateInstance } = webhookBody;
    console.log(`🔄 WhatsApp instance state changed to: ${stateInstance}`);
    
    // Update instance status in database
    // Notify admins of state changes
  } catch (error) {
    console.error('❌ Handle instance state change error:', error);
  }
};

// Handle extended incoming message (with more details)
const handleIncomingMessageExtended = async (webhookBody) => {
  try {
    const { chatId, senderData, messageData } = webhookBody;
    const phoneNumber = senderData.sender.replace('@c.us', '');
    const message = messageData.textMessageData?.textMessage || '';
    const messageType = messageData.typeMessage || 'text';

    console.log(`📱 Extended incoming ${messageType} message from ${phoneNumber}: ${message}`);

    // Store incoming message with extended data
    await storeIncomingMessage(phoneNumber, message, messageType);

    // Use the new Node.js bot if available, otherwise fallback to old automation
    if (nodejsBot) {
      console.log('🤖 Processing extended message with Node.js Bot...');
      await nodejsBot.processMessage(phoneNumber, message, messageData);
    } else {
      console.log('🔄 Processing extended message with old automation service...');
      await automationService.processMessage(phoneNumber, message, messageType);
    }

  } catch (error) {
    console.error('❌ Handle extended incoming message error:', error);
    
    // Send error message to user
    try {
      await greenAPI.sendMessage(phoneNumber, 
        'Samahani, kuna tatizo la kimtambo. Tafadhali jaribu tena baada ya muda.'
      );
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
  }
};

// Handle extended outgoing message
const handleOutgoingMessageExtended = async (webhookBody) => {
  try {
    const { chatId, senderData, messageData } = webhookBody;
    const phoneNumber = senderData.sender.replace('@c.us', '');
    const message = messageData.textMessageData?.textMessage || '';

    console.log(`📤 Extended outgoing message from ${phoneNumber}: ${message}`);
    
    // Store outgoing message
    await storeOutgoingMessage(phoneNumber, message, 'sent');
  } catch (error) {
    console.error('❌ Handle extended outgoing message error:', error);
  }
};

// Handle incoming call
const handleIncomingCall = async (webhookBody) => {
  try {
    const { chatId, senderData } = webhookBody;
    const phoneNumber = senderData.sender.replace('@c.us', '');
    
    console.log(`📞 Incoming call from ${phoneNumber}`);
    
    // Store call event
    await storeIncomingMessage(phoneNumber, '[INCOMING_CALL]', 'call');
    
    // You could implement call handling logic here
    // For now, just log it
    
  } catch (error) {
    console.error('❌ Handle incoming call error:', error);
  }
};

// Handle device info updates
const handleDeviceInfo = async (webhookBody) => {
  try {
    const { deviceData } = webhookBody;
    
    console.log(`📱 Device info update:`, deviceData);
    
    // Store device info for monitoring
    // This could be useful for tracking device status
    
  } catch (error) {
    console.error('❌ Handle device info error:', error);
  }
};

// Enhanced message processing with natural language understanding
const processWhatsAppMessage = async (phoneNumber, message, messageType = 'text') => {
  try {
    const lowerMessage = message.toLowerCase().trim();

    // Check if user exists
    const userQuery = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [databases.queries.equal('phone', phoneNumber)]
    );

    if (userQuery.documents.length === 0) {
      // New user - send welcome message
      await sendWhatsAppMessage(phoneNumber, MESSAGE_TEMPLATES.welcome('Mpendwa'));
      return;
    }

    const user = userQuery.documents[0];

    // Process commands with enhanced understanding
    if (lowerMessage.includes('msaada') || lowerMessage.includes('help') || lowerMessage.includes('aid')) {
      await sendHelpMessage(phoneNumber, user);
    } else if ((lowerMessage.includes('unda') || lowerMessage.includes('create')) && user.role === 'kiongozi') {
      await sendCreateGroupInstructions(phoneNumber, user);
    } else if (lowerMessage.includes('jiunga') || lowerMessage.includes('join')) {
      await sendJoinGroupInstructions(phoneNumber, user);
    } else if (lowerMessage.includes('status') || lowerMessage.includes('hali') || lowerMessage.includes('state')) {
      await sendUserStatus(phoneNumber, user);
    } else if (lowerMessage.includes('vikundi') || lowerMessage.includes('groups')) {
      await sendUserGroups(phoneNumber, user);
    } else if (lowerMessage.includes('toa') || lowerMessage.includes('contribute') || lowerMessage.includes('mchango')) {
      await processContribution(phoneNumber, user, message);
    } else if (lowerMessage.includes('balance') || lowerMessage.includes('salio')) {
      await sendUserBalance(phoneNumber, user);
    } else if (lowerMessage.includes('history') || lowerMessage.includes('historia')) {
      await sendTransactionHistory(phoneNumber, user);
    } else {
      await sendDefaultMessage(phoneNumber, user);
    }

  } catch (error) {
    console.error('❌ Process WhatsApp message error:', error);
    await sendWhatsAppMessage(phoneNumber, MESSAGE_TEMPLATES.errorMessage());
  }
};

// Send help message with interactive buttons
const sendHelpMessage = async (phoneNumber, user) => {
  const message = MESSAGE_TEMPLATES.help();
  
  // Send interactive buttons for quick actions
  const buttons = [
    { buttonText: 'Status Yangu' },
    { buttonText: 'Vikundi Vyangu' },
    { buttonText: 'Msaada Zaidi' }
  ];
  
  try {
    await sendInteractiveButtons(phoneNumber, message, buttons);
  } catch (error) {
    // Fallback to regular message if buttons fail
    await sendWhatsAppMessage(phoneNumber, message);
  }
};

// Send create group instructions
const sendCreateGroupInstructions = async (phoneNumber, user) => {
  const message = MESSAGE_TEMPLATES.createGroup();
  await sendWhatsAppMessage(phoneNumber, message);
};

// Send join group instructions
const sendJoinGroupInstructions = async (phoneNumber, user) => {
  const message = MESSAGE_TEMPLATES.joinGroup();
  await sendWhatsAppMessage(phoneNumber, message);
};

// Send user status with enhanced information
const sendUserStatus = async (phoneNumber, user) => {
  try {
    // Get user's groups and financial information
    let groups = [];
    let totalBalance = 0;
    
    if (user.role === 'kiongozi') {
      const kiongoziGroups = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [databases.queries.equal('kiongozi_id', user.$id)]
      );
      groups = kiongoziGroups.documents;
      
      // Calculate total group balance
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
      
      // Calculate personal balance
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

    await sendWhatsAppMessage(phoneNumber, message);

  } catch (error) {
    console.error('❌ Send user status error:', error);
    await sendWhatsAppMessage(phoneNumber, 'Samahani, haikuweza kuona hali yako. Jaribu tena.');
  }
};

// Send user groups with detailed information
const sendUserGroups = async (phoneNumber, user) => {
  try {
    let groups = [];
    
    if (user.role === 'kiongozi') {
      const kiongoziGroups = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [databases.queries.equal('kiongozi_id', user.$id)]
      );
      groups = kiongoziGroups.documents;
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
    }

    if (groups.length === 0) {
      await sendWhatsAppMessage(phoneNumber, 
        'Huna vikundi bado. Unda kikundi au jiunge na kikundi cha mtu mwingine.'
      );
      return;
    }

    let message = `🏷️ Vikundi Vyako:\n\n`;
    
    groups.forEach((group, index) => {
      message += `${index + 1}. ${group.name}\n`;
      message += `   💰 Mchango: ${(group.contribution_amount || 0).toLocaleString()} TZS\n`;
      message += `   👥 Wanachama: ${group.max_members || 0}\n`;
      message += `   📅 Muda: ${group.rotation_duration || 0} miezi\n`;
      
      if (user.role === 'kiongozi') {
        message += `   🆔 Group ID: ${group.$id}\n`;
        message += `   💰 Jumla: TZS ${(group.total_balance || 0).toLocaleString()}\n`;
      } else {
        message += `   🔢 Namba Yako: ${group.member_info.member_number}\n`;
        message += `   💰 Salio: TZS ${(group.member_info.balance || 0).toLocaleString()}\n`;
      }
      message += `\n`;
    });

    await sendWhatsAppMessage(phoneNumber, message);

  } catch (error) {
    console.error('❌ Send user groups error:', error);
    await sendWhatsAppMessage(phoneNumber, 'Samahani, haikuweza kuona vikundi vyako. Jaribu tena.');
  }
};

// Process contribution request with enhanced validation
const processContribution = async (phoneNumber, user, message) => {
  try {
    // Extract amount from message using regex
    const amountMatch = message.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (!amountMatch) {
      await sendWhatsAppMessage(phoneNumber, 
        'Tafadhali andika kiasi sahihi. Mfano: "toa 50000" au "contribute 50,000"'
      );
      return;
    }

    const amount = parseInt(amountMatch[1].replace(/,/g, ''));
    
    // Validate amount
    if (amount < 1000) {
      await sendWhatsAppMessage(phoneNumber, 
        'Kiasi cha chini ni TZS 1,000. Tafadhali weka kiasi sahihi.'
      );
      return;
    }

    if (amount > 1000000) {
      await sendWhatsAppMessage(phoneNumber, 
        'Kiasi cha juu ni TZS 1,000,000. Tafadhali weka kiasi sahihi.'
      );
      return;
    }
    
    // Get user's groups
    const memberGroups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMBERS,
      [databases.queries.equal('user_id', user.$id)]
    );

    if (memberGroups.documents.length === 0) {
      await sendWhatsAppMessage(phoneNumber, 
        'Huna vikundi bado. Jiunge na kikundi kwanza.'
      );
      return;
    }

    if (memberGroups.documents.length > 1) {
      // Send list message for group selection (better UX than buttons)
      const sections = [{
        title: 'Chagua Kikundi',
        rows: memberGroups.documents.map((member, index) => ({
          id: `group_${member.group_id}`,
          title: `Kikundi ${index + 1}`,
          description: `ID: ${member.group_id}`
        }))
      }];
      
      try {
        await greenAPI.sendListMessage(phoneNumber, 
          `Una vikundi ${memberGroups.documents.length}. Chagua kikundi cha kutoa mchango:`, 
          sections
        );
      } catch (error) {
        // Fallback to interactive buttons if list fails
        const buttons = memberGroups.documents.map((member, index) => ({
          buttonText: `Kikundi ${index + 1}`
        }));
        
        await sendInteractiveButtons(phoneNumber, 
          `Una vikundi ${memberGroups.documents.length}. Chagua kikundi cha kutoa mchango:`, 
          buttons
        );
      }
      return;
    }

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
        description: `Mchango kupitia WhatsApp - ${amount.toLocaleString()} TZS`,
        status: 'pending',
        payment_method: 'whatsapp',
        created_at: new Date().toISOString()
      }
    );

    await sendWhatsAppMessage(phoneNumber, 
      MESSAGE_TEMPLATES.contributionSuccess(amount, group.name)
    );

  } catch (error) {
    console.error('❌ Process contribution error:', error);
    await sendWhatsAppMessage(phoneNumber, 
      'Samahani, haikuweza kuweka mchango. Jaribu tena au wasiliana na admin.'
    );
  }
};

// Send user balance information
const sendUserBalance = async (phoneNumber, user) => {
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

    await sendWhatsAppMessage(phoneNumber, message);

  } catch (error) {
    console.error('❌ Send user balance error:', error);
    await sendWhatsAppMessage(phoneNumber, 'Samahani, haikuweza kuona salio yako. Jaribu tena.');
  }
};

// Send transaction history
const sendTransactionHistory = async (phoneNumber, user) => {
  try {
    const transactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [databases.queries.equal('user_id', user.$id)],
      10 // Limit to last 10 transactions
    );

    if (transactions.documents.length === 0) {
      await sendWhatsAppMessage(phoneNumber, 'Huna muamala wowote bado.');
      return;
    }

    let message = `📋 Historia ya Miamala (10 ya Mwisho):\n\n`;
    
    transactions.documents.forEach((transaction, index) => {
      const date = new Date(transaction.created_at).toLocaleDateString('sw-TZ');
      const amount = (transaction.amount || 0).toLocaleString();
      const type = transaction.type === 'contribution' ? 'Mchango' : 'Mlipo';
      const status = transaction.status === 'completed' ? '✅' : 
                    transaction.status === 'pending' ? '⏳' : '❌';
      
      message += `${index + 1}. ${status} ${type}: TZS ${amount}\n`;
      message += `   📅 ${date} - ${transaction.description || 'Hakuna maelezo'}\n\n`;
    });

    await sendWhatsAppMessage(phoneNumber, message);

  } catch (error) {
    console.error('❌ Send transaction history error:', error);
    await sendWhatsAppMessage(phoneNumber, 'Samahani, haikuweza kuona historia ya miamala. Jaribu tena.');
  }
};

// Send default message with suggestions
const sendDefaultMessage = async (phoneNumber, user) => {
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
  
  await sendWhatsAppMessage(phoneNumber, message);
};

// Send notification to user (for system notifications)
router.post('/send-notification', async (req, res) => {
  try {
    const { phoneNumber, message, mediaUrl, mediaType } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    let result;
    if (mediaUrl && mediaType) {
      result = await sendMediaMessage(phoneNumber, mediaUrl, message, mediaType);
    } else {
      result = await sendWhatsAppMessage(phoneNumber, message);
    }

    res.json({
      message: 'Notification sent successfully',
      result
    });

  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Send bulk notification to multiple users
router.post('/send-bulk-notification', async (req, res) => {
  try {
    const { phoneNumbers, message, mediaUrl, mediaType } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
      return res.status(400).json({ error: 'Phone numbers array and message are required' });
    }

    const results = [];
    const errors = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        let result;
        if (mediaUrl && mediaType) {
          result = await sendMediaMessage(phoneNumber, message, mediaUrl, mediaType);
        } else {
          result = await sendWhatsAppMessage(phoneNumber, message);
        }
        results.push({ phoneNumber, success: true, result });
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push({ phoneNumber, error: error.message });
      }
    }

    res.json({
      message: 'Bulk notification completed',
      total: phoneNumbers.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('❌ Send bulk notification error:', error);
    res.status(500).json({ error: 'Failed to send bulk notification', details: error.message });
  }
});

// Send list message (for group selection, etc.)
router.post('/send-list-message', async (req, res) => {
  try {
    const { phoneNumber, message, sections } = req.body;
    
    if (!phoneNumber || !message || !sections) {
      return res.status(400).json({ error: 'Phone number, message, and sections are required' });
    }

    const result = await greenAPI.sendListMessage(phoneNumber, message, sections);

    res.json({
      message: 'List message sent successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Send list message error:', error);
    res.status(500).json({ error: 'Failed to send list message', details: error.message });
  }
});

// Get chat history
router.get('/chat-history/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { count = 100 } = req.query;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const chatHistory = await greenAPI.getChatHistory(phoneNumber, parseInt(count));

    res.json({
      phoneNumber,
      chatHistory,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history', details: error.message });
  }
});

// Mark message as read
router.post('/mark-read', async (req, res) => {
  try {
    const { phoneNumber, messageId } = req.body;
    
    if (!phoneNumber || !messageId) {
      return res.status(400).json({ error: 'Phone number and message ID are required' });
    }

    const result = await greenAPI.markMessageAsRead(phoneNumber, messageId);

    res.json({
      message: 'Message marked as read successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read', details: error.message });
  }
});

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'WhatsApp routes are working!',
    timestamp: new Date().toISOString(),
    config: {
      instanceId: greenAPI.config.instanceId,
      botPhone: greenAPI.config.botPhone,
      baseUrl: greenAPI.config.baseUrl
    },
    queueStatus: greenAPI.getQueueStatus()
  });
});

// Get queue status
router.get('/queue-status', (req, res) => {
  res.json({
    queueStatus: greenAPI.getQueueStatus(),
    timestamp: new Date().toISOString()
  });
});

// Clear message queue
router.post('/clear-queue', (req, res) => {
  try {
    const clearedCount = greenAPI.clearQueue();
    res.json({
      message: 'Message queue cleared successfully',
      clearedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Clear queue error:', error);
    res.status(500).json({ error: 'Failed to clear queue', details: error.message });
  }
});

// Get instance information
router.get('/instance-info', async (req, res) => {
  try {
    if (!process.env.GREENAPI_ID_INSTANCE || process.env.GREENAPI_ID_INSTANCE === '7105299826') {
      return res.json({
        message: 'GreenAPI not configured',
        config: greenAPI.config,
        timestamp: new Date().toISOString()
      });
    }

    const [status, settings] = await Promise.all([
      greenAPI.getInstanceStatus(),
      greenAPI.getInstanceSettings()
    ]);

    res.json({
      status,
      settings,
      config: greenAPI.config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get instance info error:', error);
    res.status(500).json({ error: 'Failed to get instance info', details: error.message });
  }
});

// Get WhatsApp bot status and instance information
router.get('/status', async (req, res) => {
  try {
    console.log('📱 WhatsApp status endpoint called');
    
    // For testing purposes, return mock data if GreenAPI is not configured
    if (!process.env.GREENAPI_ID_INSTANCE || process.env.GREENAPI_ID_INSTANCE === '7105299826') {
      console.log('⚠️  Using mock data for WhatsApp status (GreenAPI not configured)');
      return res.json({
        status: 'WhatsApp bot is running (mock mode)',
        botStatus: 'authorized',
        botPhone: greenAPI.config.botPhone,
        instanceId: greenAPI.config.instanceId,
        webhookUrl: greenAPI.config.webhookUrl,
        queueStatus: greenAPI.getQueueStatus(),
        timestamp: new Date().toISOString(),
        note: 'This is mock data. Configure GreenAPI for real functionality.'
      });
    }

    const [instanceStatus, instanceSettings] = await Promise.all([
      greenAPI.getInstanceStatus(),
      greenAPI.getInstanceSettings()
    ]);

    res.json({
      status: 'WhatsApp bot is running',
      botStatus: instanceStatus.stateInstance,
      botPhone: greenAPI.config.botPhone,
      instanceId: greenAPI.config.instanceId,
      settings: instanceSettings,
      webhookUrl: greenAPI.config.webhookUrl,
      queueStatus: greenAPI.getQueueStatus(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get WhatsApp status error:', error);
    res.status(500).json({ 
      error: 'Failed to get WhatsApp status', 
      details: error.message,
      config: {
        instanceId: greenAPI.config.instanceId,
        baseUrl: greenAPI.config.baseUrl
      },
      queueStatus: greenAPI.getQueueStatus()
    });
  }
});

// Get message statistics
router.get('/statistics', async (req, res) => {
  try {
    console.log('📊 WhatsApp statistics endpoint called');
    
    // For development, always return mock data to avoid database issues
    console.log('⚠️  Using mock data for WhatsApp statistics (development mode)');
    return res.json({
      statistics: {
        totalIncoming: 15,
        totalOutgoing: 23,
        successfulOutgoing: 22,
        failedOutgoing: 1,
        successRate: 95.7,
        totalMessages: 38
      },
      automation: automationService.getAutomationStats(),
      timestamp: new Date().toISOString(),
      note: 'This is mock data for development. Configure GreenAPI and database for real statistics.'
    });

  } catch (error) {
    console.error('❌ Get WhatsApp statistics error:', error);
    // Return mock data on error for development
    res.json({
      statistics: {
        totalIncoming: 15,
        totalOutgoing: 23,
        successfulOutgoing: 22,
        failedOutgoing: 1,
        successRate: 95.7,
        totalMessages: 38
      },
      automation: automationService.getAutomationStats(),
      timestamp: new Date().toISOString(),
      note: 'This is mock data due to an error. Check database connection.',
      error: error.message
    });
  }
});

// Get automation statistics
router.get('/automation/stats', (req, res) => {
  try {
    const stats = automationService.getAutomationStats();
    res.json({
      automation: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get automation stats error:', error);
    res.status(500).json({ error: 'Failed to get automation stats', details: error.message });
  }
});

// Clear old automation sessions
router.post('/automation/clear-sessions', (req, res) => {
  try {
    const { maxAge } = req.body;
    const clearedCount = automationService.clearOldSessions(maxAge);
    res.json({
      message: 'Old sessions cleared successfully',
      clearedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Clear sessions error:', error);
    res.status(500).json({ error: 'Failed to clear sessions', details: error.message });
  }
});

// Get active automation sessions
router.get('/automation/sessions', (req, res) => {
  try {
    const sessions = Array.from(automationService.userSessions.entries()).map(([phone, session]) => ({
      phone,
      activeFlow: session.activeFlow,
      currentStep: session.currentStep,
      lastActivity: session.lastActivity
    }));
    
    res.json({
      sessions,
      total: sessions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions', details: error.message });
  }
});

// Get recent messages
router.get('/messages', async (req, res) => {
  try {
    console.log('💬 WhatsApp messages endpoint called');
    
    const { limit = 50, type, phoneNumber } = req.query;
    
    // For development, always return mock data to avoid database issues
    console.log('⚠️  Using mock data for WhatsApp messages (development mode)');
    const mockMessages = [
      {
        $id: 'mock1',
        phone_number: '+255738071080',
        message: 'Hello, I need help with my savings group',
        type: 'incoming',
        message_type: 'text',
        status: 'received',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      },
      {
        $id: 'mock2',
        phone_number: '+255738071080',
        message: 'Welcome to Kijumbe! How can I help you today?',
        type: 'outgoing',
        message_type: 'text',
        status: 'sent',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() // 4 minutes ago
      },
      {
        $id: 'mock3',
        phone_number: '+255738071081',
        message: 'I want to contribute 50000 TZS',
        type: 'incoming',
        message_type: 'text',
        status: 'received',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() // 3 minutes ago
      },
      {
        $id: 'mock4',
        phone_number: '+255738071080',
        message: 'Thank you! Your contribution has been recorded.',
        type: 'outgoing',
        message_type: 'text',
        status: 'sent',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 minutes ago
      },
      {
        $id: 'mock5',
        phone_number: '+255738071082',
        message: 'How do I check my group balance?',
        type: 'incoming',
        message_type: 'text',
        status: 'received',
        timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString() // 1 minute ago
      }
    ];
    
    // Filter by type if specified
    let filteredMessages = mockMessages;
    if (type) {
      filteredMessages = mockMessages.filter(msg => msg.type === type);
    }
    
    // Filter by phone number if specified
    if (phoneNumber) {
      filteredMessages = filteredMessages.filter(msg => msg.phone_number === phoneNumber);
    }
    
    return res.json({
      messages: filteredMessages.slice(0, parseInt(limit)),
      total: filteredMessages.length,
      timestamp: new Date().toISOString(),
      note: 'This is mock data for development. Configure GreenAPI and database for real messages.'
    });

  } catch (error) {
    console.error('❌ Get WhatsApp messages error:', error);
    res.status(500).json({ 
      error: 'Failed to get WhatsApp messages', 
      details: error.message,
      note: 'Check database connection and collection configuration'
    });
  }
});

// Test WhatsApp connection
router.post('/test-connection', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required for test' });
    }

    const testMessage = `🧪 Test message from Kijumbe WhatsApp Bot\n\nTimestamp: ${new Date().toLocaleString('sw-TZ')}\nStatus: Bot is working correctly!`;
    
    const result = await sendWhatsAppMessage(phoneNumber, testMessage);

    res.json({
      message: 'Test message sent successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test WhatsApp connection error:', error);
    res.status(500).json({ error: 'Failed to send test message', details: error.message });
  }
});

// Update webhook URL
router.put('/webhook-url', async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Update webhook URL in GreenAPI instance
    const result = await greenAPI.setWebhookUrl(webhookUrl);

    res.json({
      message: 'Webhook URL updated successfully',
      webhookUrl,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update webhook URL error:', error);
    res.status(500).json({ error: 'Failed to update webhook URL', details: error.message });
  }
});

// Test endpoint for direct bot interaction
router.post('/test-bot', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['phoneNumber', 'message'] 
      });
    }

    console.log(`🧪 Testing bot with message from ${phoneNumber}: ${message}`);

    if (nodejsBot) {
      await nodejsBot.processMessage(phoneNumber, message);
      res.json({ 
        success: true, 
        message: 'Message processed by Node.js bot',
        bot: 'nodejs'
      });
    } else {
      await automationService.processMessage(phoneNumber, message, 'text');
      res.json({ 
        success: true, 
        message: 'Message processed by old automation service',
        bot: 'legacy'
      });
    }

  } catch (error) {
    console.error('❌ Test bot error:', error);
    res.status(500).json({ 
      error: 'Bot test failed', 
      details: error.message 
    });
  }
});

// Get bot status endpoint
router.get('/bot-status', (req, res) => {
  try {
    if (nodejsBot) {
      const status = nodejsBot.getStatus();
      res.json({
        success: true,
        bot: 'nodejs',
        status: status,
        message: 'Node.js bot is loaded and ready'
      });
    } else {
      res.json({
        success: false,
        bot: 'legacy',
        message: 'Only legacy automation service is available'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get bot status',
      details: error.message
    });
  }
});

module.exports = router;
