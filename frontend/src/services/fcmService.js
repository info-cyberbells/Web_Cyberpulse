import { messaging, getToken, onMessage } from "./firebaseConfig";
import { registerFcmToken, removeFcmToken } from "./services";

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

/**
 * Initialize FCM: request permission, get token, register with backend.
 * Call after login.
 */
export const initFCM = async () => {
  try {
    if (!messaging) {
      console.warn("Firebase messaging not initialized. Skipping FCM setup.");
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied by user.");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Register token with backend
      await registerFcmToken({ token, device: "web" });
      console.log("FCM token registered successfully");
      return token;
    }

    console.warn("No FCM token received");
    return null;
  } catch (error) {
    console.error("Error initializing FCM:", error);
    return null;
  }
};

/**
 * Cleanup FCM: remove token from backend.
 * Call before logout.
 */
export const cleanupFCM = async () => {
  try {
    if (!messaging) return;

    const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (!registration) return;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await removeFcmToken({ token });
      console.log("FCM token removed successfully");
    }
  } catch (error) {
    console.error("Error cleaning up FCM:", error);
  }
};

/**
 * Listen for foreground messages.
 * Call once after FCM init to handle messages when app is in focus.
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    if (callback) callback(payload);
  });
};
