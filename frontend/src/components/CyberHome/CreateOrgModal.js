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
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';

const CreateOrgModal = ({ open, onClose }) => {
  const [form, setForm] = useState({
    orgName: '',
    adminName: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    console.log('New Organisation:', form);
    setForm({ orgName: '', adminName: '', email: '', phone: '', address: '', industry: '' });
    onClose();
  };

  const handleCancel = () => {
    setForm({ orgName: '', adminName: '', email: '', phone: '', address: '', industry: '' });
    onClose();
  };

  const fieldSx = {
    '& label.Mui-focused': { color: '#2563eb' },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': { borderColor: '#3b82f6' },
      '&.Mui-focused fieldset': { borderColor: '#2563eb' },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BusinessIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '18px', color: 'white', fontFamily: "'Inter', sans-serif" }}>
                Create New Organisation
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>
                Your Organisation, Your Rules — Built to Scale.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Form */}
      <DialogContent sx={{ px: 3, pt: '24px !important', pb: 1 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              label="Organisation Name"
              name="orgName"
              value={form.orgName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Admin Name"
              name="adminName"
              value={form.adminName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Industry / Type"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="medium"
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            borderColor: '#2563eb', color: '#2563eb',
            borderRadius: '8px', fontWeight: 600,
            textTransform: 'none', px: 3, py: 1,
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
            backgroundColor: '#2563eb', color: 'white',
            borderRadius: '8px', fontWeight: 600,
            textTransform: 'none', px: 3, py: 1,
            fontFamily: "'Inter', sans-serif",
            '&:hover': { backgroundColor: '#1d4ed8', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' },
          }}
        >
          Create Organisation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrgModal;
