import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For SuperAdmin (type 1 with no organizationId), allow orgId via x-org-id header
    const orgId =
      decoded.organizationId ||
      (decoded.type === 1 && !decoded.organizationId ? req.headers['x-org-id'] : null);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      organizationId: orgId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};
