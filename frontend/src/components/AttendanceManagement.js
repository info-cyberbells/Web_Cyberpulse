import React, { useState, useEffect } from "react";
import { store } from "../store";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import {
  clockInAsync,
  clockOutAsync,
  getAttendance,
  fetchAttendanceTasksAsync,
  updateAttendanceAsync,
} from "../features/attendance/attendanceSlice";
import {
  ExitToApp as ExitToAppIcon,
  FreeBreakfast as FreeBreakfastIcon,
  EmojiFoodBeverage as EmojiFoodBeverageIcon,
  Work as WorkIcon,
  Warning as WarningIcon,
  Restaurant as RestaurantIcon,
  MoreHoriz as MoreHorizIcon,
  HistoryToggleOff as HistoryToggleOffIcon,
  BreakfastDining as BreakfastDiningIcon,
  PauseCircleOutline as PauseCircleOutlineIcon
} from '@mui/icons-material';
import { format } from "date-fns";
import { fetchTasksAsync, updateTaskStatusAsync } from "../features/task/taskSlice";
import DailyReport from "./Attendance/DailyReport";
import MonthlyReport from "././Attendance/MonthlyReport";
import { CircularProgress } from "@mui/material";
import TaskAttendanceManagement from "./TaskAttendanceManagement/TaskAttendanceManagement";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
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
  Divider,
  Chip,
  Grid,
  Avatar,
  alpha,
  Tooltip,
  Container,
  useTheme,
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
  Timer as TimerIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import SummarizeIcon from '@mui/icons-material/Summarize';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { CalendarMonth, TrendingUp, MoreTime, HourglassEmpty, DescriptionOutlined } from "@mui/icons-material";

