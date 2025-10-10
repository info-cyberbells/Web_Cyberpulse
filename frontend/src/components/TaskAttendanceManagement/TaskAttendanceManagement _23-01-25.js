// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   Stack,
//   CircularProgress,
//   Tabs,
//   Tab,
// } from "@mui/material";
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   PlayArrow as PlayIcon,
//   History as HistoryIcon,
// } from "@mui/icons-material";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addTaskAsync,
//   updateTaskAsync,
//   updateTaskStatusAsync,
//   fetchTasksAsync,
//   fetchTasksByStatusAsync,
//   deleteTaskAsync,
//   selectPreviousTasks,
//   setPreviousTasks,
// } from "../../features/task/taskSlice";
// import { toast } from "react-toastify";
// import TaskCard from "./TaskCard";
// import TaskModel from "./TaskModel";

// const TaskStatus = {
//   PENDING: "Pending",
//   IN_PROGRESS: "In Progress",
//   PAUSED: "Paused",
//   COMPLETED: "Completed",
// };

// const TaskAttendanceManagement = ({
//   tasks,
//   clockInData,
//   clockOutData,
//   employeeId,
//   showTaskInput,
//   setShowTaskInput,
// }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const dispatch = useDispatch();
//   const previousTasks = useSelector(selectPreviousTasks);
//   const [localTasks, setLocalTasks] = useState(tasks);
//   const [activeTab, setActiveTab] = useState(0);
//   const [newTask, setNewTask] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [activeTaskId, setActiveTaskId] = useState(null);
//   const [taskTimers, setTaskTimers] = useState({});
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [editedDescription, setEditedDescription] = useState("");
//   const [expandedTasks, setExpandedTasks] = useState({});
//   console.log("previousTasks", previousTasks);
//   // Group previous tasks by date
//   const groupedPreviousTasks = React.useMemo(() => {
//     if (!Array.isArray(previousTasks)) {
//       return {};
//     }

//     return previousTasks.reduce((acc, task) => {
//       if (!task?.createdAt) return acc; // Check if task has createdAt property

//       const date = new Date(task.createdAt).toLocaleDateString();
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push(task);
//       return acc;
//     }, {});
//   }, [previousTasks]);

//   useEffect(() => {
//     const initialTimers = {};
//     tasks.forEach((task) => {
//       const existingTimer = taskTimers[task._id];
//       if (task.status === TaskStatus.IN_PROGRESS) {
//         setActiveTaskId(task._id);
//         initialTimers[task._id] = {
//           startTime: new Date(task.startTime).getTime(),
//           isRunning: true,
//           totalDuration: existingTimer?.totalDuration || task.duration || 0,
//           previousDuration:
//             existingTimer?.previousDuration || task.duration || 0,
//         };
//       } else {
//         initialTimers[task._id] = {
//           startTime: null,
//           isRunning: false,
//           totalDuration: task.duration || 0,
//           previousDuration: task.duration || 0,
//         };
//       }
//     });
//     setTaskTimers(initialTimers);
//   }, [tasks]);

//   useEffect(() => {
//     const intervals = {};
//     Object.entries(taskTimers).forEach(([taskId, timer]) => {
//       if (timer.isRunning) {
//         intervals[taskId] = setInterval(() => {
//           setTaskTimers((prev) => {
//             const currentTimer = prev[taskId];
//             if (!currentTimer?.isRunning) return prev;

//             const now = Date.now();
//             const elapsed = Math.floor((now - currentTimer.startTime) / 1000);

//             return {
//               ...prev,
//               [taskId]: {
//                 ...currentTimer,
//                 totalDuration: elapsed + (currentTimer.previousDuration || 0),
//               },
//             };
//           });
//         }, 1000);
//       }
//     });

//     return () => {
//       Object.values(intervals).forEach((interval) => clearInterval(interval));
//     };
//   }, [taskTimers]);

//   const formatDuration = (seconds) => {
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
//       2,
//       "0"
//     )}:${String(secs).padStart(2, "0")}`;
//   };

//   const loadAllTasks = async () => {
//     try {
//       const today = new Date().toISOString().split("T")[0];  
//       // Fetch current day's tasks
//       const currentResponse = await dispatch(
//         fetchTasksAsync({
//           employeeId,
//           date: today,
//         })
//       ).unwrap();

//       if (Array.isArray(currentResponse)) {
//         setLocalTasks(currentResponse);
//       }

