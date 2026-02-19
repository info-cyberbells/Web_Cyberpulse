import cron from 'node-cron';
import Message from '../model/MessageModel.js';

// Run every 10 minutes - clean up expired messages
cron.schedule('*/10 * * * *', async () => {
  try {
    const result = await Message.deleteMany({
      expiresAt: { $ne: null, $lte: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired messages`);
    }
  } catch (error) {
    console.error('Disappearing messages cron error:', error);
  }
});
