import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userType = decoded.type;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};
