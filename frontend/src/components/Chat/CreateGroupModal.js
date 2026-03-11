import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Box, Typography,
  IconButton, InputAdornment, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { fetchEmployeeList, createGroupConversation } from '../../features/chat/chatSlice';

const CreateGroupModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector(state => state.chat);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(1); // Step 1: Select users, Step 2: Group details
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;

  useEffect(() => {
    if (open) dispatch(fetchEmployeeList());
  }, [dispatch, open]);

  const filtered = employees.filter(emp => {
    if (emp._id === currentUser?.id) return false;
    if (!search) return true;
    return emp.name?.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelect = (empId) => {
    setSelected(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length === 0) return;
    dispatch(createGroupConversation({
      groupName: groupName.trim(),
      participants: selected,
      groupDescription: description,
    }));
    handleClose();
  };

  const handleClose = () => {
    setGroupName('');
    setDescription('');
    setSelected([]);
    setSearch('');
    setStep(1);
    onClose();
  };

  const avatarColors = ['#1976d2', '#e91e63', '#9c27b0', '#ff5722', '#009688', '#ff9800'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: '16px' },
          maxHeight: '90vh',
          height: { xs: '85vh', sm: '75vh' },
          m: { xs: 0, sm: 2 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          width: { xs: '100%', sm: 'auto' },
          display: 'flex',
          flexDirection: 'column',
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
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {step === 2 && (
            <IconButton onClick={() => setStep(1)} sx={{ color: 'white', mr: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <GroupAddIcon />
          <Typography variant="h6" fontWeight={700}>
            {step === 1 ? 'Select Members' : 'Group Details'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* STEP 1: Select Users */}
      {step === 1 && (
        <>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            {/* Search bar */}
            <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '24px', bgcolor: '#f5f5f5' }
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

            {/* Selected chips row */}
            {selected.length > 0 && (
              <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                {selected.map((id) => {
                  const emp = employees.find(e => e._id === id);
                  return emp ? (
                    <Box
                      key={id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        border: '1.5px solid #1976d2',
                        borderRadius: '20px',
                        px: 1.5,
                        py: 0.4,
                        bgcolor: 'rgba(25,118,210,0.06)',
                      }}
                    >
                      <Typography sx={{ color: '#1976d2', fontWeight: 600, fontSize: '0.82rem' }}>
                        {emp.name?.split(' ')[0]}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleSelect(id)}
                        sx={{ p: 0, ml: 0.3, color: '#1976d2', width: 18, height: 18 }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ) : null;
                })}
                <Button
                  size="small"
                  onClick={() => setSelected([])}
                  sx={{ color: '#666', fontSize: '0.82rem', textTransform: 'none', ml: 0.5 }}
                >
                  Clear
                </Button>
              </Box>
            )}

            {/* Employee list - takes all remaining space */}
            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
              {filtered.map((emp, idx) => {
                const isSelected = selected.includes(emp._id);
                const color = avatarColors[idx % avatarColors.length];
                return (
                  <ListItem
                    key={emp._id}
                    button
                    onClick={() => toggleSelect(emp._id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(25,118,210,0.06)' : 'white',
                      '&:hover': { bgcolor: isSelected ? 'rgba(25,118,210,0.1)' : '#f8f8f8' },
                      py: 1.2,
                      px: 2,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 50 }}>
                      <Avatar
                        src={emp.image}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: color,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {emp.name?.[0]?.toUpperCase()}
                      </Avatar>
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
                    <Box sx={{ ml: 1 }}>
                      {isSelected
                        ? <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                        : <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 24 }} />
                      }
                    </Box>
                  </ListItem>
                );
              })}
              {filtered.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>
                  No employees found
                </Box>
              )}
            </List>
          </DialogContent>

          {/* Next button */}
          <DialogActions sx={{ p: 2, pt: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '12px',
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #14B8A6 0%, #0284C7 100%)',
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(20, 184, 166, 0.4)',
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#aaa',
                }
              }}
            >
              {selected.length > 0
                ? `Next - ${selected.length} member${selected.length > 1 ? 's' : ''} selected`
                : 'Select members to continue'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* STEP 2: Group Details */}
      {step === 2 && (
        <>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', flex: 1 }}>
            <Box
              sx={{
                px: 3,
                pt: 0.5,
                pb: 0.5,
                background: 'linear-gradient(135deg, #14B8A6 0%, #0284C7 100%)',
                borderRadius: 0,
              }}
            />
            <Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: 'white' }}>
              <Typography variant="overline" sx={{ color: '#888', fontWeight: 700, letterSpacing: 1.2 }}>
                GROUP NAME *
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Design Team"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                sx={{
                  mt: 0.5,
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' },
                  }
                }}
              />

              <Typography variant="overline" sx={{ color: '#888', fontWeight: 700, letterSpacing: 1.2 }}>
                DESCRIPTION (OPTIONAL)
              </Typography>
              <TextField
                fullWidth
                placeholder="What's this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                sx={{
                  mt: 0.5,
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f8f8f8',
                    '&.Mui-focused fieldset': { borderColor: '#14B8A6' },
                  }
                }}
              />

              <Divider sx={{ mb: 2 }} />

              <Typography variant="overline" sx={{ color: '#888', fontWeight: 700, letterSpacing: 1.2 }}>
                {selected.length} MEMBERS SELECTED
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 1, flexWrap: 'wrap' }}>
                {selected.map((id, idx) => {
                  const emp = employees.find(e => e._id === id);
                  return emp ? (
                    <Box key={id} sx={{ textAlign: 'center', position: 'relative' }}>
                      <Avatar
                        src={emp.image}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: avatarColors[idx % avatarColors.length],
                          fontSize: 16,
                          fontWeight: 700,
                          mx: 'auto',
                        }}
                      >
                        {emp.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <IconButton
                        size="small"
                        onClick={() => {
                          toggleSelect(id);
                          if (selected.length <= 1) setStep(1);
                        }}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          bgcolor: '#f44336',
                          color: 'white',
                          '&:hover': { bgcolor: '#d32f2f' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#555', display: 'block', mt: 0.5 }}>
                        {emp.name?.split(' ')[0]}
                      </Typography>
                    </Box>
                  ) : null;
                })}
              </Box>
            </Box>
          </DialogContent>

          {/* Create button */}
          <DialogActions sx={{ p: 2, pt: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCreate}
              disabled={!groupName.trim() || selected.length === 0}
              sx={{
                borderRadius: '12px',
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #14B8A6 0%, #0284C7 100%)',
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(20, 184, 166, 0.4)',
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#aaa',
                }
              }}
            >
              Create Group
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default CreateGroupModal;
