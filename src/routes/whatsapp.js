const express = require('express');
const { body, validationResult } = require('express-validator');
const { whatsappBot } = require('../services/whatsapp-bot');
const { authenticateToken, requireAdmin } = require('../middleware/auth-mock');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Phone number validation
const validatePhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Check if it's a valid format (10-15 digits)
  return /^\d{10,15}$/.test(cleaned);
};

// WhatsApp webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook with the bot
    const result = await whatsappBot.processWebhook(req.body);
    
    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Webhook processing failed',
      error: error.message 
    });
  }
});

// WhatsApp bot status and statistics
router.get('/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = whatsappBot.getStatus();
    const settings = whatsappBot.getSettings();
    const stats = whatsappBot.getStats();
    const instanceInfo = await whatsappBot.getInstanceInfo();

    res.json({
      success: true,
      data: {
        status,
        settings,
        stats,
        instanceInfo
      }
    });
  } catch (error) {
    console.error('WhatsApp status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get WhatsApp status',
      error: error.message 
    });
  }
});

// Get WhatsApp statistics
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = whatsappBot.getStats();
    const queueStatus = whatsappBot.getQueueStatus();
    const recentMessages = await whatsappBot.getRecentMessages(10);

    res.json({
      success: true,
      data: {
        stats,
        queueStatus,
        recentMessages
      }
    });
  } catch (error) {
    console.error('WhatsApp statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get WhatsApp statistics',
      error: error.message 
    });
  }
});

// Get message queue status
router.get('/queue-status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const queueStatus = whatsappBot.getQueueStatus();
    const queue = whatsappBot.getMessageQueue();

    res.json({
      success: true,
      data: {
        queueStatus,
        queue
      }
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get queue status',
      error: error.message 
    });
  }
});

// Clear message queue
router.post('/clear-queue', authenticateToken, requireAdmin, (req, res) => {
  try {
    const result = whatsappBot.clearQueue();

    res.json({
      success: true,
      message: 'Message queue cleared successfully',
      data: result
    });
  } catch (error) {
    console.error('Clear queue error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to clear queue',
      error: error.message 
    });
  }
});

// Test WhatsApp connection
router.post('/test-connection', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await whatsappBot.testConnection();

    res.json({
      success: result.success,
      message: result.success ? 'Connection test successful' : 'Connection test failed',
      data: result
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Connection test failed',
      error: error.message 
    });
  }
});

// Get instance information
router.get('/instance-info', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const instanceInfo = await whatsappBot.getInstanceInfo();

    res.json({
      success: true,
      data: instanceInfo
    });
  } catch (error) {
    console.error('Get instance info error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get instance information',
      error: error.message 
    });
  }
});

// Send WhatsApp message (admin only)
router.post('/send', authenticateToken, requireAdmin, [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, message, options = {} } = req.body;
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please use a valid phone number.'
      });
    }
    
    const result = await whatsappBot.sendMessage(phoneNumber, message, options);
    
    res.json({
      success: result.success,
      message: result.success ? 'Message sent successfully' : 'Failed to send message',
      data: result
    });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message',
      error: error.message 
    });
  }
});

// Send bulk WhatsApp messages (admin only)
router.post('/send-bulk', authenticateToken, requireAdmin, [
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('message').notEmpty().withMessage('Message is required')
], validateRequest, async (req, res) => {
  try {
    const { recipients, message, options = {} } = req.body;
    
    // Validate recipients
    const validRecipients = recipients.filter(recipient => 
      recipient.phoneNumber && validatePhoneNumber(recipient.phoneNumber)
    );
    
    if (validRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid phone numbers found in recipients list'
      });
    }
    
    const result = await whatsappBot.sendBulkMessages(validRecipients, message, options);
    
    res.json({
      success: true,
      message: `Bulk message processing initiated for ${validRecipients.length} recipients`,
      data: result
    });
  } catch (error) {
    console.error('Send bulk WhatsApp message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send bulk messages',
      error: error.message 
    });
  }
});

