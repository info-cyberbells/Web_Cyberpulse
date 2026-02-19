import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import socketService from '../../services/socketService';
import { setReplyTo, setEditingMessage, deleteMessageForMe } from '../../features/chat/chatSlice';

const MessageBubble = ({ message, isOwn, currentUser, conversationType }) => {
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showActions, setShowActions] = useState(false);

  if (message.type === 'system') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <Typography variant="caption" sx={{
          bgcolor: '#fff3cd', px: 2, py: 0.5, borderRadius: 2, fontSize: 11, color: '#856404',
        }}>
          {message.content}
        </Typography>
      </Box>
    );
  }

  if (message.deletedForEveryone) {
    return (
      <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 0.5, px: 1 }}>
        <Box sx={{
          px: 2, py: 1, borderRadius: 2,
          bgcolor: isOwn ? '#e3f2fd' : '#fff',
          border: '1px solid #e0e0e0', fontStyle: 'italic', opacity: 0.6,
        }}>
          <Typography variant="body2" color="text.secondary">This message was deleted</Typography>
        </Box>
      </Box>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const senderName = typeof message.senderId === 'object' ? message.senderId.name : '';

  const handleReply = () => {
    dispatch(setReplyTo(message));
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    dispatch(setEditingMessage(message));
    setMenuAnchor(null);
  };

  const handleDeleteForMe = () => {
    socketService.emit('message:delete-for-me', { messageId: message._id }, (response) => {
      if (response?.success) {
        dispatch(deleteMessageForMe({
          messageId: message._id,
          conversationId: response.conversationId,
        }));
      }
    });
    setMenuAnchor(null);
  };

  const handleDeleteForEveryone = () => {
    socketService.emit('message:delete-for-everyone', { messageId: message._id });
    setMenuAnchor(null);
  };

  const handlePin = () => {
    socketService.emit('message:pin', { messageId: message._id, pin: !message.isPinned });
    setMenuAnchor(null);
  };

  const handleReaction = (emoji) => {
    socketService.emit('reaction:add', { messageId: message._id, emoji });
  };

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const renderAttachments = () => {
    if (!message.attachments?.length) return null;
    return message.attachments.map((att, idx) => {
      if (att.type === 'image') {
        return (
          <Box key={idx} sx={{ mt: 1, maxWidth: 250 }}>
            <img src={`http://localhost:4040${att.url}`} alt={att.name} style={{ width: '100%', borderRadius: 8 }} />
          </Box>
        );
      }
      return (
        <Box key={idx} sx={{ mt: 1, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
          <a href={`http://localhost:4040${att.url}`} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
            {att.name || 'Attachment'}
          </a>
        </Box>
      );
    });
  };

  const hasReactions = message.reactions?.length > 0;
  const groupedReactions = () => {
    if (!hasReactions) return {};
    const grouped = {};
    message.reactions.forEach(r => {
      grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
    });
    return grouped;
  };

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    const reply = message.replyTo;
    return (
      <Box sx={{
        borderLeft: '3px solid #1976d2', pl: 1, mb: 0.5, py: 0.5,
        bgcolor: isOwn ? 'rgba(0,0,0,0.05)' : 'rgba(25,118,210,0.05)', borderRadius: 1,
      }}>
        <Typography variant="caption" color="primary" fontWeight={600}>
          {typeof reply.senderId === 'object' ? reply.senderId.name : 'Unknown'}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary" noWrap>
          {reply.content}
        </Typography>
      </Box>
    );
  };

  const statusIcon = () => {
    if (!isOwn) return null;
    if (message.status === 'seen') return <DoneAllIcon sx={{ fontSize: 14, color: '#4fc3f7' }} />;
    if (message.status === 'delivered') return <DoneAllIcon sx={{ fontSize: 14, color: '#999' }} />;
    return <DoneIcon sx={{ fontSize: 14, color: '#999' }} />;
  };

  return (
    <Box
      sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', mb: 0.5, px: 1 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <Avatar src={typeof message.senderId === 'object' ? message.senderId.image : ''}
          sx={{ width: 28, height: 28, mr: 1, mt: 0.5, bgcolor: '#1976d2', fontSize: 13 }}>
          {senderName?.[0]?.toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%', position: 'relative' }}>
        {/* Quick actions */}
        {showActions && (
          <Box sx={{
            position: 'absolute', top: -8,
            [isOwn ? 'left' : 'right']: -8,
            display: 'flex', gap: 0.3, zIndex: 1,
            bgcolor: '#fff', borderRadius: 2, boxShadow: 1, px: 0.5,
          }}>
            {quickEmojis.slice(0, 3).map(emoji => (
              <IconButton key={emoji} size="small" onClick={() => handleReaction(emoji)} sx={{ fontSize: 14, p: 0.3 }}>
                {emoji}
              </IconButton>
            ))}
            <IconButton size="small" onClick={handleReply} sx={{ p: 0.3 }}><ReplyIcon sx={{ fontSize: 16 }} /></IconButton>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ p: 0.3 }}>
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}

        {/* Message bubble */}
        <Box sx={{
          bgcolor: isOwn ? '#dcf8c6' : '#fff',
          px: 1.5, py: 1, borderRadius: 2,
          borderTopRightRadius: isOwn ? 4 : 16,
          borderTopLeftRadius: isOwn ? 16 : 4,
          boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
          position: 'relative',
          mb: hasReactions ? '14px' : 0,
        }}>
          {!isOwn && senderName && conversationType === 'group' && (
            <Typography variant="caption" fontWeight={600} color="primary" display="block" sx={{ mb: 0.3 }}>
              {senderName}
            </Typography>
          )}
          {message.isPinned && (
            <PushPinIcon sx={{ fontSize: 12, color: '#ff9800', position: 'absolute', top: 4, right: 4 }} />
          )}
          {renderReplyPreview()}
          {message.content && (
            <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          )}
          {renderAttachments()}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.3 }}>
            {message.isEdited && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>edited</Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{time}</Typography>
            {statusIcon()}
          </Box>

          {/* Reactions - WhatsApp style, positioned at bottom edge of bubble */}
          {hasReactions && (
            <Box sx={{
              position: 'absolute',
              bottom: -12,
              [isOwn ? 'left' : 'left']: 8,
              display: 'flex', gap: 0.3, flexWrap: 'wrap',
              zIndex: 2,
            }}>
              {Object.entries(groupedReactions()).map(([emoji, count]) => (
                <Box key={emoji} onClick={() => handleReaction(emoji)} sx={{
                  cursor: 'pointer', fontSize: 13, bgcolor: '#fff',
                  borderRadius: 10, px: 0.6, py: 0.2,
                  display: 'flex', alignItems: 'center', gap: 0.3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  '&:hover': { bgcolor: '#f0f0f0' },
                }}>
                  {emoji} {count > 1 && <span style={{ fontSize: 11, color: '#666' }}>{count}</span>}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleReply} sx={{ fontSize: 13 }}>
          <ReplyIcon sx={{ fontSize: 16, mr: 1 }} /> Reply
        </MenuItem>
        {isOwn && (
          <MenuItem onClick={handleEdit} sx={{ fontSize: 13 }}>
            <EditIcon sx={{ fontSize: 16, mr: 1 }} /> Edit
          </MenuItem>
        )}
        <MenuItem onClick={handlePin} sx={{ fontSize: 13 }}>
          <PushPinIcon sx={{ fontSize: 16, mr: 1 }} /> {message.isPinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={handleDeleteForMe} sx={{ fontSize: 13 }}>
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Delete for me
        </MenuItem>
        {isOwn && (
          <MenuItem onClick={handleDeleteForEveryone} sx={{ fontSize: 13, color: 'error.main' }}>
            <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Delete for everyone
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default MessageBubble;
