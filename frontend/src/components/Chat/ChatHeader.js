import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, IconButton, Avatar, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ChatHeader = ({ conversation, currentUser, onBack, onInfoClick, onSearchClick }) => {
  const { onlineUsers, typingUsers } = useSelector(state => state.chat);

  const getDisplayName = () => {
    if (conversation.type === 'group') return conversation.groupName;
    const other = conversation.participants?.find(p => p._id !== currentUser?.id);
    return other?.name || 'Unknown';
  };

  const getAvatar = () => {
    if (conversation.type === 'group') return conversation.groupImage;
    const other = conversation.participants?.find(p => p._id !== currentUser?.id);
    return other?.image;
  };

  const getStatus = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants?.length || 0} members`;
    }
    const other = conversation.participants?.find(p => p._id !== currentUser?.id);
    if (other && onlineUsers.includes(other._id)) return 'Online';
    return 'Offline';
  };

  const typingInConv = (typingUsers[conversation._id] || []).filter(id => id !== currentUser?.id);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', px: 2, py: 1.5,
      borderBottom: '1px solid #e0e0e0', bgcolor: '#fff', minHeight: 64,
    }}>
      {onBack && (
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Avatar src={getAvatar()} sx={{ width: 40, height: 40, mr: 1.5, bgcolor: '#1976d2' }}>
        {getDisplayName()?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {getDisplayName()}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {typingInConv.length > 0 ? (
            <span style={{ color: '#4caf50', fontStyle: 'italic' }}>typing...</span>
          ) : getStatus()}
        </Typography>
      </Box>
      <IconButton onClick={onSearchClick}><SearchIcon /></IconButton>
      {conversation.type === 'group' && (
        <IconButton onClick={onInfoClick}><InfoOutlinedIcon /></IconButton>
      )}
    </Box>
  );
};

export default ChatHeader;
