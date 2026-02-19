
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, TextField, InputAdornment, Box, Typography, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { fetchEmployeeList, createDirectConversation } from '../../features/chat/chatSlice';

const NewChatModal = ({ open, onClose, onSelectConversation }) => {
  const dispatch = useDispatch();
  const { employees, onlineUsers } = useSelector(state => state.chat);
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;

  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  const filtered = employees.filter(emp => {
    if (emp._id === currentUser?.id) return false;
    if (!search) return true;
    return emp.name?.toLowerCase().includes(search.toLowerCase()) ||
           emp.email?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = async (emp) => {
    const result = await dispatch(createDirectConversation(emp._id));
    if (result.payload?.data) {
      onSelectConversation(result.payload.data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>New Chat</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Search employees..."
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
        </Box>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>No employees found</Box>
          ) : (
            filtered.map(emp => (
              <ListItem key={emp._id} button onClick={() => handleSelect(emp)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ListItemAvatar>
                  <Avatar src={emp.image} sx={{ bgcolor: '#1976d2' }}>
                    {emp.name?.[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {emp.name}
                      {onlineUsers.includes(emp._id) && (
                        <FiberManualRecordIcon sx={{ fontSize: 10, color: '#4caf50' }} />
                      )}
                    </Box>
                  }
                  secondary={emp.email}
                />
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
