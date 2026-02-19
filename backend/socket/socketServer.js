import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socketAuth.js';
import { registerMessageHandlers } from './handlers/messageHandler.js';
import { registerPresenceHandlers } from './handlers/presenceHandler.js';
import { registerTypingHandlers } from './handlers/typingHandler.js';
import { registerReadReceiptHandlers } from './handlers/readReceiptHandler.js';
import { registerGroupHandlers } from './handlers/groupHandler.js';
import { registerMessageActionsHandlers } from './handlers/messageActionsHandler.js';
import { registerReactionHandlers } from './handlers/reactionHandler.js';
import { registerGroupAdminHandlers } from './handlers/groupAdminHandler.js';
import { registerCallHandlers } from './handlers/callHandler.js';
import Conversation from '../model/ConversationModel.js';

let io;

export const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply JWT auth middleware
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Join personal room for multi-tab sync
    socket.join(`user:${userId}`);

    // Join all conversation rooms the user is part of
    try {
      const conversations = await Conversation.find(
        { participants: userId },
        { _id: 1 }
      );
      conversations.forEach(conv => {
        socket.join(`conversation:${conv._id}`);
      });
    } catch (error) {
      console.error('Error joining conversation rooms:', error);
    }

    // Join conversation room on demand
    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Register all handlers
    registerMessageHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerReadReceiptHandlers(io, socket);
    registerGroupHandlers(io, socket);
    registerMessageActionsHandlers(io, socket);
    registerReactionHandlers(io, socket);
    registerGroupAdminHandlers(io, socket);
    registerCallHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
