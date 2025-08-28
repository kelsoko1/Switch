// WhatsApp Automation Configuration
// This file contains all the automation rules, message templates, and settings

const AUTOMATION_CONFIG = {
  // General settings
  settings: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxRetries: 3,
    rateLimitDelay: 2000, // 2 seconds between messages
    enableLogging: true,
    enableAnalytics: true
  },

  // Message templates
  templates: {
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
      `⏳ Inachakata... Tafadhali subiri kidogo.`,

    contributionSuccess: (amount, groupName) =>
      `✅ Mchango wa ${amount.toLocaleString()} TZS umewekwa kwenye kikundi "${groupName}"\n\n` +
      `📊 Status: Inasubiri uthibitisho\n` +
      `📱 Unaweza kuona hali yake kwenye tovuti\n\n` +
      `Asante kwa mchango wako!`,

    groupCreationGuide: () =>
      `🏗️ Kuunda Kikundi:\n\n` +
      `1️⃣ Nenda kwenye tovuti yetu\n` +
      `2️⃣ Jisajili kama Kiongozi\n` +
      `3️⃣ Unda kikundi chako\n` +
      `4️⃣ Pata Group ID na Bot Phone\n\n` +
      `Baada ya kuunda, utapata Group ID na unaweza kuanza kukaribisha wanachama.`,

    groupJoiningGuide: () =>
      `👥 Kujiunga na Kikundi:\n\n` +
      `1️⃣ Pata Group ID kutoka kwa Kiongozi\n` +
      `2️⃣ Nenda kwenye tovuti yetu\n` +
      `3️⃣ Jisajili kama Member\n` +
      `4️⃣ Jiunge na kikundi kwa Group ID\n\n` +
      `Baada ya kujiunga, utapata Member Number yako.`
  },

  // Automation rules
  rules: {
    // Welcome flow for new users
    welcome: {
      triggers: ['hi', 'hello', 'habari', 'mambo', 'jambo', 'karibu'],
      actions: ['send_welcome', 'ask_for_role'],
      nextFlow: 'role_selection',
      priority: 1
    },

    // Role-based flows
    role_selection: {
      triggers: ['kiongozi', 'leader', 'mwanachama', 'member', 'role', 'nafasi'],
      actions: ['store_role', 'send_role_specific_info'],
      nextFlow: 'main_menu',
      priority: 2
    },

    // Group management flows
    group_creation: {
      triggers: ['unda', 'create', 'create group', 'tengeneza'],
      conditions: { role: 'kiongozi' },
      actions: ['send_creation_guide', 'start_creation_process'],
      nextFlow: 'group_setup',
      priority: 3
    },

    group_joining: {
      triggers: ['jiunga', 'join', 'join group', 'ingia'],
      actions: ['send_joining_guide', 'ask_for_group_id'],
      nextFlow: 'group_verification',
      priority: 3
    },

    // Financial flows
    contribution: {
      triggers: ['toa', 'contribute', 'mchango', 'deposit', 'weka'],
      actions: ['validate_user', 'ask_for_amount'],
      nextFlow: 'amount_confirmation',
      priority: 4
    },

    balance_check: {
      triggers: ['salio', 'balance', 'pesa', 'money', 'cash'],
      actions: ['fetch_balance', 'send_balance_info'],
      nextFlow: 'main_menu',
      priority: 4
    },

    // Support flows
    help: {
      triggers: ['msaada', 'help', 'aid', 'tusaidie', 'support'],
      actions: ['send_help_menu', 'show_available_commands'],
      nextFlow: 'help_selection',
      priority: 5
    },

    // Status flows
    status_check: {
      triggers: ['status', 'hali', 'state', 'progress', 'progress'],
      actions: ['fetch_user_status', 'send_status_report'],
      nextFlow: 'main_menu',
      priority: 4
    },

    // Group information
    group_info: {
      triggers: ['vikundi', 'groups', 'group', 'kikundi'],
      actions: ['fetch_user_groups', 'send_groups_info'],
      nextFlow: 'main_menu',
      priority: 4
    },

    // Transaction history
    transaction_history: {
      triggers: ['historia', 'history', 'miamala', 'transactions'],
      actions: ['fetch_transaction_history', 'send_history'],
      nextFlow: 'main_menu',
      priority: 4
    }
  },

  // Conversation flows
  flows: {
    welcome: {
      steps: [
        {
          step: 0,
          action: 'send_welcome',
          nextStep: 1,
          conditions: ['is_welcome_message']
        },
        {
          step: 1,
          action: 'ask_for_role',
          nextStep: 'end',
          conditions: []
        }
      ]
    },

    role_selection: {
      steps: [
        {
          step: 0,
          action: 'send_role_selection',
          nextStep: 1,
          conditions: []
        },
        {
          step: 1,
          action: 'process_role_selection',
          nextStep: 'end',
          conditions: ['is_valid_role']
        }
      ]
    },

    contribution: {
      steps: [
        {
          step: 0,
          action: 'ask_for_amount',
          nextStep: 1,
          conditions: []
        },
        {
          step: 1,
          action: 'validate_amount',
          nextStep: 2,
          conditions: ['is_valid_amount']
        },
        {
          step: 2,
          action: 'process_contribution',
          nextStep: 'end',
          conditions: ['user_has_groups']
        }
      ]
    }
  },

  // Validation rules
  validation: {
    amount: {
      min: 1000,
      max: 1000000,
      currency: 'TZS'
    },
    phone: {
      format: /^\+255\d{9}$/,
      country: 'Tanzania'
    },
    group: {
      maxMembers: 50,
      minContribution: 1000
    }
  },

  // Response patterns
  patterns: {
    amount: /(\d+(?:,\d+)*(?:\.\d+)?)/,
    phone: /(\+255\d{9})/,
    groupId: /([a-zA-Z0-9]{20,})/,
    memberNumber: /(\d{1,3})/
  },

  // Keywords for natural language processing
  keywords: {
    welcome: ['hi', 'hello', 'habari', 'mambo', 'jambo', 'karibu', 'welcome'],
    role: ['kiongozi', 'leader', 'mwanachama', 'member', 'role', 'nafasi'],
    group: ['kikundi', 'group', 'vikundi', 'groups'],
    money: ['pesa', 'money', 'cash', 'salio', 'balance', 'mchango', 'contribution'],
    help: ['msaada', 'help', 'aid', 'tusaidie', 'support'],
    status: ['status', 'hali', 'state', 'progress'],
    history: ['historia', 'history', 'miamala', 'transactions']
  },

  // Error messages
  errors: {
    invalidAmount: 'Kiasi si sahihi. Tafadhali andika kiasi sahihi. Mfano: "toa 50000"',
    noGroups: 'Huna vikundi bado. Unda kikundi au jiunge na kikundi cha mtu mwingine.',
    invalidRole: 'Tafadhali chagua "KIONGOZI" au "MWANACHAMA"',
    processingError: 'Samahani, kuna tatizo. Tafadhali jaribu tena baada ya muda au wasiliana na admin.',
    userNotFound: 'Samahani, haujasajiliwa. Tafadhali jisajili kwanza.',
    groupNotFound: 'Kikundi hakijapatikana. Tafadhali hakiki Group ID.',
    insufficientBalance: 'Salio yako haitoshi. Tafadhali weka pesa za kutosha.',
    rateLimitExceeded: 'Unaweka ujumbe wa kutosha. Tafadhali subiri kidogo.'
  },

  // Analytics events
  analytics: {
    events: {
      message_received: 'message_received',
      message_sent: 'message_sent',
      user_registered: 'user_registered',
      contribution_made: 'contribution_made',
      group_created: 'group_created',
      group_joined: 'group_joined',
      error_occurred: 'error_occurred'
    }
  }
};

module.exports = AUTOMATION_CONFIG;
