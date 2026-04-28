# CallIt Real-time 🚀

WebSocket infrastructure for the CallIt social app. Built with Socket.io for high-performance real-time communication.

## Features

### 1. Live Feed Updates 📰
- Subscribe/unsubscribe to feeds
- Real-time post updates
- Multi-feed support

### 2. Real-time Comments 💬
- Join/leave comment rooms per post
- Live comment updates, edits, deletes
- Typing indicators
- Reactions on comments

### 3. Live Notifications 🔔
- User-specific notifications
- Broadcast notifications
- Read receipts
- Multi-device sync

### 4. Presence Tracking 👥
- Online/offline status
- Custom status (online, away, busy, offline)
- Real-time presence updates
- Online user list

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Run test client
npm test
```

## API Endpoints

### WebSocket Events

#### Authentication
```javascript
// Client -> Server
socket.emit('auth', { userId, token, status })

// Server -> Client
socket.on('auth:success', (data) => {})
```

#### Feed Subscriptions
```javascript
// Subscribe to feed
socket.emit('feed:subscribe', { feedId })
socket.on('feed:subscribed', (data) => {})

// Unsubscribe from feed
socket.emit('feed:unsubscribe', { feedId })

// Receive updates
socket.on('feed:update', (data) => {})
socket.on('feed:new_post', (data) => {})
```

#### Comments
```javascript
// Join comment room
socket.emit('comments:join', { postId })
socket.on('comments:joined', (data) => {})

// Leave comment room
socket.emit('comments:leave', { postId })

// Typing indicator
socket.emit('comments:typing', { postId, isTyping })
socket.on('comments:typing', (data) => {})

// Receive comment events
socket.on('comment:new', (data) => {})
socket.on('comment:update', (data) => {})
socket.on('comment:delete', (data) => {})
socket.on('comment:reaction', (data) => {})
```

#### Notifications
```javascript
// Receive notifications
socket.on('notification:new', (data) => {})
socket.on('notification:broadcast', (data) => {})

// Acknowledge notification
socket.emit('notification:ack', { notificationId })
```

#### Presence
```javascript
// Update status
socket.emit('presence:status', { status, ...metadata })

// Get online users
socket.emit('presence:list')
socket.on('presence:list', (data) => {})

// Receive presence updates
socket.on('presence:update', (data) => {})
```

### REST API

#### Feed Operations
```bash
POST /api/feed/:feedId/update       # Trigger feed update
POST /api/feed/:feedId/post         # Publish new post
```

#### Comment Operations
```bash
POST   /api/posts/:postId/comment                    # Add comment
PUT    /api/posts/:postId/comments/:commentId        # Update comment
DELETE /api/posts/:postId/comments/:commentId        # Delete comment
POST   /api/posts/:postId/comments/:commentId/react  # Add reaction
```

#### Notifications
```bash
POST /api/notifications/send/:userId     # Send to user
POST /api/notifications/broadcast        # Broadcast to all
POST /api/notifications/send-multiple    # Send to multiple users
```

#### Presence
```bash
GET /api/presence/online      # List online users
GET /api/presence/:userId     # Check user status
```

#### Stats
```bash
GET /api/stats                # Server statistics
GET /health                   # Health check
```

## Client SDK

```javascript
// Include the client SDK
import { CallItRealtimeClient } from './src/client.js';

// Create client
const client = new CallItRealtimeClient({
  url: 'ws://localhost:3001',
  autoReconnect: true
});

// Connect and authenticate
await client.connect();
await client.authenticate('user-123', 'auth-token');

// Subscribe to feed
await client.subscribeToFeed('main-feed');
client.onNewPost((data) => {
  console.log('New post:', data.post);
});

// Join comments
await client.joinComments('post-456');
client.onNewComment((data) => {
  console.log('New comment:', data.text);
});

// Handle notifications
client.onNotification((data) => {
  console.log('Notification:', data.title);
});

// Update presence
client.setStatus('busy');
```

## Architecture

```
┌─────────────────┐
│   Web Clients   │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│   Socket.io     │
│    Server       │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Presence│ │  Feed  │
│Manager  │ │Manager │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│Comment │ │Notify  │
│Manager  │ │Manager │
└────────┘ └────────┘
```

## Environment Variables

```bash
PORT=3001                    # Server port
REDIS_URL=redis://localhost  # Redis URL (optional, for scaling)
```

## Scaling

For multi-server deployments, connect Redis:

```javascript
// Redis adapter automatically used if REDIS_URL is set
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

## Demo

Open `examples/demo.html` in a browser for an interactive demo.

## License

ISC