//       // Fetch previous tasks
//       const previousResponse = await dispatch(
//         fetchTasksByStatusAsync({
//           employeeId,
//           status: TaskStatus.PENDING,
//         })
//       ).unwrap();
//       if (Array.isArray(previousResponse)) {
//         const filteredPreviousTasks = previousResponse.filter((task) => {
//           if (!task?.createdAt) return false;
//           const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
//           return taskDate !== today;
//         });
//         dispatch(setPreviousTasks(filteredPreviousTasks));
//       }
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       toast.error("Failed to load tasks");
//     }
//   };

//   useEffect(() => {
//     if (employeeId) {
//       setIsLoading(true);
//       loadAllTasks().finally(() => setIsLoading(false));
//     }
//   }, [dispatch, employeeId]);

//   const handleTaskAction = async (taskId, action) => {
//     if (action === "start" && activeTaskId && activeTaskId !== taskId) {
//       toast.warning("Please complete or pause the current task first.");
//       return;
//     }
//     try {
//       setLoading(true);
//       let newStatus;
//       const currentTime = new Date().toISOString();
//       // Find task in either current or previous tasks
//       const currentTask =
//         localTasks.find((t) => t._id === taskId) ||
//         previousTasks.find((t) => t._id === taskId);
//       if (!currentTask) {
//         throw new Error("Task not found");
//       }
//       switch (action) {
//         case "start":
//         case "restart":
//           newStatus = TaskStatus.IN_PROGRESS;
//           setActiveTaskId(taskId);
//           setTaskTimers((prev) => ({
//             ...prev,
//             [taskId]: {
//               startTime: Date.now(),
//               isRunning: true,
//               totalDuration:
//                 action === "restart" ? 0 : prev[taskId]?.previousDuration || 0,
//               previousDuration:
//                 action === "restart" ? 0 : prev[taskId]?.previousDuration || 0,
//             },
//           }));
//           break;

//         case "pause":
//           newStatus = TaskStatus.PAUSED;
//           setActiveTaskId(null);
//           setTaskTimers((prev) => ({
//             ...prev,
//             [taskId]: {
//               ...prev[taskId],
//               isRunning: false,
//               previousDuration: prev[taskId].totalDuration,
//             },
//           }));
//           break;
//         case "complete":
//           newStatus = TaskStatus.COMPLETED;
//           setActiveTaskId(null);
//           const finalDuration = taskTimers[taskId]?.totalDuration || 0;
//           setTaskTimers((prev) => ({
//             ...prev,
//             [taskId]: {
//               ...prev[taskId],
//               isRunning: false,
//               totalDuration: finalDuration,
//               previousDuration: finalDuration,
//             },
//           }));
//           break;
//       }
//       const response = await dispatch(
//         updateTaskStatusAsync({
//           id: taskId,
//           taskData: {
//             status: newStatus,
//             attendanceId: clockInData._id,
//             currentTime,
//             duration:
//               action === "restart" ? 0 : taskTimers[taskId]?.totalDuration || 0,
//           },
//         })
//       ).unwrap();     
//          // Load all tasks again
//       await loadAllTasks();
//       toast.success(`Task ${action}ed successfully`);
//     } catch (error) {
//       console.error("Error updating task:", error);
//       toast.error(error.message || `Failed to ${action} task`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (window.confirm("Are you sure you want to delete this task?")) {
//       try {
//         setLoading(true);
//         await dispatch(deleteTaskAsync(taskId)).unwrap();     
//         // Clean up timer
//         setTaskTimers((prev) => {
//           const newTimers = { ...prev };
//           delete newTimers[taskId];
//           return newTimers;
//         });
//         // Load all tasks again
//         await loadAllTasks();       
//         toast.success("Task deleted successfully");
//       } catch (error) {
//         toast.error(error.message || "Failed to delete task");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleEditTask = (task) => {
//     setEditingTask(task);
//     setEditedDescription(task.description);
//     setEditModalVisible(true);
//   };

