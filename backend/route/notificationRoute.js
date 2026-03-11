import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationSettings,
  updateNotificationSettings,
} from "../controller/notificationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerNotification = express.Router();

routerNotification.get("/", authenticateToken, getNotifications);
routerNotification.get("/unread-count", authenticateToken, getUnreadCount);
routerNotification.patch("/mark-all-read", authenticateToken, markAllAsRead);
routerNotification.patch("/:id/read", authenticateToken, markAsRead);
routerNotification.get("/settings", authenticateToken, getNotificationSettings);
routerNotification.put("/settings", authenticateToken, updateNotificationSettings);

export default routerNotification;
