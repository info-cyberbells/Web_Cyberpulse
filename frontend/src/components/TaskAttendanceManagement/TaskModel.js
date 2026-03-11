import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Grid,
  Typography,
  IconButton,
  Stack,
  Divider,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  FolderOpen as FolderIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const TaskModel = ({
  open,
  onClose,
  title,
  value,
  onChange,
  onSubmit,
  loading,
  isEdit,
  projects,
  selectedProjectId,
  onProjectChange,
  customProjectName,
  onCustomProjectNameChange,
  estimatedHours,
  onEstimatedHoursChange,
  estimatedMinutes,
  onEstimatedMinutesChange,
}) => {
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
  ];

  const handleSubmit = () => {
    const html = quillRef.current.getEditor().root.innerHTML;
    const plainText = quillRef.current.getEditor().getText().trim();
    onSubmit(html, plainText);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
          py: 2,
          px: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEdit ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {isEdit ? 'Update the task details below' : 'Fill in the details to create a new task'}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '24px !important', px: 3, pb: 2 }}>
        {/* Description Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            Description <Typography component="span" color="error.main">*</Typography>
          </Typography>
          <Box
            sx={{
              '& .ql-toolbar': {
                borderRadius: '10px 10px 0 0',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              },
              '& .ql-container': {
                borderRadius: '0 0 10px 10px',
                borderColor: 'divider',
                fontSize: '0.95rem',
              },
              '& .ql-editor': {
                minHeight: '160px',
              },
              '& .ql-editor.ql-blank::before': {
                fontStyle: 'normal',
                color: '#aaa',
              },
            }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={value}
              onChange={onChange}
              modules={modules}
              formats={formats}
              placeholder="Describe your task here..."
            />
          </Box>
        </Box>

        {/* Project & Time Section */}
        <Grid container spacing={3}>
          {/* Project Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                height: '100%',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <FolderIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Project
                </Typography>
              </Stack>
              <FormControl fullWidth size="small">
                <InputLabel id="project-select-label">Select Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProjectId}
                  onChange={(e) => onProjectChange(e.target.value)}
                  disabled={loading}
                  label="Select Project"
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects?.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">+ Other</MenuItem>
                </Select>
              </FormControl>

              {/* Custom Project Name */}
              {selectedProjectId === "other" && (
                <TextField
                  fullWidth
                  label="Enter Project Name *"
                  value={customProjectName}
                  onChange={(e) => onCustomProjectNameChange(e.target.value)}
                  disabled={loading}
                  sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  placeholder="Type custom project name"
                  size="small"
                />
              )}
            </Box>
          </Grid>

          {/* Time Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.03),
                height: '100%',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <TimerIcon sx={{ fontSize: '1.1rem', color: 'warning.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Estimated Time
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Hours"
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      val = Math.min(23, Math.max(0, val));
                      onEstimatedHoursChange(val);
                    }}
                    onInput={(e) => {
                      if (e.target.value > 23) e.target.value = 23;
                      if (e.target.value < 0) e.target.value = 0;
                    }}
                    disabled={loading}
                    placeholder="0"
                    onFocus={(e) => {
                      if (e.target.value === '0') e.target.select();
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null || e.target.value < 0) {
                        onEstimatedHoursChange(0);
                      } else if (e.target.value > 23) {
                        onEstimatedHoursChange(23);
                      }
                    }}
                    inputProps={{ min: 0, max: 23, step: 1 }}
                    helperText="Max 23 hours"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Minutes"
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      val = Math.min(59, Math.max(0, val));
                      onEstimatedMinutesChange(val);
                    }}
                    onInput={(e) => {
                      if (e.target.value > 59) e.target.value = 59;
                      if (e.target.value < 0) e.target.value = 0;
                    }}
                    disabled={loading}
                    placeholder="0"
                    onFocus={(e) => {
                      if (e.target.value === '0') e.target.select();
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null || e.target.value < 0) {
                        onEstimatedMinutesChange(0);
                      } else if (e.target.value > 59) {
                        onEstimatedMinutesChange(59);
                      }
                    }}
                    inputProps={{ min: 0, max: 59, step: 1 }}
                    helperText="Max 59 minutes"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 3,
            py: 1,
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.400' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            (!isEdit && (
              !selectedProjectId ||
              (selectedProjectId === "other" && !customProjectName.trim()) ||
              (estimatedHours === 0 && estimatedMinutes === 0)
            ))
          }
          startIcon={
            loading ? null : isEdit ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.35)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.45)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: '#fff' }} />
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Add Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModel;
