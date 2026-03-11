import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, TextField, InputAdornment, Box, Typography, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { fetchEmployeeList, createDirectConversation } from '../../features/chat/chatSlice';

const avatarColors = ['#1976d2', '#e91e63', '#9c27b0', '#ff5722', '#009688', '#ff9800'];

const NewChatModal = ({ open, onClose, onSelectConversation }) => {
  const dispatch = useDispatch();
  const { employees, onlineUsers } = useSelector(state => state.chat);
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;

  useEffect(() => {
    if (open) dispatch(fetchEmployeeList());
  }, [dispatch, open]);

  const filtered = employees.filter(emp => {
    if (emp._id === currentUser?.id) return false;
    if (!search) return true;
    return emp.name?.toLowerCase().includes(search.toLowerCase()) ||
           emp.email?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (emp) => {
    dispatch(createDirectConversation(emp._id)).then((result) => {
      if (result.payload?.data) {
        onSelectConversation(result.payload.data);
      }
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: '16px' },
          maxHeight: '85vh',
          m: { xs: 0, sm: 2 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          width: { xs: '100%', sm: 'auto' },
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #14B8A6 0%, #0284C7 100%)',
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutlineIcon />
          <Typography variant="h6" fontWeight={700}>New Message</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                bgcolor: '#f5f5f5',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: '#ddd' },
                '&.Mui-focused fieldset': { borderColor: '#14B8A6' },
              }
            }}
          />
        </Box>

        {/* Employee list */}
        <List sx={{ maxHeight: 420, overflow: 'auto', py: 0 }}>
          {filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#bbb' }}>
              <Typography variant="body2">No employees found</Typography>
            </Box>
          ) : (
            filtered.map((emp, idx) => {
              const isOnline = onlineUsers.includes(emp._id);
              const color = avatarColors[idx % avatarColors.length];
              return (
                <ListItem
                  key={emp._id}
                  button
                  onClick={() => handleSelect(emp)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    py: 1.3,
                    px: 2,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 54 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={emp.image}
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: color,
                          fontSize: 17,
                          fontWeight: 700,
                        }}
                      >
                        {emp.name?.[0]?.toUpperCase()}
                      </Avatar>
                      {isOnline && (
                        <FiberManualRecordIcon
                          sx={{
                            position: 'absolute',
                            bottom: 1,
                            right: 1,
                            fontSize: 12,
                            color: '#4caf50',
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                        {emp.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {emp.department || emp.email}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
