import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DemoPage = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    console.log('Demo Request:', form);
    setForm({ name: '', email: '', phone: '', description: '' });
    onClose();
  };

  const handleCancel = () => {
    setForm({ name: '', email: '', phone: '', description: '' });
    onClose();
  };

  const fieldSx = {
    '& label.Mui-focused': { color: '#2563eb' },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': { borderColor: '#3b82f6' },
      '&.Mui-focused fieldset': { borderColor: '#2563eb' },
    },
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#2563eb',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
          borderRadius: '16px 16px 0 0',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '20px', fontFamily: "'Inter', sans-serif" }}>
          Book a Demo
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white', p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: '24px !important', pb: 1 }}>
        <Typography sx={{ color: '#64748b', fontSize: '14px', mb: 2.5, fontFamily: "'Inter', sans-serif" }}>
          Fill in your details and our team will get back to you shortly.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="medium"
            sx={fieldSx}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="medium"
            sx={fieldSx}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="medium"
            sx={fieldSx}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            sx={fieldSx}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            borderColor: '#2563eb',
            color: '#2563eb',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            fontFamily: "'Inter', sans-serif",
            '&:hover': { borderColor: '#1d4ed8', backgroundColor: 'rgba(37,99,235,0.05)' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            fontFamily: "'Inter', sans-serif",
            '&:hover': { backgroundColor: '#1d4ed8', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DemoPage;
