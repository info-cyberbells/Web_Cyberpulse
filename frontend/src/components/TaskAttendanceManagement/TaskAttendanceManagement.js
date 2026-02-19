import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  addTaskAsync,
  updateTaskAsync,
  updateTaskStatusAsync,
  fetchTasksAsync,
  fetchTasksByStatusAsync,
  deleteTaskAsync,
  selectPreviousTasks,
  setPreviousTasks,
} from "../../features/task/taskSlice";
import { toast } from "react-toastify";
import TaskCard from "./TaskCard";
import TaskModel from "./TaskModel";
import { API_BASE_URL } from "../../constants/apiConstants";
import { getOrganizationId } from '../../services/globalOrg';

const TaskStatus = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
};

const TaskAttendanceManagement = ({
  tasks,
  clockInData,
  clockOutData,
  employeeId,
  showTaskInput,
  setShowTaskInput,
  onPauseActiveTask,
  currentAttendance,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const dispatch = useDispatch();
  const previousTasks = useSelector(selectPreviousTasks);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeTab, setActiveTab] = useState(0);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskTimers, setTaskTimers] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [expandedTasks, setExpandedTasks] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [customProjectName, setCustomProjectName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  // console.log("previousTasks", previousTasks);
  // Group previous tasks by date
  const groupedPreviousTasks = React.useMemo(() => {
    if (!Array.isArray(previousTasks)) {
      return {};
    }

    return previousTasks.reduce((acc, task) => {
      if (!task?.createdAt) return acc;

      // Use assignedDate if available, otherwise use createdAt
      const taskDate = task.assignedDate ? new Date(task.assignedDate) : new Date(task.createdAt);
      const today = new Date();

      // Check if task date is today
      const isToday = taskDate.toDateString() === today.toDateString();

      // Skip tasks that are assigned to today - they should be in Today's Tasks
      if (isToday) return acc;

      const date = taskDate.toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});
  }, [previousTasks]);

  useEffect(() => {
    const initialTimers = {};
    tasks.forEach((task) => {
      if (task.status === TaskStatus.IN_PROGRESS && currentAttendance?.Employeestatus !== "on break") {
        setActiveTaskId(task._id);

        // Calculate time elapsed since last update
        const lastUpdateTime = new Date(task.updatedAt || task.startTime || task.createdAt).getTime();
        const currentTime = Date.now();
        const timeElapsedWhileClosed = Math.floor((currentTime - lastUpdateTime) / 1000);
        const totalDurationWithClosedTime = (task.duration || 0) + timeElapsedWhileClosed;

        initialTimers[task._id] = {
          startTime: Date.now(), // Start fresh from now
          isRunning: true,
          totalDuration: totalDurationWithClosedTime, // Include time when page was closed
          previousDuration: totalDurationWithClosedTime,
        };
      } else {
        initialTimers[task._id] = {
          startTime: null,
          isRunning: false,
          totalDuration: task.duration || 0,
          previousDuration: task.duration || 0,
        };

        if (currentAttendance?.Employeestatus === "on break") {
          setActiveTaskId(null);
        }
      }
    });
    setTaskTimers(initialTimers);
  }, [tasks, currentAttendance?.Employeestatus]);

  useEffect(() => {
    if (!clockInData?._id) return;

    const saveInterval = setInterval(async () => {
      const runningTaskId = activeTaskId;
      if (runningTaskId) {
        setTaskTimers((currentTimers) => {
          const timer = currentTimers[runningTaskId];

          if (timer?.isRunning) {
            const now = Date.now();
            const elapsed = Math.floor((now - timer.startTime) / 1000);
            const currentDuration = elapsed + (timer.previousDuration || 0);

            const currentTask = tasks.find(t => t._id === runningTaskId);

            dispatch(
              updateTaskAsync({
                id: runningTaskId,
                taskData: {
                  duration: currentDuration,
                  description: currentTask?.description || '',
                },
              })
            ).then(() => {
              console.log(`✅ Auto-saved: ${currentDuration}s for task ${runningTaskId}`);
            }).catch((error) => {
              console.error("Auto-save failed:", error);
            });
          }

          return currentTimers;
        });
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [activeTaskId, dispatch, clockInData, tasks]);


  useEffect(() => {
    if (currentAttendance?.Employeestatus === "on break") {
      // If going on break, pause all running timers
      setTaskTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(taskId => {
          if (updated[taskId].isRunning) {
            updated[taskId] = {
              ...updated[taskId],
              isRunning: false,
              previousDuration: updated[taskId].totalDuration
            };
          }
        });
        return updated;
      });
      setActiveTaskId(null);
    } else if (currentAttendance?.Employeestatus === "active") {
      const inProgressTask = localTasks.find(task => task.status === "In Progress");
      if (inProgressTask) {
        setActiveTaskId(inProgressTask._id);
        setTaskTimers(prev => ({
          ...prev,
          [inProgressTask._id]: {
            ...prev[inProgressTask._id],
            startTime: Date.now(),
            isRunning: true,
            previousDuration: prev[inProgressTask._id]?.totalDuration || inProgressTask.duration || 0,
          }
        }));
      }
    }
  }, [currentAttendance?.Employeestatus, localTasks]);


  useEffect(() => {
    if (showTaskInput || editModalVisible || projects.length === 0) {
      const fetchProjects = async () => {
        try {
          setLoading(true);

          const organizationId = getOrganizationId();
          console.log("org if in task", organizationId);

          let url = `${API_BASE_URL}/projects/fetchAll/`;
          if (organizationId) {
            url += `?organizationId=${organizationId}`;
          }

          const response = await fetch(url);
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setProjects(result.data);
          } else {
            toast.error("Failed to fetch projects");
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          toast.error("Failed to fetch projects");
        } finally {
          setLoading(false);
        }
      };
      fetchProjects();
    }
  }, [showTaskInput, editModalVisible, projects.length]);

  const StyledTab = (props) => (
    <Tab
      {...props}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.95rem",
        minHeight: 48,
        color: "text.secondary",
        "&.Mui-selected": {
          color: "primary.main",
        },
        "& .MuiTab-iconWrapper": {
          mr: 1,
        },
      }}
    />
  );


  useEffect(() => {
    const intervals = {};
    Object.entries(taskTimers).forEach(([taskId, timer]) => {
      if (timer.isRunning) {
        intervals[taskId] = setInterval(() => {
          setTaskTimers((prev) => {
            const currentTimer = prev[taskId];
            if (!currentTimer?.isRunning) return prev;

            const now = Date.now();
            const elapsed = Math.floor((now - currentTimer.startTime) / 1000);

            return {
              ...prev,
              [taskId]: {
                ...currentTimer,
                totalDuration: elapsed + (currentTimer.previousDuration || 0),
              },
            };
          });
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, [taskTimers]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // const loadAllTasks = async () => {
  //   try {
  //     const today = new Date().toISOString().split("T")[0];  
  //     // Fetch current day's tasks
  //     const currentResponse = await dispatch(
  //       fetchTasksAsync({
  //         employeeId,
  //         date: today,
  //       })
  //     ).unwrap();

  //     if (Array.isArray(currentResponse)) {
  //       setLocalTasks(currentResponse);
  //     }

  //     // Fetch previous tasks
  //     const previousResponse = await dispatch(
  //       fetchTasksByStatusAsync({
  //         employeeId,
  //         status: TaskStatus.PENDING,
  //       })
  //     ).unwrap();
  //     if (Array.isArray(previousResponse)) {
  //       const filteredPreviousTasks = previousResponse.filter((task) => {
  //         if (!task?.createdAt) return false;
  //         const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
  //         return taskDate !== today;
  //       });
  //       dispatch(setPreviousTasks(filteredPreviousTasks));
  //     }
  //   } catch (error) {
  //     console.error("Error loading tasks:", error);
  //     toast.error("Failed to load tasks");
  //   }
  // };
  const pauseActiveTask = async () => {
    console.log("pauseActiveTask called - Checking for active task...");
    try {
      const activeTask = localTasks.find((task) => task.status === "In Progress");
      if (activeTask) {
        console.log(`Found active task: ${activeTask._id}, Description: ${activeTask.description}, Current Duration: ${activeTask.duration}`);
        const currentTime = new Date().toISOString();
        const finalDuration = taskTimers[activeTask._id]?.totalDuration || activeTask.duration || 0;
        console.log(`Pausing task ${activeTask._id} at ${currentTime} with duration ${finalDuration}`);

        // Update task status to Paused
        await dispatch(
          updateTaskStatusAsync({
            id: activeTask._id,
            taskData: {
              status: TaskStatus.PAUSED,
              attendanceId: clockInData._id,
              currentTime,
              duration: finalDuration,
            },
          })
        ).unwrap();
        console.log(`Task ${activeTask._id} status updated to Paused in backend`);

        // Stop the timer
        setTaskTimers((prev) => {
          const updatedTimers = {
            ...prev,
            [activeTask._id]: {
              ...prev[activeTask._id],
              isRunning: false,
              previousDuration: finalDuration,
            },
          };
          console.log(`Timer stopped for task ${activeTask._id}, Updated timers: `, updatedTimers[activeTask._id]);
          return updatedTimers;
        });
        setActiveTaskId(null);
        console.log(`Cleared activeTaskId, now: ${null}`);

        // Refresh tasks
        await loadAllTasks();
        console.log("Task list refreshed after pausing");
      } else {
        console.log("No active task found to pause");
      }
    } catch (error) {
      console.error("Error pausing active task:", error);
      toast.error("Failed to pause active task");
    }
  };

  const loadAllTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      try {
        // Try to fetch current day's tasks first
        const currentResponse = await dispatch(
          fetchTasksAsync({
            employeeId,
            date: today,
          })
        ).unwrap();

        if (Array.isArray(currentResponse)) {
          setLocalTasks(currentResponse);
        }
      } catch (currentError) {
        console.error("Error loading current tasks:", currentError);
        // toast.error("Failed to load current tasks");
      }

      // Fetch previous tasks (will run even if current tasks fail)
      const previousResponse = await dispatch(
        fetchTasksByStatusAsync({
          employeeId,
          status: TaskStatus.PENDING,
        })
      ).unwrap();

      if (Array.isArray(previousResponse)) {
        const filteredPreviousTasks = previousResponse.filter((task) => {
          if (!task?.createdAt) return false;
          const taskDate = new Date(task.assignedDate || task.createdAt)
            .toISOString()
            .split("T")[0];

          return taskDate !== today && task.status === TaskStatus.PENDING;
        });
        dispatch(setPreviousTasks(filteredPreviousTasks));
      }
    } catch (error) {
      console.error("Error loading all tasks:", error);
      toast.error("Failed to load tasks");
    }
  };
  useEffect(() => {
    if (employeeId) {
      setIsLoading(true);
      loadAllTasks().finally(() => setIsLoading(false));
    }
  }, [dispatch, employeeId]);

  const handleTaskAction = async (taskId, action) => {
    if ((action === "start" || action === "restart") && currentAttendance?.Employeestatus === "on break") {
      toast.dismiss();
      toast.warning("Please end your break first before starting a task.");
      return;
    }

    if (action === "start" && activeTaskId && activeTaskId !== taskId) {
      toast.dismiss();
      toast.warning("Please complete or pause the current task first.");
      return;
    }

    try {
      setLoading(true);
      let newStatus;
      const currentTime = new Date().toISOString();

      // Find task in either current or previous tasks
      const currentTask =
        localTasks.find((t) => t._id === taskId) ||
        previousTasks.find((t) => t._id === taskId);

      if (!currentTask) {
        throw new Error("Task not found");
      }

      // ADDED: Safety check to prevent duplicate task operations
      if (action === "start" && currentTask.status === "In Progress") {
        toast.dismiss();
        toast.warning("Task is already in progress");
        return;
      }

      switch (action) {
        case "start":
        case "restart":
          newStatus = TaskStatus.IN_PROGRESS;
          setActiveTaskId(taskId);
          setTaskTimers((prev) => ({
            ...prev,
            [taskId]: {
              startTime: Date.now(),
              isRunning: true,
              totalDuration: action === "restart" ? 0 : (currentTask.duration || 0),
              previousDuration: action === "restart" ? 0 : (currentTask.duration || 0),
            },
          }));
          break;

        case "pause":
          newStatus = TaskStatus.PAUSED;
          setActiveTaskId(null);
          const pauseDuration = taskTimers[taskId]?.totalDuration || currentTask.duration || 0;
          setTaskTimers((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              isRunning: false,
              previousDuration: pauseDuration,
              totalDuration: pauseDuration,
            },
          }));
          break;

        case "complete":
          newStatus = TaskStatus.COMPLETED;
          setActiveTaskId(null);
          const finalDuration = taskTimers[taskId]?.totalDuration || 0;
          setTaskTimers((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              isRunning: false,
              totalDuration: finalDuration,
              previousDuration: finalDuration,
            },
          }));
          break;
      }

      // Check if task is from pending tasks
      const isFromPendingTasks = previousTasks.some(t => t._id === taskId);

      // Prepare task data
      let currentDuration;
      if (action === "restart") {
        currentDuration = 0;
      } else if (action === "pause" || action === "complete") {
        currentDuration = taskTimers[taskId]?.totalDuration || currentTask.duration || 0;
      } else {
        currentDuration = taskTimers[taskId]?.totalDuration || 0;
      }

      const taskData = {
        status: newStatus,
        attendanceId: clockInData._id,
        currentTime,
        duration: currentDuration,
      };

      // FIXED: Only update assignedDate if task is truly from pending and being moved to today
      // Don't update assignedDate for tasks that are already assigned to today
      if ((action === "start" || action === "restart") && isFromPendingTasks) {
        const taskDate = new Date(currentTask.assignedDate || currentTask.createdAt).toDateString();
        const today = new Date().toDateString();

        // Only update assignedDate if task is from a different date
        if (taskDate !== today) {
          taskData.assignedDate = new Date().toISOString();
        }
      }

      // Update status first
      const response = await dispatch(
        updateTaskStatusAsync({
          id: taskId,
          taskData,
        })
      ).unwrap();

      if (action === "pause" || action === "complete") {
        await dispatch(
          updateTaskAsync({
            id: taskId,
            taskData: {
              duration: currentDuration,
              description: currentTask.description,
            },
          })
        ).unwrap();
      }

      // IMPROVED: Better handling of task movement between pending and current
      if ((action === "start" || action === "restart") && isFromPendingTasks) {
        const taskDate = new Date(currentTask.assignedDate || currentTask.createdAt).toDateString();
        const today = new Date().toDateString();

        // Only move task if it's from a different date
        if (taskDate !== today) {
          // Remove from previous tasks
          const updatedPreviousTasks = previousTasks.filter(t => t._id !== taskId);
          dispatch(setPreviousTasks(updatedPreviousTasks));

          // Add to today's tasks (but check if it doesn't already exist)
          const taskExistsInToday = localTasks.some(t => t._id === taskId);
          if (!taskExistsInToday) {
            const updatedTask = {
              ...currentTask,
              status: newStatus,
              assignedDate: new Date().toISOString(),
              duration: taskData.duration,
              startTime: newStatus === TaskStatus.IN_PROGRESS ? new Date().toISOString() : currentTask.startTime
            };
            setLocalTasks(prev => [...prev, updatedTask]);
          }
        } else {
          // Task is already for today, just refresh normally
          await loadAllTasks();
        }
      } else {
        // For non-pending tasks or tasks already assigned to today, refresh normally
        await loadAllTasks();
      }

      const actionPastTense = {
        start: "started",
        pause: "paused",
        complete: "completed",
        restart: "restarted"
      };
      toast.dismiss();
      toast.success(`Task ${actionPastTense[action] || action} successfully`);

    } catch (error) {
      console.error("Error updating task:", error);
      toast.dismiss();
      toast.error(error.message || `Failed to ${action} task`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        setLoading(true);
        await dispatch(deleteTaskAsync(taskId)).unwrap();
        // Clean up timer
        setTaskTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[taskId];
          return newTimers;
        });
        // Load all tasks again
        await loadAllTasks();
        toast.dismiss();
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.dismiss();
        toast.error(error.message || "Failed to delete task");
      } finally {
        setLoading(false);
      }
    }
  };


  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditedDescription(task.description);

    // Handle project selection
    if (task.projectName) {
      const project = projects.find(p => p.name === task.projectName);
      if (project) {
        setSelectedProjectId(project._id);
        setCustomProjectName("");
      } else {
        setSelectedProjectId("other");
        setCustomProjectName(task.projectName);
      }
    } else {
      setSelectedProjectId("");
      setCustomProjectName("");
    }
    setEstimatedHours(task.estimatedHours || 0);
    setEstimatedMinutes(task.estimatedMinutes || 0);

    setEditModalVisible(true);
  };

  const saveTaskEdit = async (html, plainText) => {
    if (!plainText) {
      toast.dismiss();
      toast.error("Description cannot be empty");
      return;
    }
    try {
      setLoading(true);

      let projectNameToSend;
      if (selectedProjectId === "other") {
        projectNameToSend = customProjectName;
      } else if (selectedProjectId) {
        const selectedProject = projects.find(p => p._id === selectedProjectId);
        projectNameToSend = selectedProject?.name || "";
      }

      const updatePayload = {
        id: editingTask._id,
        taskData: {
          description: html,
          projectName: projectNameToSend,
          attendanceId: clockInData._id,
          estimatedHours: estimatedHours || 0,
          estimatedMinutes: estimatedMinutes || 0,
        },
      };

      console.log("Update payload:", updatePayload);
      console.log("Current state - Hours:", estimatedHours, "Minutes:", estimatedMinutes);

      await dispatch(updateTaskAsync(updatePayload)).unwrap();

      // FIXED: Update local state instead of refetching all tasks
      // This prevents timer reinitialization for running tasks
      setLocalTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === editingTask._id
            ? {
              ...task,
              description: html,
              projectName: projectNameToSend,
              estimatedHours: estimatedHours || 0,
              estimatedMinutes: estimatedMinutes || 0,
            }
            : task
        )
      );

      // Also update previousTasks if the edited task is there
      const updatedPreviousTasks = previousTasks.map(task =>
        task._id === editingTask._id
          ? {
            ...task,
            description: html,
            projectName: projectNameToSend,
            estimatedHours: estimatedHours || 0,
            estimatedMinutes: estimatedMinutes || 0,
          }
          : task
      );
      dispatch(setPreviousTasks(updatedPreviousTasks));

      toast.success("Task updated successfully!");
      setEditModalVisible(false);
      setSelectedProjectId("");
      setCustomProjectName("");
      setEstimatedHours(0);
      setEstimatedMinutes(0);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (html, plainText) => {
    if (!plainText) {
      toast.dismiss();
      toast.error("Please enter a task description");
      return;
    }
    if (!selectedProjectId) {
      toast.dismiss();
      toast.error("Please select a project");
      return;
    }
    if (selectedProjectId === "other" && !customProjectName.trim()) {
      toast.dismiss();
      toast.error("Please enter a project name");
      return;
    }
    try {
      setLoading(true);
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      const taskData = {
        description: html,
        attendanceId: clockInData._id,
        employeeId: employeeId,
        status: TaskStatus.PENDING,
        projectName: selectedProjectId === "other" ? customProjectName : selectedProject?.name || "", // Use custom name or selected project name
        assignedDate: new Date().toISOString(),
        estimatedHours: estimatedHours || 0,
        estimatedMinutes: estimatedMinutes || 0,
      };
      const response = await dispatch(addTaskAsync(taskData)).unwrap();
      setTaskTimers((prev) => ({
        ...prev,
        [response._id]: {
          startTime: null,
          isRunning: false,
          totalDuration: 0,
          previousDuration: 0,
        },
      }));
      setNewTask("");
      setShowTaskInput(false);
      setSelectedProjectId("");
      setCustomProjectName("");
      setEstimatedHours(0);
      setEstimatedMinutes(0);
      await loadAllTasks();
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const LoadingOverlay = () => (
    <Box
      sx={{
        //   position: 'relative',
        //   top: 0,
        //   left: 0,
        //   right: 0,
        //   bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        //   backgroundColor: 'rgba(255, 255, 255, 0.8)',
        //   zIndex: 1000,
      }}
    >
      <CircularProgress />
    </Box>
  );
  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              Task Management
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, ml: 0.4 }}
            >
              Track and manage your daily activities
            </Typography>
          </Box>

          {clockInData && !clockOutData && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowTaskInput(true)}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              New Task
            </Button>
          )}
        </Stack>

        {clockInData && !clockOutData ? (
          <Box sx={{ position: "relative", minHeight: 300 }}>
            {/* Custom Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                mb: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <StyledTab
                label="Today's Tasks"
                icon={<PlayIcon />}
                iconPosition="start"
              />
              <StyledTab
                label="Pending Tasks"
                icon={<HistoryIcon />}
                iconPosition="start"
              />
            </Tabs>
            {(isLoading || actionLoading) && <LoadingOverlay />}
            {loading && !isLoading && !actionLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {activeTab === 0 ? (
              <Stack spacing={2}>
                {localTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    loading={loading}
                    activeTaskId={activeTaskId}
                    expandedTasks={expandedTasks}
                    setExpandedTasks={setExpandedTasks}
                    formatDuration={formatDuration}
                    taskTimers={taskTimers}
                    handleTaskAction={handleTaskAction}
                    handleEditTask={handleEditTask}
                    handleDeleteTask={handleDeleteTask}
                    currentAttendance={currentAttendance}
                  />
                ))}
                {!isLoading && localTasks.length === 0 && (
                  <Typography color="text.secondary" textAlign="center">
                    No tasks found for today
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack spacing={3}>
                {Object.entries(groupedPreviousTasks).map(([date, tasks]) => (
                  <Box key={date}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {date}
                    </Typography>
                    <Stack spacing={2}>
                      {tasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          isPreviousTask
                          loading={loading}
                          activeTaskId={activeTaskId}
                          expandedTasks={expandedTasks}
                          setExpandedTasks={setExpandedTasks}
                          formatDuration={formatDuration}
                          taskTimers={taskTimers}
                          handleTaskAction={handleTaskAction}
                          handleEditTask={handleEditTask}
                          handleDeleteTask={handleDeleteTask}
                          onAction={() => setActionLoading(true)}
                          onActionComplete={() => setActionLoading(false)}
                          currentAttendance={currentAttendance}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
                {!isLoading && Object.keys(groupedPreviousTasks).length === 0 && (
                  <Typography color="text.secondary" textAlign="center">
                    No previous tasks found
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" textAlign="center">
            Please clock in to view and manage tasks
          </Typography>
        )}
      </Paper>


      {clockInData && !clockOutData && (
        <>
          <TaskModel
            open={showTaskInput}
            onClose={() => {
              setShowTaskInput(false);
              setSelectedProjectId("");
              setCustomProjectName("");
              setEstimatedHours(0);
              setEstimatedMinutes(0);
            }}
            title="Add New Task"
            value={newTask}
            onChange={(content) => setNewTask(content)}
            onSubmit={addTask}
            loading={loading}
            isEdit={false}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(projectId) => setSelectedProjectId(projectId)}
            customProjectName={customProjectName}
            onCustomProjectNameChange={(name) => setCustomProjectName(name)}
            estimatedHours={estimatedHours}
            onEstimatedHoursChange={setEstimatedHours}
            estimatedMinutes={estimatedMinutes}
            onEstimatedMinutesChange={setEstimatedMinutes}

          />
          <TaskModel
            open={editModalVisible}
            onClose={() => {
              setEditModalVisible(false);
              setEstimatedHours(0);
              setEstimatedMinutes(0);
            }}
            title="Edit Task"
            value={editedDescription}
            onChange={(content) => setEditedDescription(content)}
            onSubmit={saveTaskEdit}
            loading={loading}
            isEdit={true}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(projectId) => setSelectedProjectId(projectId)}
            customProjectName={customProjectName}
            onCustomProjectNameChange={(name) => setCustomProjectName(name)}
            estimatedHours={estimatedHours}
            onEstimatedHoursChange={setEstimatedHours}
            estimatedMinutes={estimatedMinutes}
            onEstimatedMinutesChange={setEstimatedMinutes}
          />
        </>
      )}
    </Box>
  );
};
export default TaskAttendanceManagement;

