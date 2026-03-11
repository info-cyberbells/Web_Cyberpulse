import FcmToken from "../model/FcmTokenModel.js";
import { getMessaging } from "./firebaseAdmin.js";

/**
 * Send push notification to a single user (all their registered devices).
 * Never throws — push failure must not break the main action.
 */
export const sendPushToUser = async (userId, title, body, data = {}) => {
  try {
    const messaging = getMessaging();
    if (!messaging) return;

    const tokenDocs = await FcmToken.find({ userId }).select("token");
    if (tokenDocs.length === 0) return;

    const tokens = tokenDocs.map((t) => t.token);

    const message = {
      notification: { title, body },
      data: { ...data, type: data.type || "general" },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === "messaging/invalid-registration-token" ||
            code === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });
      if (tokensToRemove.length > 0) {
        await FcmToken.deleteMany({ token: { $in: tokensToRemove } });
      }
    }
  } catch (error) {
    console.error("Error sending push to user:", error.message);
  }
};

/**
 * Send push notification to multiple users.
 * Never throws — push failure must not break the main action.
 */
export const sendPushToMultipleUsers = async (userIds, title, body, data = {}) => {
  try {
    const messaging = getMessaging();
    if (!messaging) return;
    if (!userIds || userIds.length === 0) return;

    const tokenDocs = await FcmToken.find({ userId: { $in: userIds } }).select("token");
    if (tokenDocs.length === 0) return;

    const tokens = tokenDocs.map((t) => t.token);

    // FCM sendEachForMulticast supports max 500 tokens per call
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const message = {
        notification: { title, body },
        data: { ...data, type: data.type || "general" },
        tokens: batch,
      };

      const response = await messaging.sendEachForMulticast(message);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (
              code === "messaging/invalid-registration-token" ||
              code === "messaging/registration-token-not-registered"
            ) {
              tokensToRemove.push(batch[idx]);
            }
          }
        });
        if (tokensToRemove.length > 0) {
          await FcmToken.deleteMany({ token: { $in: tokensToRemove } });
        }
      }
    }
  } catch (error) {
    console.error("Error sending push to multiple users:", error.message);
  }
};
