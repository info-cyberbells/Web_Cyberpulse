import express from "express";
import { getOrgSettings, updateOrgSettings } from "../controller/organizationSettingsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerOrgSettings = express.Router();

routerOrgSettings.get("/:orgId", authenticateToken, getOrgSettings);
routerOrgSettings.put("/:orgId", authenticateToken, updateOrgSettings);

export default routerOrgSettings;