//   const saveTaskEdit = async () => {
//     if (!editedDescription.trim()) {
//       toast.error("Description cannot be empty");
//       return;
//     }
//     try {
//       setLoading(true);
//       await dispatch(
//         updateTaskAsync({
//           id: editingTask._id,
//           taskData: {
//             description: editedDescription,
//             attendanceId: clockInData._id,
//           },
//         })
//       ).unwrap();
//       // Load all tasks again
//       await loadAllTasks();   
//       setEditModalVisible(false);
//     } catch (error) {
//       toast.error(error.message || "Failed to update task");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addTask = async () => {
//     if (!newTask.trim()) {
//       toast.error("Please enter a task description");
//       return;
//     }
//     try {
//       setLoading(true);
//       const taskData = {
//         description: newTask.trim(),
//         attendanceId: clockInData._id,
//         employeeId: employeeId,
//         status: TaskStatus.PENDING,
//       };     
//       // Add the new task
//       const response = await dispatch(addTaskAsync(taskData)).unwrap();
//       // Initialize timer for the new task
//       setTaskTimers((prev) => ({
//         ...prev,
//         [response._id]: {
//           startTime: null,
//           isRunning: false,
//           totalDuration: 0,
//           previousDuration: 0,
//         },
//       }));
//       // Reset form
//       setNewTask("");
//       setShowTaskInput(false);
//       // Load all tasks again to ensure both current and previous tasks are up to date
//       await loadAllTasks();  
//     } catch (error) {
//       toast.error(error.message || "Failed to add task");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const LoadingOverlay = () => (
//     <Box
//       sx={{
//         //   position: 'relative',
//         //   top: 0,
//         //   left: 0,
//         //   right: 0,
//         //   bottom: 0,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         //   backgroundColor: 'rgba(255, 255, 255, 0.8)',
//         //   zIndex: 1000,
//       }}
//     >
//       <CircularProgress />
//     </Box>
//   );
//   return (
//     <Box sx={{ width: "100%" }}>
//       <Paper sx={{ p: 3 }}>
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={2}
//         >
//           <Typography variant="h5">Task Management</Typography>
//           {clockInData && !clockOutData && (
//             <Button
//               variant="outlined"
//               startIcon={<AddIcon />}
//               onClick={() => setShowTaskInput(true)}
//               disabled={loading}
//             >
//               Add New Task
//             </Button>
//           )}
//         </Stack>
  
//         {clockInData && !clockOutData ? (
//           <Box sx={{ position: "relative", minHeight: 300 }}>
//             <Tabs
//               value={activeTab}
//               onChange={(_, newValue) => setActiveTab(newValue)}
//               sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
//             >
//               <Tab
//                 label="Today's Tasks"
//                 icon={<PlayIcon />}
//                 iconPosition="start"
//               />
//               <Tab
//                 label="Previous Tasks"
//                 icon={<HistoryIcon />}
//                 iconPosition="start"
//               />
//             </Tabs>
//             {(isLoading || actionLoading) && <LoadingOverlay />}
//             {loading && (
//               <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
//                 <CircularProgress />
//               </Box>
//             )}
  
//             {activeTab === 0 ? (
//               <Stack spacing={2}>
//                 {localTasks.map((task) => (
//                   <TaskCard
//                     key={task._id}
//                     task={task}
//                     loading={loading}
//                     activeTaskId={activeTaskId}
//                     expandedTasks={expandedTasks}
//                     setExpandedTasks={setExpandedTasks}
//                     formatDuration={formatDuration}
//                     taskTimers={taskTimers}
//                     handleTaskAction={handleTaskAction}
//                     handleEditTask={handleEditTask}
//                     handleDeleteTask={handleDeleteTask}
//                   />
//                 ))}
//                 {!isLoading && localTasks.length === 0 && (
//                   <Typography color="text.secondary" textAlign="center">
//                     No tasks found for today
//                   </Typography>
//                 )}
//               </Stack>
//             ) : (
//               <Stack spacing={3}>
//                 {Object.entries(groupedPreviousTasks).map(([date, tasks]) => (
//                   <Box key={date}>
//                     <Typography
//                       variant="h6"
//                       color="text.secondary"
//                       sx={{ mb: 2 }}
//                     >
//                       {date}
//                     </Typography>
//                     <Stack spacing={2}>
//                       {tasks.map((task) => (
//                         <TaskCard
//                           key={task._id}
//                           task={task}
//                           isPreviousTask
//                           loading={loading}
//                           activeTaskId={activeTaskId}
//                           expandedTasks={expandedTasks}
//                           setExpandedTasks={setExpandedTasks}
//                           formatDuration={formatDuration}
//                           taskTimers={taskTimers}
//                           handleTaskAction={handleTaskAction}
//                           handleEditTask={handleEditTask}
//                           handleDeleteTask={handleDeleteTask}
//                           onAction={() => setActionLoading(true)}
//                           onActionComplete={() => setActionLoading(false)}
//                         />
//                       ))}
//                     </Stack>
//                   </Box>
//                 ))}
//                 {!isLoading && Object.keys(groupedPreviousTasks).length === 0 && (
//                   <Typography color="text.secondary" textAlign="center">
//                     No previous tasks found
//                   </Typography>
//                 )}
//               </Stack>
//             )}
//           </Box>
//         ) : (
//           <Typography color="text.secondary" textAlign="center">
//             Please clock in to view and manage tasks
//           </Typography>
//         )}
//       </Paper>
  
