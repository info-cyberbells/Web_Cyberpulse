import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clockInAsync,
  clockOutAsync,
  getAttendance,
  fetchAttendanceTasksAsync,
} from "../features/attendance/attendanceSlice";
import { format } from "date-fns";
import {
  fetchTasksAsync,
} from "../features/task/taskSlice";
import DailyReport from "./Attendance/DailyReport";
import MonthlyReport from "././Attendance/MonthlyReport";
import TaskAttendanceManagement from './TaskAttendanceManagement/TaskAttendanceManagement';

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
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AccessTime,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { CalendarMonth, TrendingUp } from "@mui/icons-material";

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const { tasks: reduxTasks, loading: taskLoading } = useSelector(
    (state) => state.tasks
  );
  const { currentAttendance } = useSelector((state) => state.attendances);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clockInData, setClockInData] = useState(null);
  const [clockOutData, setClockOutData] = useState(null);
  const [currentDate] = useState(new Date().toISOString().split("T")[0]);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [totalHoursWorked, setTotalHoursWorked] = useState("0.00");
  const [hasAlreadyClockedIn, setHasAlreadyClockedIn] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [initialTaskCount, setInitialTaskCount] = useState(0);
  const [newTaskAdded, setNewTaskAdded] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);


  const getCurrentISOTime = () => {
    const now = new Date();
    // Create a date string with local timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    // Construct ISO string with local time
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  };
  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const id = userData?.employee?.id;
      if (!id) {
        toast.error("Employee ID not found. Please log in again.");
        return null;
      }
      return id;
    } catch (error) {
      console.error("Error getting user ID from localStorage:", error);
      toast.error("Error accessing user data. Please log in again.");
      return null;
    }
  };

  useEffect(() => {
    const id = getUserId();
    if (id) {
      setEmployeeId(id);
    }
  }, []);

  useEffect(() => {
    if (showDailyReport) {
      const fetchMonthlyData = async () => {
        const employeeId = getUserId();
        if (!employeeId) return;
        try {
          const formattedDate = format(selectedDate, "yyyy-MM");
          const response = await dispatch(
            fetchAttendanceTasksAsync({
              date: formattedDate,
              employeeId,
            })
          ).unwrap();
          setMonthlyAttendance(response.data || []);
        } catch (error) {
          console.error("Failed to fetch monthly attendance:", error);
        }
      };
      fetchMonthlyData();
    }
  }, [showDailyReport, selectedDate, dispatch]);

  // Load initial attendance data and start fetching tasks
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      dispatch(getAttendance({ id: userId, date: currentDate }));
      dispatch(
        fetchTasksAsync({
          employeeId: userId,
          date: currentDate,
        })
      );
    }
  }, [dispatch, currentDate]);

  // Add these helper functions
  const calculateMonthlyStats = () => {
    return monthlyAttendance.reduce(
      (acc, day) => {
        acc.totalHours += parseFloat(day.totalHours || 0);
        acc.totalTasks += day.tasks?.length || 0;
        acc.completedTasks +=
          day.tasks?.filter((t) => t.status === "Completed").length || 0;
        return acc;
      },
      { totalHours: 0, totalTasks: 0, completedTasks: 0 }
    );
  };

  const handleEmergencyClockOut = async () => {
    if (!emergencyReason.trim()) {
      alert("Please provide an emergency reason");
      return;
    }
    if (!clockInData?._id) {
      alert("No clock in data found");
      return;
    }
    try {
      const clockOutTime = getCurrentISOTime();
      const clockOutData = {
        clockOutTime,
        type: "CLOCK_OUT",
        emergencyReason: emergencyReason.trim(),
        isEmergency: true,
      };
      console.log("Emergency Clock Out Payload:", clockOutData);
      const response = await dispatch(
        clockOutAsync({
          id: clockInData._id,
          clockOutData: clockOutData, // Changed from clockOutData to data
        })
      ).unwrap();
      if (response?.attendance) {
        // Make sure we set all necessary data in the state
        setClockOutData({
          timestamp: response.attendance.clockOutTime,
          clockOutTime: response.attendance.clockOutTime,
          emergencyReason: emergencyReason.trim(),
          isEmergency: true,
        });
        setShowDailyReport(true);
        setShowEmergencyModal(false);
        setEmergencyReason("");
        // Refresh attendance data
        const userId = getUserId();
        if (userId) {
          dispatch(getAttendance({ id: userId, date: currentDate }));
        }
      }
    } catch (error) {
      console.error("Emergency clock out failed:", error);
      alert("Failed to clock out. Please try again.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Update attendance data when attendance state changes
  useEffect(() => {
    if (currentAttendance) {
      const { clockInTime, clockOutTime, _id, isEmergency, emergencyReason } =
        currentAttendance;
      console.log("Current Attendance:", currentAttendance); // For debugging
      setClockInData({
        timestamp: clockInTime,
        _id: _id,
        clockInTime: clockInTime,
      });
      setHasAlreadyClockedIn(!!clockInTime);
      if (clockOutTime) {
        setClockOutData({
          timestamp: clockOutTime,
          clockOutTime: clockOutTime,
          isEmergency: isEmergency || false,
          emergencyReason: emergencyReason || "",
        });
      }
    }
  }, [currentAttendance]);

  useEffect(() => {
    const initializeData = async () => {
      let currentEmployeeId = employeeId;
      if (!currentEmployeeId) {
        currentEmployeeId = getUserId();
        if (currentEmployeeId) {
          setEmployeeId(currentEmployeeId);
        } else {
          return; // Exit if no valid employee ID
        }
      }
      dispatch(getAttendance({ id: currentEmployeeId, date: currentDate }));
      dispatch(
        fetchTasksAsync({
          employeeId: currentEmployeeId,
          date: currentDate,
        })
      );
    };
    initializeData();
  }, [dispatch, currentDate, employeeId]);

  // Timer for current time and elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (clockInData?.timestamp && !clockOutData) {
        updateElapsedTime(clockInData.timestamp);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [clockInData, clockOutData]);

  // Update total hours worked
  useEffect(() => {
    if (clockInData?.timestamp) {
      const endTime = clockOutData
        ? new Date(clockOutData.timestamp)
        : new Date();
      const startTime = new Date(clockInData.timestamp);
      const diff = (endTime - startTime) / (1000 * 60 * 60);
      setTotalHoursWorked(diff.toFixed(2));
    }
  }, [clockInData, clockOutData]);

  useEffect(() => {
    if (showTaskInput) {
      setInitialTaskCount(reduxTasks.length);
      setNewTaskAdded(false);
    }
  }, [showTaskInput, reduxTasks.length]);

  const updateElapsedTime = (startTime) => {
    const elapsed = new Date() - new Date(startTime);
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    setElapsedTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };
 
  const handleClockIn = async () => {
    if (hasAlreadyClockedIn) {
      alert("You have already clocked in for today!");
      return;
    }
    const employeeId = getUserId();
    if (!employeeId) {
      alert("User data not found. Please log in again.");
      return;
    }
    try {
      const clockInTime = getCurrentISOTime();
      const clockInData = {
        employeeId,
        clockInTime,
        date: clockInTime.split("T")[0],
      };
      const response = await dispatch(clockInAsync(clockInData)).unwrap();
      if (response?.attendance) {
        setClockInData({
          timestamp: response.attendance.clockInTime,
          _id: response.attendance._id,
          clockInTime: response.attendance.clockInTime,
        });
        setHasAlreadyClockedIn(true);
        setShowTaskInput(true); // Set this to true to show the task modal
        // Refresh attendance data
        dispatch(getAttendance({ id: employeeId, date: clockInTime.split("T")[0] }));
        
        // Fetch tasks after successful clock in
        dispatch(fetchTasksAsync({
          employeeId,
          date: clockInTime.split("T")[0],
        }));
      }
    } catch (err) {
      console.error("Clock in failed:", err);
      alert("Failed to clock in. Please try again.");
    }
  };
  
  const checkTimeAndClockOut = (currentTime) => {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    // Convert to 24-hour format: 18:00 is 6 PM
    const clockOutTime = {
      hours: 18,
      minutes: 0,
    };
    // Return true if current time is past 6 PM
    return (
      currentHour > clockOutTime.hours ||
      (currentHour === clockOutTime.hours &&
        currentMinutes >= clockOutTime.minutes)
    );
  };
  const handleClockOut = async () => {
    if (!clockInData?._id) {
      alert("No clock in data found");
      return;
    }
    const now = new Date();
    const canClockOut = checkTimeAndClockOut(now);
    if (!canClockOut) {
      alert("You can only clock out after 6:00 PM");
      return;
    }
    try {
      // Regular clock out data
      const clockOutTime = getCurrentISOTime();
      const clockOutData = {
        clockOutTime,
        type: "CLOCK_OUT",
      };
      const response = await dispatch(
        clockOutAsync({
          id: clockInData._id,
          clockOutData: clockOutData,
        })
      ).unwrap();
      if (response?.attendance) {
        setClockOutData({
          timestamp: response.attendance.clockOutTime,
          clockOutTime: response.attendance.clockOutTime,
          isEmergency: false,
        });
        setTotalHoursWorked(totalHoursWorked);
        setShowDailyReport(true);
        // Refresh attendance data
        const userId = getUserId();
        if (userId) {
          dispatch(getAttendance({ id: userId, date: currentDate }));
        }
      }
    } catch (error) {
      console.error("Clock out failed:", error);
      alert("Failed to clock out. Please try again.");
    }
  };

  const renderDailyReport = () => (
    <Dialog open={showDailyReport} fullWidth maxWidth="md">
      <DialogTitle>
        <Box
          sx={{ position: "relative", display: "flex", alignItems: "center" }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon />
            <Typography>Attendance Report</Typography>
          </Stack>
          <IconButton
            onClick={() => setShowDailyReport(false)}
            sx={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<AccessTime />} label="Today's Report" />
          <Tab icon={<CalendarMonth />} label="Monthly Overview" />
        </Tabs>

        {selectedTab === 0 && (
          <DailyReport
            clockInData={clockInData}
            clockOutData={clockOutData}
            totalHoursWorked={totalHoursWorked}
            tasks={reduxTasks}
            clockInSelfie={currentAttendance?.clockInSelfie}
            clockOutSelfie={currentAttendance?.clockOutSelfie}
          />
        )}
        {selectedTab === 1 && (
          <MonthlyReport
            selectedDate={selectedDate}
            onDateChange={(newValue) => setSelectedDate(newValue)}
            monthlyAttendance={monthlyAttendance}
          />
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button onClick={() => setShowDailyReport(false)} variant="contained">
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
  return (
    <Box sx={{ maxWidth: "lg", mx: "auto", p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
                py: 1,
                px: 2,
              }}
            >
              <AccessTime sx={{ color: "primary.main" }} />
              {clockInData && !clockOutData ? (
                <Box>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: "bold", mb: 0.5 }}
                  >
                    Time Elapsed
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary.main"
                    sx={{ fontWeight: "medium", letterSpacing: 1 }}
                  >
                    {elapsedTime}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: "medium" }}
                >
                  Not Clocked In
                </Typography>
              )}
            </Stack>
            <Stack spacing={1.5} alignItems="flex-end">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  py: 0.5,
                  px: 2,
                }}
              >
                <AccessTime sx={{ color: "text.secondary" }} />
                <Typography variant="h6" sx={{}}>
                  {currentTime.toLocaleTimeString()}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  py: 0.5,
                  px: 2,
                }}
              >
                <CalendarMonth sx={{ color: "text.secondary" }} />
                <Typography variant="h6">
                  {format(new Date(currentDate), "MMM-dd-yyyy")}
                </Typography>
              </Stack>
            </Stack>
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
        {clockOutData && !clockOutData.isEmergency !== 'false' && (
          <Typography color="error.main" sx={{ fontWeight: "600" }}>
            Clocked Out:{" "}
            {new Date(clockOutData.clockOutTime).toLocaleTimeString()}
          </Typography>
        )}
        {clockOutData && clockOutData.isEmergency !== 'false' && (
          <>
            <Typography color="error.main" sx={{ fontWeight: "600" }}>
              Emergency Clock Out:{" "}
              {new Date(clockOutData.clockOutTime).toLocaleTimeString()}
            </Typography>
            <Typography color="error.main" sx={{ fontWeight: "500", mt: 1 }}>
              Reason: {clockOutData.emergencyReason}
            </Typography>
          </>
        )}
        {clockOutData && (
          <Typography color="info.main" sx={{ fontWeight: "600", mt: 1 }}>
            Your attendance is completed for today
          </Typography>
        )}
      </Paper>
      <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
        {!hasAlreadyClockedIn && !clockOutData && (
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={handleClockOut}
              startIcon={<CancelIcon />}
            >
              Clock Out
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={() => setShowEmergencyModal(true)}
              startIcon={<CancelIcon />}
            >
              Emergency Clock Out
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Emergency Clock Out Dialog */}
      <Dialog
        open={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: "error.main" }}>
          Emergency Clock Out
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography color="error" gutterBottom>
              Please provide the reason for emergency clock out:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              placeholder="Enter emergency reason..."
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowEmergencyModal(false);
              setEmergencyReason("");
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmergencyClockOut}
            variant="contained"
            color="error"
          >
            Confirm Emergency Clock Out
          </Button>
        </DialogActions>
      </Dialog>
      {renderDailyReport()}
      <TaskAttendanceManagement
        tasks={reduxTasks}
        clockInData={clockInData}
        clockOutData={clockOutData}
        currentDate={currentDate}
        employeeId={employeeId}
        
      />   
      {/* {clockOutData && ( */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowDailyReport(true)}
          startIcon={<AssignmentIcon />}
        >
          Attendance History
        </Button>
      </Box>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Box>
  );
};
export default AttendanceManagement;
