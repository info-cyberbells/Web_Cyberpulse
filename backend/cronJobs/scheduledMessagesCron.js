import cron from 'node-cron';
import ScheduledMessage from '../model/ScheduledMessageModel.js';
import Message from '../model/MessageModel.js';
import Conversation from '../model/ConversationModel.js';

// Run every minute - send scheduled messages
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const pendingMessages = await ScheduledMessage.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    });

    for (const scheduled of pendingMessages) {
      try {
        const conversation = await Conversation.findById(scheduled.conversationId);
        if (!conversation) {
          scheduled.status = 'cancelled';
          await scheduled.save();
          continue;
        }

        // Create the actual message
        await Message.create({
          conversationId: scheduled.conversationId,
          senderId: scheduled.senderId,
          content: scheduled.content,
          type: scheduled.type,
          attachments: scheduled.attachments,
          status: 'sent',
          organizationId: scheduled.organizationId,
        });

        // Update conversation lastMessage
        conversation.lastMessage = {
          content: scheduled.content,
          senderId: scheduled.senderId,
          type: scheduled.type,
          timestamp: now,
        };

        conversation.metadata.forEach(meta => {
          if (meta.userId.toString() !== scheduled.senderId.toString()) {
            meta.unreadCount += 1;
          }
        });

        await conversation.save();

        scheduled.status = 'sent';
        await scheduled.save();
      } catch (innerError) {
        console.error(`Error sending scheduled message ${scheduled._id}:`, innerError);
      }
    }
  } catch (error) {
    console.error('Scheduled messages cron error:', error);
  }
});
