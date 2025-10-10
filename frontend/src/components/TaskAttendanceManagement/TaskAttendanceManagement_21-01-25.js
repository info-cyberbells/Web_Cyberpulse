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
  console.log("previousTasks", previousTasks);
  // Group previous tasks by date
  const groupedPreviousTasks = React.useMemo(() => {
    if (!Array.isArray(previousTasks)) {
      return {};
    }

    return previousTasks.reduce((acc, task) => {
      if (!task?.createdAt) return acc; // Check if task has createdAt property

      const date = new Date(task.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});
  }, [previousTasks]);
  // Replace your existing useEffect with this:
  useEffect(() => {
    if (employeeId) {
      const fetchTasks = async () => {
        setIsLoading(true);
        try {
          const today = new Date().toISOString().split("T")[0];
          // Fetch today's tasks
          const currentResponse = await dispatch(
            fetchTasksAsync({
              employeeId,
              date: today,
            })
          ).unwrap();

          if (Array.isArray(currentResponse)) {
            setLocalTasks(currentResponse);
          }
          // Fetch previous tasks
          const previousResponse = await dispatch(
            fetchTasksByStatusAsync({
              employeeId,
              status: TaskStatus.PENDING,
            })
          ).unwrap();

          if (Array.isArray(previousResponse)) {
            const filteredPreviousTasks = previousResponse.filter((task) => {
              if (!task?.createdAt) return false;
              const taskDate = new Date(task.createdAt)
                .toISOString()
                .split("T")[0];
              return taskDate !== today;
            });
            dispatch(setPreviousTasks(filteredPreviousTasks));
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          toast.error("Failed to fetch tasks");
        } finally {
          setIsLoading(false);
        }
      };

      fetchTasks();
    }
  }, [dispatch, employeeId]);

  useEffect(() => {
    const initialTimers = {};
    tasks.forEach((task) => {
      const existingTimer = taskTimers[task._id];
      if (task.status === TaskStatus.IN_PROGRESS) {
        setActiveTaskId(task._id);
        initialTimers[task._id] = {
          startTime: new Date(task.startTime).getTime(),
          isRunning: true,
          totalDuration: existingTimer?.totalDuration || task.duration || 0,
          previousDuration:
            existingTimer?.previousDuration || task.duration || 0,
        };
      } else {
        initialTimers[task._id] = {
          startTime: null,
          isRunning: false,
          totalDuration: task.duration || 0,
          previousDuration: task.duration || 0,
        };
      }
    });
    setTaskTimers(initialTimers);
  }, [tasks]);

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

  const loadAllTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch current day's tasks
      const currentResponse = await dispatch(
        fetchTasksAsync({
          employeeId,
          date: today,
        })
      ).unwrap();

      if (Array.isArray(currentResponse)) {
        setLocalTasks(currentResponse);
      }

      // Fetch previous tasks
      const previousResponse = await dispatch(
        fetchTasksByStatusAsync({
          employeeId,
          status: TaskStatus.PENDING,
        })
      ).unwrap();

      if (Array.isArray(previousResponse)) {
        const filteredPreviousTasks = previousResponse.filter((task) => {
          if (!task?.createdAt) return false;
          const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
          return taskDate !== today;
        });
        dispatch(setPreviousTasks(filteredPreviousTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  const handleTaskAction = async (taskId, action) => {
    if (action === "start" && activeTaskId && activeTaskId !== taskId) {
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
              totalDuration:
                action === "restart" ? 0 : prev[taskId]?.previousDuration || 0,
              previousDuration:
                action === "restart" ? 0 : prev[taskId]?.previousDuration || 0,
            },
          }));
          break;

        case "pause":
          newStatus = TaskStatus.PAUSED;
          setActiveTaskId(null);
          setTaskTimers((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              isRunning: false,
              previousDuration: prev[taskId].totalDuration,
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
      const response = await dispatch(
        updateTaskStatusAsync({
          id: taskId,
          taskData: {
            status: newStatus,
            attendanceId: clockInData._id,
            currentTime,
            duration:
              action === "restart" ? 0 : taskTimers[taskId]?.totalDuration || 0,
          },
        })
      ).unwrap();
      // Update both current and previous task lists
      const updatedTask = {
        ...currentTask,
        ...response,
        status: newStatus,
      };
      // Update localTasks
      setLocalTasks((prev) =>
        prev.map((task) => (task._id === taskId ? updatedTask : task))
      );
      // Update previousTasks in Redux store
      dispatch(
        setPreviousTasks(
          previousTasks.map((task) =>
            task._id === taskId ? updatedTask : task
          )
        )
      );
      // Refresh both current and previous tasks
      const today = new Date().toISOString().split("T")[0];
      // Fetch current day's tasks
      const currentResponse = await dispatch(
        fetchTasksAsync({
          employeeId,
          date: today,
        })
      ).unwrap();

      if (Array.isArray(currentResponse)) {
        setLocalTasks(currentResponse);
      }

      // Fetch previous tasks
      const previousResponse = await dispatch(
        fetchTasksByStatusAsync({
          employeeId,
          status: TaskStatus.PENDING,
        })
      ).unwrap();
      if (Array.isArray(previousResponse)) {
        const filteredPreviousTasks = previousResponse.filter((task) => {
          if (!task?.createdAt) return false;
          const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
          return taskDate !== today;
        });
        dispatch(setPreviousTasks(filteredPreviousTasks));
      }
      toast.success(`Task ${action}ed successfully`);
    } catch (error) {
      console.error("Error updating task:", error);
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
        // Remove from local state
        setLocalTasks((prev) => prev.filter((task) => task._id !== taskId));
        // Remove from previous tasks in Redux store
        dispatch(
          setPreviousTasks(previousTasks.filter((task) => task._id !== taskId))
        );
        // Clean up timer
        setTaskTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[taskId];
          return newTimers;
        });
        // Refresh both current and previous tasks
        const today = new Date().toISOString().split("T")[0];

        // Fetch current day's tasks
        const currentResponse = await dispatch(
          fetchTasksAsync({
            employeeId,
            date: today,
          })
        ).unwrap();
        if (Array.isArray(currentResponse)) {
          setLocalTasks(currentResponse);
        }
        // Fetch previous tasks
        const previousResponse = await dispatch(
          fetchTasksByStatusAsync({
            employeeId,
            status: TaskStatus.PENDING,
          })
        ).unwrap();
        if (Array.isArray(previousResponse)) {
          const filteredPreviousTasks = previousResponse.filter((task) => {
            if (!task?.createdAt) return false;
            const taskDate = new Date(task.createdAt)
              .toISOString()
              .split("T")[0];
            return taskDate !== today;
          });
          dispatch(setPreviousTasks(filteredPreviousTasks));
        }
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error(error.message || "Failed to delete task");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditedDescription(task.description);
    setEditModalVisible(true);
  };

  const saveTaskEdit = async () => {
    if (!editedDescription.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(
        updateTaskAsync({
          id: editingTask._id,
          taskData: {
            description: editedDescription,
            attendanceId: clockInData._id,
          },
        })
      ).unwrap();

      // Update in local tasks if present
      setLocalTasks((prev) =>
        prev.map((task) =>
          task._id === editingTask._id
            ? { ...task, description: editedDescription }
            : task
        )
      );

      // Update in previous tasks if present
      dispatch(
        setPreviousTasks(
          previousTasks.map((task) =>
            task._id === editingTask._id
              ? { ...task, description: editedDescription }
              : task
          )
        )
      );

      // Refresh both current and previous tasks
      const today = new Date().toISOString().split("T")[0];
      // Fetch current day's tasks
      const currentResponse = await dispatch(
        fetchTasksAsync({
          employeeId,
          date: today,
        })
      ).unwrap();
      if (Array.isArray(currentResponse)) {
        setLocalTasks(currentResponse);
      }
      // Fetch previous tasks
      const previousResponse = await dispatch(
        fetchTasksByStatusAsync({
          employeeId,
          status: TaskStatus.PENDING,
        })
      ).unwrap();
      if (Array.isArray(previousResponse)) {
        const filteredPreviousTasks = previousResponse.filter((task) => {
          if (!task?.createdAt) return false;
          const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
          return taskDate !== today;
        });
        dispatch(setPreviousTasks(filteredPreviousTasks));
      }
      setEditModalVisible(false);
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    try {
      setLoading(true);
      const taskData = {
        description: newTask.trim(),
        attendanceId: clockInData._id,
        employeeId: employeeId,
        status: TaskStatus.PENDING,
      };
      const response = await dispatch(addTaskAsync(taskData)).unwrap();
      // Initialize timer for the new task
      setTaskTimers((prev) => ({
        ...prev,
        [response._id]: {
          startTime: null,
          isRunning: false,
          totalDuration: 0,
          previousDuration: 0,
        },
      }));
      // Update local tasks immediately
      setLocalTasks((prev) => {
        const updatedTasks = [...prev, response];
        return updatedTasks;
      });
      // Reset form
      setNewTask("");
      setShowTaskInput(false);
      toast.success("Task added successfully");
      // Fetch updated task list
      const today = new Date().toISOString().split("T")[0];
      const currentResponse = await dispatch(
        fetchTasksAsync({
          employeeId,
          date: today,
        })
      ).unwrap();
      
      if (Array.isArray(currentResponse)) {
        setLocalTasks(currentResponse);
      }
    } catch (error) {
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
          <Typography variant="h5">Task Management</Typography>
          {clockInData && !clockOutData && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowTaskInput(true)}
              disabled={loading}
            >
              Add New Task
            </Button>
          )}
        </Stack>
  
        {clockInData && !clockOutData ? (
          <Box sx={{ position: "relative", minHeight: 300 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab
                label="Today's Tasks"
                icon={<PlayIcon />}
                iconPosition="start"
              />
              <Tab
                label="Previous Tasks"
                icon={<HistoryIcon />}
                iconPosition="start"
              />
            </Tabs>
            {(isLoading || actionLoading) && <LoadingOverlay />}
            {loading && (
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
  
      {/* Task Dialogs - only render if clocked in */}
      {clockInData && !clockOutData && (
        <>
          <TaskModel
            open={showTaskInput}
            onClose={() => setShowTaskInput(false)}
            title="Add New Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onSubmit={addTask}
            loading={loading}
            isEdit={false}
          />
          <TaskModel
            open={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            title="Edit Task"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onSubmit={saveTaskEdit}
            loading={loading}
            isEdit={true}
          />
        </>
      )}
    </Box>
  );
};
export default TaskAttendanceManagement;
