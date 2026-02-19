import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String },
  size: { type: Number },
  mimeType: { type: String },
}, { _id: false });

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema(
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
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'voice', 'system'],
      default: 'text',
    },
    attachments: [attachmentSchema],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reactions: [reactionSchema],
    reactionCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'seen'],
      default: 'sent',
    },
    deliveredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    deletedForEveryone: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    expiresAt: { type: Date, default: null },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, _id: -1 });
messageSchema.index({ organizationId: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
messageSchema.index({ content: 'text' });

const Message = mongoose.model('Message', messageSchema, 'Message');
export default Message;
