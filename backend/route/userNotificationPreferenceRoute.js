import express from "express";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../controller/userNotificationPreferenceController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerUserNotifPref = express.Router();

routerUserNotifPref.get("/", authenticateToken, getUserPreferences);
routerUserNotifPref.put("/", authenticateToken, updateUserPreferences);

export default routerUserNotifPref;
