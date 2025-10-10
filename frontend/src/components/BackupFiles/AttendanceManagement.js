import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clockInAsync,
  clockOutAsync,
  fetchAttendanceHistoryAsync,
 
} from "../features/attendance/attendanceSlice";
import {
  addTaskAsync,
  fetchTasksAsync,
  updateTaskAsync,
  deleteTaskAsync
} from '../features/task/taskSlice';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  Chip,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

// const TimeDisplay = React.memo(({ startTime = null }) => {
//   const [time, setTime] = useState(new Date());
//   const [elapsedTime, setElapsedTime] = useState("00:00:00");

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(new Date());
//       if (startTime) {
//         const elapsed = new Date() - new Date(startTime);
//         const hours = Math.floor(elapsed / (1000 * 60 * 60));
//         const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
//         setElapsedTime(
//           `${hours.toString().padStart(2, "0")}:${minutes
//             .toString()
//             .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
//         );
//       }
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [startTime]);

//   return (
//     <Box>
//       <Typography
//         variant="h4"
//         sx={{ fontWeight: "bold", color: "text.secondary" }}
//       >
//         {time.toLocaleTimeString()}
//       </Typography>
//       {startTime && (
//         <Typography variant="h6" color="primary">
//           Time Elapsed: {elapsedTime}
//         </Typography>
//       )}
//     </Box>
//   );
// });

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const { tasks: reduxTasks, loading: taskLoading } = useSelector((state) => state.tasks);
  const attendanceState = useSelector((state) => {
    console.log('Redux State:', state); // Debug log
    return state?.attendance || {
      currentAttendance: null,
      loading: false,
      error: null,
      attendanceHistory: []
    };
  });

  const { currentAttendance, loading, error, attendanceHistory } = attendanceState;
  const [clockInData, setClockInData] = useState(null);
  const [clockOutData, setClockOutData] = useState(null);
  const [currentDate] = useState(new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState([]);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  console.log("ClockININData",clockInData)
console.log()
  useEffect(() => {
    loadData();
  }, []);
  // Add this useEffect to log state changes
  useEffect(() => {
    console.log('Current Attendance:', currentAttendance);
    console.log('Attendance History:', attendanceHistory);
  }, [currentAttendance, attendanceHistory]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty dependency array so it runs continuously

  useEffect(() => {
    let timer;
    if (clockInData?.timestamp && !clockOutData) {
      timer = setInterval(() => {
        const elapsed = new Date() - new Date(clockInData.timestamp);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [clockInData, clockOutData]);
  
  // Update the time display in your JSX
  // Replace the Clock In time display with:
  {clockInData && (
    <Typography color="success.main" sx={{ fontWeight: "600" }}>
      Clocked In: {new Date(clockInData.timestamp).toLocaleTimeString()}
    </Typography>
  )}

  // Update loadData function to also fetch from API
  const loadData = async () => {
    try {
      const response = await dispatch(fetchAttendanceHistoryAsync()).unwrap();
      console.log('API Response:', response); // Debug log
  
      if (response?.length > 0) {
        const todayAttendance = response.find(record => 
          new Date(record.date).toISOString().split('T')[0] === currentDate
        );
  
        console.log('Today Attendance:', todayAttendance); // Debug log
  
        if (todayAttendance) {
          setClockInData({
            timestamp: todayAttendance.clockInTime,
            id: todayAttendance._id // MongoDB uses _id
          });
  
          if (todayAttendance.clockOutTime) {
            setClockOutData({
              timestamp: todayAttendance.clockOutTime,
              hoursWorked: todayAttendance.totalHours || 
                ((new Date(todayAttendance.clockOutTime) - new Date(todayAttendance.clockInTime)) / (1000 * 60 * 60)).toFixed(2)
            });
          }
  
          if (todayAttendance.tasks) {
            setTasks(todayAttendance.tasks);
          }
        }
      }
    }  catch (error) {
      console.error("Failed to load attendance data:", error);
      
      // Fallback to localStorage if API fails
      try {
        const savedAttendance = localStorage.getItem(`attendance_${currentDate}`);
        if (savedAttendance) {
          const data = JSON.parse(savedAttendance);
          
          // Set clock in data
          if (data.clockIn) {
            console.log("data.clockIn",data.clockIn)
            setClockInData(data.clockIn);
          }
  
          // Set clock out data
          if (data.clockOut) {
            setClockOutData(data.clockOut);
          }
  
          // Set tasks
          if (data.tasks) {
            setTasks(data.tasks);
          }
  
          // Calculate elapsed time if clock in exists
          if (data.clockIn) {
            const endTime = data.clockOut ? new Date(data.clockOut.timestamp) : new Date();
            const elapsed = endTime - new Date(data.clockIn.timestamp);
            
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            
            setElapsedTime(
              `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
          }
        }
      } catch (localStorageError) {
        console.error("Failed to load from localStorage:", localStorageError);
      }
    }
  };
  const handleClockIn = async () => {
    try {
      const savedAttendance = localStorage.getItem('user');
          const data = JSON.parse(savedAttendance);
          // alert(data)
          const employeeId = data.employee.id;
          // alert(`Employee ID: ${employeeId}`);
        // }     
      const clockInData = {
        employeeId: employeeId,
        clockInTime: new Date().toISOString(),
        date: currentDate,
        clockInLocation: "Office",
        shift: "DAY",
        tasks: [],
        status: "Active"
      };
  
      const response = await dispatch(clockInAsync(clockInData)).unwrap();
      console.log('Clock In Response:', response);
  
      if (response?.attendance) {
        // Store the MongoDB _id directly
        setClockInData({
          
          timestamp: response.attendance.clockInTime,
          _id: response.attendance._id,  // Store as _id instead of id
          clockInTime: response.attendance.clockInTime
        });
  
        // Save to localStorage with _id
        const attendanceData = {
          clockIn: {
            timestamp: response.attendance.clockInTime,
            _id: response.attendance._id,  // Store as _id in localStorage too
            clockInTime: response.attendance.clockInTime
          }
        };
        localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(attendanceData));
      
        setShowTaskInput(true);
      }
    } catch (error) {
      console.error("Clock in failed:", error);
    }
  };
  

  const handleClockOut = async () => {
    // Check for _id instead of id
    if (!clockInData?._id) {
      console.error("No clock in data found");
      return;
    }
  
    try {
      const totalHours = (new Date() - new Date(clockInData.timestamp)) / (1000 * 60 * 60);
      
      const clockOutData = {
        // employeeId: "674ee96602847c0c62e0a1cf",
        clockOutTime: new Date().toISOString(),
        totalHours: totalHours.toFixed(2),
        tasks: tasks,
        status: "Completed"
      };
  
      console.log('Sending clock out request with ID:', clockInData._id);
  
      const response = await dispatch(clockOutAsync({
        id: clockInData._id,  // Use _id here
        data: clockOutData
      })).unwrap();
  
      console.log('Clock out response:', response);
  
      if (response?.attendance) {
        setClockOutData({
          timestamp: response.attendance.clockOutTime,
          hoursWorked: response.attendance.totalHours,
          clockOutTime: response.attendance.clockOutTime
        });
  
        // Update localStorage
        const savedAttendance = localStorage.getItem(`attendance_${currentDate}`);
        const updatedAttendance = savedAttendance ? JSON.parse(savedAttendance) : {};
        updatedAttendance.clockOut = {
          timestamp: response.attendance.clockOutTime,
          hoursWorked: response.attendance.totalHours,
          clockOutTime: response.attendance.clockOutTime
        };
        localStorage.setItem(`attendance_${currentDate}`, JSON.stringify(updatedAttendance));
  
        setShowDailyReport(true);
      }
    } catch (error) {
      console.error("Clock out failed:", error);
    }
  };
  // const handleClockIn = () => {
  //   const attendanceData = {
  //     clockIn: {
  //       timestamp: new Date().toISOString(),
  //     },
  //   };
  //   localStorage.setItem(
  //     `attendance_${currentDate}`,
  //     JSON.stringify(attendanceData)
  //   );
  //   setClockInData(attendanceData.clockIn);
  //   setClockOutData(null);
  //   setElapsedTime("00:00:00");
  //   setShowTaskInput(true);
  // };

  // const handleClockOut = () => {
  //   if (!clockInData) return;

  //   const timeWorked = new Date() - new Date(clockInData.timestamp);
  //   const hoursWorked = (timeWorked / (1000 * 60 * 60)).toFixed(2);

  //   const attendanceData = {
  //     clockIn: clockInData,
  //     clockOut: {
  //       timestamp: new Date().toISOString(),
  //       hoursWorked: hoursWorked,
  //     },
  //   };

  //   localStorage.setItem(
  //     `attendance_${currentDate}`,
  //     JSON.stringify(attendanceData)
  //   );
  //   setClockOutData(attendanceData.clockOut);
  //   setShowDailyReport(true);

  //   // Set final elapsed time
  //   const elapsed = new Date() - new Date(clockInData.timestamp);
  //   const hours = Math.floor(elapsed / (1000 * 60 * 60));
  //   const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  //   const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
  //   setElapsedTime(
  //     `${hours.toString().padStart(2, "0")}:${minutes
  //       .toString()
  //       .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  //   );
  // };

  // const addTask = () => {
  //   if (!newTask.trim()) {
  //     alert("Please enter a task description");
  //     return;
  //   }

  //   const newTaskObj = {
  //     id: Date.now(),
  //     description: newTask.trim(),
  //     status: "pending",
  //     createdAt: new Date().toISOString(),
  //   };

  //   const updatedTasks = [...tasks, newTaskObj];
  //   setTasks(updatedTasks);
  //   localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(updatedTasks));
  //   setNewTask("");
  // };
  const addTask = async () => {
    if (!newTask.trim()) {
      alert("Please enter a task description");
      return;
    }
    const savedAttendance = localStorage.getItem('user');
    const data = JSON.parse(savedAttendance);
    // alert(data)
    const employeeId = data.employee.id;
    // alert(`Employee ID: ${employeeId}`);
    try {
      const taskData = {
        title: newTask.trim(),
        status: "pending",
        attendanceId: clockInData._id, // Link task to current attendance
        date: currentDate,
        employeeId: employeeId
      };

      const response = await dispatch(addTaskAsync(taskData)).unwrap();
      console.log("response", response)
      if (response) {
        setNewTask("");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await dispatch(updateTaskAsync({
        id: taskId,
        taskData: {
          status: newStatus,
          attendanceId: clockInData._id
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };
  // Add useEffect to fetch tasks when attendance changes
  useEffect(() => {
    if (clockInData?._id) {
      dispatch(fetchTasksAsync(clockInData._id)); // Fetch tasks for current attendance
    }
  }, [clockInData?._id]);
  // const updateTaskStatus = (taskId, newStatus) => {
  //   const updatedTasks = tasks.map((task) =>
  //     task.id === taskId ? { ...task, status: newStatus } : task
  //   );
  //   setTasks(updatedTasks);
  //   localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(updatedTasks));
  // };

  const getTaskStatistics = () => {
    const total = reduxTasks.length;
    const completed = reduxTasks.filter(task => task.status === "completed").length;
    const pending = reduxTasks.filter(task => task.status === "pending").length;
    const inProgress = reduxTasks.filter(task => task.status === "in-progress").length;
    return { total, completed, pending, inProgress };
  };

  const handleSubmitTasks = () => {
    if (reduxTasks.length === 0) {
      alert("Please add at least one task for the day.");
      return;
    }
    setShowTaskInput(false);
  };
  const renderDailyReport = () => (
    <Dialog open={showDailyReport} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AssignmentIcon />
          <Typography>
            Daily Work Report - {new Date(currentDate).toLocaleDateString()}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Card
            sx={{
              mb: 3,
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Duration
              </Typography>
              <Typography>
                Clock In:{" "}
                {clockInData &&
                  new Date(clockInData.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography>
                Clock Out:{" "}
                {clockOutData &&
                  new Date(clockOutData.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                Total Hours: {clockOutData?.hoursWorked} hours
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            Task Overview
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip
              label={`Total Tasks: ${getTaskStatistics().total}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Completed: ${getTaskStatistics().completed}`}
              color="success"
            />
            <Chip
              label={`In Progress: ${getTaskStatistics().inProgress}`}
              color="warning"
            />
            <Chip
              label={`Pending: ${getTaskStatistics().pending}`}
              color="error"
            />
          </Stack>

          <Typography variant="h6" gutterBottom>
            Task Details
          </Typography>
          {reduxTasks.map((task) => (
            <Card key={task._id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    {task.title}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Chip
                      label={task.status.toUpperCase()}
                      color={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in-progress"
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Added at: {new Date(task.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDailyReport(false)} variant="contained">
          Close Report
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ maxWidth: "lg", mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime />
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "text.secondary" }}
                >
                  {currentTime.toLocaleTimeString()}
                </Typography>
                {clockInData && (
                  <Typography variant="h6" color="primary">
                    Time Elapsed: {elapsedTime}
                  </Typography>
                )}
              </Box>
            </Box>

            {clockInData && (
          <Typography color="success.main" sx={{ fontWeight: "600" }}>
            Clocked In: {clockInData.date}
          </Typography>
        )}
            {/* <Typography variant="h6">
              {new Date(currentDate).toLocaleDateString()}
            </Typography> */}
          </Stack>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Attendance Status
        </Typography>
        {clockInData && (
          <Typography color="success.main" sx={{ fontWeight: "600" }}>
            Clocked In: {new Date(clockInData.clockInTime).toLocaleTimeString()}
          </Typography>
        )}
        {clockOutData && (
          <Typography color="error.main" sx={{ fontWeight: "600" }}>
            Clocked Out: {new Date(clockOutData.clockOutTime).toLocaleTimeString()}
          </Typography>
        )}
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
        {(!clockInData || clockOutData) && (
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleClockIn}
            startIcon={<CheckCircleIcon />}
          >
            Clock In
          </Button>
        )}
     
        {clockInData && !clockOutData && (
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleClockOut}
            startIcon={<CancelIcon />}
          >
            Clock Out
          </Button>
        )}
      </Stack>

      <Dialog open={showTaskInput} fullWidth maxWidth="md">
        <DialogTitle>Add Today's Tasks</DialogTitle>
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
            <Button
              variant="contained"
              color="primary"
              onClick={addTask}
              startIcon={<AddIcon />}
            >
              Add Task
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmitTasks}
            variant="contained"
            color="primary"
          >
            Submit & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {renderDailyReport()}

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
      {reduxTasks.map((task) => (
        <Card key={task._id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>{task.title}</Typography>
              <Select
                value={task.status}
                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </Stack>
          </CardContent>
        </Card>
      ))}
      {reduxTasks.length === 0 && (
        <Typography color="text.secondary" textAlign="center">
          No tasks found for today
        </Typography>
      )}
    </Box>
      </Paper>

      {clockOutData && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowDailyReport(true)}
            startIcon={<AssignmentIcon />}
          >
            View Today's Report
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceManagement;
