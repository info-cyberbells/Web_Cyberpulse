import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const crypto = require('crypto');

export const generateInviteToken = () => {
  return crypto.randomBytes(16).toString('hex');
};
