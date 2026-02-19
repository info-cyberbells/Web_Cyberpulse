import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  unreadCount: { type: Number, default: 0 },
  isMuted: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  mutedUntil: { type: Date, default: null },
}, { _id: false });

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    groupName: { type: String, default: null },
    groupImage: { type: String, default: null },
    groupDescription: { type: String, default: null },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      type: { type: String, default: 'text' },
      timestamp: { type: Date, default: null },
    },
    metadata: [metadataSchema],
    hiddenFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    archivedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    disappearingDuration: { type: Number, default: 0 }, // seconds, 0 = disabled
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, organizationId: 1 });
conversationSchema.index({ organizationId: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema, 'Conversation');
export default Conversation;
