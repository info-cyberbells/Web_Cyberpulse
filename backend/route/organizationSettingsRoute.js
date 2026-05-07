import express from "express";
import {
  getOrgSettings,
  updateOrgSettings,
  geocodeLocation,
  getStaticMap,
} from "../controller/organizationSettingsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerOrgSettings = express.Router();

// Public — returns an image, so <img>/<Image> can't send auth headers.
// Protects the API key by proxying the request server-side.
routerOrgSettings.get("/static-map", getStaticMap);

routerOrgSettings.post("/geocode", authenticateToken, geocodeLocation);
routerOrgSettings.get("/:orgId", authenticateToken, getOrgSettings);
routerOrgSettings.put("/:orgId", authenticateToken, updateOrgSettings);

export default routerOrgSettings;
