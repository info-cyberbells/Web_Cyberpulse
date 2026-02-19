import mongoose from 'mongoose';

const groupInviteLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    maxUses: { type: Number, default: 0 }, // 0 = unlimited
    useCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    requiresApproval: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

groupInviteLinkSchema.index({ conversationId: 1 });

const GroupInviteLink = mongoose.model('GroupInviteLink', groupInviteLinkSchema, 'GroupInviteLink');
export default GroupInviteLink;
