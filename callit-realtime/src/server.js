const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Redis adapter for multi-server scaling (optional)
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

// In-memory stores (use Redis in production)
const presenceStore = new Map(); // userId -> { socketId, lastSeen, status }
const feedSubscriptions = new Map(); // socketId -> Set<feedId>
const userSockets = new Map(); // userId -> Set<socketId>

// ==================== PRESENCE TRACKING ====================

class PresenceManager {
  constructor() {
    this.onlineUsers = new Map();
  }

  setOnline(userId, socketId, metadata = {}) {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socketId);

    presenceStore.set(userId, {
      socketId,
      lastSeen: Date.now(),
      status: metadata.status || 'online',
      ...metadata
    });

    this.broadcastPresence(userId, 'online');
  }

  setOffline(userId, socketId) {
    if (userSockets.has(userId)) {
      userSockets.get(userId).delete(socketId);
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);
        presenceStore.delete(userId);
        this.broadcastPresence(userId, 'offline');
      }
    }
  }

  updateStatus(userId, status, metadata = {}) {
    if (presenceStore.has(userId)) {
      const current = presenceStore.get(userId);
      presenceStore.set(userId, {
        ...current,
        status,
        lastSeen: Date.now(),
        ...metadata
      });
      this.broadcastPresence(userId, status);
    }
  }

  broadcastPresence(userId, status) {
    io.emit('presence:update', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  getOnlineUsers() {
    return Array.from(presenceStore.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  isOnline(userId) {
    return presenceStore.has(userId);
  }
}

const presenceManager = new PresenceManager();

// ==================== FEED SYSTEM ====================

class FeedManager {
  constructor() {
    this.feeds = new Map(); // feedId -> Set<socketId>
  }

  subscribe(socket, feedId) {
    socket.join(`feed:${feedId}`);
    
    if (!feedSubscriptions.has(socket.id)) {
      feedSubscriptions.set(socket.id, new Set());
    }
    feedSubscriptions.get(socket.id).add(feedId);

    console.log(`Socket ${socket.id} subscribed to feed:${feedId}`);
  }

  unsubscribe(socket, feedId) {
    socket.leave(`feed:${feedId}`);
    
    if (feedSubscriptions.has(socket.id)) {
      feedSubscriptions.get(socket.id).delete(feedId);
    }

    console.log(`Socket ${socket.id} unsubscribed from feed:${feedId}`);
  }

  unsubscribeAll(socket) {
    if (feedSubscriptions.has(socket.id)) {
      feedSubscriptions.get(socket.id).forEach(feedId => {
        socket.leave(`feed:${feedId}`);
      });
      feedSubscriptions.delete(socket.id);
    }
  }

  publishUpdate(feedId, update) {
    const payload = {
      id: uuidv4(),
      feedId,
      ...update,
      timestamp: new Date().toISOString()
    };
    
    io.to(`feed:${feedId}`).emit('feed:update', payload);
    return payload;
  }

  publishNewPost(feedId, post) {
    const payload = {
      id: uuidv4(),
      feedId,
      type: 'new_post',
      post,
      timestamp: new Date().toISOString()
    };
    
    io.to(`feed:${feedId}`).emit('feed:new_post', payload);
    return payload;
  }
}

const feedManager = new FeedManager();

// ==================== COMMENT SYSTEM ====================

class CommentManager {
  constructor() {
    this.commentRooms = new Map(); // postId -> Set<socketId>
  }

  joinCommentRoom(socket, postId) {
    socket.join(`comments:${postId}`);
    console.log(`Socket ${socket.id} joined comments:${postId}`);
  }

  leaveCommentRoom(socket, postId) {
    socket.leave(`comments:${postId}`);
    console.log(`Socket ${socket.id} left comments:${postId}`);
  }

  publishComment(postId, comment) {
    const payload = {
      id: uuidv4(),
      postId,
      ...comment,
      timestamp: new Date().toISOString()
    };
    
    io.to(`comments:${postId}`).emit('comment:new', payload);
    return payload;
  }

  publishCommentUpdate(postId, commentId, update) {
    const payload = {
      commentId,
      postId,
      ...update,
      timestamp: new Date().toISOString()
    };
    
    io.to(`comments:${postId}`).emit('comment:update', payload);
    return payload;
  }

  publishCommentDelete(postId, commentId) {
    const payload = {
      commentId,
      postId,
      timestamp: new Date().toISOString()
    };
    
    io.to(`comments:${postId}`).emit('comment:delete', payload);
    return payload;
  }

  publishReaction(postId, commentId, reaction) {
    const payload = {
      id: uuidv4(),
      commentId,
      postId,
      ...reaction,
      timestamp: new Date().toISOString()
    };
    
    io.to(`comments:${postId}`).emit('comment:reaction', payload);
    return payload;
  }
}

const commentManager = new CommentManager();

// ==================== NOTIFICATION SYSTEM ====================

class NotificationManager {
  constructor() {
    this.userRooms = new Map(); // userId -> Set<socketId>
  }

  registerUser(socket, userId) {
    socket.join(`user:${userId}`);
    
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(socket.id);

    console.log(`Socket ${socket.id} registered for user:${userId}`);
  }

  unregisterUser(socket, userId) {
    socket.leave(`user:${userId}`);
    
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(socket.id);
      if (this.userRooms.get(userId).size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  sendToUser(userId, notification) {
    const payload = {
      id: uuidv4(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    io.to(`user:${userId}`).emit('notification:new', payload);
    return payload;
  }

  sendToUsers(userIds, notification) {
    const payload = {
      id: uuidv4(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('notification:new', payload);
    });
    
    return payload;
  }

  broadcast(notification) {
    const payload = {
      id: uuidv4(),
      ...notification,
      timestamp: new Date().toISOString()
    };
    
    io.emit('notification:broadcast', payload);
    return payload;
  }

  markAsRead(userId, notificationId) {
    io.to(`user:${userId}`).emit('notification:read', {
      notificationId,
      timestamp: new Date().toISOString()
    });
  }
}

const notificationManager = new NotificationManager();

// ==================== SOCKET.IO CONNECTION HANDLING ====================

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Authentication
  socket.on('auth', (data) => {
    const { userId, token, ...metadata } = data;
    
    // Store user data on socket
    socket.userId = userId;
    socket.authenticated = true;
    socket.authTime = Date.now();

    // Set presence
    presenceManager.setOnline(userId, socket.id, metadata);
    
    // Register for notifications
    notificationManager.registerUser(socket, userId);

    socket.emit('auth:success', {
      socketId: socket.id,
      onlineUsers: presenceManager.getOnlineUsers().length
    });

    console.log(`User ${userId} authenticated on socket ${socket.id}`);
  });

  // Presence updates
  socket.on('presence:status', (data) => {
    if (!socket.authenticated) return;
    
    const { status, ...metadata } = data;
    presenceManager.updateStatus(socket.userId, status, metadata);
  });

  // Feed subscriptions
  socket.on('feed:subscribe', (data) => {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }
    
    const { feedId } = data;
    feedManager.subscribe(socket, feedId);
    socket.emit('feed:subscribed', { feedId });
  });

  socket.on('feed:unsubscribe', (data) => {
    const { feedId } = data;
    feedManager.unsubscribe(socket, feedId);
    socket.emit('feed:unsubscribed', { feedId });
  });

  // Comment room management
  socket.on('comments:join', (data) => {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }
    
    const { postId } = data;
    commentManager.joinCommentRoom(socket, postId);
    socket.emit('comments:joined', { postId });
  });

  socket.on('comments:leave', (data) => {
    const { postId } = data;
    commentManager.leaveCommentRoom(socket, postId);
    socket.emit('comments:left', { postId });
  });

  // Typing indicators
  socket.on('comments:typing', (data) => {
    if (!socket.authenticated) return;
    
    const { postId, isTyping } = data;
    socket.to(`comments:${postId}`).emit('comments:typing', {
      postId,
      userId: socket.userId,
      isTyping
    });
  });

  // Notification acknowledgment
  socket.on('notification:ack', (data) => {
    if (!socket.authenticated) return;
    
    const { notificationId } = data;
    notificationManager.markAsRead(socket.userId, notificationId);
  });

  // Heartbeat/Ping
  socket.on('ping', () => {
    socket.emit('pong', {
      timestamp: Date.now(),
      connections: io.engine.clientsCount
    });
  });

  // Get online users
  socket.on('presence:list', () => {
    socket.emit('presence:list', {
      users: presenceManager.getOnlineUsers(),
      count: presenceManager.getOnlineUsers().length
    });
  });

  // Disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

    if (socket.userId) {
      presenceManager.setOffline(socket.userId, socket.id);
      notificationManager.unregisterUser(socket, socket.userId);
    }

    feedManager.unsubscribeAll(socket);
  });
});

// ==================== REST API ENDPOINTS ====================

// Trigger feed update (called by backend services)
app.post('/api/feed/:feedId/update', (req, res) => {
  const { feedId } = req.params;
  const update = req.body;
  
  const payload = feedManager.publishUpdate(feedId, update);
  res.json({ success: true, payload });
});

app.post('/api/feed/:feedId/post', (req, res) => {
  const { feedId } = req.params;
  const post = req.body;
  
  const payload = feedManager.publishNewPost(feedId, post);
  res.json({ success: true, payload });
});

// Comment operations
app.post('/api/posts/:postId/comment', (req, res) => {
  const { postId } = req.params;
  const comment = req.body;
  
  const payload = commentManager.publishComment(postId, comment);
  res.json({ success: true, payload });
});

app.put('/api/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  const update = req.body;
  
  const payload = commentManager.publishCommentUpdate(postId, commentId, update);
  res.json({ success: true, payload });
});

