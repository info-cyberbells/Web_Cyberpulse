import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from "@mui/material";
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CloseIcon from "@mui/icons-material/Close";
import { fetchCurrentEmpAttendanceAsync, fetchAutoClockOutAsync } from "../features/attendance/attendanceSlice";
import ImageZoomModal from "../components/HomeAndEmployeeSelfie/ImageZoomModal";
import HistoryIcon from "@mui/icons-material/History";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material";
import parse from 'html-react-parser';
import { drawerWidth } from '../components/sidebar'
import MaleSVG from "../assets/male_svg.svg";
import FemaleSVG from "../assets/female_svg.svg";


const Home = ({ open, isMobile }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    currentDayAttendance,
    autoClockOutEmployees,
    loading,
    autoClockOutLoading,
    error } = useSelector((state) => ({
      currentDayAttendance: state.attendances?.currentDayAttendance || [],
      autoClockOutEmployees: state.attendances?.autoClockOutEmployees || [],
      loading: state.attendances?.loading || false,
      autoClockOutLoading: state.attendances?.autoClockOutLoading || false,
      error: state.attendances?.error || null,
    }));

  const activeCount = currentDayAttendance.filter(
    (employee) => employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut
  ).length;

  const [tick, setTick] = useState(0);

  const [taskModal, setTaskModal] = useState({
    open: false,
    tasks: [],
    employeeName: "",
  });
  const [zoomImage, setZoomImage] = useState({
    open: false,
    image: null,
    name: "",
  });
  // const [clockInDurations, setClockInDurations] = useState({});
  const [autoClockOutModal, setAutoClockOutModal] = useState({
    open: false,
  });

  const [attendanceFilter, setAttendanceFilter] = useState('active');

  function cleanTaskDescription(html) {
    // If the input is already properly formatted, just return it
    if (!html.includes('<p>') && !html.includes('<br>')) {
      return html;
    }

    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // Preserve formatting but replace paragraph and break tags with newlines
    let content = tmp.innerHTML
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, " ")
      .trim();

    return content;
  }

  useEffect(() => {
    dispatch(fetchAutoClockOutAsync());
  }, [dispatch]);


  const handleOpenAutoClockOutModal = () => {
    setAutoClockOutModal((prev) => ({ ...prev, open: true }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseAutoClockOutModal = () => {
    setAutoClockOutModal((prev) => ({ ...prev, open: false }));
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (val) => String(val).padStart(2, '0'); // adds leading 0
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };


  const calculateWorkDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null;

    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const durationInSeconds = Math.floor((end - start) / 1000);

    return formatDuration(durationInSeconds);
  };

  useEffect(() => {
    let isInitialFetch = true;

    const fetchAttendancee = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        await dispatch(fetchCurrentEmpAttendanceAsync({ date: today, isInitialFetch })).unwrap();
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
      isInitialFetch = false;
    };


    fetchAttendancee();


    const intervalId = setInterval(fetchAttendancee, 600000);


    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleViewTasks = (tasks, employeeName, employee) => {
    setTaskModal({
      open: true,
      tasks: Array.isArray(tasks) ? tasks : [],
      previousTasks: Array.isArray(employee.previousTasks) ? employee.previousTasks : [],
      employeeName,
      attendance: employee.attendance || {},
      image: employee.image || "",
      gender: employee.gender || "",
      position: employee.position || "",
    });
  };

  const handleCloseTasksModal = () => {
    setTaskModal({ open: false, tasks: [], employeeName: "" });
  };

  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const sortAttendanceData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return [...data].sort((a, b) => {
      const aClockIn = a.attendance?.todayClockIn;
      const bClockIn = b.attendance?.todayClockIn;
      if (aClockIn && bClockIn) {
        return new Date(aClockIn) - new Date(bClockIn);
      }
      if (aClockIn) return -1;
      if (bClockIn) return 1;
      const aLastClockOut = a.attendance?.lastClockOut;
      const bLastClockOut = b.attendance?.lastClockOut;
      if (aLastClockOut && bLastClockOut) {
        return new Date(bLastClockOut) - new Date(aLastClockOut);
      }
      if (aLastClockOut) return -1;
      if (bLastClockOut) return 1;
      return a.employeeName.localeCompare(b.employeeName);
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Not Available";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFullDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not Available";
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) {
      return "Invalid Date";
    }
    const date = dateTime.toISOString().split("T")[0];
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${date} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };


  const filteredAttendance = currentDayAttendance.filter((employee) => {
    if (attendanceFilter === 'active') {
      return employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut;
    }
    if (attendanceFilter === 'absent') {
      const hasNoClockIn = !employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut;
      const onLeaveAndNotActive = employee.leaveRequest &&
        (!employee.attendance?.todayClockIn || !!employee.attendance?.todayClockOut);

      return hasNoClockIn || onLeaveAndNotActive;
    }

    return true;
  });

  const getAttendanceStatus = (attendance, leaveRequest) => {
    let attendanceStatus = {};
    let leaveStatus = null;

    if (leaveRequest) {
      leaveStatus = {
        leaveType: leaveRequest.leaveType,
        status: leaveRequest.status,
        color:
          leaveRequest.status === "Approved"
            ? "success"
            : leaveRequest.status === "Rejected"
              ? "error"
              : "warning",
      };

      if (leaveRequest.status === "Approved") {
        return {
          attendanceStatus: {
            status: "On Leave",
            color: "info",
            message: (
              <>
                On <strong>{leaveRequest.leaveType}</strong>
              </>
            ),
          },
          leaveStatus
        };
      }
      if (leaveRequest.status === "Pending") {
        return {
          attendanceStatus: {
            status: "Leave Pending",
            color: "warning",
            message: (
              <>
                <strong>{leaveRequest.leaveType}</strong> pending approval
              </>
            ),
          },
          leaveStatus
        };
      }
    }

    if (!attendance || !attendance.todayClockIn) {
      attendanceStatus = {
        status: "Inactive",
        color: "error",
        message: (
          <>
            Last Clocked out via <strong>{attendance?.todayClockInPlatform || "Unknown"}</strong> on{" "}
            <strong> {formatFullDateTime(attendance?.lastClockOut)}</strong>
          </>
        ),
      };
      if (!attendance?.lastClockOut) {
        attendanceStatus = {
          status: "Absent",
          color: "error",
          message: <>No clock-in or clock-out recorded</>,
        };
      }
    } else if (attendance.todayClockIn && !attendance.todayClockOut) {
      if (attendance.EmployeeStatus === "on break") {
        attendanceStatus = {
          status: "On Break",
          color: "warning",
          message: (
            <>
              On break since <strong>{formatTime(attendance.breakTimings[attendance.breakTimings.length - 1]?.startTime)}</strong>
            </>
          ),
        };
      } else {
        attendanceStatus = {
          status: "Active",
          color: "success",
          message: (
            <>
              Clocked in via <strong>{attendance.todayClockInPlatform || "Unknown"}</strong> on{" "}
              <strong> {getTodayDate()} </strong> at<strong> {formatTime(attendance.todayClockIn)}</strong>
            </>
          ),
        };
      }
    } else {
      attendanceStatus = {
        status: "Clocked Out",
        color: "default",
        message: (
          <>
            Clocked out via <strong>{attendance.todayClockInPlatform || "Unknown"}</strong> on{" "}
            <strong>  {formatFullDateTime(attendance.todayClockOut)} </strong>
          </>
        ),
      };
    }

    return { attendanceStatus, leaveStatus };
  };

  if (loading && currentDayAttendance.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: {
          md: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)`,
        },
        ml: {
          md: open ? `${drawerWidth}px` : `${theme.spacing(9)}px`,
        },
        mt: isMobile ? "64px" : 0, // Match mobile AppBar height
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Container
        sx={{
          mt: 0,
          mb: 4,
          px: { xs: 2, md: 3 },
          width: "100%",
          height: "100vh",
          overflowY: "scroll",
          position: "relative",

          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: 'white',
            py: 1,
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              Today's Attendance
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>

              <Box
                sx={{
                  backgroundColor: "white",
                  color: '#333',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  minWidth: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',

                }}
                onClick={handleOpenAutoClockOutModal}
              >
                <Tooltip title="View Previous Day Auto Clock-Outs">
                  <Box display="flex" alignItems="center" gap={1}>
                    Auto ClockOut
                    <HistoryIcon sx={{ color: '#1976d2' }} />
                  </Box>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  backgroundColor: attendanceFilter === 'active' ? 'success.dark' : 'success.main',
                  color: '#fff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  minWidth: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setAttendanceFilter('active')}
              >
                Active: {
                  currentDayAttendance.filter(
                    (employee) => employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut
                  ).length
                }
              </Box>

              <Box
                sx={{
                  backgroundColor: attendanceFilter === 'absent' ? 'error.dark' : 'error.main',
                  color: '#fff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  minWidth: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setAttendanceFilter('absent')}
              >
                Inactive: {
                  currentDayAttendance.filter((employee) => {
                    const noClockInOut = !employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut;
                    const onLeaveAndNotActive = employee.leaveRequest &&
                      (!employee.attendance?.todayClockIn || !!employee.attendance?.todayClockOut);
                    return noClockInOut || onLeaveAndNotActive;
                  }).length
                }
              </Box>

              <Box
                sx={{
                  backgroundColor: attendanceFilter === 'all' ? 'primary.dark' : 'primary.main',
                  color: '#fff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  minWidth: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setAttendanceFilter('all')}
              >
                Total: {currentDayAttendance.length}
              </Box>
            </Box>

          </Box>
        </Box>

        {error ? (
          <Box textAlign="center" sx={{ p: 4 }}>
            <Typography variant="h5" color="error" sx={{ fontSize: '1.5rem' }}>
              Error: {error}
            </Typography>
          </Box>
        ) : currentDayAttendance.length === 0 ? (
          <Box textAlign="center" sx={{ p: 4 }}>
            <Typography variant="h5" color="textSecondary" sx={{ fontSize: '1.5rem' }}>
              No attendance records found for today
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              maxHeight: "calc(100vh - 64px)", // Adjust based on "Today's Attendance" height
              overflowY: "scroll", // Enable scrolling
              overflowX: "hidden",
              width: "100%",
              mt: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              // Hide scrollbar cross-browser
              "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
              "-ms-overflow-style": "none", // IE and Edge
              "scrollbar-width": "none", // Firefox
            }}
          >
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0, // Stick to the top of the TableContainer, not viewport
                  zIndex: 10,
                  backgroundColor: "white",
                  py: 1,
                }}
              >
                <TableRow sx={{ backgroundColor: "grey.100", py: 0 }}>
                  <TableCell align="center" sx={{ py: 1, width: "20%" }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem", letterSpacing: "0.2px" }}>
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1, width: "20%" }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem", letterSpacing: "0.2px" }}>
                      Email
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1, width: "25%" }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem", letterSpacing: "0.2px" }}>
                      Details
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1, width: "15%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>
                        Working Hours
                      </Typography>
                      {/* <Tooltip title="View Previous Day Auto Clock-Outs">
                        <IconButton onClick={handleOpenAutoClockOutModal}>
                          <HistoryIcon color="primary" />
                        </IconButton>
                      </Tooltip> */}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortAttendanceData(filteredAttendance).map((employee) => {
                  const { attendanceStatus, leaveStatus } = getAttendanceStatus(employee.attendance, employee.leaveRequest);
                  const isActive = employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut;

                  // Calculate duration directly
                  let duration = "Absent";
                  if (isActive) {
                    const clockInTime = new Date(employee.attendance.todayClockIn).getTime();
                    const now = new Date().getTime();
                    let elapsedSeconds = Math.floor((now - clockInTime) / 1000);

                    // Subtract break times
                    if (employee.attendance?.breakTimings && employee.attendance.breakTimings.length > 0) {
                      employee.attendance.breakTimings.forEach(breakTime => {
                        const breakStart = new Date(breakTime.startTime).getTime();
                        const breakEnd = breakTime.endTime ? new Date(breakTime.endTime).getTime() : now;
                        if (breakStart >= clockInTime && breakStart <= now) {
                          const breakDuration = Math.floor((breakEnd - breakStart) / 1000);
                          elapsedSeconds -= breakDuration;
                        }
                      });
                    }
                    duration = formatDuration(elapsedSeconds);
                  } else if (employee.attendance?.todayClockIn && employee.attendance?.todayClockOut) {
                    duration = calculateWorkDuration(employee.attendance.todayClockIn, employee.attendance.todayClockOut);
                  }


                  return (
                    <TableRow
                      key={employee.employeeId}
                      sx={{
                        opacity: isActive ? 1 : 0.8,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                      onClick={() => handleViewTasks(employee.tasks, employee.employeeName, employee)}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, overflow: "hidden" }}>

                          <Box sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>

                            {employee.image ? (
                              <Avatar sx={{ width: 40, height: 40 }} src={`${employee.image}`} />
                            ) : (
                              <Avatar
                                sx={{ width: 40, height: 40 }}
                                src={employee.gender === "male" ? MaleSVG : employee.gender === "female" ? FemaleSVG : undefined}
                              >
                                {!employee.gender && employee.employeeName?.charAt(0).toUpperCase()}
                              </Avatar>
                            )}


                            {employee.attendance?.todayClockIn && !employee.attendance?.todayClockOut ? (
                              employee.attendance?.EmployeeStatus === "on break" ? (
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: -3,
                                  right: -3,
                                  width: 18,
                                  height: 18,
                                  bgcolor: 'white',
                                  borderRadius: '50%',
                                  border: '2px solid #ED6C02', // warning color
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  overflow: 'hidden',
                                  animation: 'pulseBreak 2s infinite',
                                  '@keyframes pulseBreak': {
                                    '0%': { boxShadow: '0 0 0 0 rgba(237, 108, 2, 0.4)' },
                                    '70%': { boxShadow: '0 0 0 6px rgba(237, 108, 2, 0)' },
                                    '100%': { boxShadow: '0 0 0 0 rgba(237, 108, 2, 0)' }
                                  },
                                  '& svg': {
                                    animation: 'sip 3s infinite',
                                    '@keyframes sip': {
                                      '0%, 100%': { transform: 'translateY(0)' },
                                      '50%': { transform: 'translateY(1px)' }
                                    }
                                  }
                                }}>
                                  <LocalCafeIcon sx={{
                                    fontSize: 10,
                                    color: '#ED6C02',
                                    filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))'
                                  }} />
                                </Box>
                              ) : (
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  width: 12,
                                  height: 12,
                                  bgcolor: 'success.main',
                                  borderRadius: '50%',
                                  border: '2px solid white'
                                }} />
                              )
                            ) : employee.leaveRequest && employee.leaveRequest.status === "Approved" ? (
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: 'info.main',
                                borderRadius: '50%',
                                border: '2px solid white'
                              }} />
                            ) : employee.leaveRequest && employee.leaveRequest.status === "Pending" ? (
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: 'warning.main',
                                borderRadius: '50%',
                                border: '2px solid white'
                              }} />
                            ) : (
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: 'error.main',
                                borderRadius: '50%',
                                border: '2px solid white'
                              }} />
                            )}
                          </Box>
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {employee.employeeName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.85rem",
                                color: "text.secondary",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {employee.position || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {employee.email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.80rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",

                          }}
                        >
                          {attendanceStatus.message}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.9rem",
                            color: "black.600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "center",
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          <strong>{duration}</strong>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={taskModal.open}
          onClose={handleCloseTasksModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 1,
            },
          }}
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Profile Image Display - Only show profile picture */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {taskModal.image ? (
                  <img
                    src={`${taskModal.image}`}
                    alt={taskModal.employeeName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "grey.300",
                    }}
                  >
                    {taskModal.gender === "male" ? (
                      <img
                        src={MaleSVG}
                        alt="Male Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : taskModal.gender === "female" ? (
                      <img
                        src={FemaleSVG}
                        alt="Female Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Typography variant="subtitle2">
                        {taskModal.employeeName?.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Title Text */}
              <Typography sx={{ fontSize: "1rem", fontWeight: "bold", letterSpacing: "-0.3px", }}>
                {`Clock In Details - ${taskModal.employeeName} (${taskModal.position})`}
              </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
              sx={{ position: "absolute", right: 8, top: 8 }}
              onClick={handleCloseTasksModal}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* Clock In Picture Section */}
          <Box sx={{
            px: 3,
            py: 2,
            borderBottom: '0px solid rgba(0, 0, 0, 0.12)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Clock In Picture
            </Typography>

            <Box
              sx={{
                border: '2px solid #e0e0e0',
                p: 0.5,
                width: '60px',
                height: '60px',
                cursor: 'pointer'
              }}
              onClick={() =>
                setZoomImage({
                  open: true,
                  image: taskModal.attendance?.todayClockInSelfie || null,
                  name: taskModal.employeeName,
                })
              }
            >
              {taskModal.attendance?.todayClockInSelfie ? (
                <img
                  src={taskModal.attendance.todayClockInSelfie}
                  alt="Clock In Selfie"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    N/A
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <DialogContent dividers>
            {/* Debug log to inspect taskModal */}
            {console.log("taskModal in DialogContent:", taskModal)}

            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              Today's Task Details:
            </Typography>
            {Array.isArray(taskModal.tasks) && taskModal.tasks.length > 0 ? (
              taskModal.tasks.map((task, index) => (
                <Box
                  key={task.id || index}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.9rem",
                      letterSpacing: "0.1px",
                      flex: 1,
                      mr: 2,
                    }}
                  >
                    <strong>{index + 1}. </strong>
                    <div style={{ paddingLeft: "8px" }}>
                      <span dangerouslySetInnerHTML={{ __html: cleanTaskDescription(task.description) }} />
                      {" - "}
                      <span style={{ fontWeight: "bold" }}>{task.projectName}</span>
                    </div>

                  </Typography>
                  <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1
                  }}>
                    <Chip
                      label={task.status || "Unknown"}
                      size="small"
                      color={
                        task.status.toLowerCase() === "completed"
                          ? "success"
                          : task.status.toLowerCase() === "in progress"
                            ? "warning"
                            : "error"
                      }
                      sx={{
                        borderRadius: "5px",
                        minWidth: "90px",
                        height: "24px",
                        textAlign: "center",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        flexShrink: 0,
                        overflow: "visible",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                          display: "block",
                        },
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontSize: "0.75rem",
                        textAlign: "right",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {task.estimatedHours || 0}h {task.estimatedMinutes || 0}m
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary" sx={{ py: 2, fontSize: "1.1rem" }}>
                No tasks available
              </Typography>
            )}

            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
                mt: 3,
              }}
            >
              Previous Days' Tasks:
            </Typography>
            {Array.isArray(taskModal.previousTasks) && taskModal.previousTasks.length > 0 ? (
              taskModal.previousTasks.map((task, index) => (
                <Box
                  key={task.id || index}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.9rem",
                        letterSpacing: "0.1px",
                      }}
                    >
                      <strong>{index + 1}. </strong>
                      <div
                        style={{ paddingLeft: "8px" }}
                        dangerouslySetInnerHTML={{ __html: cleanTaskDescription(task.description) }}
                      />
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: "block", mt: 0.5, pl: "28px" }}
                    >
                      Added: {task.taskDate ? new Date(task.taskDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1
                  }}>
                    <Chip
                      label={task.status || "Unknown"}
                      size="small"
                      color={
                        task.status.toLowerCase() === "completed"
                          ? "success"
                          : task.status.toLowerCase() === "in progress"
                            ? "warning"
                            : "error"
                      }
                      sx={{
                        borderRadius: "5px",
                        minWidth: "90px",
                        height: "24px",
                        textAlign: "center",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        flexShrink: 0,
                        overflow: "visible",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                          display: "block",
                        },
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontSize: "0.75rem",
                        textAlign: "right",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {task.estimatedHours || 0}h {task.estimatedMinutes || 0}m
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary" sx={{ py: 2, fontSize: "1.1rem" }}>
                No previous tasks available
              </Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCloseTasksModal}
              variant="outlined"
              sx={{
                textTransform: 'uppercase',
                mx: 1,
                my: 0.5
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={autoClockOutModal.open}
          onClose={handleCloseAutoClockOutModal}
          maxWidth="md" // Increased from "sm" to "md" to provide more width
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)" // Subtle shadow for depth
            }
          }}
        >
          <DialogTitle sx={{ bgcolor: "grey.100", py: 2, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                letterSpacing: "-0.3px",
                color: "text.primary"
              }}
            >
              Previous Day Auto Clock-Outs
            </Typography>
            <IconButton
              sx={{ position: "absolute", right: 8, top: 8, color: "grey.600" }}
              onClick={handleCloseAutoClockOutModal}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {autoClockOutEmployees.length > 0 ? (
              <TableContainer sx={{ overflowX: "visible" }}>
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.200" }}>
                      <TableCell width="10%" sx={{ fontWeight: "bold", fontSize: "1rem", color: "text.primary", py: 1.5 }}>
                        Sr. No
                      </TableCell>
                      <TableCell width="25%" sx={{ fontWeight: "bold", fontSize: "1rem", color: "text.primary", py: 1.5 }}>
                        Name
                      </TableCell>
                      <TableCell width="35%" sx={{ fontWeight: "bold", fontSize: "1rem", color: "text.primary", py: 1.5 }}>
                        Email
                      </TableCell>
                      <TableCell width="30%" sx={{ fontWeight: "bold", fontSize: "1rem", color: "text.primary", py: 1.5 }}>
                        Clock-In Time
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {autoClockOutEmployees.map((employee, index) => (
                      <TableRow
                        key={employee._id}
                        sx={{
                          "&:hover": { bgcolor: "grey.50" },
                          borderBottom: "1px solid rgba(0,0,0,0.05)"
                        }}
                      >
                        <TableCell sx={{ py: 1.5, fontSize: "1rem" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: "1rem" }}>
                          {employee.employeeId.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 1.5,
                            fontSize: "1rem",
                            color: "text.secondary",
                            maxWidth: "200px", // Limit width
                            overflow: "hidden",
                            textOverflow: "ellipsis" // Add ellipsis if text overflows
                          }}
                        >
                          {employee.employeeId.email}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: "1rem", color: "text.secondary" }}>
                          {new Date(employee.clockInTime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                {autoClockOutLoading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No employees were auto clocked out yesterday.
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseAutoClockOutModal}
              variant="outlined"
              sx={{
                borderRadius: 1,
                textTransform: "none",
                px: 3,
                "&:hover": { bgcolor: "grey.100" }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <ImageZoomModal
          open={zoomImage.open}
          onClose={() => setZoomImage({ open: false, image: null, name: "" })}
          imageSrc={zoomImage.image}
          employeeName={zoomImage.name}
        />

      </Container>
    </Box>
  );
};

export default Home;