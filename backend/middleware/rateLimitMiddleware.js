const requestCounts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const apiRateLimiter = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  const record = requestCounts.get(key);

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + WINDOW_MS;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  }

  record.count += 1;
  next();
};

// Socket rate limiter
const socketMessageCounts = new Map();
const SOCKET_WINDOW_MS = 60 * 1000; // 1 minute
const SOCKET_MAX_MESSAGES = 30;

export const socketRateLimiter = (socketId) => {
  const now = Date.now();

  if (!socketMessageCounts.has(socketId)) {
    socketMessageCounts.set(socketId, { count: 1, resetAt: now + SOCKET_WINDOW_MS });
    return true;
  }

  const record = socketMessageCounts.get(socketId);

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + SOCKET_WINDOW_MS;
    return true;
  }

  if (record.count >= SOCKET_MAX_MESSAGES) {
    return false;
  }

  record.count += 1;
  return true;
};

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts) {
    if (now > record.resetAt) requestCounts.delete(key);
  }
  for (const [key, record] of socketMessageCounts) {
    if (now > record.resetAt) socketMessageCounts.delete(key);
  }
}, 5 * 60 * 1000);
