import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import parse from 'html-react-parser';

const TaskModal = ({ task, onEdit, onDelete }) => {
  const [openModal, setOpenModal] = useState(false);

  if (!task || !task.description) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "paused":
        return "#757575";
      case "pending":
        return "#ed6c02";
      case "in progress":
        return "#1976d2";
      default:
        return "#757575";
    }
  };

  const truncatedDescription = task.description && task.description.length > 60
    ? `${task.description.substring(0, 60)}...`
    : task.description || '';

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{
                wordBreak: "break-word",
                cursor: task.description && task.description.length > 20 ? 'pointer' : 'default'
              }}
              onClick={task.description && task.description.length > 20 ? handleOpenModal : undefined}
            >
              {parse(truncatedDescription)}
              {task.description && task.description.length > 20 && (
                <Typography
                  component="span"
                  color="primary"
                  sx={{
                    display: 'inline-block',
                    ml: 1,
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  See More
                </Typography>
              )}
            </Typography>
            <Box>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(task)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(task._id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} mb={2}>
            <Typography
              variant="body2"
              sx={{
                color: "#fff",
                padding: "7px 14px",
                backgroundColor: getStatusColor(task.status),
                display: "inline-block",
                borderRadius: "4px",
                textTransform: "capitalize",
              }}
            >
              {task.status}
            </Typography>
          </Stack>

          {/* ADD THIS SECTION - Project Name and Time */}
          <Box sx={{ mb: 2 }}>
            {task.projectName && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Project:</strong> {task.projectName}
              </Typography>
            )}
            {(task.estimatedHours > 0 || task.estimatedMinutes > 0) && (
              <Typography variant="body2" color="text.secondary">
                <strong>Estimated Time:</strong> {task.estimatedHours || 0}h {task.estimatedMinutes || 0}m
              </Typography>
            )}
          </Box>

          <Divider />
          <Typography
            variant="caption"
            display="block"
            mt={2}
            color="text.secondary"
          >
            Created: {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}
          </Typography>
        </CardContent>
      </Card>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Task Description
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Description:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {parse(task.description)}
            </Typography>
          </Box>

          {task.projectName && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Project:
              </Typography>
              <Typography variant="body1">
                {task.projectName}
              </Typography>
            </Box>
          )}

          {(task.estimatedHours > 0 || task.estimatedMinutes > 0) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Estimated Time:
              </Typography>
              <Typography variant="body1">
                {task.estimatedHours || 0} hours {task.estimatedMinutes || 0} minutes
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Status:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#fff",
                padding: "7px 14px",
                backgroundColor: getStatusColor(task.status),
                display: "inline-block",
                borderRadius: "4px",
                textTransform: "capitalize",
              }}
            >
              {task.status}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskModal;