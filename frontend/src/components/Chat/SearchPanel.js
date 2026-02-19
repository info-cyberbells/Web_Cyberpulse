import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer, Box, Typography, TextField, IconButton, List, ListItem,
  ListItemText, InputAdornment, CircularProgress, Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { searchMessages, clearSearchResults, setActiveConversation } from '../../features/chat/chatSlice';

const SearchPanel = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { searchResults, activeConversation } = useSelector(state => state.chat);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    await dispatch(searchMessages({
      query: query.trim(),
      conversationId: activeConversation?._id,
    }));
    setSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClose = () => {
    dispatch(clearSearchResults());
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{ sx: { width: 360 } }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Search Messages</Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>

        <TextField
          fullWidth size="small" placeholder="Search..."
          value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} autoFocus
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearch}>
                  {searching ? <CircularProgress size={18} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <List sx={{ mt: 2 }}>
          {searchResults.length === 0 && query && !searching ? (
            <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>No results found</Box>
          ) : (
            searchResults.map(msg => (
              <ListItem key={msg._id} sx={{
                cursor: 'pointer', borderRadius: 1, mb: 0.5,
                '&:hover': { bgcolor: '#f5f5f5' },
              }}>
                <Avatar src={msg.senderId?.image} sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#1976d2', fontSize: 13 }}>
                  {msg.senderId?.name?.[0]?.toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={600}>{msg.senderId?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {msg.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SearchPanel;
