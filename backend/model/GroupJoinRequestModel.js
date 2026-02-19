import mongoose from 'mongoose';

const groupJoinRequestSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    inviteLinkToken: { type: String, default: null },
  },
  { timestamps: true }
);

groupJoinRequestSchema.index({ conversationId: 1, userId: 1 });

const GroupJoinRequest = mongoose.model('GroupJoinRequest', groupJoinRequestSchema, 'GroupJoinRequest');
export default GroupJoinRequest;
