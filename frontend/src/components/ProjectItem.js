import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Tooltip,
  alpha
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { format } from 'date-fns';
import { removeProject, fetchProjects } from '../features/projects/projectsSlice';
import ProjectForm from './ProjectForm';

const ProjectItem = ({ project }) => {
  const dispatch = useDispatch();
  const [showEditForm, setShowEditForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleCancelEdit = () => setShowEditForm(false);
  const toggleExpanded = () => setExpanded(!expanded);

  const handleDelete = async () => {
    try {
      await dispatch(removeProject(project._id)).unwrap();
      dispatch(fetchProjects());
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'work in progress':
        return {
          color: '#FF9800',
          label: 'In Progress'
        };
      case 'delayed':
        return {
          color: '#F44336',
          label: 'Delayed'
        };
      case 'completed':
        return {
          color: '#4CAF50',
          label: 'Completed'
        };
      case 'paused':
        return {
          color: '#9E9E9E',
          label: 'Paused'
        };
      default:
        return {
          color: '#2196F3',
          label: status
        };
    }
  };

  const status = project.status.length > 0 ? project.status[0].name : 'Unknown';
  const statusConfig = getStatusConfig(status);

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const today = new Date();
    const deadline = new Date(project.deliveryDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <>
      <Box
        sx={{
          maxWidth: "100%",
          borderRadius: '16px',
          background: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          mb: 3,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        {/* Project header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ maxWidth: '75%' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#111', lineHeight: 1.2 }}>
                {project.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessRoundedIcon sx={{ fontSize: 16, mr: 0.75, color: '#666' }} />
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                  {project.clientName}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={statusConfig.label}
              sx={{
                borderRadius: '20px',
                height: '28px',
                backgroundColor: alpha(statusConfig.color, 0.12),
                color: statusConfig.color,
                border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                '& .MuiChip-label': {
                  px: 1.5,
                }
              }}
            />
          </Box>

          {/* Description with expand/collapse */}
          <Box sx={{
            mb: 2,
            maxHeight: expanded ? 'none' : '48px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'max-height 0.3s ease',
            pr: expanded ? 0 : 6
          }}>
            <Typography
              variant="body2"
              sx={{
                color: '#555',
                lineHeight: 1.6,
                fontSize: '0.875rem',
              }}
            >
              {project.description}
            </Typography>

            {!expanded && project.description.length > 120 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '80px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                <IconButton
                  size="small"
                  onClick={toggleExpanded}
                  sx={{
                    backgroundColor: '#f0f0f0',
                    width: '28px',
                    height: '28px',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    }
                  }}
                >
                  <ExpandMoreRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {expanded && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={toggleExpanded}
                  sx={{
                    backgroundColor: '#f0f0f0',
                    width: '28px',
                    height: '28px',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    }
                  }}
                >
                  <ExpandLessRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Project metadata */}
          <Box sx={{
            p: 2,
            backgroundColor: '#f9fafc',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#444', fontWeight: 600, fontSize: '0.8rem' }}>
                PROJECT DETAILS
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#5E35B1', mr: 1.5 }} />
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', fontWeight: 500 }}>
                    Tech: {project.technology.map(tech => tech.name).join(', ')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#00897B', mr: 1.5 }} />
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', fontWeight: 500 }}>
                    Department: {project.department}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#444', fontWeight: 600, fontSize: '0.8rem' }}>
                TIMELINE
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 14, mr: 1.5, color: '#1976D2' }} />
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', fontWeight: 500 }}>
                    Started: {format(new Date(project.startDate), 'MMM d, yyyy')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 14, mr: 1.5, color: daysRemaining < 0 ? '#F44336' : '#E65100' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: daysRemaining < 0 ? '#666' : '#666',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                  >
                    Due: {format(new Date(project.deliveryDate), 'MMM d, yyyy')}
                    {daysRemaining > 0 ? ` (${daysRemaining} days left)` :
                      daysRemaining === 0 ? ' (Due today)' :
                        ``}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Team section */}
          <Box sx={{ mt: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#555',
                fontSize: '0.75rem',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Team Members
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {project.assignedTo.map((person, index) => (
                // <Tooltip key={index} title={person.name} arrow>
                <Chip
                  label={person.name}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: '#EDE7F6',
                    color: '#5E35B1',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                />
                // </Tooltip>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Actions footer */}
        {isAuthenticated && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f0f0f0',
            p: 2
          }}>
            <Button
              startIcon={<EditRoundedIcon />}
              onClick={() => setShowEditForm(true)}
              sx={{
                mr: 1.5,
                color: '#5E35B1',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: alpha('#5E35B1', 0.08),
                }
              }}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteOutlineRoundedIcon />}
              color="error"
              onClick={() => setShowDeleteDialog(true)}
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: alpha('#F44336', 0.08),
                }
              }}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {/* Edit Modal */}
      <Modal
        open={showEditForm}
        onClose={handleCancelEdit}
        aria-labelledby="modal-edit-project"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 24px 40px rgba(0, 0, 0, 0.2)',
            p: { xs: 2, sm: 3 },
            outline: 'none'
          }}
        >
          <IconButton
            onClick={handleCancelEdit}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#666',
              backgroundColor: '#f0f0f0',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              }
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Box sx={{ pt: 1 }}>
            <ProjectForm project={project} onSubmit={handleCancelEdit} onCancel={handleCancelEdit} />
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            px: 1
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          fontSize: '1.25rem'
        }}>
          Delete Project
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#555' }}>
            Are you sure you want to delete the project "<strong>{project.name}</strong>"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: '8px',
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectItem;