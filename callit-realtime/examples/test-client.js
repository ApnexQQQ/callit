/**
 * Node.js test client for CallIt Real-time
 * Run with: node examples/test-client.js
 */

const io = require('socket.io-client');

class TestClient {
  constructor(userId, serverUrl = 'http://localhost:3001') {
    this.userId = userId;
    this.serverUrl = serverUrl;
    this.socket = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);

      this.socket.on('connect', () => {
        console.log(`[${this.userId}] Connected`);
        
        // Authenticate
        this.socket.emit('auth', { 
          userId: this.userId, 
          token: 'test-token',
          status: 'online'
        });
      });

      this.socket.on('auth:success', (data) => {
        console.log(`[${this.userId}] Authenticated, socket: ${data.socketId}`);
        resolve(data);
      });

      this.socket.on('error', (err) => {
        console.error(`[${this.userId}] Error:`, err);
        reject(err);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`[${this.userId}] Disconnected: ${reason}`);
      });

      // Event handlers
      this.socket.on('feed:update', (data) => {
        console.log(`[${this.userId}] Feed update:`, data.type || 'update');
      });

      this.socket.on('feed:new_post', (data) => {
        console.log(`[${this.userId}] New post:`, data.post?.title);
      });

      this.socket.on('comment:new', (data) => {
        console.log(`[${this.userId}] New comment:`, data.text?.substring(0, 50));
      });

      this.socket.on('notification:new', (data) => {
        console.log(`[${this.userId}] Notification:`, data.title);
      });

      this.socket.on('presence:update', (data) => {
        console.log(`[${this.userId}] Presence: ${data.userId} is ${data.status}`);
      });
    });
  }

  subscribeToFeed(feedId) {
    this.socket.emit('feed:subscribe', { feedId });
    console.log(`[${this.userId}] Subscribed to feed: ${feedId}`);
  }

  joinComments(postId) {
    this.socket.emit('comments:join', { postId });
    console.log(`[${this.userId}] Joined comments: ${postId}`);
  }

  setStatus(status) {
    this.socket.emit('presence:status', { status });
    console.log(`[${this.userId}] Status set to: ${status}`);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Run tests if called directly
if (require.main === module) {
  async function runTests() {
    console.log('🚀 Starting CallIt Real-time Tests\n');

    // Create test clients
    const alice = new TestClient('alice');
    const bob = new TestClient('bob');
    const charlie = new TestClient('charlie');

    try {
      // Connect all clients
      console.log('--- Connecting clients ---');
      await Promise.all([
        alice.connect(),
        bob.connect(),
        charlie.connect()
      ]);

      // Wait a bit
      await new Promise(r => setTimeout(r, 1000));

      // Test feed subscriptions
      console.log('\n--- Testing Feed Subscriptions ---');
      alice.subscribeToFeed('main-feed');
      bob.subscribeToFeed('main-feed');
      charlie.subscribeToFeed('other-feed');

      await new Promise(r => setTimeout(r, 500));

      // Test comments
      console.log('\n--- Testing Comments ---');
      alice.joinComments('post-123');
      bob.joinComments('post-123');

      await new Promise(r => setTimeout(r, 500));

      // Test presence
      console.log('\n--- Testing Presence ---');
      alice.setStatus('busy');
      await new Promise(r => setTimeout(r, 500));
      bob.setStatus('away');

      await new Promise(r => setTimeout(r, 1000));

      // Test typing indicator
      console.log('\n--- Testing Typing Indicator ---');
      alice.socket.emit('comments:typing', { postId: 'post-123', isTyping: true });
      await new Promise(r => setTimeout(r, 2000));
      alice.socket.emit('comments:typing', { postId: 'post-123', isTyping: false });

      await new Promise(r => setTimeout(r, 1000));

      console.log('\n✅ Tests completed!');
      console.log('Press Ctrl+C to exit or wait for auto-cleanup...');

      // Cleanup after 5 seconds
      setTimeout(() => {
        alice.disconnect();
        bob.disconnect();
        charlie.disconnect();
        process.exit(0);
      }, 5000);

    } catch (err) {
      console.error('Test failed:', err);
      process.exit(1);
    }
  }

  runTests();
}

module.exports = { TestClient };