// Send media message (admin only)
router.post('/send-media', authenticateToken, requireAdmin, [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('mediaUrl').notEmpty().withMessage('Media URL is required'),
  body('caption').optional()
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, mediaUrl, caption, mediaType = 'image' } = req.body;
    
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    const result = await whatsappBot.sendMediaMessage(phoneNumber, mediaUrl, caption, { mediaType });
    
    res.json({
      success: result.success,
      message: result.success ? 'Media message sent successfully' : 'Failed to send media message',
      data: result
    });
  } catch (error) {
    console.error('Send media message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send media message',
      error: error.message 
    });
  }
});

// Send WhatsApp group message (admin only)
router.post('/send-group', authenticateToken, requireAdmin, [
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('message').notEmpty().withMessage('Message is required')
], validateRequest, async (req, res) => {
  try {
    const { groupId, message } = req.body;
    
    const result = await whatsappBot.sendGroupMessage(groupId, message);
    
    res.json({
      success: result.success,
      message: result.success ? 'Group message sent successfully' : 'Failed to send group message',
      data: result
    });
  } catch (error) {
    console.error('Send WhatsApp group message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send group message',
      error: error.message 
    });
  }
});

// Get message queue (admin only)
router.get('/queue', authenticateToken, requireAdmin, (req, res) => {
  try {
    const queue = whatsappBot.getMessageQueue();

    res.json({
      success: true,
      data: { queue }
    });
  } catch (error) {
    console.error('Get message queue error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get message queue',
      error: error.message 
    });
  }
});

// Send interactive message (buttons or list)
router.post('/send-interactive', authenticateToken, requireAdmin, [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('messageType').isIn(['buttons', 'list']).withMessage('Message type must be buttons or list')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, message, messageType, buttons, sections } = req.body;
    
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    let result;
    if (messageType === 'buttons' && buttons) {
      result = await whatsappBot.sendInteractiveButtons(phoneNumber, message, buttons);
    } else if (messageType === 'list' && sections) {
      result = await whatsappBot.sendListMessage(phoneNumber, message, sections);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid interactive message format'
      });
    }
    
    res.json({
      success: result.success,
      message: result.success ? 'Interactive message sent successfully' : 'Failed to send interactive message',
      data: result
    });
  } catch (error) {
    console.error('Send interactive message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send interactive message',
      error: error.message 
    });
  }
});

// Get chat history for a specific phone number
router.get('/chat-history/:phoneNumber', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    const messages = await whatsappBot.getChatHistory(phoneNumber);
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get chat history',
      error: error.message 
    });
  }
});

// Update webhook configuration
router.post('/webhook-config', authenticateToken, requireAdmin, [
  body('webhookUrl').isURL().withMessage('Valid webhook URL is required')
], validateRequest, async (req, res) => {
  try {
    const { webhookUrl, webhookToken } = req.body;
    
    const result = await whatsappBot.updateWebhookConfig(webhookUrl, webhookToken);
    
    res.json({
      success: result.success,
      message: result.success ? 'Webhook configuration updated successfully' : 'Failed to update webhook',
      data: result
    });
  } catch (error) {
    console.error('Update webhook config error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update webhook configuration',
      error: error.message 
    });
  }
});

// Test bot command
router.post('/test-command', authenticateToken, requireAdmin, [
  body('command').notEmpty().withMessage('Command is required')
], validateRequest, async (req, res) => {
  try {
    const { command } = req.body;
    
    const result = await whatsappBot.testCommand(command);
    
    res.json({
      success: result.success,
      message: result.success ? 'Command test successful' : 'Command test failed',
      data: result
    });
  } catch (error) {
    console.error('Test command error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to test command',
      error: error.message 
    });
  }
});

// Mark message as read
router.post('/mark-read', authenticateToken, requireAdmin, [
  body('messageId').notEmpty().withMessage('Message ID is required')
], validateRequest, async (req, res) => {
  try {
    const { messageId } = req.body;
    
    const result = await whatsappBot.markMessageAsRead(messageId);
    
    res.json({
      success: result.success,
      message: result.success ? 'Message marked as read' : 'Failed to mark message as read',
      data: result
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark message as read',
      error: error.message 
    });
  }
});

module.exports = router;
