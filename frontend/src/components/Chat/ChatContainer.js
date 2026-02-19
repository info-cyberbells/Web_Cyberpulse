import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import socketService from '../../services/socketService';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import CreateGroupModal from './CreateGroupModal';
import GroupInfoPanel from './GroupInfoPanel';
import SearchPanel from './SearchPanel';
import {
  fetchConversations,
  fetchMessages,
  setConnectionStatus,
  addMessage,
  updateConversationLastMessage,
  incrementUnread,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  removeTypingUser,
  updateMessageInStore,
  removeMessageFromStore,
  markMessagesAsSeen,
  setActiveConversation,
  addConversation,
  fetchConversationById,
} from '../../features/chat/chatSlice';

const ChatContainer = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { activeConversation, connectionStatus } = useSelector(state => state.chat);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showChat, setShowChat] = useState(false); // mobile: show chat area

  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  // Ref to track current active conversation inside socket listeners (avoids stale closure)
  const activeConvRef = useRef(null);
  const typingTimersRef = useRef({}); // Auto-clear typing indicators

  useEffect(() => {
    activeConvRef.current = activeConversation?._id || null;
  }, [activeConversation?._id]);

  // Socket connection & event listeners
  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);
    dispatch(setConnectionStatus('connected'));
    dispatch(fetchConversations());

    socket.on('connect', () => dispatch(setConnectionStatus('connected')));
    socket.on('disconnect', () => dispatch(setConnectionStatus('disconnected')));
    socket.on('reconnecting', () => dispatch(setConnectionStatus('reconnecting')));

    socket.on('message:received', (data) => {
      if (data.success && data.data) {
        dispatch(addMessage(data.data));
        dispatch(updateConversationLastMessage({
          conversationId: data.data.conversationId,
          lastMessage: {
            content: data.data.content,
            senderId: data.data.senderId,
            type: data.data.type,
            timestamp: data.data.createdAt,
          },
        }));

        const senderId = typeof data.data.senderId === 'object' ? data.data.senderId._id : data.data.senderId;
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.employee?.id;

        // If this message is for the currently active conversation and NOT from me, mark as seen immediately
        if (data.data.conversationId === activeConvRef.current && senderId !== currentUserId) {
          socketService.emit('read:mark', { conversationId: data.data.conversationId });
        } else {
          dispatch(incrementUnread(data.data.conversationId));
        }
      }
    });

    socket.on('conversation:updated', (data) => {
      dispatch(updateConversationLastMessage(data));
    });

    // When a new or unhidden conversation appears (first message or after delete)
    socket.on('conversation:new', (data) => {
      dispatch(fetchConversations());
      if (data?.conversationId) {
        socketService.emit('conversation:join', { conversationId: data.conversationId });
      }
    });

    socket.on('presence:online-users', (data) => {
      dispatch(setOnlineUsers(data.users));
    });

    socket.on('presence:changed', (data) => {
      if (data.status === 'online') dispatch(addOnlineUser(data.userId));
      else dispatch(removeOnlineUser(data.userId));
    });

    socket.on('typing:started', (data) => {
      dispatch(setTypingUser(data));
      // Auto-clear typing after 3 seconds if typing:stopped is never received
      const timerKey = `${data.conversationId}_${data.userId}`;
      if (typingTimersRef.current[timerKey]) {
        clearTimeout(typingTimersRef.current[timerKey]);
      }
      typingTimersRef.current[timerKey] = setTimeout(() => {
        dispatch(removeTypingUser(data));
        delete typingTimersRef.current[timerKey];
      }, 3000);
    });
    socket.on('typing:stopped', (data) => {
      dispatch(removeTypingUser(data));
      const timerKey = `${data.conversationId}_${data.userId}`;
      if (typingTimersRef.current[timerKey]) {
        clearTimeout(typingTimersRef.current[timerKey]);
        delete typingTimersRef.current[timerKey];
      }
    });

    socket.on('message:edited', (data) => {
      dispatch(updateMessageInStore({
        messageId: data.messageId,
        updates: { content: data.content, isEdited: true },
        conversationId: data.conversationId,
      }));
    });

    socket.on('message:deleted-for-everyone', (data) => {
      dispatch(removeMessageFromStore({
        messageId: data.messageId,
        conversationId: data.conversationId,
      }));
    });

    socket.on('message:pinned', (data) => {
      dispatch(updateMessageInStore({
        messageId: data.messageId,
        updates: { isPinned: data.isPinned },
        conversationId: data.conversationId,
      }));
    });

    socket.on('reaction:updated', (data) => {
      dispatch(updateMessageInStore({
        messageId: data.messageId,
        updates: { reactions: data.reactions, reactionCounts: data.reactionCounts },
        conversationId: data.conversationId,
      }));
    });

    socket.on('reaction:activity', (data) => {
      dispatch(updateConversationLastMessage({
        conversationId: data.conversationId,
        lastMessage: {
          content: `${data.emoji} ${data.reactorName} reacted to "${data.messagePreview}"`,
          senderId: data.reactorId,
          type: 'reaction',
          timestamp: data.timestamp,
        },
      }));
    });

    socket.on('read:receipt', (data) => {
      if (data.conversationId && data.userId) {
        dispatch(markMessagesAsSeen({
          conversationId: data.conversationId,
          userId: data.userId,
        }));
      }
    });

    socket.on('group:joined', (data) => {
      dispatch(fetchConversations());
      socketService.emit('conversation:join', { conversationId: data.conversationId });
    });

    socket.on('group:removed', (data) => {
      dispatch(fetchConversations());
    });

    socket.on('group:member-update', (data) => {
      dispatch(fetchConversations());
      if (data?.conversationId) {
        dispatch(fetchConversationById(data.conversationId));
      }
    });

    return () => {
      // Clear all typing timers
      Object.values(typingTimersRef.current).forEach(timer => clearTimeout(timer));
      typingTimersRef.current = {};
      socketService.disconnect();
      dispatch(setConnectionStatus('disconnected'));
    };
  }, [token, dispatch]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      dispatch(fetchMessages({ conversationId: activeConversation._id }));
      socketService.emit('conversation:join', { conversationId: activeConversation._id });
      socketService.emit('read:mark', { conversationId: activeConversation._id });
    }
  }, [activeConversation?._id, dispatch]);

  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
    if (isMobile) setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    dispatch(setActiveConversation(null));
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Sidebar - Conversation List */}
      <Box sx={{
        width: isMobile ? '100%' : 360,
        minWidth: isMobile ? '100%' : 360,
        display: isMobile && showChat ? 'none' : 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0',
        bgcolor: '#fff',
      }}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          onCreateGroup={() => setShowGroupModal(true)}
          onOpenSearch={() => setShowSearch(true)}
        />
      </Box>

      {/* Main Chat Area */}
      <Box sx={{
        flex: 1,
        display: isMobile && !showChat ? 'none' : 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
      }}>
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              currentUser={currentUser}
              onBack={isMobile ? handleBackToList : null}
              onInfoClick={() => activeConversation.type === 'group' && setShowGroupInfo(true)}
              onSearchClick={() => setShowSearch(true)}
            />
            <MessageList currentUser={currentUser} />
            <MessageInput conversationId={activeConversation._id} />
          </>
        ) : (
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#999', fontSize: 18,
          }}>
            Select a conversation to start chatting
          </Box>
        )}
      </Box>

      {/* Modals */}
      {showGroupModal && (
        <CreateGroupModal open={showGroupModal} onClose={() => setShowGroupModal(false)} />
      )}
      {showGroupInfo && activeConversation?.type === 'group' && (
        <GroupInfoPanel
          open={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          conversation={activeConversation}
        />
      )}
      {showSearch && (
        <SearchPanel open={showSearch} onClose={() => setShowSearch(false)} />
      )}
    </Box>
  );
};

export default ChatContainer;
