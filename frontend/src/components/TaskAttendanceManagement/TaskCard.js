import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import parse from 'html-react-parser';



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
  // Add safety check for status
  const status = (task?.status || 'pending').toLowerCase();
  const isActive = task._id === activeTaskId;

  // Early return if task is undefined
  if (!task) return null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip
                  label={task.status || 'Pending'}
                  color={
                    status === 'completed'
                      ? 'success'
                      : status === 'in progress'
                        ? 'primary'
                        : status === 'paused'
                          ? 'warning'
                          : 'default'
                  }
                  size="small"
                />
                <Tooltip title={new Date(task.createdAt).toLocaleString()}>
                  <AccessTimeIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Box
                  className="rich-text-content"
                  sx={{
                    display: 'inline',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    '& p': {
                      display: 'inline',
                      margin: 0
                    },
                    '& ul, & ol': {
                      display: 'inline',
                      padding: 0,
                      margin: 0
                    },
                    '& strong': { fontWeight: 'bold' },
                    '& em': { fontStyle: 'italic' },
                    '& s': { textDecoration: 'line-through' },
                    '& u': { textDecoration: 'underline' },
                    '& h2': {
                      display: 'inline',
                      fontSize: 'inherit',
                      fontWeight: 'bold',
                      margin: 0
                    }
                  }}
                >
                  {task.description ? parse(task.description) : ''}
                </Box>
                <Typography variant="body2" fontWeight="bold">-</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {task.projectName}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              Duration:{' '}
              {formatDuration(
                taskTimers[task._id]?.totalDuration || task.duration || 0
              )}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Estimated Time : {task.estimatedHours}h  {task.estimatedMinutes} m
            </Typography>

            <Stack direction="row" spacing={1}>
              {status !== 'completed' && (
                <>
                  {!isActive && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<PlayIcon />}
                      onClick={() => handleTaskAction(task._id, 'start')}
                      disabled={loading}
                      title={currentAttendance?.Employeestatus === "on break" ? "End break first to start task" : "Start task"}

                    >
                      Start
                    </Button>
                  )}

                  {isActive && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={<PauseIcon />}
                        onClick={() => handleTaskAction(task._id, 'pause')}
                        disabled={loading}
                      >
                        Pause
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<StopIcon />}
                        onClick={() => handleTaskAction(task._id, 'complete')}
                        disabled={loading}
                      >
                        Complete
                      </Button>
                    </>
                  )}

                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditTask(task)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                </>
              )}

              {status === 'completed' && (
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleTaskAction(task._id, 'restart')}
                  disabled={loading}
                >
                  Restart
                </Button>
              )}

              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteTask(task._id)}
                disabled={loading}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;