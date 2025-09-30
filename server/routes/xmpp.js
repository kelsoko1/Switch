const express = require('express');
const router = express.Router();
const xmppService = require('../services/xmpp.service');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// Connect to XMPP server
router.post('/connect', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'XMPP token is required' });
    }

    const xmppClient = await xmppService.connect(userId, token);
    
    res.status(200).json({ 
      success: true, 
      message: 'Connected to XMPP server',
      jid: xmppClient.jid.toString()
    });
  } catch (error) {
    logger.error('XMPP connection error:', error);
    next(error);
  }
});

// Send a message
router.post('/message', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: 'Recipient and message body are required' });
    }

    await xmppService.sendMessage(userId, to, body);
    
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    next(error);
  }
});

// Create a group chat
router.post('/groups', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { roomId, roomName } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const result = await xmppService.createRoom(roomId, userId, roomName || `Room-${roomId}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Group chat created successfully',
      roomJid: result.roomJid
    });
  } catch (error) {
    logger.error('Error creating group chat:', error);
    next(error);
  }
});

// Disconnect from XMPP server
router.post('/disconnect', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    await xmppService.disconnect(userId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Disconnected from XMPP server' 
    });
  } catch (error) {
    logger.error('Error disconnecting from XMPP:', error);
    next(error);
  }
});

module.exports = router;
