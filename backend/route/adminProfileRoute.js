import express from "express";
import {
  getAdminProfile,
  updateAdminProfile,
  updateOrganizationDetails,
} from "../controller/AdminController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const routerAdminProfile = express.Router();

// GET  /api/admin-profile/me
routerAdminProfile.get("/get-profile", authenticateToken, getAdminProfile);

// PUT  /api/admin-profile/me
routerAdminProfile.put("/me", authenticateToken, updateAdminProfile);

// PUT  /api/admin-profile/organization
routerAdminProfile.put("/organization", authenticateToken, updateOrganizationDetails);

export default routerAdminProfile;
