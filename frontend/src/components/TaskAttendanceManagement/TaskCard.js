import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Timer as TimerIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import parse from 'html-react-parser';

const statusConfig = {
  'in progress': {
    color: '#1976d2',
    bgColor: '#e3f2fd',
    borderColor: '#1976d2',
    chipColor: 'primary',
    label: 'In Progress',
  },
  'completed': {
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    borderColor: '#2e7d32',
    chipColor: 'success',
    label: 'Completed',
  },
  'paused': {
    color: '#ed6c02',
    bgColor: '#fff3e0',
    borderColor: '#ed6c02',
    chipColor: 'warning',
    label: 'Paused',
  },
  'pending': {
    color: '#757575',
    bgColor: '#f5f5f5',
    borderColor: '#bdbdbd',
    chipColor: 'default',
    label: 'Pending',
  },
};

const TaskCard = ({
  task,
  isPreviousTask,
  loading,
  activeTaskId,
  expandedTasks,
  setExpandedTasks,
  formatDuration,
  taskTimers,
  handleTaskAction,
  handleEditTask,
  handleDeleteTask,
  currentAttendance,
}) => {
  const status = (task?.status || 'pending').toLowerCase();
  const isActive = task._id === activeTaskId;
  const config = statusConfig[status] || statusConfig['pending'];

  if (!task) return null;

  // Calculate progress percentage
  const currentDuration = taskTimers[task._id]?.totalDuration || task.duration || 0;
  const estimatedSeconds = ((task.estimatedHours || 0) * 3600) + ((task.estimatedMinutes || 0) * 60);
  const progressPercent = estimatedSeconds > 0
    ? Math.min(100, Math.round((currentDuration / estimatedSeconds) * 100))
    : 0;
  const isOvertime = estimatedSeconds > 0 && currentDuration > estimatedSeconds;

  return (
    <Card
      elevation={isActive ? 4 : 1}
      sx={{
        borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          elevation: 3,
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
        ...(isActive && {
          animation: 'pulse-border 2s ease-in-out infinite',
          '@keyframes pulse-border': {
            '0%, 100%': { boxShadow: `0 0 0 0 ${config.borderColor}33` },
            '50%': { boxShadow: `0 0 0 4px ${config.borderColor}22` },
          },
        }),
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack spacing={1.5}>
          {/* Top Row: Status chip + Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={config.label}
                color={config.chipColor}
                size="small"
                variant={isActive ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 26,
                  ...(isActive && {
                    animation: 'chip-glow 2s ease-in-out infinite',
                    '@keyframes chip-glow': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.8 },
                    },
                  }),
                }}
              />
              {task.projectName && (
                <Chip
                  icon={<FolderIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={task.projectName}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 26,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {status !== 'completed' && (
                <>
                  {!isActive ? (
                    <Tooltip title={
                      currentAttendance?.Employeestatus === "on break"
                        ? "End break first to start task"
                        : "Start task"
                    }>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleTaskAction(task._id, 'start')}
                          disabled={loading || currentAttendance?.Employeestatus === "on break"}
                          sx={{
                            bgcolor: 'primary.main',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                          }}
                        >
                          <PlayIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Pause task">
                        <IconButton
                          size="small"
                          onClick={() => handleTaskAction(task._id, 'pause')}
                          disabled={loading}
                          sx={{
                            bgcolor: 'warning.main',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: 'warning.dark' },
                          }}
                        >
                          <PauseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Complete task">
                        <IconButton
                          size="small"
                          onClick={() => handleTaskAction(task._id, 'complete')}
                          disabled={loading}
                          sx={{
                            bgcolor: 'success.main',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: 'success.dark' },
                          }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Edit task">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTask(task)}
                      disabled={loading}
                      sx={{ color: 'text.secondary', width: 32, height: 32 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {status === 'completed' && (
                <Tooltip title="Restart task">
                  <IconButton
                    size="small"
                    onClick={() => handleTaskAction(task._id, 'restart')}
                    disabled={loading}
                    sx={{
                      bgcolor: 'secondary.main',
                      color: '#fff',
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: 'secondary.dark' },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Delete task">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTask(task._id)}
                  disabled={loading}
                  sx={{ width: 32, height: 32 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Description */}
          <Box
            className="rich-text-content"
            sx={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '& p': { display: 'inline', margin: 0 },
              '& ul, & ol': { display: 'inline', padding: 0, margin: 0 },
              '& strong': { fontWeight: 'bold' },
              '& em': { fontStyle: 'italic' },
              '& s': { textDecoration: 'line-through' },
              '& u': { textDecoration: 'underline' },
              '& h2': { display: 'inline', fontSize: 'inherit', fontWeight: 'bold', margin: 0 },
            }}
          >
            {task.description ? parse(task.description) : ''}
          </Box>

          {/* Bottom Row: Timer + Progress */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pt: 0.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Timer Display */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                  bgcolor: isActive ? `${config.borderColor}15` : 'grey.50',
                  border: '1px solid',
                  borderColor: isActive ? `${config.borderColor}40` : 'grey.200',
                }}
              >
                <TimerIcon
                  sx={{
                    fontSize: '1rem',
                    color: isActive ? config.borderColor : 'text.secondary',
                    ...(isActive && {
                      animation: 'timer-spin 1s linear infinite',
                      '@keyframes timer-spin': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 },
                      },
                    }),
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Roboto Mono", monospace',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: isActive ? config.borderColor : 'text.primary',
                    letterSpacing: '0.5px',
                  }}
                >
                  {formatDuration(currentDuration)}
                </Typography>
              </Box>

              {estimatedSeconds > 0 && (
                <Tooltip title={`Estimated: ${task.estimatedHours}h ${task.estimatedMinutes}m`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: '0.9rem', color: 'text.disabled' }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {task.estimatedHours}h {task.estimatedMinutes}m
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Stack>

            {/* Progress Bar */}
            {estimatedSeconds > 0 && (
              <Box sx={{ flex: 1, maxWidth: 160 }}>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: isOvertime ? 'error.main' : progressPercent >= 80 ? 'warning.main' : 'success.main',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: isOvertime ? 'error.main' : 'text.disabled',
                    textAlign: 'right',
                    display: 'block',
                    mt: 0.25,
                  }}
                >
                  {isOvertime ? 'Overtime' : `${progressPercent}%`}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
