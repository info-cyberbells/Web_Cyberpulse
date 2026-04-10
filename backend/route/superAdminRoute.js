import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getAllOrganizations,
  getOrgEmployees,
  getOrgAttendance,
} from '../controller/superAdminController.js';

const routerSuperAdmin = express.Router();

// Middleware: only type 1 with no organizationId (SuperAdmin)
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.type !== 1 || req.user?.organizationId) {
    return res.status(403).json({ success: false, message: 'SuperAdmin access only' });
  }
  next();
};

routerSuperAdmin.get('/organizations', authenticateToken, requireSuperAdmin, getAllOrganizations);
routerSuperAdmin.get('/organizations/:orgId/employees', authenticateToken, requireSuperAdmin, getOrgEmployees);
routerSuperAdmin.get('/organizations/:orgId/attendance', authenticateToken, requireSuperAdmin, getOrgAttendance);

export default routerSuperAdmin;
