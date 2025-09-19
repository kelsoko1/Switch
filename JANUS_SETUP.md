# Janus WebRTC Setup Guide

This project now uses Janus WebRTC Gateway for streaming functionality instead of SimplePeer. Janus provides a more robust and scalable solution for WebRTC streaming.

## What is Janus WebRTC?

Janus is a general purpose WebRTC server that provides a gateway between browsers and other applications. It's particularly useful for:

- Video conferencing
- Live streaming
- Screen sharing
- Recording
- Broadcasting to multiple viewers

## Setup Options

### Option 1: Use Public Test Server (Easiest)

The application is configured to use a public test server by default. No setup required - it should work out of the box.

### Option 2: Run Your Own Janus Server

For production use or better control, you can run your own Janus server.

#### Using Docker (Recommended)

1. Install Docker and Docker Compose
2. Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  janus:
    image: canyanio/janus-gateway:latest
    ports:
      - "8188:8188"
      - "8088:8088"
      - "8089:8089"
      - "7889:7889"
      - "10000-10200:10000-10200/udp"
    environment:
      - JANUS_HOST=0.0.0.0
      - JANUS_WS=1
      - JANUS_WS_PORT=8188
      - JANUS_WS_SECURE=0
    volumes:
      - ./janus.plugin.videoroom.jcfg:/opt/janus/etc/janus/janus.plugin.videoroom.jcfg
    command: ["/opt/janus/bin/janus", "--configs-folder=/opt/janus/etc/janus"]
```

3. Run with: `docker-compose up -d`

#### Manual Installation

1. Install dependencies:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libmicrohttpd-dev libjansson-dev libssl-dev libsrtp2-dev libsofia-sip-ua-dev libglib2.0-dev libopus-dev libogg-dev libcurl4-openssl-dev liblua5.3-dev libconfig-dev pkg-config gengetopt libtool automake

# CentOS/RHEL
sudo yum install libmicrohttpd-devel jansson-devel openssl-devel libsrtp2-devel sofia-sip-devel glib2-devel opus-devel libogg-devel libcurl-devel lua-devel libconfig-devel pkgconfig gengetopt libtool automake
```

2. Clone and build Janus:
```bash
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway
sh autogen.sh
./configure --prefix=/opt/janus --enable-websockets --enable-post-processing
make
sudo make install
```

3. Configure and run:
```bash
sudo /opt/janus/bin/janus --configs-folder=/opt/janus/etc/janus
```

## Configuration

The Janus configuration is managed in `src/lib/janus-config.ts`. You can modify:

- Server URL
- Video/audio settings
- Codec preferences
- ICE servers
- Debug levels

### Environment Variables

Set these environment variables for production:

```bash
REACT_APP_JANUS_URL=wss://your-janus-server.com/ws
```

## Features

### Current Implementation

- **Video Streaming**: High-quality video streaming with configurable resolution and bitrate
- **Audio Streaming**: Clear audio with noise suppression and echo cancellation
- **Room Management**: Automatic room creation and joining
- **Multiple Viewers**: Support for multiple viewers per stream
- **Error Handling**: Robust error handling and reconnection logic

### Planned Features

- **Recording**: Stream recording capabilities
- **Screen Sharing**: Screen sharing functionality
- **Chat Integration**: Real-time chat during streams
- **Moderation Tools**: Stream moderation features
- **Analytics**: Stream analytics and metrics

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if the Janus server is running and accessible
2. **No Video**: Ensure camera permissions are granted
3. **No Audio**: Check microphone permissions and audio settings
4. **Poor Quality**: Adjust bitrate and resolution settings in config

### Debug Mode

Enable debug mode by setting `debug.level: 'all'` in the Janus configuration.

### Browser Compatibility

Janus WebRTC works with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Migration from SimplePeer

The migration from SimplePeer to Janus provides:

- Better scalability (supports more concurrent users)
- More reliable connections
- Better error handling
- Built-in room management
- Support for recording and broadcasting
- Better mobile device support

## Resources

- [Janus WebRTC Gateway Documentation](https://janus.conf.meetecho.com/docs/)
- [Janus GitHub Repository](https://github.com/meetecho/janus-gateway)
- [WebRTC Standards](https://webrtc.org/)
