// Shared Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0XxN1p-y2x70Bo2eZxXz_t-E93ecbg5o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "push-noti-1be3b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "push-noti-1be3b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "push-noti-1be3b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "172777133623",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:172777133623:web:28838b93de1a7ab0c6d1b2",
};

export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BK34CvO2UuZ8Yup0_-hZ1L7TOnTta1s0JfAN9dmvU9d6JC8-G3REE8p0eWqew6UEKl0xUgAJPb78FQkgXJn4YnI";