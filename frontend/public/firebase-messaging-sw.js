// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyC0XxN1p-y2x70Bo2eZxXz_t-E93ecbg5o",
  authDomain: "push-noti-1be3b.firebaseapp.com",
  projectId: "push-noti-1be3b",
  storageBucket: "push-noti-1be3b.firebasestorage.app",
  messagingSenderId: "172777133623",
  appId: "1:172777133623:web:28838b93de1a7ab0c6d1b2",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "inventory-notification",
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/action-view.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/action-dismiss.png",
      },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification click events
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click received.");

  event.notification.close();

  if (event.action === "dismiss") {
    // Just close the notification
    return;
  }

  // Default action or 'view' action - open the app
  event.waitUntil(clients.openWindow("/"));
});
