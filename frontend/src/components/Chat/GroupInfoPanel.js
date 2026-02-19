import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Drawer, Box, Typography, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Chip, Divider, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import apiClient from '../../services/api';
import { fetchConversations, setActiveConversation, fetchConversationById } from '../../features/chat/chatSlice';

const GroupInfoPanel = ({ open, onClose, conversation }) => {
  const dispatch = useDispatch();
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const isAdmin = conversation.admins?.some(a => (a._id || a) === currentUser?.id);
  const headers = { Authorization: `Bearer ${token}` };

  const handleRemoveMember = async (memberId) => {
    try {
      await apiClient.post('/chat/groups/remove-member', {
        conversationId: conversation._id, memberId,
      }, { headers });
      dispatch(fetchConversations());
      dispatch(fetchConversationById(conversation._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async (memberId) => {
    try {
      await apiClient.post('/chat/groups/promote', {
        conversationId: conversation._id, memberId,
      }, { headers });
      dispatch(fetchConversations());
      dispatch(fetchConversationById(conversation._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await apiClient.post('/chat/groups/leave', {
        conversationId: conversation._id,
      }, { headers });
      dispatch(setActiveConversation(null));
      dispatch(fetchConversations());
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const adminIds = conversation.admins?.map(a => a._id || a) || [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 360 } }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Group Info</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar src={conversation.groupImage} sx={{ width: 80, height: 80, bgcolor: '#9c27b0', fontSize: 32, mb: 1 }}>
            {conversation.groupName?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={600}>{conversation.groupName}</Typography>
          {conversation.groupDescription && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              {conversation.groupDescription}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {conversation.participants?.length} members
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Members ({conversation.participants?.length})
        </Typography>

        <List dense>
          {conversation.participants?.map(member => {
            const memberId = member._id || member;
            const memberName = member.name || 'Unknown';
            const isMemberAdmin = adminIds.includes(memberId);
            const isMe = memberId === currentUser?.id;

            return (
              <ListItem key={memberId} secondaryAction={
                isAdmin && !isMe ? (
                  <Box>
                    <IconButton size="small" onClick={() => handlePromote(memberId)} title="Make Admin">
                      <AdminPanelSettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveMember(memberId)} title="Remove">
                      <PersonRemoveIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                ) : null
              }>
                <ListItemAvatar>
                  <Avatar src={member.image} sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 13 }}>
                    {memberName[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {memberName} {isMe && '(You)'}
                      {isMemberAdmin && <Chip label="Admin" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
                    </Box>
                  }
                  secondary={member.email}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth variant="outlined" color="error"
          startIcon={<ExitToAppIcon />}
          onClick={handleLeaveGroup}
        >
          Leave Group
        </Button>
      </Box>
    </Drawer>
  );
};

export default GroupInfoPanel;
