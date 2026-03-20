import 'dotenv/config';
import mongoose from 'mongoose';
import '../model/employeeModel.js';
import FcmToken from '../model/FcmTokenModel.js';
import { getMessaging } from '../helpers/firebaseAdmin.js';

await mongoose.connect(process.env.MONGO_URL);

const messaging = getMessaging();
if (!messaging) {
  console.error('Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT_PATH in .env');
  process.exit(1);
}

// Fetch all registered FCM tokens
const allTokens = await FcmToken.find({}).populate('userId', 'name email');
console.log(`\nFound ${allTokens.length} registered FCM token(s):\n`);
allTokens.forEach((t, i) => {
  console.log(`  ${i + 1}. ${t.userId?.name || 'Unknown'} (${t.userId?.email || ''}) — device: ${t.device}`);
});

if (allTokens.length === 0) {
  console.log('\nKoi FCM token registered nahi hai. Pehle app mein login karo.');
  process.exit(0);
}

const tokens = allTokens.map(t => t.token);

const message = {
  notification: {
    title: '🔔 CyberPulse Test',
    body: 'Yeh ek test push notification hai!',
  },
  data: { type: 'general' },
  tokens,
};

console.log(`\nSending test notification to ${tokens.length} device(s)...`);
const response = await messaging.sendEachForMulticast(message);

console.log(`\nResult:`);
console.log(`  ✅ Success: ${response.successCount}`);
console.log(`  ❌ Failed:  ${response.failureCount}`);

if (response.failureCount > 0) {
  response.responses.forEach((r, i) => {
    if (!r.success) {
      console.log(`  Error on token ${i + 1}: ${r.error?.code} — ${r.error?.message}`);
    }
  });
}

await mongoose.disconnect();
