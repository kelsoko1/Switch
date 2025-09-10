const express = require('express');
const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { authenticateToken, requireAdmin } = require('../middleware/auth-mock');
const { whatsappBot } = require('../services/whatsapp-bot');

const router = express.Router();

// Get system statistics
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, groups, transactions] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GROUPS),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.TRANSACTIONS)
    ]);

    const statistics = {
      users: {
        total: users.documents.length,
        active: users.documents.filter(u => u.status === 'active').length,
        inactive: users.documents.filter(u => u.status !== 'active').length
      },
      groups: {
        total: groups.documents.length,
        active: groups.documents.filter(g => g.status === 'active').length,
        inactive: groups.documents.filter(g => g.status !== 'active').length
      },
      transactions: {
        total: transactions.documents.length,
        total_amount: transactions.documents.reduce((sum, t) => sum + (t.amount || 0), 0),
        pending_amount: transactions.documents.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0),
        completed_amount: transactions.documents.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0)
      }
    };

    res.json({
      success: true,
      data: { statistics }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
});

// Get recent admin activity
router.get('/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get recent users
    const recentUsers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [],
      5,
      0,
      'created_at',
      'DESC'
    );

    // Get recent groups
    const recentGroups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [],
      5,
      0,
      'created_at',
      'DESC'
    );

    // Get recent transactions
    const recentTransactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [],
      5,
      0,
      'created_at',
      'DESC'
    );

    const activities = [
      ...recentUsers.documents.map(user => ({
        id: user.$id,
        type: 'user_registration',
        description: 'New user registered',
        user: user.name,
        timestamp: user.created_at,
        status: 'completed'
      })),
      ...recentGroups.documents.map(group => ({
        id: group.$id,
        type: 'group_creation',
        description: 'New group created',
        user: group.name,
        timestamp: group.created_at,
        status: 'completed'
      })),
      ...recentTransactions.documents.map(transaction => ({
        id: transaction.$id,
        type: 'transaction',
        description: 'Payment processed',
        user: transaction.user_id,
        amount: transaction.amount,
        timestamp: transaction.created_at,
        status: transaction.status
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      data: { activities }
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message 
    });
  }
});

// Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [],
      limit,
      offset,
      'created_at',
      'DESC'
    );

    const usersWithoutPasswords = users.documents.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: {
        users: usersWithoutPasswords,
        total: users.total,
        page,
        limit,
        totalPages: Math.ceil(users.total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get users',
      error: error.message 
    });
  }
});

// Get all groups with pagination
router.get('/groups', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const groups = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [],
      limit,
      offset,
      'created_at',
      'DESC'
    );

    // Add member count to each group
    const groupsWithCounts = await Promise.all(groups.documents.map(async (group) => {
      const groupMembers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MEMBERS,
        [`group_id.equal("${group.$id}")`]
      );
      
      return {
        ...group,
        current_members: groupMembers.documents.length
      };
    }));

    res.json({
      success: true,
      data: {
        groups: groupsWithCounts,
        total: groups.total,
        page,
        limit,
        totalPages: Math.ceil(groups.total / limit)
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get groups',
      error: error.message 
    });
  }
});

// Update user status
router.patch('/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    const user = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      { status }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user status',
      error: error.message 
    });
  }
});

// Update group status
router.patch('/groups/:groupId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    const group = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId,
      { status }
    );

    res.json({
      success: true,
      message: 'Group status updated successfully',
      data: { group }
    });

  } catch (error) {
    console.error('Update group status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update group status',
      error: error.message 
    });
  }
});

// WhatsApp Admin Endpoints

// Get WhatsApp status and settings
router.get('/whatsapp/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = whatsappBot.getStatus();
    const settings = whatsappBot.getSettings();
    const stats = whatsappBot.getStats();

    res.json({
      success: true,
      data: {
        status,
        settings,
        stats
      }
    });
  } catch (error) {
    console.error('Get WhatsApp status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get WhatsApp status',
      error: error.message 
    });
  }
});

// Toggle WhatsApp bot
router.post('/whatsapp/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const result = await whatsappBot.toggleBot(enabled);
    
    res.json({
      success: result.success,
      message: result.success ? 'Bot toggled successfully' : 'Failed to toggle bot',
      data: result
    });
  } catch (error) {
    console.error('Toggle WhatsApp bot error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle bot',
      error: error.message 
    });
  }
});

// Update WhatsApp settings
router.post('/whatsapp/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    const result = await whatsappBot.updateSettings(settings);
    
    res.json({
      success: result.success,
      message: result.success ? 'Settings updated successfully' : 'Failed to update settings',
      data: result
    });
  } catch (error) {
    console.error('Update WhatsApp settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update settings',
      error: error.message 
    });
  }
});

// Send test message
router.post('/whatsapp/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await whatsappBot.sendTestMessage();
    
    res.json({
      success: result.success,
      message: result.success ? 'Test message sent successfully' : 'Failed to send test message',
      data: result
    });
  } catch (error) {
    console.error('Send test message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send test message',
      error: error.message 
    });
  }
});

module.exports = router;