//       {/* Task Dialogs - only render if clocked in */}
//       {clockInData && !clockOutData && (
//         <>
//           <TaskModel
//             open={showTaskInput}
//             onClose={() => setShowTaskInput(false)}
//             title="Add New Task"
//             value={newTask}
//             onChange={(e) => setNewTask(e.target.value)}
//             onSubmit={addTask}
//             loading={loading}
//             isEdit={false}
//           />
//           <TaskModel
//             open={editModalVisible}
//             onClose={() => setEditModalVisible(false)}
//             title="Edit Task"
//             value={editedDescription}
//             onChange={(e) => setEditedDescription(e.target.value)}
//             onSubmit={saveTaskEdit}
//             loading={loading}
//             isEdit={true}
//           />
//         </>
//       )}
//     </Box>
//   );
// };
// export default TaskAttendanceManagement;




import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addTaskAsync, updateTaskAsync, updateTaskStatusAsync, fetchTasksAsync } from '../../features/task/taskSlice';
import { toast } from 'react-toastify';

const TaskAttendanceManagement = ({ 
  tasks, 
  clockInData, 
  clockOutData, 
  currentDate, 
  employeeId ,
  showTaskInput, 
  setShowTaskInput
  
}) => {
  const dispatch = useDispatch();
  console.log("fetchTasksAsync", fetchTasksAsync)
  const [newTask, setNewTask] = useState('');
  const [taskValidationError, setTaskValidationError] = useState('');
  const [newTaskAdded, setNewTaskAdded] = useState(false);
  const [initialTaskCount, setInitialTaskCount] = useState(0);

  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const id = userData?.employee?.id;
      if (!id) {
        toast.error('Employee ID not found. Please log in again.');
        return null;
      }
      return id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      toast.error('Error accessing user data. Please log in again.');
      return null;
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    let currentEmployeeId = employeeId || getUserId();
    if (!currentEmployeeId) {
      toast.error('Unable to find employee ID. Please refresh and try again.');
      return;
    }

    try {
      const taskData = {
        description: newTask.trim(),
     
        attendanceId: clockInData._id,

        employeeId: currentEmployeeId,
      };

      const response = await dispatch(addTaskAsync(taskData)).unwrap();

      if (response) {
        setNewTask('');
        setNewTaskAdded(true);
        dispatch(fetchTasksAsync({
          employeeId: currentEmployeeId,
          date: currentDate,
        }));
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error(error.message || 'Failed to add task. Please try again.');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    let currentEmployeeId = employeeId || getUserId();
    if (!currentEmployeeId) {
      toast.error('Unable to find employee ID. Please refresh and try again.');
      return;
    }

    try {
      await dispatch(updateTaskStatusAsync({
        id: taskId,
        taskData: {
          status: newStatus,
          attendanceId: clockInData._id,
        },
      })).unwrap();

      dispatch(fetchTasksAsync({
        employeeId: currentEmployeeId,
        date: currentDate,
      }));
    //toast.success('Task status updated successfully');
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error(error.message || 'Failed to update task status. Please try again.');
    }
  };

  const handleSubmitTasks = () => {
    const currentTaskCount = tasks.length;
    if (!newTaskAdded || currentTaskCount <= initialTaskCount) {
      setTaskValidationError('Please add at least one task before continuing');
      setTimeout(() => setTaskValidationError(''), 3000);
      return;
    }
    setTaskValidationError('');
    setShowTaskInput(false);
    setNewTaskAdded(false);
  };
  const handleCloseDialog = () => {
    if (tasks.length === 0) {
      toast.warning('Please add at least one task before closing');
      return;
    }
    setShowTaskInput(false);
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Today's Tasks</Typography>
          {clockInData && !clockOutData && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowTaskInput(true)}
            >
              Add New Task
            </Button>
          )}
        </Stack>
        
        <Box sx={{ mt: 2 }}>
          {console.log("TASKS", tasks)}
          {tasks.map((task) => (
            <Card key={task._id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{}</Typography>
                  <Select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && (
            <Typography color="text.secondary" textAlign="center">
              No tasks found for today
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Task Input Dialog */}
      <Dialog open={showTaskInput} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
          Add Today's Tasks
          <IconButton
            onClick={() => setShowTaskInput(false)}
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
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Enter new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              sx={{ mb: 2 }}
            />
            {taskValidationError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {taskValidationError}
              </Typography>
            )}
          </Box>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={addTask}
              startIcon={<AddIcon />}
            >
              Add Task
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskAttendanceManagement;
