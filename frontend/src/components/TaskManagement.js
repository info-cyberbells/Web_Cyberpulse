import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
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
  DateRange as DateRangeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import TaskModal from "./TaskModal";
import LoopIcon from '@mui/icons-material/Loop';
import {
  getAttendance,
} from "../features/attendance/attendanceSlice";
import {
  Assignment as AssignmentIcon,
  TaskAlt as TaskAltIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  FactCheck as FactCheckIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ListAlt as ListAltIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "react-toastify/dist/ReactToastify.css";
import {
  addTaskAsync,
  updateTaskAsync,
  deleteTaskAsync,
  fetchTasksAsync,
  updateTaskStatusAsync,
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  selectTotalTasks,
  selectCompletedTasks,
  selectPendingTasks,
  selectInPausedTasks,
  selectInProgressTasks,
} from "../features/task/taskSlice";
import {
  fetchProjects,
  selectProjects
} from "../features/projects/projectsSlice";
import { styled } from "@mui/material/styles";

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));

// Stats Card Component
const StatCard = ({ title, value, icon, color = "primary" }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
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

// Task Form Component
const TaskForm = ({ open, initialData, mode, selectedDate, handleClose }) => {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects) || [];
  const [formData, setFormData] = useState({
    description: "",
    status: "Pending",
  });

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customProjectName, setCustomProjectName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

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


  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        description: initialData.description || "",
        status: initialData.status || "Pending",
      });

      const foundProject = projects.find(p => p.name === initialData.projectName);
      if (foundProject) {
        setSelectedProjectId(foundProject._id);
      } else if (initialData.projectName) {
        setSelectedProjectId('other');
        setCustomProjectName(initialData.projectName);
      } else {
        setSelectedProjectId('');
      }

      setEstimatedHours(initialData.estimatedHours || 0);
      setEstimatedMinutes(initialData.estimatedMinutes || 0);
    } else {

    }
  }, [initialData, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = JSON.parse(localStorage.getItem("user"));
    const employeeId = userData?.employee?.id;

    if (!employeeId) {
      toast.error("Employee ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    // Get HTML and plain text from ReactQuill
    const html = quillRef.current.getEditor().root.innerHTML;
    const plainText = quillRef.current.getEditor().getText().trim();

    if (!plainText) {
      toast.error("Please enter a task description");
      setLoading(false);
      return;
    }

    // Validation for required fields
    if (!selectedProjectId) {
      toast.error("Please select a project");
      setLoading(false);
      return;
    }

    if (selectedProjectId === "other" && !customProjectName.trim()) {
      toast.error("Please enter a custom project name");
      setLoading(false);
      return;
    }

    if (estimatedHours === 0 && estimatedMinutes === 0) {
      toast.error("Please set an estimated time");
      setLoading(false);
      return;
    }

    try {

      const selectedProject = projects.find(p => p._id === selectedProjectId);
      const projectName = selectedProjectId === "other"
        ? customProjectName
        : selectedProject?.name || "";

      const taskData = {
        description: html,
        plainText: plainText,
        status: formData.status,
        projectId: selectedProjectId,
        projectName: projectName,
        estimatedHours,
        estimatedMinutes,
        employeeId,
        date: selectedDate,
      };

      if (mode === "edit") {
        await dispatch(
          updateTaskAsync({
            id: initialData._id,
            taskData,
          })
        ).unwrap();
      } else {
        if (!isCurrentDate(selectedDate)) {
          toast.error("Tasks can only be added for the current date");
          setLoading(false);
          return;
        }
        await dispatch(addTaskAsync(taskData)).unwrap();
      }


      handleCloseForm();
      setFormData({
        description: "",
        status: "Pending",
      });
      setSelectedProjectId('');
      setCustomProjectName('');
      setEstimatedHours(0);
      setEstimatedMinutes(0);

      toast.success(mode === "edit" ? "Task updated successfully" : "Task added successfully");
    } catch (error) {
      toast.error(error.message || "Failed to process task");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    if (projectId !== 'other') {
      setCustomProjectName('');
    }
  };

  const handleCloseForm = () => {
    handleClose();
    setFormData({
      description: "",
      status: "Pending",
    });
    setSelectedProjectId('');
    setCustomProjectName('');
    setEstimatedHours(0);
    setEstimatedMinutes(0);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "edit" ? "Edit Task" : "Add New Task"}
        <IconButton
          aria-label="close"
          onClick={handleCloseForm}
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
      <DialogContent>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          modules={modules}
          formats={formats}
          placeholder="Enter task description..."
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
                  onChange={(e) => handleProjectChange(e.target.value)}
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
                      setEstimatedHours(value);
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
                        setEstimatedHours(0);
                      } else if (e.target.value > 23) {
                        setEstimatedHours(23);
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
                      setEstimatedMinutes(value);
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
                        setEstimatedMinutes(0);
                      } else if (e.target.value > 59) {
                        setEstimatedMinutes(59);
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
            onChange={(e) => setCustomProjectName(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            placeholder="Type custom project name"
            size="small"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseForm} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            (!mode === "edit" && (
              !selectedProjectId ||
              (selectedProjectId === "other" && !customProjectName.trim()) ||
              (estimatedHours === 0 && estimatedMinutes === 0)
            ))
          }
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : mode === "edit" ? (
            'Save Changes'
          ) : (
            'Add Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const stripHtml = (html) => {
  return html.replace(/<[^>]+>/g, '');
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "Completed":
        return "#4CAF50";
      case "Paused":
        return "#757575";
      case "Pending":
        return "#ed6c02";
      case "In progress":
        return "#1976d2";
      default:
        return "#757575";
    }
  };

  return (
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
            sx={{ wordBreak: "break-word" }}
          >
            {stripHtml(task.description)}
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
  );
};

// Helper function
const isCurrentDate = (dateString) => {
  if (!dateString) return false;
  const selected = new Date(dateString);
  const current = new Date();
  return (
    selected.getDate() === current.getDate() &&
    selected.getMonth() === current.getMonth() &&
    selected.getFullYear() === current.getFullYear()
  );
};

// Main Component
const TaskManagement = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks) || [];
  const currentAttendance = useSelector((state) => state.attendances?.currentAttendance);
  const [clockInData, setClockInData] = useState(null);
  const [clockOutData, setClockOutData] = useState(null);
  const loading = useSelector(selectTasksLoading);
  const totalTasks = useSelector(selectTotalTasks) || 0;
  const completedTasks = useSelector(selectCompletedTasks) || 0;
  const pendingTasks = useSelector(selectPendingTasks) || 0;
  const inPausedTasks = useSelector(selectInPausedTasks) || 0;
  const inProgressTasks = useSelector(selectInProgressTasks) || 0;
  const projects = useSelector(selectProjects) || [];

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openForm, setOpenForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // console.log("setSearchTerm",searchTerm)

  const today = new Date().toISOString().split("T")[0];
  const isUserClockedIn = () => {
    return clockInData && !clockOutData && currentAttendance && !currentAttendance.clockOutTime;
  };

  // ADD THIS useEffect TO FETCH ATTENDANCE DATA
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData?.employee?.id;

        if (employeeId) {
          await dispatch(getAttendance({
            id: employeeId,
            date: today
          }));
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendanceData();
  }, [dispatch, today]);

  // ADD THIS useEffect TO UPDATE CLOCK IN/OUT DATA BASED ON ATTENDANCE
  useEffect(() => {
    if (currentAttendance) {
      const { clockInTime, clockOutTime, _id } = currentAttendance;

      if (clockInTime && !isNaN(new Date(clockInTime).getTime())) {
        setClockInData({
          timestamp: clockInTime,
          _id: _id,
          clockInTime: clockInTime,
        });
      }

      if (clockOutTime && !isNaN(new Date(clockOutTime).getTime())) {
        setClockOutData({
          timestamp: clockOutTime,
          clockOutTime: clockOutTime,
        });
      }
    }
  }, [currentAttendance]);

  // Fetch tasks effect
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData?.employee?.id;

        if (!employeeId) {
          toast.error("User data not found. Please log in again.");
          return;
        }

        await dispatch(
          fetchTasksAsync({
            employeeId,
            startDate,
            endDate,
          })
        ).unwrap();
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
      }
    };

    fetchTasks();
  }, [dispatch, startDate, endDate]);

  // Handlers
  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
      // If end date is before new start date, update it
      if (new Date(endDate) < new Date(value)) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask({
      _id: task._id,
      description: task.description,
      status: task.status,
      projectName: task.projectName,
      estimatedHours: task.estimatedHours,
      estimatedMinutes: task.estimatedMinutes,
    });
    setOpenForm(true);
  };

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTaskAsync(taskId));
    }
  };

  // Filtered tasks
  const filteredTasks = React.useMemo(() => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    return tasksArray.filter((task) => {
      if (!task) return false;

      const taskStatus = (task.status || "").toLowerCase();
      const matchesStatus =
        filterStatus === "all" || taskStatus === filterStatus.toLowerCase();

      const matchesSearch = (task.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [tasks, filterStatus, searchTerm]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Task Management
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Create, track, and manage your daily tasks and assignments efficiently
              </Typography>
            </Box>
            <FactCheckIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      {/* Stats Section */}
      <Grid container spacing={4} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Tasks"
            value={totalTasks || 0}
            icon={<TaskIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed"
            value={completedTasks || 0}
            icon={<TaskDoneIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="In Progress"
            value={inProgressTasks || 0}
            icon={<LoopIcon fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Paused"
            value={inPausedTasks || 0}
            icon={<PendingTaskIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending"
            value={pendingTasks || 0}
            icon={<PendingIcon fontSize="large" />}
            color="error"
          />
        </Grid>
      </Grid>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
              }}
              inputProps={{ max: today }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
              }}
              inputProps={{ min: startDate, max: today }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Status Filter"
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
              <MenuItem value="In progress">In Progress</MenuItem>
              <MenuItem value="Paused">Paused</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Typography color="textSecondary">
                {filteredTasks.length} tasks found
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isCurrentDate(startDate) && isUserClockedIn() && (
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

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {/* Tasks Grid */}
      <Grid container spacing={3}>
        {/* {console.log("filteredTasks", filteredTasks)} */}
        {Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (

          filteredTasks.map((task) => (

            <Grid item xs={12} sm={6} md={4} key={task._id}>

              <TaskModal
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                {loading
                  ? "Loading tasks..."
                  : "No tasks found. Try adjusting your filters or add a new task."}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      {/* Task Form Dialog */}
      <TaskForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        initialData={selectedTask}
        mode={selectedTask ? "edit" : "add"}
        selectedDate={startDate}
      />
    </Container>
  );
};

export default TaskManagement;
