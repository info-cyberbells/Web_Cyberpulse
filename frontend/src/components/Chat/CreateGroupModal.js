import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Checkbox, Box, Typography, Chip, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchEmployeeList, createGroupConversation } from '../../features/chat/chatSlice';

const CreateGroupModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector(state => state.chat);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'))?.employee;

  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

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
    await dispatch(createGroupConversation({
      groupName: groupName.trim(),
      participants: selected,
      groupDescription: description,
    }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Create Group</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2, mt: 1 }} required
        />
        <TextField
          fullWidth label="Description (optional)" value={description}
          onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} multiline rows={2}
        />

        {selected.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {selected.map(id => {
              const emp = employees.find(e => e._id === id);
              return emp ? (
                <Chip key={id} label={emp.name} size="small" onDelete={() => toggleSelect(id)} />
              ) : null;
            })}
          </Box>
        )}

        <TextField
          fullWidth size="small" placeholder="Search members..."
          value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 1 }}
        />

        <List sx={{ maxHeight: 250, overflow: 'auto' }}>
          {filtered.map(emp => (
            <ListItem key={emp._id} button onClick={() => toggleSelect(emp._id)}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
              <Checkbox checked={selected.includes(emp._id)} size="small" />
              <ListItemAvatar>
                <Avatar src={emp.image} sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 14 }}>
                  {emp.name?.[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={emp.name} secondary={emp.department || emp.email} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={!groupName.trim() || selected.length === 0}>
          Create Group ({selected.length} members)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
