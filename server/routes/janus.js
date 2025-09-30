const express = require('express');
const router = express.Router();
const janusService = require('../services/janus.service');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create a new Janus session
router.post('/sessions', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const session = await janusService.createSession(userId);
    
    res.status(201).json({ 
      success: true, 
      sessionId: session.getId(),
      message: 'Janus session created successfully'
    });
  } catch (error) {
    logger.error('Error creating Janus session:', error);
    next(error);
  }
});

// Create a new video room
router.post('/rooms', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { roomId, options = {} } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const session = await janusService.createSession(userId);
    const result = await janusService.createRoom(session, roomId, options);
    
    res.status(201).json({ 
      success: true, 
      roomId: result.roomId,
      data: result.data,
      message: 'Video room created successfully'
    });
  } catch (error) {
    logger.error('Error creating video room:', error);
    next(error);
  }
});

// Join a video room
router.post('/rooms/:roomId/join', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { roomId } = req.params;
    const { publisher = false, displayName } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const session = await janusService.createSession(userId);
    const result = await janusService.joinRoom(
      session, 
      roomId, 
      userId, 
      { publisher, displayName: displayName || `User-${userId}` }
    );
    
    res.status(200).json({ 
      success: true, 
      roomId,
      data: result.data,
      message: 'Joined video room successfully'
    });
  } catch (error) {
    logger.error('Error joining video room:', error);
    next(error);
  }
});

// Publish a stream to a room
router.post('/rooms/:roomId/publish', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { roomId } = req.params;
    const { jsep, options = {} } = req.body;

    if (!jsep) {
      return res.status(400).json({ error: 'JSEP offer is required' });
    }

    const session = await janusService.createSession(userId);
    const result = await janusService.publish(
      session, 
      roomId, 
      userId, 
      jsep, 
      options
    );
    
    res.status(200).json({ 
      success: true, 
      roomId,
      data: result.data,
      message: 'Stream published successfully'
    });
  } catch (error) {
    logger.error('Error publishing stream:', error);
    next(error);
  }
});

// Get room participants
router.get('/rooms/:roomId/participants', authenticate, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const session = await janusService.createSession('admin');
    const plugin = await session.attach('janus.plugin.videoroom');
    
    const response = await new Promise((resolve, reject) => {
      plugin.send({
        message: { request: 'listparticipants', room: parseInt(roomId) },
        success: resolve,
        error: reject
      });
    });

    res.status(200).json({ 
      success: true, 
      roomId,
      participants: response.participants || [],
      count: response.participants ? response.participants.length : 0
    });
  } catch (error) {
    logger.error('Error getting room participants:', error);
    next(error);
  }
});

// Destroy a session
router.delete('/sessions/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.user;
    await janusService.destroySession(userId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Janus session destroyed successfully' 
    });
  } catch (error) {
    logger.error('Error destroying Janus session:', error);
    next(error);
  }
});

module.exports = router;
