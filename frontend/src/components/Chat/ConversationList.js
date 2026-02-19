import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, TextField, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Badge, IconButton, InputAdornment, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  FormControlLabel, Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { fetchArchivedConversations, deleteConversationThunk, archiveConversationThunk } from '../../features/chat/chatSlice';
import NewChatModal from './NewChatModal';

const ConversationList = ({ onSelectConversation, onCreateGroup, onOpenSearch }) => {
  const dispatch = useDispatch();
  const { conversations, archivedConversations, activeConversation, unreadCounts, onlineUsers, loading } = useSelector(state => state.chat);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteMessages, setDeleteMessages] = useState(false);
  const [hoveredConv, setHoveredConv] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;

  const filtered = conversations.filter(conv => {
    const query = search.toLowerCase();
    if (!query) return true;
    if (conv.type === 'group') return conv.groupName?.toLowerCase().includes(query);
    const other = conv.participants?.find(p => p._id !== currentUser?.id);
    return other?.name?.toLowerCase().includes(query);
  });

  const getDisplayName = (conv) => {
    if (conv.type === 'group') return conv.groupName;
    const other = conv.participants?.find(p => p._id !== currentUser?.id);
    return other?.name || 'Unknown';
  };

  const getAvatar = (conv) => {
    if (conv.type === 'group') return conv.groupImage;
    const other = conv.participants?.find(p => p._id !== currentUser?.id);
    return other?.image;
  };

  const isOtherOnline = (conv) => {
    if (conv.type === 'group') return false;
    const other = conv.participants?.find(p => p._id !== currentUser?.id);
    return other && onlineUsers.includes(other._id);
  };

  const getLastMessagePreview = (conv) => {
    if (!conv.lastMessage?.content) return 'No messages yet';
    const content = conv.lastMessage.content;
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleContextMenu = (e, conv) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, conv });
  };

  const handleMoreClick = (e, conv) => {
    e.stopPropagation();
    setContextMenu({ anchorEl: e.currentTarget, conv });
  };

  const handleDeleteClick = () => {
    if (contextMenu?.conv) {
      setDeleteConfirm(contextMenu.conv);
    }
    setContextMenu(null);
  };

  const handleArchiveClick = () => {
    if (contextMenu?.conv) {
      dispatch(archiveConversationThunk(contextMenu.conv._id));
    }
    setContextMenu(null);
  };

  const handleToggleArchived = () => {
    if (!showArchived) {
      dispatch(fetchArchivedConversations());
    }
    setShowArchived(prev => !prev);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      dispatch(deleteConversationThunk({ conversationId: deleteConfirm._id, deleteMessages }));
    }
    setDeleteConfirm(null);
    setDeleteMessages(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteMessages(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>Chats</Typography>
          <Box>
            <IconButton size="small" onClick={() => setShowNewChat(true)} title="New Chat">
              <ChatIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onCreateGroup} title="New Group">
              <GroupAddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <TextField
          fullWidth size="small" placeholder="Search conversations..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f5f5f5' } }}
        />
      </Box>

      {/* Conversation list */}
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {loading && conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>Loading...</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>No conversations yet</Box>
        ) : (
          filtered.map(conv => {
            const unread = unreadCounts[conv._id] || 0;
            const isActive = activeConversation?._id === conv._id;

            return (
              <ListItem
                key={conv._id} button
                onClick={() => onSelectConversation(conv)}
                onContextMenu={(e) => handleContextMenu(e, conv)}
                onMouseEnter={() => setHoveredConv(conv._id)}
                onMouseLeave={() => setHoveredConv(null)}
                sx={{
                  px: 2, py: 1.5, cursor: 'pointer', position: 'relative',
                  bgcolor: isActive ? '#e3f2fd' : 'transparent',
                  '&:hover': { bgcolor: isActive ? '#e3f2fd' : '#f5f5f5' },
                  borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                }}
                secondaryAction={
                  hoveredConv === conv._id ? (
                    <IconButton size="small" onClick={(e) => handleMoreClick(e, conv)}
                      sx={{ bgcolor: '#fff', boxShadow: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      isOtherOnline(conv) ? (
                        <FiberManualRecordIcon sx={{ fontSize: 12, color: '#4caf50' }} />
                      ) : null
                    }
                  >
                    <Avatar src={getAvatar(conv)} sx={{ bgcolor: conv.type === 'group' ? '#9c27b0' : '#1976d2' }}>
                      {getDisplayName(conv)?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={unread > 0 ? 700 : 500} noWrap sx={{ flex: 1 }}>
                        {getDisplayName(conv)}
                      </Typography>
                      <Typography variant="caption" color={unread > 0 ? 'primary' : 'text.secondary'} sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                        {formatTime(conv.lastMessage?.timestamp || conv.updatedAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                        {getLastMessagePreview(conv)}
                      </Typography>
                      {unread > 0 && (
                        <Chip label={unread > 99 ? '99+' : unread} size="small" color="primary"
                          sx={{ height: 20, minWidth: 20, fontSize: 11, ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })
        )}
      </List>

      {/* Archived section toggle */}
      <Box
        onClick={handleToggleArchived}
        sx={{
          display: 'flex', alignItems: 'center', px: 2, py: 1.2,
          cursor: 'pointer', borderTop: '1px solid #e0e0e0',
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
      >
        <ArchiveIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1, color: '#666' }}>
          Archived
        </Typography>
        {archivedConversations.length > 0 && (
          <Chip label={archivedConversations.length} size="small" sx={{ height: 18, fontSize: 10, mr: 1 }} />
        )}
        {showArchived ? <ExpandLessIcon sx={{ color: '#666' }} /> : <ExpandMoreIcon sx={{ color: '#666' }} />}
      </Box>

      {/* Archived conversations list */}
      {showArchived && (
        <List sx={{ overflow: 'auto', p: 0, bgcolor: '#fafafa', maxHeight: 300 }}>
          {archivedConversations.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: '#999', fontSize: 13 }}>No archived chats</Box>
          ) : (
            archivedConversations.map(conv => (
              <ListItem
                key={conv._id} button
                onClick={() => onSelectConversation(conv)}
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, conv, isArchived: true }); }}
                onMouseEnter={() => setHoveredConv(conv._id)}
                onMouseLeave={() => setHoveredConv(null)}
                sx={{
                  px: 2, py: 1, cursor: 'pointer', position: 'relative',
                  '&:hover': { bgcolor: '#f0f0f0' },
                }}
                secondaryAction={
                  hoveredConv === conv._id ? (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setContextMenu({ anchorEl: e.currentTarget, conv, isArchived: true }); }}
                      sx={{ bgcolor: '#fff', boxShadow: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar src={getAvatar(conv)} sx={{ bgcolor: conv.type === 'group' ? '#9c27b0' : '#1976d2', width: 36, height: 36 }}>
                    {getDisplayName(conv)?.[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={500} noWrap>{getDisplayName(conv)}</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary" noWrap>{getLastMessagePreview(conv)}</Typography>}
                />
              </ListItem>
            ))
          )}
        </List>
      )}

      {showNewChat && (
        <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} onSelectConversation={onSelectConversation} />
      )}

      {/* Context menu for conversations (right-click or hover icon) */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        {...(contextMenu?.anchorEl
          ? { anchorEl: contextMenu.anchorEl }
          : {
              anchorReference: 'anchorPosition',
              anchorPosition: contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined,
            }
        )}
      >
        {contextMenu?.isArchived ? (
          <MenuItem onClick={handleArchiveClick} sx={{ fontSize: 13 }}>
            <UnarchiveIcon sx={{ fontSize: 16, mr: 1 }} /> Unarchive Chat
          </MenuItem>
        ) : (
          <MenuItem onClick={handleArchiveClick} sx={{ fontSize: 13 }}>
            <ArchiveIcon sx={{ fontSize: 16, mr: 1 }} /> Archive Chat
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick} sx={{ fontSize: 13, color: 'error.main' }}>
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} /> Delete Chat
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={handleCancelDelete}>
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            Are you sure you want to delete this chat?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteMessages}
                onChange={(e) => setDeleteMessages(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Also delete all messages for me (new messages will start fresh)
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationList;
