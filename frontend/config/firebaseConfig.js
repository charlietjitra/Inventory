import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC0XxN1p-y2x70Bo2eZxXz_t-E93ecbg5o",
  authDomain: "push-noti-1be3b.firebaseapp.com",
  projectId: "push-noti-1be3b",
  storageBucket: "push-noti-1be3b.firebasestorage.app",
  messagingSenderId: "172777133623",
  appId: "1:172777133623:web:28838b93de1a7ab0c6d1b2",
};

const vapidKey = "BK34CvO2UuZ8Yup0_-hZ1L7TOnTta1s0JfAN9dmvU9d6JC8-G3REE8p0eWqew6UEKl0xUgAJPb78FQkgXJn4YnI";
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
