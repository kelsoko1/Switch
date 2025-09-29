# ejabberd XMPP Setup Guide

This project now includes ejabberd XMPP integration for messaging functionality. ejabberd is a robust, scalable XMPP server that provides real-time messaging capabilities.

## What is ejabberd?

ejabberd is an open-source XMPP server written in Erlang. It provides:

- **Real-time messaging** - Instant messaging between users
- **Group chats** - Multi-user chat rooms
- **Presence** - Online/offline status
- **File sharing** - Send files and media
- **Mobile support** - Works with mobile XMPP clients
- **Scalability** - Handles thousands of concurrent users
- **Security** - TLS encryption and authentication

## Setup Options

### Option 1: Use Simple XMPP Implementation (Current)

The application currently uses a simple XMPP implementation that works without a server. This provides basic messaging functionality for testing and development.

**Features:**
- ✅ Basic messaging simulation
- ✅ Mock contacts and presence
- ✅ Group chat simulation
- ✅ No server setup required

**Limitations:**
- ❌ No real-time messaging between users
- ❌ No persistent message storage
- ❌ No actual XMPP protocol

### Option 2: Run Your Own ejabberd Server

For production use or real-time messaging, you can run your own ejabberd server.

#### Using Docker (Recommended)

1. **Create a docker-compose.yml file:**

```yaml
version: '3.8'
services:
  ejabberd:
    image: ejabberd/ecs:latest
    container_name: ejabberd
    ports:
      - "5222:5222"   # XMPP client port
      - "2026:2026"   # HTTP/WebSocket port
      - "5281:5281"   # HTTPS port
      - "5443:5443"   # XMPP over TLS
    environment:
      - EJABBERD_ADMIN=admin@localhost
      - EJABBERD_ADMINPASS=admin123
      - EJABBERD_DBMS=sqlite
      - EJABBERD_HOSTS=localhost
      - EJABBERD_LOGLEVEL=4
    volumes:
      - ejabberd_data:/opt/ejabberd/database
      - ./ejabberd.yml:/opt/ejabberd/conf/ejabberd.yml
    command: ["ejabberdctl", "foreground"]

volumes:
  ejabberd_data:
```

2. **Create ejabberd.yml configuration:**

```yaml
hosts:
  - localhost

loglevel: 4
log_rotate_size: 10485760
log_rotate_count: 1

certfiles:
  - /opt/ejabberd/conf/server.pem

ca_file: /opt/ejabberd/conf/cacert.pem

listen:
  -
    port: 5222
    ip: "::"
    module: ejabberd_c2s
    max_stanza_size: 262144
    shaper: c2s_shaper
    access: c2s
    starttls_required: false
  -
    port: 2026
    ip: "::"
    module: ejabberd_http
    request_handlers:
      /ws: ejabberd_http_ws
      /bosh: mod_bosh
      /api: mod_http_api
  -
    port: 5443
    ip: "::"
    module: ejabberd_c2s
    max_stanza_size: 262144
    shaper: c2s_shaper
    access: c2s
    tls: true

auth_method: sql

sql_type: sqlite
sql_server: "localhost"
sql_database: "/opt/ejabberd/database/ejabberd.db"
sql_username: "ejabberd"
sql_password: ""

modules:
  mod_roster: {}
  mod_shared_roster: {}
  mod_private: {}
  mod_disco: {}
  mod_caps: {}
  mod_muc:
    host: "conference.@HOST@"
    access: muc
    access_create: muc_admin
    access_persistent: muc_admin
    access_admin: muc_admin
  mod_http_upload:
    put_url: "https://@HOST@:5443/upload"
  mod_http_api: {}
  mod_admin_extra: {}
  mod_announce: {}
  mod_avatar: {}
  mod_blocking: {}
  mod_bosh: {}
  mod_carboncopy: {}
  mod_client_state: {}
  mod_configure: {}
  mod_disco: {}
  mod_fail2ban: {}
  mod_http_upload: {}
  mod_last: {}
  mod_mam:
    default: always
  mod_mqtt: {}
  mod_muc: {}
  mod_offline:
    access_max_user_messages: max_user_offline_messages
  mod_ping: {}
  mod_privacy: {}
  mod_private: {}
  mod_proxy65: {}
  mod_pubsub:
    access_createnode: pubsub_createnode
    plugins:
      - flat
      - pep
      - pep_muc#lightweight
  mod_push: {}
  mod_push_keepalive: {}
  mod_register:
    welcome_message:
      subject: "Welcome!"
      body: "Hi.\n\nWelcome to this XMPP server.\n\n"
    captcha_protected: false
    password_strength: 32
  mod_roster: {}
  mod_s2s_dialback: {}
  mod_shared_roster: {}
  mod_stream_mgmt:
    resend_on_timeout: if_offline
  mod_vcard: {}
  mod_vcard_xupdate: {}
  mod_version: {}
  mod_websockets: {}

access_rules:
  local:
    - allow: local
  c2s:
    - deny: blocked
    - allow
  c2s_shaper:
    - none
  muc_admin:
    - allow: admin
  muc:
    - allow
  pubsub_createnode:
    - allow: local
  max_user_sessions:
    - 10
  max_user_offline_messages:
    - 5000

shaper_rules:
  c2s_shaper:
    - 1000: 1000000
  s2s_shaper:
    - 1000: 1000000

acl:
  admin:
    user:
      - admin@localhost
  local:
    user_regexp: ""
  loopback:
    ip:
      - 127.0.0.0/8
      - ::1/128
      - ::FFFF:127.0.0.1/128
```

