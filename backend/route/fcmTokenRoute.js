import express from "express";
import {
  registerToken,
  removeToken,
  removeAllTokens,
} from "../controller/fcmTokenController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerFcmToken = express.Router();

routerFcmToken.post("/", authenticateToken, registerToken);
routerFcmToken.delete("/", authenticateToken, removeToken);
routerFcmToken.delete("/all", authenticateToken, removeAllTokens);

export default routerFcmToken;
