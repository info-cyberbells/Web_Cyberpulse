import mongoose from 'mongoose';

const blockedUserSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

blockedUserSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
blockedUserSchema.index({ blockerId: 1 });

const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema, 'BlockedUser');
export default BlockedUser;