3. **Run with Docker Compose:**

```bash
docker-compose up -d
```

#### Manual Installation

1. **Install ejabberd:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ejabberd

# CentOS/RHEL
sudo yum install ejabberd

# macOS
brew install ejabberd
```

2. **Configure ejabberd:**

Edit `/etc/ejabberd/ejabberd.yml` and add your domain:

```yaml
hosts:
  - localhost
  - your-domain.com
```

3. **Start ejabberd:**

```bash
sudo systemctl start ejabberd
sudo systemctl enable ejabberd
```

4. **Create admin user:**

```bash
sudo ejabberdctl register admin localhost admin123
```

## Configuration

The ejabberd configuration is managed in `src/lib/ejabberd-config.ts`. You can modify:

- Server host and port
- Domain settings
- Security settings
- Room configuration
- Database settings

### Environment Variables

Set these environment variables for production:

```bash
REACT_APP_EJABBERD_HOST=your-domain.com
REACT_APP_EJABBERD_PORT=2026
REACT_APP_EJABBERD_DOMAIN=your-domain.com
```

## Features

### Current Implementation

- **Simple XMPP Simulation**: Mock messaging for development
- **Message History**: Local message storage
- **Contact Management**: Mock contact list
- **Group Chat Simulation**: Mock group messaging
- **Presence Simulation**: Mock online/offline status

### With ejabberd Server

- **Real-time Messaging**: Instant message delivery
- **Group Chats**: Multi-user chat rooms
- **File Sharing**: Send files and media
- **Presence**: Real online/offline status
- **Message History**: Persistent message storage
- **Mobile Support**: Works with XMPP mobile apps
- **Security**: TLS encryption and authentication

## Testing

### Test the Simple Implementation

1. **Navigate to** `http://localhost:5173/test/xmpp` (after logging in)
2. **Enter credentials** (any username/password works)
3. **Click "Connect"** to test the mock connection
4. **Send messages** to test the messaging functionality
5. **Try group messaging** with room JIDs

### Test with ejabberd Server

1. **Set up ejabberd server** using Docker or manual installation
2. **Update configuration** in `ejabberd-config.ts`
3. **Switch to real XMPP implementation** in the code
4. **Test real-time messaging** between users

## Migration from Simple to Real XMPP

To switch from the simple implementation to real ejabberd:

### 1. Update Imports

```typescript
// Replace this:
import { createSimpleXMPPManager } from '../lib/xmpp-simple';

// With this:
import { createXMPPManager } from '../lib/xmpp-manager';
```

### 2. Update Configuration

```typescript
// Update server settings
const config = {
  server: 'ws://localhost:2026/ws',
  domain: 'localhost',
  username: 'your-username',
  password: 'your-password',
};
```

### 3. Handle Real Connections

```typescript
// Add error handling for real connections
try {
  await xmppManager.connect();
} catch (error) {
  console.error('Connection failed:', error);
  // Handle connection errors
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if ejabberd server is running
   - Verify server URL and port
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password
   - Check if user exists in ejabberd
   - Verify domain configuration

3. **Messages Not Delivered**
   - Check network connectivity
   - Verify recipient JID format
   - Check ejabberd logs

4. **Group Chat Issues**
   - Verify room JID format
   - Check room permissions
   - Ensure user is joined to room

### Debug Mode

Enable debug mode by setting `debug: true` in the XMPP configuration.

### Browser Compatibility

XMPP WebSocket works with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Resources

- [ejabberd Documentation](https://docs.ejabberd.im/)
- [ejabberd GitHub Repository](https://github.com/processone/ejabberd)
- [XMPP Standards](https://xmpp.org/)
- [XMPP Client Libraries](https://xmpp.org/software/libraries/)

## Next Steps

1. **Set up ejabberd server** for production use
2. **Configure SSL/TLS** for secure connections
3. **Set up user management** and authentication
4. **Implement file sharing** capabilities
5. **Add mobile app support** with XMPP clients
6. **Set up monitoring** and logging
7. **Configure clustering** for high availability
