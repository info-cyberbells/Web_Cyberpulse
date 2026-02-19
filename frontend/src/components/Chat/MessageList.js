import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import { fetchMessages } from '../../features/chat/chatSlice';
import MessageBubble from './MessageBubble';

const MessageList = ({ currentUser }) => {
  const dispatch = useDispatch();
  const { activeConversation, messages, pagination, messagesLoading } = useSelector(state => state.chat);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const prevScrollHeight = useRef(0);

  const convId = activeConversation?._id;
  const convMessages = messages[convId] || [];
  const pag = pagination[convId];
  const hasMore = pag?.hasMore;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [convMessages.length]);

  // Infinite scroll upward for loading older messages
  const handleScroll = useCallback(() => {
    if (!listRef.current || messagesLoading || !hasMore) return;
    if (listRef.current.scrollTop < 100) {
      prevScrollHeight.current = listRef.current.scrollHeight;
      const firstMsgId = convMessages[0]?._id;
      if (firstMsgId) {
        dispatch(fetchMessages({ conversationId: convId, before: firstMsgId })).then(() => {
          // Maintain scroll position after prepending
          if (listRef.current) {
            const newHeight = listRef.current.scrollHeight;
            listRef.current.scrollTop = newHeight - prevScrollHeight.current;
          }
        });
      }
    }
  }, [convId, convMessages, dispatch, hasMore, messagesLoading]);

  const formatDateDivider = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const renderMessages = () => {
    let lastDate = null;
    return convMessages.map((msg, idx) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      let showDivider = false;
      if (msgDate !== lastDate) {
        showDivider = true;
        lastDate = msgDate;
      }

      return (
        <React.Fragment key={msg._id}>
          {showDivider && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
              <Typography variant="caption" sx={{
                bgcolor: '#e0e0e0', px: 2, py: 0.5, borderRadius: 3, fontSize: 11, color: '#555',
              }}>
                {formatDateDivider(msg.createdAt)}
              </Typography>
            </Box>
          )}
          <MessageBubble
            message={msg}
            isOwn={msg.senderId?._id === currentUser?.id || msg.senderId === currentUser?.id}
            currentUser={currentUser}
            conversationType={activeConversation?.type}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <Box
      ref={listRef}
      onScroll={handleScroll}
      sx={{
        flex: 1, overflow: 'auto', px: 2, py: 1,
        bgcolor: '#f0f2f5',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {messagesLoading && convMessages.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      {hasMore && convMessages.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          {messagesLoading ? <CircularProgress size={20} /> : (
            <Typography variant="caption" color="text.secondary">Scroll up for older messages</Typography>
          )}
        </Box>
      )}
      {renderMessages()}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
