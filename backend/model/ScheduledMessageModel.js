import mongoose from 'mongoose';

const scheduledMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document'],
      default: 'text',
    },
    attachments: [{
      url: String,
      type: String,
      name: String,
      size: Number,
      mimeType: String,
    }],
    scheduledFor: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'cancelled'],
      default: 'pending',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

scheduledMessageSchema.index({ scheduledFor: 1, status: 1 });

const ScheduledMessage = mongoose.model('ScheduledMessage', scheduledMessageSchema, 'ScheduledMessage');
export default ScheduledMessage;
