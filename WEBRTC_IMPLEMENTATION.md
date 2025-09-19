# WebRTC Streaming Implementation

This project now includes WebRTC streaming functionality. Due to the complexity of setting up Janus WebRTC Gateway, I've implemented a simpler WebRTC solution that provides basic streaming capabilities.

## Current Implementation

### Simple WebRTC Manager (`src/lib/webrtc-simple.ts`)

The current implementation provides:

- **Basic WebRTC streaming** using native browser APIs
- **Camera and microphone access** with configurable settings
- **Peer connection management** with ICE servers
- **Data channel support** for future signaling implementation
- **Error handling** and connection state management

### Features

✅ **Working Features:**
- Camera and microphone access
- Video preview in streaming components
- Basic WebRTC peer connection setup
- Stream management (start/stop)
- Error handling and logging

⚠️ **Limitations:**
- No signaling server (streams are local only)
- No multi-viewer support yet
- No room management
- No recording capabilities

## Usage

### Testing the Implementation

1. **Navigate to** `http://localhost:5173/test/janus` (after logging in)
2. **Click "Start Stream"** to test camera/microphone access
3. **Check the logs** for connection status
4. **Use the streaming features** in the main app

### In Your App

The streaming components (`CreateStream.tsx` and `StreamView.tsx`) now use the simple WebRTC implementation:

```typescript
import { createSimpleWebRTCManager } from '../../lib/webrtc-simple';

// Create a stream manager
const manager = createSimpleWebRTCManager(streamId, isStreamer);

// Initialize and start streaming
await manager.initialize();
const stream = await manager.startStream();
```

## Next Steps for Full Janus Integration

To implement full Janus WebRTC Gateway support:

### 1. Set Up Janus Server

```bash
# Using Docker (recommended)
docker run -d --name janus \
  -p 8188:8188 \
  -p 8088:8088 \
  -p 8089:8089 \
  -p 10000-10200:10000-10200/udp \
  canyanio/janus-gateway:latest
```

### 2. Install Correct Janus Package

```bash
npm install janus-gateway-js
```

### 3. Update Imports

Replace the simple WebRTC implementation with the Janus implementation:

```typescript
// Replace this:
import { createSimpleWebRTCManager } from '../../lib/webrtc-simple';

// With this:
import { createJanusStreamManager } from '../../lib/janus';
```

### 4. Configure Janus Server

Update `src/lib/janus-config.ts` with your Janus server URL:

```typescript
export const JANUS_CONFIG = {
  serverUrl: 'ws://localhost:8188', // Your Janus server
  // ... other config
};
```

## Benefits of Janus WebRTC

When fully implemented, Janus will provide:

- **Multi-viewer support** - Multiple people can watch streams
- **Room management** - Organized streaming rooms
- **Recording capabilities** - Record streams for later viewing
- **Better scalability** - Handle more concurrent users
- **Advanced features** - Screen sharing, moderation tools, etc.

## Current Status

The project is now running with basic WebRTC streaming. The streaming components work for local preview and testing. To enable multi-viewer streaming and advanced features, you'll need to set up a Janus WebRTC Gateway server.

## Troubleshooting

### Common Issues

1. **Camera/Microphone Access Denied**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try refreshing the page

2. **No Video Preview**
   - Check browser console for errors
   - Verify camera is not being used by another app
   - Try different browser

3. **Connection Errors**
   - Check network connectivity
   - Verify ICE servers are accessible
   - Check browser WebRTC support

### Browser Compatibility

WebRTC works with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development Notes

The current implementation is designed to be easily replaceable with Janus WebRTC Gateway. The interface is similar, so switching should be straightforward once Janus is properly set up.

For production use, consider:
- Setting up a proper signaling server
- Implementing room management
- Adding user authentication for streams
- Implementing stream recording
- Adding moderation tools
