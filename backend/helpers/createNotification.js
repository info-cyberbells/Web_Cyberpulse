import Notification from "../model/NotificationModel.js";
import NotificationSettings from "../model/NotificationSettingsModel.js";
import UserNotificationPreference from "../model/UserNotificationPreferenceModel.js";
import Employee from "../model/employeeModel.js";
import { getIO } from "../socket/socketServer.js";
import { sendPushToUser, sendPushToMultipleUsers } from "./sendPushNotification.js";

/**
 * Emits socket events for created notifications.
 */
const emitNotifications = (created) => {
  try {
    const io = getIO();
    created.forEach((notification) => {
      io.to(`user:${notification.recipient}`).emit("notification:new", {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        triggeredBy: notification.triggeredBy,
        isRead: false,
        createdAt: notification.createdAt,
        resourceId: notification.resourceId,
        resourceType: notification.resourceType,
      });
    });
  } catch (socketErr) {
    console.error("Socket emit error for notifications:", socketErr);
  }
};

/**
 * Check user's per-notification-type preference.
 * Returns true if user wants this notification type (or has no preferences set yet).
 */
const isUserNotifEnabled = (userPref, notifType) => {
  if (!userPref || !userPref.preferences) return true; // default enabled
  return userPref.preferences[notifType] !== false;
};

/**
 * Build a prefs map and return two lists:
 *  - notifEligible: recipients who want this notification type (in-app + push)
 *  - pushEligible:  subset who also have pushEnabled
 */
const getEligibleRecipients = async (recipientIds, type) => {
  const userPrefs = await UserNotificationPreference.find({
    userId: { $in: recipientIds },
  });

  const prefsMap = new Map();
  userPrefs.forEach((p) => prefsMap.set(p.userId.toString(), p));

  const notifEligible = [];
  const pushEligible = [];

  recipientIds.forEach((id) => {
    const pref = prefsMap.get(id.toString());
    const wantsType = !pref || isUserNotifEnabled(pref, type);
    if (!wantsType) return; // user disabled this type entirely
    notifEligible.push(id);
    if (!pref || (pref.pushEnabled && wantsType)) {
      pushEligible.push(id);
    }
  });

  return { notifEligible, pushEligible };
};

/**
 * Send FCM push to eligible recipients.
 */
const sendFcmToRecipients = async (pushEligible, type, title, message) => {
  try {
    if (!pushEligible || pushEligible.length === 0) return;
    if (pushEligible.length === 1) {
      await sendPushToUser(pushEligible[0], title, message, { type });
    } else {
      await sendPushToMultipleUsers(pushEligible, title, message, { type });
    }
  } catch (error) {
    console.error("Error sending FCM to recipients:", error.message);
  }
};

/**
 * Creates notifications for Admin/TL/HR/Manager in the same org.
 * Never throws - notification failure must not break the main action.
 */
export const createNotification = async (type, data) => {
  try {
    const { triggeredBy, organizationId, title, message, resourceId, resourceType } = data;

    const settings = await NotificationSettings.findOne({ organizationId });
    if (settings && settings[type] === false) return;

    const recipients = await Employee.find({
      organizationId,
      type: { $in: [1, 3, 4, 5] },
      _id: { $ne: triggeredBy },
      status: "1",
    }).select("_id");

    if (recipients.length === 0) return;

    const allIds = recipients.map((r) => r._id);
    const { notifEligible, pushEligible } = await getEligibleRecipients(allIds, type);
    if (notifEligible.length === 0) return;

    const notificationDocs = notifEligible.map((id) => ({
      type, title, message, triggeredBy,
      recipient: id, organizationId,
      resourceId: resourceId || null,
      resourceType: resourceType || null,
    }));

    const created = await Notification.insertMany(notificationDocs);
    emitNotifications(created);

    await sendFcmToRecipients(pushEligible, type, title, message);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

/**
 * Creates a notification for a SPECIFIC employee (e.g. leave approved/rejected).
 */
export const createNotificationForEmployee = async (type, data) => {
  try {
    const { triggeredBy, recipientId, organizationId, title, message, resourceId, resourceType } = data;

    const settings = await NotificationSettings.findOne({ organizationId });
    if (settings && settings[type] === false) return;

    const { notifEligible, pushEligible } = await getEligibleRecipients([recipientId], type);
    if (notifEligible.length === 0) return;

    const doc = {
      type, title, message, triggeredBy,
      recipient: recipientId, organizationId,
      resourceId: resourceId || null,
      resourceType: resourceType || null,
    };

    const created = await Notification.insertMany([doc]);
    emitNotifications(created);

    await sendFcmToRecipients(pushEligible, type, title, message);
  } catch (error) {
    console.error("Error creating employee notification:", error);
  }
};

/**
 * Creates notifications for ALL employees in the org (e.g. events, announcements).
 * Excludes the triggeredBy employee.
 */
export const createNotificationForAll = async (type, data) => {
  try {
    const { triggeredBy, organizationId, title, message, resourceId, resourceType } = data;

    const settings = await NotificationSettings.findOne({ organizationId });
    if (settings && settings[type] === false) return;

    const recipients = await Employee.find({
      organizationId,
      _id: { $ne: triggeredBy },
      status: "1",
    }).select("_id");

    if (recipients.length === 0) return;

    const allIds = recipients.map((r) => r._id);
    const { notifEligible, pushEligible } = await getEligibleRecipients(allIds, type);
    if (notifEligible.length === 0) return;

    const notificationDocs = notifEligible.map((id) => ({
      type, title, message, triggeredBy,
      recipient: id, organizationId,
      resourceId: resourceId || null,
      resourceType: resourceType || null,
    }));

    const created = await Notification.insertMany(notificationDocs);
    emitNotifications(created);

    await sendFcmToRecipients(pushEligible, type, title, message);
  } catch (error) {
    console.error("Error creating broadcast notification:", error);
  }
};
