/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Firebase config — these values must match your .env REACT_APP_FIREBASE_* values
// Since service workers can't access process.env, we use self.__FIREBASE_CONFIG or hardcode
const firebaseConfig = {
  apiKey: self.__FIREBASE_CONFIG?.apiKey || "",
  authDomain: self.__FIREBASE_CONFIG?.authDomain || "",
  projectId: self.__FIREBASE_CONFIG?.projectId || "",
  storageBucket: self.__FIREBASE_CONFIG?.storageBucket || "",
  messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId || "",
  appId: self.__FIREBASE_CONFIG?.appId || "",
};

// Only initialize if config is available
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("Background message received:", payload);

    const notificationTitle = payload.notification?.title || "Cyber Pulse";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/logo192.png",
      badge: "/logo192.png",
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window or open new one
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
