import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Grid,
  Container,
  IconButton,
  Divider,
  Paper,
  TextField,
  Typography,
  MenuItem,
  LinearProgress,
  Stack,
} from "@mui/material";
import { format } from "date-fns";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  CalendarMonth as CalendarIcon,
  AssignmentTurnedIn as TaskDoneIcon,
  Assignment as TaskIcon,
  HourglassEmpty as PendingTaskIcon,
} from "@mui/icons-material";
import { HourglassEmpty } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addTaskAsync,
  updateTaskAsync,
  deleteTaskAsync,
  fetchTasksAsync,
  updateTaskStatusAsync,
  //clearTaskError,
  //clearTaskSuccessMessage,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  selectTotalTasks,
  selectCompletedTasks,
  selectPendingTasks,
  selectInPausedTasks,
  selectInProgressTasks,
} from "../features/task/taskSlice";

const StatCard = ({ description, value, icon, color }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {description}
          </Typography>
          <Typography variant="h4" color={color}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.lighter`,
            borderRadius: 2,
            p: 1,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);
const isCurrentDate = (dateString) => {
  const selected = new Date(dateString);
  const current = new Date();
  return (
    selected.getDate() === current.getDate() &&
    selected.getMonth() === current.getMonth() &&
    selected.getFullYear() === current.getFullYear()
  );
};
const TaskForm = ({ open, handleClose, initialData, mode, selectedDate }) => {
  const dispatch = useDispatch(); // Add this line
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: selectedDate || new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dueDate:
          initialData.dueDate?.split("T")[0] ||
          selectedDate ||
          new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        description: "",
      });
    }
  }, [initialData, selectedDate]);

  useEffect(() => {
    console.log("useEffect triggered with date:", selectedDate);
    const fetchData = () => {
      console.log("About to dispatch fetchTasksAsync");
      dispatch(
        fetchTasksAsync({
          employeeId: "674ee96602847c0c62e0a1cf",
          date: selectedDate,
        })
      );
    };
    fetchData();
  }, [dispatch, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get employeeId from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    const employeeId = userData?.employee?.id;

    if (!employeeId) {
      toast.error("Employee ID not found. Please log in again.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    // Check if the selected date is current date
    // if (!isCurrentDate(selectedDate)) {
    //   toast.error("Tasks can only be added for the current date");
    //   return;
    // }

    try {
      if (mode === "edit") {
        await dispatch(
          updateTaskAsync({
            id: initialData._id,
            taskData: {
              ...formData,
              employeeId,
              date: selectedDate,
            },
          })
        ).unwrap();
        // toast.success("Task updated successfully");
      } else {
        if (!isCurrentDate(selectedDate)) {
          toast.error("Tasks can only be added for the current date");
          return;
        }
        // For new task
        const taskData = {
          description: formData.description.trim(),
          status: formData.status,
          employeeId: employeeId,
          date: selectedDate,
        };

        await dispatch(addTaskAsync(taskData)).unwrap();
        // toast.success("Task added successfully");
      }

      // Refresh tasks after successful operation
      dispatch(
        fetchTasksAsync({
          employeeId,
          date: selectedDate,
        })
      );

      handleClose();
      setFormData({
        description: "",
        status: "Pending",
        dueDate: selectedDate || new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error(error.message || "Failed to process task");
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "Edit Task" : "Add New Task"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Grid>
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid> */}
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid> */}
            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid> */}
          </Grid>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {mode === "edit" ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "paused":
        return "rgba(0, 0, 0, 0.6)";
      case "pending":
        return "#ed6c02";
      case "in progress":
        return "#1976d2";
      default:
        return "default";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
        transition: "transform 0.2s",
        "&:hover": {
          // transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            {task.description}
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
        {/* <Typography
          color="textSecondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "4.5em",
          }}
        >
          {task.description}
        </Typography> */}
        <Stack direction="row" spacing={1} mb={2}>
          {/* <Chip
            size="small"
            label={task.priority}
            color={getPriorityColor(task.priority)}
          /> */}
          <Typography
            variant="body2"
            sx={{
              color: "#fff",
              padding: "7px 7px",
              backgroundColor: getStatusColor(task.status),
              display: "inline-block",
              borderRadius: "3px",
            }}
          >
            {task.status}
          </Typography>
        </Stack>
        <Divider />
        {console.log("task.createdAt", task.createdAt)}
        <Typography
          variant="caption"
          display="block"
          mt={2}
          color="text.secondary"
        >
          Date: {format(new Date(task.createdAt), "MMM-dd-yyyy")}
        </Typography>
      </CardContent>
    </Card>
  );
};

const TaskManagement = () => {
  const dispatch = useDispatch(); // Add this line at the top of TaskManager
  const tasks = useSelector(selectTasks);
  console.log("tasks", tasks);
  // Remove handleDateChange and useEffect from TaskForm and add them here
  const handleDateChange = (e) => {
    console.log("Date changed to:", e.target.value);
    setSelectedDate(e.target.value);
  };
  const loading = useSelector(selectTasksLoading);
  const error = useSelector(selectTasksError);

  const totalTasks = useSelector(selectTotalTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const pendingTasks = useSelector(selectPendingTasks);
  const inPausedTasks = useSelector(selectInPausedTasks);
  const inProgressTasks = useSelector(selectInProgressTasks);

  const [openForm, setOpenForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  useEffect(() => {
    console.log("useEffect triggered with date:", selectedDate);

    // Retrieve the user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));

    // Extract the employeeId
    const employeeId = userData?.employee?.id;
    // alert(employeeId)
    if (!employeeId) {
      console.error("Employee ID not found in localStorage!");
      return; // Exit early if employeeId is not found
    }

    console.log("Employee ID retrieved from localStorage:", employeeId);

    const fetchData = () => {
      console.log("About to dispatch fetchTasksAsync");
      const userData = JSON.parse(localStorage.getItem("user"));

      // Extract the employeeId
      const employeeId = userData?.employee?.id;
      // alert(employeeId)
      dispatch(
        fetchTasksAsync({
          employeeId, // Use the employeeId retrieved from localStorage
          date: selectedDate,
        })
      );
    };

    fetchData();
  }, [dispatch, selectedDate]);

  const handleEdit = (task) => {
    // Make sure we're passing the complete task object
    setSelectedTask({
      _id: task._id,
      description: task.description,
      // status: task.status,
      dueDate: task.dueDate || task.createdAt, // Use createdAt as fallback
    });
    setOpenForm(true);
  };

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTaskAsync(taskId));
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTask(null);
  };

  const filteredTasks = React.useMemo(() => {
    console.log("Filtering tasks:", tasks);
    try {
      return (tasks || []).filter((task) => {
        const taskStatus = task.status?.toLowerCase();
        const matchesStatus =
          filterStatus === "all" || taskStatus === filterStatus.toLowerCase();

        const matchesSearch = task.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      });
    } catch (error) {
      console.error("Error filtering tasks:", error);
      return [];
    }
  }, [tasks, filterStatus, searchTerm]);

  return (
    <Container sx={{ p: 3 }} maxWidth="lg">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        {/* <Tooltip title="Add New Task">
          <Fab color="primary" size="medium" onClick={() => setOpenForm(true)}>
            <AddIcon />
          </Fab>
        </Tooltip> */}
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<TaskDoneIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Partial"
            value={inPausedTasks}
            icon={<HourglassEmpty fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            icon={<HourglassEmpty fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={pendingTasks}
            icon={<PendingTaskIcon fontSize="large" />}
            // color="warning"
          />
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange} // Use the new handler
              InputProps={{
                startAdornment: (
                  <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              InputProps={{
                startAdornment: (
                  <FilterIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paused">Paused</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box display="flex" justifyContent="flex-end">
              <Typography color="textSecondary">
                {filteredTasks.length} tasks found
              </Typography>
            </Box>
          </Grid>
          {isCurrentDate(selectedDate) && (
            <Box
              sx={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 1000,
              }}
            >
              <Fab
                color="primary"
                onClick={() => {
                  setSelectedTask(null);
                  setOpenForm(true);
                }}
                sx={{
                  width: 56,
                  height: 56,
                  boxShadow: 3,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <AddIcon />
              </Fab>
            </Box>
          )}
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tasks Grid */}
      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task._id}>
            <TaskCard task={task} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
        ))}
        {filteredTasks.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No tasks found. Try adjusting your filters or add a new task.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Task Form Dialog */}
      <TaskForm
        open={openForm}
        handleClose={handleCloseForm}
        initialData={selectedTask}
        mode={selectedTask ? "edit" : "add"}
        selectedDate={selectedDate}
      />
    </Container>
  );
};

export default TaskManagement;
