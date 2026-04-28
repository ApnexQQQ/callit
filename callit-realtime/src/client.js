/**
 * CallIt Real-time Client SDK
 * WebSocket client for browser/Node.js environments
 */

class CallItRealtimeClient {
  constructor(options = {}) {
    this.url = options.url || 'ws://localhost:3001';
    this.autoReconnect = options.autoReconnect !== false;
    this.reconnectDelay = options.reconnectDelay || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    
    this.socket = null;
    this.authenticated = false;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    
    // Event handlers
    this.handlers = {
      connect: [],
      disconnect: [],
      error: [],
      'auth:success': [],
      'feed:update': [],
      'feed:new_post': [],
      'comment:new': [],
      'comment:update': [],
      'comment:delete': [],
      'comment:reaction': [],
      'comments:typing': [],
      'notification:new': [],
      'notification:broadcast': [],
      'notification:read': [],
      'presence:update': [],
      'presence:list': []
    };
  }

  // ==================== CONNECTION ====================

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Use Socket.io client or native WebSocket
        if (typeof io !== 'undefined') {
          // Socket.io available
          this.socket = io(this.url);
        } else {
          // Native WebSocket fallback
          this.socket = new WebSocket(this.url);
          this._wrapNativeWebSocket();
        }

        this._setupEventHandlers();
        
        // Wait for connection
        const onConnect = () => {
          this._emit('connect');
          this._startHeartbeat();
          resolve();
        };

        const onError = (err) => {
          reject(err);
        };

        this.once('connect', onConnect);
        this.once('error', onError);

      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect() {
    this._stopReconnect();
    this._stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect?.() || this.socket.close();
      this.socket = null;
    }
    
    this.authenticated = false;
    this.userId = null;
  }

  // ==================== AUTHENTICATION ====================

  authenticate(userId, token, metadata = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.userId = userId;
      
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      this.once('auth:success', (data) => {
        clearTimeout(timeout);
        this.authenticated = true;
        resolve(data);
      });

      this.emit('auth', { userId, token, ...metadata });
    });
  }

  // ==================== PRESENCE ====================

  setStatus(status, metadata = {}) {
    if (!this.authenticated) return;
    this.emit('presence:status', { status, ...metadata });
  }

  getOnlineUsers() {
    return new Promise((resolve) => {
      this.once('presence:list', (data) => resolve(data));
      this.emit('presence:list');
    });
  }

  // ==================== FEED SUBSCRIPTIONS ====================

  subscribeToFeed(feedId) {
    return new Promise((resolve) => {
      this.once('feed:subscribed', () => resolve());
      this.emit('feed:subscribe', { feedId });
    });
  }

  unsubscribeFromFeed(feedId) {
    return new Promise((resolve) => {
      this.once('feed:unsubscribed', () => resolve());
      this.emit('feed:unsubscribe', { feedId });
    });
  }

  onFeedUpdate(callback) {
    this.on('feed:update', callback);
  }

  onNewPost(callback) {
    this.on('feed:new_post', callback);
  }

  // ==================== COMMENTS ====================

  joinComments(postId) {
    return new Promise((resolve) => {
      this.once('comments:joined', () => resolve());
      this.emit('comments:join', { postId });
    });
  }

  leaveComments(postId) {
    return new Promise((resolve) => {
      this.once('comments:left', () => resolve());
      this.emit('comments:leave', { postId });
    });
  }

  setTyping(postId, isTyping) {
    this.emit('comments:typing', { postId, isTyping });
  }

  onNewComment(callback) {
    this.on('comment:new', callback);
  }

  onCommentUpdate(callback) {
    this.on('comment:update', callback);
  }

  onCommentDelete(callback) {
    this.on('comment:delete', callback);
  }

  onCommentReaction(callback) {
    this.on('comment:reaction', callback);
  }

  onTypingIndicator(callback) {
    this.on('comments:typing', callback);
  }

  // ==================== NOTIFICATIONS ====================

  acknowledgeNotification(notificationId) {
    this.emit('notification:ack', { notificationId });
  }

  onNotification(callback) {
    this.on('notification:new', callback);
  }

  onBroadcast(callback) {
    this.on('notification:broadcast', callback);
  }

  // ==================== EVENT HANDLING ====================

  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.handlers[event]) return;
    const index = this.handlers[event].indexOf(handler);
    if (index > -1) {
      this.handlers[event].splice(index, 1);
    }
  }

  once(event, handler) {
    const onceHandler = (...args) => {
      this.off(event, onceHandler);
      handler(...args);
    };
    this.on(event, onceHandler);
  }

  emit(event, data) {
    if (this.socket) {
      if (this.socket.emit) {
        // Socket.io
        this.socket.emit(event, data);
      } else {
        // Native WebSocket
        this.socket.send(JSON.stringify({ event, data }));
      }
    }
  }

  _emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in handler for ${event}:`, err);
        }
      });
    }
  }

  // ==================== INTERNAL ====================

  _setupEventHandlers() {
    if (!this.socket) return;

    // Socket.io events
    if (this.socket.on) {
      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        this._emit('connect');
        this._startHeartbeat();
      });

      this.socket.on('disconnect', (reason) => {
        this.authenticated = false;
        this._stopHeartbeat();
        this._emit('disconnect', reason);
        
        if (this.autoReconnect) {
          this._scheduleReconnect();
        }
      });

      this.socket.on('error', (err) => {
        this._emit('error', err);
      });

      // Server events
      Object.keys(this.handlers).forEach(event => {
        if (!['connect', 'disconnect', 'error'].includes(event)) {
          this.socket.on(event, (data) => this._emit(event, data));
        }
      });
    }
  }

  _wrapNativeWebSocket() {
    // Wrap native WebSocket to behave like Socket.io
    const originalSend = this.socket.send.bind(this.socket);
    
    this.socket.emit = (event, data) => {
      originalSend(JSON.stringify({ event, data }));
    };

    this.socket.on = (event, handler) => {
      if (event === 'connect') {
        this.socket.addEventListener('open', handler);
      } else if (event === 'disconnect') {
        this.socket.addEventListener('close', handler);
      } else if (event === 'error') {
        this.socket.addEventListener('error', handler);
      } else {
        this.socket.addEventListener('message', (msg) => {
          try {
            const parsed = JSON.parse(msg.data);
            if (parsed.event === event) {
              handler(parsed.data);
            }
          } catch (err) {
            // Ignore non-JSON messages
          }
        });
      }
    };
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.emit('ping');
    }, 30000);
  }

  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, delay);
  }

  _stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ==================== UTILITIES ====================

  isConnected() {
    return this.socket && this.socket.connected;
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CallItRealtimeClient };
}

if (typeof window !== 'undefined') {
  window.CallItRealtimeClient = CallItRealtimeClient;
}