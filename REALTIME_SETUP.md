# Real-Time Communication Setup Guide

This guide explains how to set up the real-time communication components for the Switch application, including ejabberd XMPP server and Janus WebRTC Gateway.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 16+ and npm 8+ installed
- Basic understanding of XMPP and WebRTC concepts

## Setting Up ejabberd XMPP Server

### Using Docker

1. Create a `docker-compose.yml` file with the following content:

```yaml
version: '3'

services:
  ejabberd:
    image: ejabberd/ecs
    ports:
      - "5222:5222"   # XMPP client connections
      - "5269:5269"   # XMPP server-to-server connections
      - "2026:2026"   # HTTP admin interface and WebSocket
      - "5443:5443"   # HTTPS admin interface
    volumes:
      - ./ejabberd/conf:/home/ejabberd/conf
      - ./ejabberd/database:/home/ejabberd/database
      - ./ejabberd/logs:/home/ejabberd/logs
    environment:
      - ERLANG_NODE=ejabberd@localhost
      - XMPP_DOMAIN=localhost
      - EJABBERD_ADMIN=admin@localhost
      - EJABBERD_ADMIN_PWD=admin_password
```

2. Create the ejabberd configuration directory:

```bash
mkdir -p ejabberd/conf
```

3. Create a basic ejabberd configuration file at `ejabberd/conf/ejabberd.yml`:

```yaml
###
###               ejabberd configuration file
###

### The parameters used in this configuration file are explained at
###
###       https://docs.ejabberd.im/admin/configuration

loglevel: 4

hosts:
  - localhost

certfiles:
  - /home/ejabberd/conf/server.pem

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
    port: 5269
    ip: "::"
    module: ejabberd_s2s_in
    max_stanza_size: 524288
  -
    port: 2026
    ip: "::"
    module: ejabberd_http
    request_handlers:
      "/api": mod_http_api
      "/bosh": mod_bosh
      "/ws": ejabberd_http_ws
    web_admin: true
    http_bind: true
    captcha: false

acl:
  admin:
    user:
      - "admin@localhost"
  local:
    user_regexp: ""

access_rules:
  local:
    allow: local
  c2s:
    allow: all
  announce:
    allow: admin
  configure:
    allow: admin
  muc_create:
    allow: local
  pubsub_createnode:
    allow: local
  trusted_network:
    allow: loopback

api_permissions:
  "console commands":
    from:
      - ejabberd_ctl
    who: all
    what: "*"
  "admin access":
    who:
      access:
        allow:
          acl: admin
      oauth:
        scope: "ejabberd:admin"
        access:
          allow:
            acl: admin
    what:
      - "*"
      - "!stop"
      - "!start"
  "public commands":
    who:
      ip: 127.0.0.1/8
    what:
      - status
      - connected_users_number

shaper:
  normal: 1000
  fast: 50000

shaper_rules:
  max_user_sessions: 10
  max_user_offline_messages:
    5000: admin
    100: all
  c2s_shaper:
    none: admin
    normal: all
  s2s_shaper: fast

modules:
  mod_adhoc: {}
  mod_admin_extra: {}
  mod_announce:
    access: announce
  mod_avatar: {}
  mod_blocking: {}
  mod_bosh: {}
  mod_caps: {}
  mod_carboncopy: {}
  mod_client_state: {}
  mod_configure: {}
  mod_disco: {}
  mod_fail2ban: {}
  mod_http_api: {}
  mod_last: {}
  mod_mam:
    ## Mnesia is limited to 2GB, better to use an SQL backend
    ## For small servers SQLite is a good fit and is very easy
    ## to configure. Uncomment this when you have SQL configured:
    ## db_type: sql
    assume_mam_usage: true
    default: always
  mod_muc:
    access:
      - allow
    access_admin:
      - allow: admin
    access_create: muc_create
    access_persistent: muc_create
    access_mam:
      - allow
    default_room_options:
      mam: true
  mod_muc_admin: {}
  mod_offline:
    access_max_user_messages: max_user_offline_messages
  mod_ping: {}
  mod_privacy: {}
  mod_private: {}
  mod_pubsub:
    access_createnode: pubsub_createnode
    plugins:
      - flat
      - pep
    force_node_config:
      ## Avoid buggy clients to make their bookmarks public
      storage:bookmarks:
        access_model: whitelist
  mod_push: {}
  mod_push_keepalive: {}
  mod_register:
    ## Only accept registration requests from the "trusted"
    ## network (see access_rules section above).
    ## Think twice before enabling registration from any
    ## address. See the Jabber SPAM Manifesto for details:
    ## https://github.com/ge0rg/jabber-spam-fighting-manifesto
    ip_access: trusted_network
  mod_roster:
    versioning: true
  mod_s2s_dialback: {}
  mod_shared_roster: {}
  mod_stream_mgmt:
    resend_on_timeout: if_offline
  mod_vcard: {}
  mod_vcard_xupdate: {}
  mod_version:
    show_os: false
```

