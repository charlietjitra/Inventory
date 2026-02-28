// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);
import { firebaseConfig } from "./firebase-config";

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
