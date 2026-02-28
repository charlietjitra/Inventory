import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseConfig, vapidKey } from "./firebase-config";

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging only in the browser
let messaging = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// Function to request notification permission and get token
const requestNotificationPermission = async () => {
  try {
    // Check if we're in the browser and messaging is available
    if (typeof window === "undefined" || !messaging) {
      console.log('Firebase messaging not available (server-side or initialization failed)');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log('Current token for client: ', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};



export { messaging, vapidKey, requestNotificationPermission };
