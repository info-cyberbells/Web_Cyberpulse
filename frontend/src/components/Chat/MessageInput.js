import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, TextField, IconButton, Typography, InputAdornment, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker from 'emoji-picker-react';
import socketService from '../../services/socketService';
import { setReplyTo, setEditingMessage, uploadAttachment, addMessage } from '../../features/chat/chatSlice';

const MessageInput = ({ conversationId }) => {
  const dispatch = useDispatch();
  const { replyTo, editingMessage } = useSelector(state => state.chat);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !editingMessage) return;

    if (editingMessage) {
      socketService.emit('message:edit', {
        messageId: editingMessage._id,
        content: trimmed,
      }, (response) => {
        if (response?.success) {
          dispatch(setEditingMessage(null));
          setText('');
        }
      });
      return;
    }

    const msgData = {
      conversationId,
      content: trimmed,
      type: 'text',
      replyTo: replyTo?._id || null,
    };

    socketService.emit('message:send', msgData, (response) => {
      if (response?.success) {
        // Message will come back via message:received event
      }
    });

    setText('');
    dispatch(setReplyTo(null));
    setShowEmoji(false);

    // Stop typing indicator
    socketService.emit('typing:stop', { conversationId });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    socketService.emit('typing:start', { conversationId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketService.emit('typing:stop', { conversationId });
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await dispatch(uploadAttachment(file)).unwrap();
      if (result?.data) {
        socketService.emit('message:send', {
          conversationId,
          content: '',
          type: result.data.type,
          attachments: [result.data],
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const cancelReply = () => dispatch(setReplyTo(null));
  const cancelEdit = () => {
    dispatch(setEditingMessage(null));
    setText('');
  };

  return (
    <Box sx={{ borderTop: '1px solid #e0e0e0', bgcolor: '#fff', position: 'relative' }}>
      {/* Reply preview */}
      {replyTo && (
        <Box sx={{
          display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#f5f5f5',
          borderLeft: '3px solid #1976d2',
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={600} color="primary">
              Replying to {typeof replyTo.senderId === 'object' ? replyTo.senderId.name : 'Unknown'}
            </Typography>
            <Typography variant="caption" display="block" noWrap color="text.secondary">
              {replyTo.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={cancelReply}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      )}

      {/* Editing preview */}
      {editingMessage && (
        <Box sx={{
          display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#e3f2fd',
          borderLeft: '3px solid #1976d2',
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight={600} color="primary">Editing message</Typography>
          </Box>
          <IconButton size="small" onClick={cancelEdit}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <Box sx={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 10 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={350} />
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 1, py: 1, gap: 0.5 }}>
        <IconButton onClick={() => setShowEmoji(prev => !prev)} color={showEmoji ? 'primary' : 'default'}>
          <EmojiEmotionsIcon />
        </IconButton>

        <IconButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
        </IconButton>
        <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />

        <TextField
          inputRef={inputRef}
          fullWidth multiline maxRows={4} size="small"
          placeholder="Type a message..."
          value={text} onChange={handleTyping} onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f5f5f5' },
          }}
        />

        <IconButton color="primary" onClick={handleSend} disabled={!text.trim() && !editingMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageInput;
