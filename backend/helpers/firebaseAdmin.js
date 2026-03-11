import admin from "firebase-admin";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let messaging = null;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Load from file path (resolve relative to project root, i.e. backend/)
    const fs = await import("fs");
    const resolvedPath = path.resolve(path.join(__dirname, ".."), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const raw = fs.readFileSync(resolvedPath, "utf8");
    serviceAccount = JSON.parse(raw);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Load from inline JSON env var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    messaging = admin.messaging();
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.warn(
      "Firebase Admin SDK not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT env var. Push notifications will be disabled."
    );
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error.message);
}

export const getMessaging = () => messaging;
export default admin;
