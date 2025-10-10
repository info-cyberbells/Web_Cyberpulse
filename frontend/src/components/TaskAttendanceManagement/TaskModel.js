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
} from '@mui/material';
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Enter task description *"
          style={{ height: '200px', marginBottom: '50px' }}
        />

        {/* Timer and Project in same row */}
        <Grid container spacing={3} sx={{ mb: 2 }}>

          {/* Project Section - Right Half */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Project
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="project-select-label">Select Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProjectId}
                  onChange={(e) => onProjectChange(e.target.value)}
                  disabled={loading}
                  label="Select Project"
                >
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects?.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Timer Section - Left Half */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Estimated Time
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Hours"
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => {
                      let value = parseInt(e.target.value) || 0;
                      // Enforce limits: 0-23 hours
                      value = Math.min(23, Math.max(0, value));
                      onEstimatedHoursChange(value);
                    }}
                    onInput={(e) => {
                      // Real-time input restriction
                      if (e.target.value > 23) e.target.value = 23;
                      if (e.target.value < 0) e.target.value = 0;
                    }}
                    disabled={loading}
                    placeholder="0"
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null || e.target.value < 0) {
                        onEstimatedHoursChange(0);
                      } else if (e.target.value > 23) {
                        onEstimatedHoursChange(23);
                      }
                    }}
                    inputProps={{
                      min: 0,
                      max: 23,
                      step: 1
                    }}
                    helperText="Max 23 hours"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Minutes"
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => {
                      let value = parseInt(e.target.value) || 0;
                      // Enforce limits: 0-59 minutes
                      value = Math.min(59, Math.max(0, value));
                      onEstimatedMinutesChange(value);
                    }}
                    onInput={(e) => {
                      // Real-time input restriction
                      if (e.target.value > 59) e.target.value = 59;
                      if (e.target.value < 0) e.target.value = 0;
                    }}
                    disabled={loading}
                    placeholder="0"
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null || e.target.value < 0) {
                        onEstimatedMinutesChange(0);
                      } else if (e.target.value > 59) {
                        onEstimatedMinutesChange(59);
                      }
                    }}
                    inputProps={{
                      min: 0,
                      max: 59,
                      step: 1
                    }}
                    helperText="Max 59 minutes"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Custom Project Name Field */}
        {selectedProjectId === "other" && (
          <TextField
            fullWidth
            label="Enter Project Name *"
            value={customProjectName}
            onChange={(e) => onCustomProjectNameChange(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            placeholder="Type custom project name"
            size="small"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
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
        >
          {loading ? (
            <CircularProgress size={24} />
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