app.delete('/api/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  
  const payload = commentManager.publishCommentDelete(postId, commentId);
  res.json({ success: true, payload });
});

app.post('/api/posts/:postId/comments/:commentId/react', (req, res) => {
  const { postId, commentId } = req.params;
  const reaction = req.body;
  
  const payload = commentManager.publishReaction(postId, commentId, reaction);
  res.json({ success: true, payload });
});

// Notifications
app.post('/api/notifications/send/:userId', (req, res) => {
  const { userId } = req.params;
  const notification = req.body;
  
  const payload = notificationManager.sendToUser(userId, notification);
  res.json({ success: true, payload });
});

app.post('/api/notifications/broadcast', (req, res) => {
  const notification = req.body;
  
  const payload = notificationManager.broadcast(notification);
  res.json({ success: true, payload });
});

app.post('/api/notifications/send-multiple', (req, res) => {
  const { userIds, ...notification } = req.body;
  
  const payload = notificationManager.sendToUsers(userIds, notification);
  res.json({ success: true, payload });
});

// Presence API
app.get('/api/presence/online', (req, res) => {
  res.json({
    users: presenceManager.getOnlineUsers(),
    count: presenceManager.getOnlineUsers().length
  });
});

app.get('/api/presence/:userId', (req, res) => {
  const { userId } = req.params;
  const isOnline = presenceManager.isOnline(userId);
  
  res.json({
    userId,
    online: isOnline,
    ...(isOnline && presenceStore.has(userId) ? presenceStore.get(userId) : {})
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    connections: io.engine.clientsCount,
    onlineUsers: presenceManager.getOnlineUsers().length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Try to connect to Redis for adapter (optional)
    try {
      await pubClient.connect();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Redis adapter connected');
    } catch (err) {
      console.log('Redis not available, running without adapter (single server mode)');
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 WebSocket server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 Presence API: http://localhost:${PORT}/api/presence/online`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { io, httpServer, app };