const AttendanceManagement = () => {
  const theme = useTheme();
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
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [clockInRequestId, setClockInRequestId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [lastElapsedSeconds, setLastElapsedSeconds] = useState(0);

  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakType, setBreakType] = useState('');
  const [breakDescription, setBreakDescription] = useState('');
  const [breakTimer, setBreakTimer] = useState(0);
  const [breakHistoryExpanded, setBreakHistoryExpanded] = useState(false);
  const [activeTaskIdBeforeBreak, setActiveTaskIdBeforeBreak] = useState(null);
  const [isBreakLoading, setIsBreakLoading] = useState(false);

  const getCurrentISOTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

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

  const breakOptions = [
    // { value: 'Morning Tea/Coffee', label: 'Morning Tea/Coffee Break (Max 10 minutes)', duration: 10 * 60 },
    { value: 'Lunch Break', label: 'Lunch Break (Max 30 minutes)', duration: 30 * 60 },
    // { value: 'Evening Tea/Coffee', label: 'Evening Tea/Coffee Break (Max 10 minutes)', duration: 10 * 60 },
    { value: 'other', label: 'Other', duration: 0 },
  ];

  useEffect(() => {
    const id = getUserId();
    if (id) {
      setEmployeeId(id);
    }
  }, []);

  const getBreakIcon = (breakName) => {
    switch (breakName) {
      case 'Morning Tea/Coffee':
        return <EmojiFoodBeverageIcon />;
      case 'Evening Tea/Coffee':
        return <FreeBreakfastIcon />;
      case 'Lunch Break':
        return <RestaurantIcon />;
      default:
        return <MoreHorizIcon />;
    }
  };


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
      await pauseActiveTask();
      const clockOutTime = getCurrentISOTime();
      let updatedBreakTimings = [...(currentAttendance?.breakTimings || [])];
      if (currentAttendance?.Employeestatus === "on break") {
        updatedBreakTimings = updatedBreakTimings.map((b, index) =>
          index === updatedBreakTimings.length - 1 && !b.endTime ? { ...b, endTime: clockOutTime } : b
        );
      }
      const breakTimeMinutes = updatedBreakTimings.reduce((acc, b) => {
        if (b.startTime && b.endTime) {
          return acc + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60));
        }
        return acc;
      }, 0);
      const clockOutData = {
        clockOutTime,
        type: "CLOCK_OUT",
        emergencyReason: emergencyReason.trim(),
        isEmergency: true,
        breakTime: breakTimeMinutes,
        breakTimings: updatedBreakTimings,
        Employeestatus: "clocked out", // Fixed
      };
      console.log("Emergency clock out payload:", clockOutData); // Debug log
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
          emergencyReason: emergencyReason.trim(),
          isEmergency: true,
          workingDay: response.attendance.workingDay,
        });
        setShowDailyReport(true);
        setShowEmergencyModal(false);
        setEmergencyReason('');
        toast.dismiss();
        toast.success("Emergency clock out successful!");
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

  const pauseActiveTask = async () => {
    console.log("pauseActiveTask called - Checking for active task...");
    try {
      const activeTask = reduxTasks.find((task) => task.status === "In Progress");
      if (activeTask) {
        console.log(`Found active task: ${activeTask._id}, Description: ${activeTask.description}, Current Duration: ${activeTask.duration}`);
        const currentTime = getCurrentISOTime(); // Use consistent format
        const finalDuration = activeTask.duration || 0;
        console.log(`Pausing task ${activeTask._id} at ${currentTime} with duration ${finalDuration}`);
        await dispatch(
          updateTaskStatusAsync({
            id: activeTask._id,
            taskData: {
              status: "Paused",
              attendanceId: clockInData?._id,
              currentTime,
              duration: finalDuration,
            },
          })
        ).unwrap();
        console.log(`Task ${activeTask._id} status updated to Paused in backend`);
        const userId = getUserId();
        if (userId) {
          await dispatch(
            fetchTasksAsync({
              employeeId: userId,
              date: currentDate,
            })
          );
          console.log("Task list refreshed after pausing");
        }
      } else {
        console.log("No active task found to pause");
      }
    } catch (error) {
      console.error("Error pausing active task:", error);
      toast.dismiss();
      toast.error("Failed to pause active task");
    }
  };


  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // useEffect(() => {
  //   if (currentAttendance) {
  //     const { clockInTime, clockOutTime, _id, isEmergency, emergencyReason } = currentAttendance;
  //     if (clockInTime && !isNaN(new Date(clockInTime).getTime())) {
  //       setClockInData({
  //         timestamp: clockInTime,
  //         _id: _id,
  //         clockInTime: clockInTime,
  //       });
  //       setHasAlreadyClockedIn(true);
  //     }
  //     if (clockOutTime && !isNaN(new Date(clockOutTime).getTime())) {
  //       setClockOutData({
  //         timestamp: clockOutTime,
  //         clockOutTime: clockOutTime,
  //         isEmergency: isEmergency || false,
  //         emergencyReason: emergencyReason || "",
  //       });
  //     }
  //   }
  // }, [currentAttendance]);

  useEffect(() => {
    if (currentAttendance) {
      const { clockInTime, clockOutTime, _id, isEmergency, emergencyReason } = currentAttendance;
      if (clockInTime && !isNaN(new Date(clockInTime).getTime())) {
        setClockInData({
          timestamp: clockInTime,
          _id: _id,
          clockInTime: clockInTime,
        });
        setHasAlreadyClockedIn(true);
      }
      if (clockOutTime && !isNaN(new Date(clockOutTime).getTime())) {
        setClockOutData({
          timestamp: clockOutTime,
          clockOutTime: clockOutTime,
          isEmergency: isEmergency || false,
          emergencyReason: emergencyReason || "",
        });
      }
    }
  }, [currentAttendance]);


  const safeFormat = (date, pattern) => {
    try {
      if (date && !isNaN(new Date(date).getTime())) {
        return format(new Date(date), pattern);
      }
      return "N/A";
    } catch (error) {
      return "N/A";
    }
  };

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


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // CHANGE THIS LINE: Remove the break status condition
      if (clockInData?.timestamp && !clockOutData) {
        updateElapsedTime(clockInData.timestamp);
      }
      // Rest of the break timer logic stays the same
      if (currentAttendance?.Employeestatus === "on break" && currentAttendance?.breakTimings?.length > 0) {
        const latestBreak = currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1];
        if (latestBreak && !latestBreak.endTime) {
          const elapsed = Math.floor((new Date() - new Date(latestBreak.startTime)) / 1000);
          setBreakTimer(elapsed);
        } else {
          setBreakTimer(0);
        }
      } else {
        setBreakTimer(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockInData, clockOutData, currentAttendance]);

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
    const now = new Date();
    const start = new Date(startTime);

    // Calculate total break time with stable rounding
    const totalBreakSeconds = currentAttendance?.breakTimings?.reduce((acc, b) => {
      if (b.startTime && b.endTime) {
        // Completed break
        return acc + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / 1000);
      } else if (b.startTime && !b.endTime) {
        // Ongoing break - use seconds since start, rounded down consistently
        const breakStart = new Date(b.startTime);
        const breakDuration = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
        return acc + breakDuration;
      }
      return acc;
    }, 0) || 0;

    // Calculate working time (total - breaks)
    const totalSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    const workingSeconds = Math.max(0, totalSeconds - totalBreakSeconds);

    const hours = Math.floor(workingSeconds / 3600);
    const minutes = Math.floor((workingSeconds % 3600) / 60);
    const seconds = workingSeconds % 60;

    setElapsedTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };


  const handleClockIn = async () => {
    // Prevent multiple calls
    if (isClockingIn) {
      toast.dismiss();
      console.log("Clock-in already in progress, ignoring duplicate call");
      return;
    }

    if (hasAlreadyClockedIn) {
      toast.dismiss();
      toast.warning("You have already clocked in for today!");
      return;
    }

    const employeeId = getUserId();
    if (!employeeId) {
      toast.dismiss();
      toast.error("User data not found. Please log in again.");
      return;
    }

    // Generate unique request ID for deduplication
    const requestId = Date.now() + Math.random();
    setClockInRequestId(requestId);
    setIsClockingIn(true);

    try {
      console.log(`🔍 Starting clock-in process - Request ID: ${requestId}`);

      const clockInTime = getCurrentISOTime();
      const platform = window.navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Web';

      const clockInData = {
        employeeId,
        clockInTime,
        date: clockInTime.split("T")[0],
        platform,
      };

      console.log(`📤 Sending clock-in request:`, clockInData);

      const response = await dispatch(clockInAsync(clockInData)).unwrap();

      console.log(`✅ Clock-in response received:`, response);

      if (response?.attendance) {
        setClockInData({
          timestamp: response.attendance.clockInTime,
          _id: response.attendance._id,
          clockInTime: response.attendance.clockInTime,
        });
        setHasAlreadyClockedIn(true);
        setShowTaskInput(true);
        toast.dismiss();
        toast.success("Clock in successful!");

        // Refresh attendance data
        dispatch(
          getAttendance({ id: employeeId, date: clockInTime.split("T")[0] })
        );
      }
    } catch (error) {
      console.error(`❌ Clock in failed - Request ID: ${requestId}`, error);

      // Check if it's a duplicate error from backend
      if (error?.message?.includes('already exists')) {
        toast.dismiss();
        toast.warning("You have already clocked in for today!");
        setHasAlreadyClockedIn(true);

        // Fetch current attendance to sync state
        dispatch(getAttendance({ id: employeeId, date: new Date().toISOString().split("T")[0] }));
      } else {
        toast.dismiss();
        toast.error("Failed to clock in. Please try again.");
      }
    } finally {
      setIsClockingIn(false);
      setClockInRequestId(null);
      console.log(`🏁 Clock-in process completed - Request ID: ${requestId}`);
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

  useEffect(() => {
    return () => {
      if (isClockingIn) {
        console.log("Component unmounting during clock-in, cleaning up...");
      }
    };
  }, [isClockingIn]);

  const handleClockOut = async () => {
    if (!clockInData?._id) {
      toast.dismiss();
      toast.error("No clock in data found");
      return;
    }
    const now = new Date();
    const canClockOut = checkTimeAndClockOut(now);
    if (!canClockOut) {
      toast.dismiss();
      toast.warning("You can only clock out after 6:00 PM");
      return;
    }
    try {
      await pauseActiveTask();
      const clockOutTime = getCurrentISOTime();
      let updatedBreakTimings = [...(currentAttendance?.breakTimings || [])];
      if (currentAttendance?.Employeestatus === "on break") {
        updatedBreakTimings = updatedBreakTimings.map((b, index) =>
          index === updatedBreakTimings.length - 1 && !b.endTime ? { ...b, endTime: clockOutTime } : b
        );
      }
      const breakTimeMinutes = updatedBreakTimings.reduce((acc, b) => {
        if (b.startTime && b.endTime) {
          return acc + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60));
        }
        return acc;
      }, 0);
      const clockOutData = {
        clockOutTime,
        type: "CLOCK_OUT",
        isEmergency: false,
        breakTime: breakTimeMinutes,
        breakTimings: updatedBreakTimings,
        Employeestatus: "clocked out",
      };
      console.log("Clock out payload:", clockOutData); // Debug log
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
          workingDay: response.attendance.workingDay,
        });
        setTotalHoursWorked(totalHoursWorked);
        setShowDailyReport(true);
        const userId = getUserId();
        if (userId) {
          dispatch(getAttendance({ id: userId, date: currentDate }));
        }
        toast.dismiss();
        toast.success("Clock out successful!");
      }
    } catch (error) {
      console.error("Clock out failed:", error);
      toast.dismiss();
      toast.error("Failed to clock out. Please try again.");
    }
  };



  // const handleBackToWork = async () => {
  //   if (currentAttendance?.Employeestatus !== "on break" || !currentAttendance?.breakTimings?.length) {
  //     toast.error('No active break to end');
  //     return;
  //   }
  //   try {
  //     const now = getCurrentISOTime(); // Use string format
  //     const latestBreak = currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1];
  //     if (latestBreak.endTime) {
  //       toast.error('No active break to end');
  //       return;
  //     }
  //     const breakDurationSeconds = Math.floor((new Date(now) - new Date(latestBreak.startTime)) / 1000);
  //     const updatedBreakTimings = currentAttendance.breakTimings.map((b, index) =>
  //       index === currentAttendance.breakTimings.length - 1 ? { ...b, endTime: now } : b
  //     );
  //     console.log("Sending payload:", {
  //       id: clockInData._id,
  //       data: {
  //         breakTimings: updatedBreakTimings,
  //         Employeestatus: "active",
  //       },
  //     });
  //     await dispatch(updateAttendanceAsync({
  //       id: clockInData._id,
  //       data: {
  //         breakTimings: updatedBreakTimings,
  //         Employeestatus: "active",
  //       },
  //     })).unwrap();
  //     if (activeTaskIdBeforeBreak) {
  //       const taskToResume = reduxTasks.find((task) => task._id === activeTaskIdBeforeBreak);
  //       if (taskToResume && taskToResume.status === "Paused") {
  //         const currentTime = getCurrentISOTime();
  //         await dispatch(
  //           updateTaskStatusAsync({
  //             id: activeTaskIdBeforeBreak,
  //             taskData: {
  //               status: "In Progress",
  //               attendanceId: clockInData?._id,
  //               currentTime,
  //               duration: taskToResume.duration || 0,
  //             },
  //           })
  //         ).unwrap();
  //         const userId = getUserId();
  //         if (userId) {
  //           await dispatch(
  //             fetchTasksAsync({
  //               employeeId: userId,
  //               date: currentDate,
  //             })
  //           );
  //         }
  //       }
  //     }
  //     const userId = getUserId();
  //     if (userId) {
  //       await dispatch(getAttendance({ id: userId, date: currentDate }));
  //     }
  //     setActiveTaskIdBeforeBreak(null);
  //     toast.success(`Break ended. Duration: ${Math.floor(breakDurationSeconds / 60).toString().padStart(2, '0')}:${(breakDurationSeconds % 60).toString().padStart(2, '0')}`);
  //   } catch (error) {
  //     console.error("Error ending break:", error);
  //     toast.error("Failed to end break");
  //   }
  // };


  // const handleBackToWork = async () => {
  //   if (currentAttendance?.Employeestatus !== "on break" || !currentAttendance?.breakTimings?.length) {
  //     toast.error('No active break to end');
  //     return;
  //   }

  //   try {
  //     const now = getCurrentISOTime();
  //     const latestBreak = currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1];

  //     if (latestBreak.endTime) {
  //       toast.error('No active break to end');
  //       return;
  //     }

  //     const breakDurationSeconds = Math.floor((new Date(now) - new Date(latestBreak.startTime)) / 1000);
  //     const updatedBreakTimings = currentAttendance.breakTimings.map((b, index) =>
  //       index === currentAttendance.breakTimings.length - 1 ? { ...b, endTime: now } : b
  //     );

  //     console.log("Ending break - activeTaskIdBeforeBreak:", activeTaskIdBeforeBreak);

  //     // First update attendance
  //     await dispatch(updateAttendanceAsync({
  //       id: clockInData._id,
  //       data: {
  //         breakTimings: updatedBreakTimings,
  //         Employeestatus: "active",
  //       },
  //     })).unwrap();

  //     // Force refresh attendance data
  //     const userId = getUserId();
  //     if (userId) {
  //       await dispatch(getAttendance({ id: userId, date: currentDate }));

  //       // Force component re-render using existing currentTime state
  //       setTimeout(() => {
  //         setCurrentTime(new Date());
  //       }, 500);
  //     }

  //     // Small delay to ensure state propagation
  //     await new Promise(resolve => setTimeout(resolve, 200));

  //     const taskIdToResume = activeTaskIdBeforeBreak || currentAttendance?.activeTaskIdBeforeBreak;
  //     console.log("Task ID to resume from DB:", taskIdToResume);

  //     if (taskIdToResume) {

  //       // Refresh tasks to get latest data
  //       if (userId) {
  //         await dispatch(
  //           fetchTasksAsync({
  //             employeeId: userId,
  //             date: currentDate,
  //           })
  //         );
  //       }

  //       // Small delay to ensure state is updated
  //       await new Promise(resolve => setTimeout(resolve, 500));

  //       // Get fresh Redux state
  //       const currentState = store.getState(); // You'll need to import store
  //       const freshTasks = currentState.tasks.tasks; // Adjust path based on your Redux structure

  //       const taskToResume = freshTasks.find((task) => task._id === taskIdToResume);
  //       console.log("Fresh task found:", taskToResume);

  //       if (taskToResume && taskToResume.status === "Paused") {
  //         const currentTime = getCurrentISOTime();

  //         console.log("Resuming task:", taskToResume._id);

  //         await dispatch(
  //           updateTaskStatusAsync({
  //             id: activeTaskIdBeforeBreak,
  //             taskData: {
  //               status: "In Progress",
  //               attendanceId: clockInData?._id,
  //               currentTime,
  //               duration: taskToResume.duration || 0,
  //             },
  //           })
  //         ).unwrap();

  //         // Final refresh after resuming
  //         if (userId) {
  //           await dispatch(
  //             fetchTasksAsync({
  //               employeeId: userId,
  //               date: currentDate,
  //             })
  //           );
  //         }

  //         console.log("Task resumed successfully");
  //         // toast.success("Task resumed automatically");
  //       } else {
  //         console.log("Task not found or wrong status:", taskToResume?.status);
  //       }
  //     }

  //     // Clear the state only after everything is done
  //     setActiveTaskIdBeforeBreak(null);
  //     await dispatch(updateAttendanceAsync({
  //       id: clockInData._id,
  //       data: {
  //         activeTaskIdBeforeBreak: null,
  //       },
  //     })).unwrap();

  //     toast.success(`Break ended. Duration: ${Math.floor(breakDurationSeconds / 60).toString().padStart(2, '0')}:${(breakDurationSeconds % 60).toString().padStart(2, '0')}`);

  //   } catch (error) {
  //     console.error("Error ending break:", error);
  //     toast.error("Failed to end break");
  //   }
  // };

  const handleBackToWork = async () => {
    if (currentAttendance?.Employeestatus !== "on break" || !currentAttendance?.breakTimings?.length) {
      toast.dismiss();
      toast.error('No active break to end');
      return;
    }

    try {
      const now = getCurrentISOTime();
      const latestBreak = currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1];

      if (latestBreak.endTime) {
        toast.dismiss();
        toast.error('No active break to end');
        return;
      }

      const breakDurationSeconds = Math.floor((new Date(now) - new Date(latestBreak.startTime)) / 1000);
      const updatedBreakTimings = currentAttendance.breakTimings.map((b, index) =>
        index === currentAttendance.breakTimings.length - 1 ? { ...b, endTime: now } : b
      );

      console.log("Ending break - activeTaskIdBeforeBreak:", activeTaskIdBeforeBreak);

      // Get the task ID to resume - prioritize state variable over DB
      const taskIdToResume = activeTaskIdBeforeBreak || currentAttendance?.activeTaskIdBeforeBreak;
      console.log("Task ID to resume:", taskIdToResume);

      // First update attendance status
      await dispatch(updateAttendanceAsync({
        id: clockInData._id,
        data: {
          breakTimings: updatedBreakTimings,
          Employeestatus: "active",
        },
      })).unwrap();

      // Refresh attendance data
      const userId = getUserId();
      if (userId) {
        await dispatch(getAttendance({ id: userId, date: currentDate }));
      }

      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Resume task if there was one active before break
      if (taskIdToResume) {
        // Refresh tasks to get latest data
        if (userId) {
          await dispatch(
            fetchTasksAsync({
              employeeId: userId,
              date: currentDate,
            })
          );
        }

        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 200));

        // Get fresh Redux state
        const currentState = store.getState();
        const freshTasks = currentState.tasks.tasks;

        const taskToResume = freshTasks.find((task) => task._id === taskIdToResume);
        console.log("Fresh task found:", taskToResume);

        if (taskToResume && taskToResume.status === "Paused") {
          const currentTime = getCurrentISOTime();

          console.log("Resuming task:", taskToResume._id);

          // FIXED: Don't update assignedDate - keep original date
          await dispatch(
            updateTaskStatusAsync({
              id: taskIdToResume, // ← FIXED: Use correct task ID
              taskData: {
                status: "In Progress",
                attendanceId: clockInData?._id,
                currentTime,
                duration: taskToResume.duration || 0,
                // REMOVED: assignedDate - don't change the original assigned date
              },
            })
          ).unwrap();

          console.log("Task resumed successfully");

          // Final refresh after resuming task
          if (userId) {
            await dispatch(
              fetchTasksAsync({
                employeeId: userId,
                date: currentDate,
              })
            );
          }
        } else {
          console.log("Task not found or not in paused status:", taskToResume?.status);
        }
      }

      // Clear the activeTaskIdBeforeBreak from both state and DB
      setActiveTaskIdBeforeBreak(null);
      await dispatch(updateAttendanceAsync({
        id: clockInData._id,
        data: {
          activeTaskIdBeforeBreak: null,
        },
      })).unwrap();

      // Final refresh of attendance data
      if (userId) {
        setTimeout(async () => {
          await dispatch(getAttendance({ id: userId, date: currentDate }));
        }, 500);
      }

      toast.success(`Break ended. Duration: ${Math.floor(breakDurationSeconds / 60).toString().padStart(2, '0')}:${(breakDurationSeconds % 60).toString().padStart(2, '0')}`);

    } catch (error) {
      toast.dismiss();
      console.error("Error ending break:", error);
      toast.error("Failed to end break");
    }
  };
  // Force refresh when employee status changes from break to active
  useEffect(() => {
    if (currentAttendance?.Employeestatus === "active") {
      // Force refresh attendance data when returning from break
      const userId = getUserId();
      if (userId && clockInData) {
        setTimeout(() => {
          dispatch(getAttendance({ id: userId, date: currentDate }));
        }, 300);
      }
    }
  }, [currentAttendance?.Employeestatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getStatusColor = () => {
    if (clockOutData) {
      return clockOutData.isEmergency ? "error.main" : "success.main";
    }
    if (clockInData) {
      return currentAttendance?.Employeestatus === "on break" ? "warning.main" : "primary.main";
    }
    return "text.secondary";
  };

  const getStatusText = () => {
    if (clockOutData) {
      return clockOutData.isEmergency ? "Emergency Clock Out" : "Clocked Out";
    }
    if (clockInData) {
      return currentAttendance?.Employeestatus === "on break" ? "On Break" : "Clocked In";
    }
    return "Not Clocked In";
  };
  const renderDailyReport = () => (
    <Dialog
      open={showDailyReport}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Box
          sx={{ position: "relative", display: "flex", alignItems: "center" }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon />
            <Typography variant="h6">Attendance Report</Typography>
          </Stack>
          <IconButton
            onClick={() => setShowDailyReport(false)}
            sx={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white"
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 3,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              }
            }
          }}
        >
          <Tab icon={<AccessTime sx={{ mr: 1 }} />} iconPosition="start" label="Today's Report" />
          <Tab icon={<CalendarMonth sx={{ mr: 1 }} />} iconPosition="start" label="Monthly Overview" />
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
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={() => setShowDailyReport(false)}
          variant="contained"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const formatTotalBreakTime = () => {
    const now = currentTime;

    const totalSeconds = currentAttendance?.breakTimings?.reduce((acc, b) => {
      if (b.startTime && b.endTime) {
        return acc + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / 1000);
      }
      return acc;
    }, 0) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2, mt: -1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          mb: 3
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                width: 48,
                height: 48,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              {clockInData ? <HowToRegIcon /> : <AccessTimeIcon />}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={600}>
                Attendance Dashboard
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {format(new Date(currentDate), "EEEE, MMMM d, yyyy")}
              </Typography>
            </Stack>
          </Stack>

          <Chip
            label={getStatusText()}
            color={
              clockOutData
                ? (clockOutData.isEmergency ? "error" : "success")
                : (clockInData ? (currentAttendance?.Employeestatus === "on break" ? "warning" : "success") : "default")
            }
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 32,
              borderRadius: 2,
              px: 1,
              color: getStatusText() === "Not Clocked In" ? 'white' : 'inherit',
              '& .MuiChip-icon': {
                color: getStatusText() === "Not Clocked In" ? 'white' : 'inherit'
              }
            }}
            icon={
              clockOutData
                ? (clockOutData.isEmergency ? <WarningIcon /> : <ExitToAppIcon />)
                : (clockInData ? (currentAttendance?.Employeestatus === "on break" ? <FreeBreakfastIcon /> : <CheckCircleIcon />) : <HourglassEmpty />)
            }
          />
        </Box>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >

        <CardContent sx={{ p: 0 }}>
          {/* Time & Status Section */}
          <Grid container spacing={0}>
            {/* Current Time */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRight: { md: '1px solid', xs: 'none' },
                  borderBottom: { md: 'none', xs: '1px solid' },
                  borderColor: 'divider'
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5 }}>
                  Current Time
                </Typography>
                <Typography variant="h3" fontWeight={700} color="text.primary">
                  {format(currentTime, "hh:mm")}
                  <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 1 }}>
                    {format(currentTime, "a")}
                  </Typography>
                </Typography>
              </Box>
            </Grid>

            {/* Elapsed Time */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRight: { md: '1px solid', xs: 'none' },
                  borderBottom: { md: 'none', xs: '1px solid' },
                  borderColor: 'divider'
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Time Logged
                </Typography>
                {clockInData && !clockOutData ? (
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {elapsedTime}
                  </Typography>
                ) : (
                  <Typography variant="h5" color="text.secondary" fontWeight={500}>
                    Not Clocked In
                  </Typography>
                )}
                {clockInData && (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`In: ${safeFormat(clockInData.clockInTime, "hh:mm a")}`}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Status & Break Information */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5 }}>
                  Break Status
                </Typography>
                {currentAttendance?.Employeestatus === "on break" && currentAttendance?.breakTimings?.length > 0 ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {Math.floor(breakTimer / 60).toString().padStart(2, '0')}:{(breakTimer % 60).toString().padStart(2, '0')}
                    </Typography>
                    <Chip
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                      icon={getBreakIcon(currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1].name)}
                      label={currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1].name}
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary" fontWeight={500}>
                      Not On Break
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Total break: {formatTotalBreakTime()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        {/* Actions Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.03)
        }}>

          {!hasAlreadyClockedIn && !clockOutData && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleClockIn}
              disabled={isClockingIn || hasAlreadyClockedIn}
              startIcon={isClockingIn ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                fontSize: '1rem'
              }}
            >
              {isClockingIn ? 'Clocking In...' : 'Clock In'}
            </Button>
          )}


          {clockInData && !clockOutData && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {currentAttendance?.Employeestatus !== "on break" ? (
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={() => setIsBreakModalOpen(true)}
                  startIcon={<PauseCircleOutlineIcon />}
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2
                  }}
                >
                  Take a Break
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleBackToWork}
                  startIcon={<WorkIcon />}
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2
                  }}
                >
                  Back to Work
                </Button>
              )}
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={handleClockOut}
                startIcon={<ExitToAppIcon />}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                Clock Out
              </Button>

              <Button
                variant="contained"
                color="warning"
                size="large"
                onClick={() => setShowEmergencyModal(true)}
                startIcon={<WarningIcon />}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#B91C1C',
                  '&:hover': { bgcolor: '#991B1B' },
                }}
              >
                Emergency Clock Out
              </Button>
            </Stack>
          )}

          {/* {clockOutData && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowDailyReport(true)}
              startIcon={<AssignmentIcon />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              View Attendance Report
            </Button>
          )} */}
        </Box>
      </Paper>

      {currentAttendance?.breakTimings?.length > 0 && !clockOutData && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            mb: 4
          }}
        >
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <HistoryToggleOffIcon />
              <Typography variant="h6" fontWeight={600}>
                Break History
              </Typography>
            </Stack>
            <IconButton
              size="small"
              sx={{ color: 'white' }}
              onClick={() => setBreakHistoryExpanded(!breakHistoryExpanded)}
            >
              {breakHistoryExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>

          {breakHistoryExpanded && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {currentAttendance.breakTimings.map((breakItem, index) => {
                  const durationSeconds =
                    breakItem.endTime
                      ? Math.floor((new Date(breakItem.endTime) - new Date(breakItem.startTime)) / 1000)
                      : 0;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: 'warning.main'
                            }}
                          >
                            {getBreakIcon(breakItem.name)}
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {breakItem.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(breakItem.startTime), "hh:mm a")} •
                              {' '}{Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:{(durationSeconds % 60).toString().padStart(2, '0')}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip
                  icon={<MoreTime />}
                  label={`Total Break Time: ${formatTotalBreakTime()}`}
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Task Management Section */}
      <TaskAttendanceManagement
        tasks={Array.isArray(reduxTasks) ? reduxTasks : []}
        clockInData={clockInData}
        clockOutData={clockOutData}
        currentDate={currentDate}
        employeeId={employeeId}
        showTaskInput={showTaskInput}
        setShowTaskInput={setShowTaskInput}
        onPauseActiveTask={pauseActiveTask}
        currentAttendance={currentAttendance}
      />

      {/* Footer Actions */}
      <Box sx={{
        mt: 4,
        textAlign: "center",
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setSelectedTab(0);
            setShowDailyReport(true);
          }}
          startIcon={<SummarizeIcon />}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Today's Report
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setSelectedTab(1);
            setShowDailyReport(true);
          }}
          startIcon={<CalendarMonth />}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Monthly Overview
        </Button>
      </Box>

      {/* Dialogs */}
      <Dialog
        open={showEmergencyModal}
        onClose={() => {
          setShowEmergencyModal(false);
          setEmergencyReason("");
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'error.main',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WarningIcon />
          <Typography variant="h6" fontWeight={600}>
            Emergency Clock Out
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography color="error.dark" sx={{ mb: 2, fontWeight: 500 }}>
            {/* Please provide the reason for emergency clock out: */}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            placeholder="Enter emergency reason..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05)
              }
            }}
            error={!emergencyReason.trim()}
            helperText={!emergencyReason.trim() ? "Emergency reason is required *" : ""}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => {
              setShowEmergencyModal(false);
              setEmergencyReason("");
            }}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmergencyClockOut}
            variant="contained"
            color="error"
            disabled={!emergencyReason.trim()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Confirm Emergency Clock Out
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isBreakModalOpen}
        onClose={() => {
          setIsBreakModalOpen(false);
          setBreakType('');
          setBreakDescription('');
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'warning.main',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <BreakfastDiningIcon />
          <Typography variant="h6" fontWeight={600}>
            Take a Break
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Select a break type and add a description if needed
          </Typography>
          <TextField
            select
            fullWidth
            label="Break Type"
            value={breakType || ''}
            onChange={(e) => setBreakType(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            SelectProps={{
              native: true
            }}
            variant="outlined"
            helperText="Choose a break type"
          >
            <option value=""></option>
            {breakOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={
                  option.value !== 'other' &&
                  currentAttendance?.breakTimings?.some(
                    (b) => b.name === option.value && new Date(b.startTime).toDateString() === new Date().toDateString()
                  )
                }
              >
                {option.label}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            value={breakDescription}
            onChange={(e) => setBreakDescription(e.target.value)}
            placeholder={breakType === 'other' ? 'E.g., Doctor visit, personal errand' : 'Optional notes'}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            variant="outlined"
            helperText={breakType === 'other' ? 'Description is required for Other breaks' : 'Optional details about your break'}
            required={breakType === 'other'}
            error={breakType === 'other' && !breakDescription.trim()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => {
              setIsBreakModalOpen(false);
              setBreakType('');
              setBreakDescription('');
            }}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setIsBreakLoading(true);
              if (!breakType) {
                toast.dismiss();
                toast.error('Please select a break type');
                return;
              }
              if (
                breakType !== 'other' &&
                currentAttendance?.breakTimings?.some(
                  (b) => b.name === breakType && new Date(b.startTime).toDateString() === new Date().toDateString()
                )
              ) {
                toast.error('This break type has already been used today');
                return;
              }
              if (breakType === 'other' && !breakDescription.trim()) {
                toast.dismiss();
                toast.error('Please provide a description for Other break');
                return;
              }
              try {
                const activeTask = reduxTasks.find((task) => task.status === "In Progress");
                if (activeTask) {
                  console.log("Setting activeTaskIdBeforeBreak to:", activeTask._id);
                  setActiveTaskIdBeforeBreak(activeTask._id);
                  await pauseActiveTask();
                }
                const now = getCurrentISOTime();
                const updatedBreakTimings = [
                  ...(currentAttendance?.breakTimings || []),
                  {
                    name: breakType === 'other' ? breakDescription.trim() : breakType,
                    startTime: now,
                    endTime: null,
                  },
                ];
                await dispatch(updateAttendanceAsync({
                  id: clockInData._id,
                  data: {
                    breakTimings: updatedBreakTimings,
                    Employeestatus: "on break",
                    activeTaskIdBeforeBreak: activeTask?._id || null,
                  },
                })).unwrap();
                const userId = getUserId();
                if (userId) {
                  await dispatch(getAttendance({ id: userId, date: currentDate }));
                }
                setIsBreakModalOpen(false);
                toast.success(`Started ${breakType === 'other' ? 'Other break' : breakOptions.find((opt) => opt.value === breakType)?.label}`);
                setBreakDescription('');
                setBreakType('');
              } catch (error) {
                console.error("Error starting break:", error);
                toast.dismiss();
                toast.error("Failed to start break");
              }
              finally {
                setIsBreakLoading(false);
              }
            }}
            variant="contained"
            color="warning"
            disabled={!breakType || (breakType === 'other' && !breakDescription.trim()) || isBreakLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
            startIcon={isBreakLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isBreakLoading ? 'Starting Break...' : 'Start Break'}
          </Button>
        </DialogActions>
      </Dialog>

      {renderDailyReport()}
      <ToastContainer position="top-right" />
    </Container>
  );
};

export default AttendanceManagement;