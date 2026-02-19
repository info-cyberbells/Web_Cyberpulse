import CallLog from '../../model/CallLogModel.js';

export const registerCallHandlers = (io, socket) => {
  // Initiate call - send offer to target user
  socket.on('call:initiate', async ({ callId, targetUserId, offer, callType }) => {
    io.to(`user:${targetUserId}`).emit('call:incoming', {
      callId,
      callerId: socket.userId,
      offer,
      callType,
    });
  });

  // Answer call
  socket.on('call:answer', async ({ callId, callerId, answer }) => {
    await CallLog.updateOne(
      { _id: callId },
      { $set: { status: 'ongoing', startedAt: new Date() } }
    );

    io.to(`user:${callerId}`).emit('call:answered', {
      callId,
      answer,
      answererId: socket.userId,
    });
  });

  // ICE candidate exchange
  socket.on('call:ice-candidate', ({ targetUserId, candidate }) => {
    io.to(`user:${targetUserId}`).emit('call:ice-candidate', {
      candidate,
      fromUserId: socket.userId,
    });
  });

  // End call
  socket.on('call:end', async ({ callId, targetUserId }) => {
    const callLog = await CallLog.findById(callId);
    if (callLog && callLog.status !== 'ended') {
      callLog.status = 'ended';
      callLog.endedAt = new Date();
      if (callLog.startedAt) {
        callLog.duration = Math.round((callLog.endedAt - callLog.startedAt) / 1000);
      }
      await callLog.save();
    }

    io.to(`user:${targetUserId}`).emit('call:ended', {
      callId,
      endedBy: socket.userId,
    });
  });

  // Reject call
  socket.on('call:reject', async ({ callId, callerId }) => {
    await CallLog.updateOne(
      { _id: callId },
      { $set: { status: 'rejected' } }
    );

    io.to(`user:${callerId}`).emit('call:rejected', {
      callId,
      rejectedBy: socket.userId,
    });
  });
};
