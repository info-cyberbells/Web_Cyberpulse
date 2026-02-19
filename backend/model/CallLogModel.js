import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    callType: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'ongoing', 'ended', 'missed', 'rejected'],
      default: 'initiated',
    },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // seconds
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

callLogSchema.index({ conversationId: 1, createdAt: -1 });
callLogSchema.index({ initiatedBy: 1 });

const CallLog = mongoose.model('CallLog', callLogSchema, 'CallLog');
export default CallLog;
