const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account
// For production, use service account key from environment variable
// For development, you can use the default config
let firebaseApp;
let messaging = null;

try {
  // Try to initialize with service account (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'push-noti-1be3b'
    });
    messaging = admin.messaging();
    console.log('✅ Firebase Admin SDK initialized with service account');
  } else {
    // Development mode - try to initialize with default credentials
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set. Attempting development setup...');
    
    // For development, we'll skip Firebase Admin initialization
    // and just log notifications instead of sending them
    console.log('📱 Development mode: Notifications will be logged instead of sent');
    firebaseApp = null;
    messaging = null;
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  firebaseApp = null;
  messaging = null;
}

// Function to send notification to specific device token
const sendNotificationToDevice = async (token, title, body, data = {}) => {
  if (!messaging) {
    // Development mode - log the notification instead of sending it
    console.log('\n🔔 NOTIFICATION (Development Mode):');
    console.log('📱 Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('📋 Title:', title);
    console.log('📝 Body:', body);
    console.log('📊 Data:', JSON.stringify(data, null, 2));
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('─'.repeat(50));
    
    return { 
      success: true, 
      messageId: 'dev-mode-notification', 
      mode: 'development',
      message: 'Notification logged (development mode)'
    };
  }

  try {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      webpush: {
        headers: {
          'Urgency': 'high',
        },
        notification: {
          title: title,
          body: body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'inventory-notification',
          renotify: true,
          requireInteraction: false,
          actions: [
            {
              action: 'view',
              title: 'View',
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
            }
          ]
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

// Function to send notification to multiple devices
const sendNotificationToMultipleDevices = async (tokens, title, body, data = {}) => {
  if (!messaging || !tokens.length) {
    return { success: false, error: 'No tokens or Firebase not configured' };
  }

  try {
    const message = {
      tokens: tokens,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      webpush: {
        headers: {
          'Urgency': 'high',
        },
        notification: {
          title: title,
          body: body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'inventory-notification',
        },
      },
    };

    const response = await messaging.sendMulticast(message);
    console.log('Successfully sent messages:', response);
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses 
    };
  } catch (error) {
    console.error('Error sending messages:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  admin,
  messaging,
  sendNotificationToDevice,
  sendNotificationToMultipleDevices
};