4. Start the ejabberd server:

```bash
docker-compose up -d
```

5. Create a user for testing:

```bash
docker exec -it switch_ejabberd_1 ejabberdctl register testuser localhost password
```

### Configuration in the Switch App

Update your `.env.local` file with the following XMPP configuration:

```
# XMPP Configuration
VITE_XMPP_SERVER=ws://localhost:2026/ws
VITE_XMPP_DOMAIN=localhost
VITE_EJABBERD_WS_URL=ws://localhost:2026/ws
VITE_EJABBERD_DOMAIN=localhost
VITE_EJABBERD_API_URL=http://localhost:2026/api
```

## Setting Up Janus WebRTC Gateway

### Using Docker

1. Add Janus to your `docker-compose.yml` file:

```yaml
  janus:
    image: canyan/janus-gateway:latest
    ports:
      - "8088:8088"   # HTTP API
      - "8089:8089"   # HTTPS API
      - "8188:8188"   # WebSocket
      - "8989:8989"   # WebSocket Secure
      - "10000-10100:10000-10100/udp" # RTP/RTCP ports
    volumes:
      - ./janus/conf:/usr/local/etc/janus
```

2. Create the Janus configuration directory:

```bash
mkdir -p janus/conf
```

3. Start the Janus server:

```bash
docker-compose up -d
```

### Configuration in the Switch App

Update your `.env.local` file with the following Janus configuration:

```
# Janus WebRTC Configuration
VITE_USE_JANUS=true
VITE_JANUS_URL=ws://localhost:8188/janus
VITE_JANUS_JS_URL=https://janus.conf.meetecho.com/janus.js
```

## Testing the Setup

1. Run the update-env.js script to update your environment files:

```bash
node update-env.js
```

2. Start the application:

```bash
npm run dev
```

3. Open the application in your browser and navigate to the chat or streaming features to test the real-time communication.

## Troubleshooting

### XMPP Connection Issues

- Check if the ejabberd server is running: `docker ps | grep ejabberd`
- Check the ejabberd logs: `docker logs switch_ejabberd_1`
- Ensure the WebSocket endpoint is accessible: `curl -v http://localhost:2026/ws`

### Janus Connection Issues

- Check if the Janus server is running: `docker ps | grep janus`
- Check the Janus logs: `docker logs switch_janus_1`
- Test the Janus API: `curl -v http://localhost:8088/janus`

### Browser WebRTC Issues

- Open the browser console and check for WebRTC-related errors
- Ensure your browser supports WebRTC: visit `chrome://webrtc-internals/` in Chrome
- Check if your camera and microphone permissions are enabled

## Production Considerations

For production deployment, consider the following:

1. Use HTTPS for all connections
2. Set up proper authentication for ejabberd and Janus
3. Configure proper TURN servers for NAT traversal
4. Set up monitoring and logging
5. Implement rate limiting to prevent abuse
6. Use a reverse proxy like Nginx to handle SSL termination and load balancing
