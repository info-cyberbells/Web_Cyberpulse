import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Tooltip,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  ChatBubble as ChatIcon,
  ExitToApp as LogoutIcon,
  Timer as TimerIcon,
  Coffee as BreakIcon,
  Logout as ClockOutIcon,
  FreeBreakfast as OnBreakIcon,
  AccountCircle as AccountCircleIcon,
  BreakfastDining as BreakfastDiningIcon,
} from "@mui/icons-material";
import NotificationBell from "./Notifications/NotificationBell";
import { drawerWidth } from "./sidebar";
import {
  clockOutAsync,
  updateAttendanceAsync,
  getAttendance,
} from "../features/attendance/attendanceSlice";
import { getOrgSettings } from "../services/services";

const COLLAPSED_WIDTH = 72;

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
    return userData?.employee?.id || null;
  } catch {
    return null;
  }
};

const TopNavbar = ({ onLogout, userName, userRole, sidebarOpen, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentAttendance } = useSelector((state) => state.attendances);
  const { unreadCounts } = useSelector((state) => state.chat);

  const [elapsedTime, setElapsedTime] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false);
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [breakDescription, setBreakDescription] = useState("");
  const [isBreakLoading, setIsBreakLoading] = useState(false);
  const [isClockOutLoading, setIsClockOutLoading] = useState(false);
  const [clockOutError, setClockOutError] = useState(null);
  const [orgSettings, setOrgSettings] = useState({
    workingHoursRequired: 8,
    maxBreakDurationMinutes: 60,
    minClockOutHour: 18,
    minClockOutMinute: 0,
  });

  const totalUnreadMessages = Object.values(unreadCounts || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  const isClockedIn =
    currentAttendance?.clockInTime && !currentAttendance?.clockOutTime;
  const isOnBreak = currentAttendance?.Employeestatus === "on break";

  // Fetch org settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const orgId = userData?.employee?.organizationId;
        if (orgId) {
          const response = await getOrgSettings(orgId);
          if (response?.success && response?.data) {
            setOrgSettings(response.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch org settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentAttendance?.clockInTime && !currentAttendance?.clockOutTime) {
        const now = new Date();
        const start = new Date(currentAttendance.clockInTime);

        const totalBreakSeconds =
          currentAttendance?.breakTimings?.reduce((acc, b) => {
            const paused = b.pausedDuration || 0;
            if (b.startTime && b.endTime) {
              const total = Math.floor(
                (new Date(b.endTime) - new Date(b.startTime)) / 1000
              );
              return acc + Math.max(0, total - paused);
            }
            if (b.startTime && !b.endTime) {
              const total = Math.floor(
                (now.getTime() - new Date(b.startTime).getTime()) / 1000
              );
              return acc + Math.max(0, total - paused);
            }
            return acc;
          }, 0) || 0;

        const totalSeconds = Math.floor(
          (now.getTime() - start.getTime()) / 1000
        );
        const workingSeconds = Math.max(0, totalSeconds - totalBreakSeconds);
        const h = Math.floor(workingSeconds / 3600);
        const m = Math.floor((workingSeconds % 3600) / 60);
        const s = workingSeconds % 60;
        setElapsedTime(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        );
      } else {
        setElapsedTime(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAttendance]);

  // ── Break Start Handler ──
  const handleStartBreak = async () => {
    if (!breakDescription.trim()) {
      toast.dismiss();
      toast.error("Please provide a reason for your break");
      return;
    }
    setIsBreakLoading(true);
    try {
      const now = getCurrentISOTime();
      const updatedBreakTimings = [
        ...(currentAttendance?.breakTimings || []),
        {
          name: breakDescription.trim(),
          startTime: now,
          endTime: null,
        },
      ];
      await dispatch(
        updateAttendanceAsync({
          id: currentAttendance._id,
          data: {
            breakTimings: updatedBreakTimings,
            Employeestatus: "on break",
          },
        })
      ).unwrap();
      const userId = getUserId();
      if (userId) {
        const today = new Date().toISOString().split("T")[0];
        await dispatch(getAttendance({ id: userId, date: today }));
      }
      setBreakDialogOpen(false);
      setBreakDescription("");
      toast.success(`Break started: ${breakDescription.trim()}`);
    } catch (error) {
      console.error("Error starting break:", error);
      toast.dismiss();
      toast.error("Failed to start break");
    } finally {
      setIsBreakLoading(false);
    }
  };

  // ── End Break (Back to Work) Handler ──
  const handleEndBreak = async () => {
    if (currentAttendance?.Employeestatus !== "on break" || !currentAttendance?.breakTimings?.length) {
      toast.dismiss();
      toast.error("No active break to end");
      return;
    }
    try {
      const now = getCurrentISOTime();
      const latestBreak = currentAttendance.breakTimings[currentAttendance.breakTimings.length - 1];
      if (latestBreak.endTime) {
        toast.dismiss();
        toast.error("No active break to end");
        return;
      }
      const updatedBreakTimings = currentAttendance.breakTimings.map((b, index) =>
        index === currentAttendance.breakTimings.length - 1 ? { ...b, endTime: now } : b
      );
      await dispatch(
        updateAttendanceAsync({
          id: currentAttendance._id,
          data: {
            breakTimings: updatedBreakTimings,
            Employeestatus: "active",
          },
        })
      ).unwrap();
      const userId = getUserId();
      if (userId) {
        const today = new Date().toISOString().split("T")[0];
        await dispatch(getAttendance({ id: userId, date: today }));
      }
      toast.success("Break ended, back to work!");
    } catch (error) {
      console.error("Error ending break:", error);
      toast.dismiss();
      toast.error("Failed to end break");
    }
  };

  // ── Check if clock out is allowed ──
  const getClockOutStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const h = orgSettings.minClockOutHour;
    const m = orgSettings.minClockOutMinute;
    const canClockOutByTime =
      currentHour > h || (currentHour === h && currentMinutes >= m);

    if (!canClockOutByTime) {
      const timeStr = `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
      return { allowed: false, type: "time", message: `You can clock out after ${timeStr}`, timeStr };
    }

    if (currentAttendance?.clockInTime) {
      const start = new Date(currentAttendance.clockInTime);
      const totalSeconds = Math.floor((now - start) / 1000);
      const totalBreakSeconds =
        currentAttendance?.breakTimings?.reduce((acc, b) => {
          const paused = b.pausedDuration || 0;
          if (b.startTime && b.endTime) {
            const total = Math.floor((new Date(b.endTime) - new Date(b.startTime)) / 1000);
            return acc + Math.max(0, total - paused);
          }
          if (b.startTime && !b.endTime) {
            const total = Math.floor((now - new Date(b.startTime)) / 1000);
            return acc + Math.max(0, total - paused);
          }
          return acc;
        }, 0) || 0;
      const workedHours = Math.max(0, totalSeconds - totalBreakSeconds) / 3600;

      if (workedHours < orgSettings.workingHoursRequired) {
        const hrs = Math.floor(workedHours);
        const mins = Math.floor((workedHours - hrs) * 60);
        const reqH = Math.floor(orgSettings.workingHoursRequired);
        const remaining = orgSettings.workingHoursRequired - workedHours;
        const remH = Math.floor(remaining);
        const remM = Math.floor((remaining - remH) * 60);
        return {
          allowed: false,
          type: "hours",
          message: `You have worked ${hrs}h ${mins}m out of ${reqH}h required.`,
          remaining: `${remH}h ${remM}m remaining`,
          worked: `${hrs}h ${mins}m`,
          required: `${reqH}h`,
        };
      }
    }

    return { allowed: true };
  };

  // ── Clock Out Handler ──
  const handleClockOut = async () => {
    setIsClockOutLoading(true);
    setClockOutError(null);
    try {
      const status = getClockOutStatus();
      if (!status.allowed) {
        setClockOutError(status);
        setIsClockOutLoading(false);
        return;
      }

      // Perform clock out
      const clockOutTime = getCurrentISOTime();
      let updatedBreakTimings = [...(currentAttendance?.breakTimings || [])];
      if (currentAttendance?.Employeestatus === "on break") {
        updatedBreakTimings = updatedBreakTimings.map((b, index) =>
          index === updatedBreakTimings.length - 1 && !b.endTime
            ? { ...b, endTime: clockOutTime }
            : b
        );
      }
      const breakTimeMinutes = updatedBreakTimings.reduce((acc, b) => {
        if (b.startTime && b.endTime) {
          return acc + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60));
        }
        return acc;
      }, 0);

      const clockOutPayload = {
        clockOutTime,
        type: "CLOCK_OUT",
        isEmergency: false,
        breakTime: breakTimeMinutes,
        breakTimings: updatedBreakTimings,
        Employeestatus: "clocked out",
      };

      const response = await dispatch(
        clockOutAsync({
          id: currentAttendance._id,
          clockOutData: clockOutPayload,
        })
      ).unwrap();

      if (response?.attendance) {
        const userId = getUserId();
        if (userId) {
          const today = new Date().toISOString().split("T")[0];
          dispatch(getAttendance({ id: userId, date: today }));
        }
        toast.dismiss();
        toast.success("Clock out successful!");
      }
      setClockOutDialogOpen(false);
    } catch (error) {
      console.error("Clock out failed:", error);
      toast.dismiss();
      toast.error("Failed to clock out. Please try again.");
    } finally {
      setIsClockOutLoading(false);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: isMobile ? 64 : 0,
          left: isMobile
            ? 0
            : sidebarOpen
              ? `${drawerWidth}px`
              : `${COLLAPSED_WIDTH}px`,
          width: isMobile
            ? "100%"
            : `calc(100% - ${sidebarOpen ? drawerWidth : COLLAPSED_WIDTH}px)`,
          height: 52,
          backgroundImage: "linear-gradient(135deg, #1e1e2f 0%, #2d2d44 50%, #3c3c5a 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          transition: theme.transitions.create(["left", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          zIndex: theme.zIndex.appBar - 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: "52px !important",
            maxHeight: "52px !important",
            px: { xs: 1, sm: 1.5, md: 2.5 },
            gap: { xs: 0.5, md: 1 },
          }}
        >
          {/* Left: User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                fontWeight="600"
                color="#ffffff"
                noWrap
                sx={{ fontSize: "0.8rem", lineHeight: 1.2 }}
              >
                {userName || "User"}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", lineHeight: 1 }}
              >
                {userRole || "Employee"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Center: Timer + Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
            {/* Work Timer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: { xs: 1, md: 1.5 },
                py: 0.5,
                borderRadius: 2,
                bgcolor: isClockedIn
                  ? isOnBreak
                    ? "rgba(251,191,36,0.15)"
                    : "rgba(34,197,94,0.15)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid",
                borderColor: isClockedIn
                  ? isOnBreak
                    ? "rgba(251,191,36,0.3)"
                    : "rgba(34,197,94,0.3)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              <TimerIcon
                sx={{
                  fontSize: 16,
                  color: isClockedIn
                    ? isOnBreak ? "#fbbf24" : "#22c55e"
                    : "rgba(255,255,255,0.4)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", md: "0.85rem" },
                  color: isClockedIn
                    ? isOnBreak ? "#fbbf24" : "#4ade80"
                    : "rgba(255,255,255,0.4)",
                  letterSpacing: "0.5px",
                }}
              >
                {elapsedTime || "00:00:00"}
              </Typography>
              {isOnBreak && (
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Break
                </Typography>
              )}
            </Box>

            {/* Break / End Break Button */}
            {isClockedIn && (
              <Tooltip title={isOnBreak ? "End Break" : "Take Break"}>
                <Button
                  size="small"
                  onClick={isOnBreak ? handleEndBreak : () => setBreakDialogOpen(true)}
                  sx={{
                    minWidth: 0,
                    px: { xs: 0.75, md: 1.5 },
                    py: 0.5,
                    borderRadius: 1.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "none",
                    color: isOnBreak ? "#fbbf24" : "rgba(255,255,255,0.7)",
                    bgcolor: isOnBreak ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
                    border: "1px solid",
                    borderColor: isOnBreak ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.1)",
                    "&:hover": {
                      bgcolor: isOnBreak ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.12)",
                    },
                  }}
                  startIcon={
                    isOnBreak
                      ? <OnBreakIcon sx={{ fontSize: "14px !important" }} />
                      : <BreakIcon sx={{ fontSize: "14px !important" }} />
                  }
                >
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    {isOnBreak ? "End Break" : "Break"}
                  </Box>
                </Button>
              </Tooltip>
            )}

            {/* Clock Out Button */}
            {isClockedIn && (
              <Tooltip title="Clock Out">
                <Button
                  size="small"
                  onClick={() => setClockOutDialogOpen(true)}
                  sx={{
                    minWidth: 0,
                    px: { xs: 0.75, md: 1.5 },
                    py: 0.5,
                    borderRadius: 1.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "none",
                    color: "#f87171",
                    bgcolor: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    "&:hover": {
                      bgcolor: "rgba(239,68,68,0.2)",
                    },
                  }}
                  startIcon={<ClockOutIcon sx={{ fontSize: "14px !important" }} />}
                >
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    Clock Out
                  </Box>
                </Button>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right: Messages + Notifications + Logout */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            <Tooltip title="Messages">
              <IconButton
                onClick={() => navigate("/chat")}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
                }}
              >
                <Badge
                  badgeContent={totalUnreadMessages}
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.6rem",
                      minWidth: 16,
                      height: 16,
                      bgcolor: "#ef4444",
                      color: "#fff",
                    },
                  }}
                >
                  <ChatIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <NotificationBell />

            <Tooltip title="Profile">
              <IconButton
                onClick={() => navigate("/profile")}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                width: 1,
                height: 24,
                bgcolor: "rgba(255,255,255,0.12)",
                mx: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            />

            <Tooltip title="Logout">
              <IconButton
                onClick={() => setLogoutDialogOpen(true)}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.15)", color: "#f87171" },
                }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, px: 1, py: 0.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLogoutDialogOpen(false);
              onLogout();
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clock Out Confirmation Dialog */}
      <Dialog
        open={clockOutDialogOpen}
        onClose={() => {
          if (!isClockOutLoading) {
            setClockOutDialogOpen(false);
            setClockOutError(null);
          }
        }}
        slotProps={{ paper: { sx: { borderRadius: 3, px: 1, py: 0.5, minWidth: 380 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {clockOutError ? "Cannot Clock Out" : "Confirm Clock Out"}
        </DialogTitle>
        <DialogContent>
          {clockOutError ? (
            <Box>
              {clockOutError.type === "time" && (
                <Box
                  sx={{
                    bgcolor: "#fff3e0",
                    border: "1px solid #ffcc80",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ fontSize: 36, mb: 1 }}>&#9200;</Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#e65100" gutterBottom>
                    Too Early to Clock Out
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {clockOutError.message}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#fff8e1",
                      borderRadius: 1.5,
                      py: 1,
                      px: 2,
                      display: "inline-block",
                    }}
                  >
                    <Typography variant="h6" fontWeight={800} color="#f57c00">
                      {clockOutError.timeStr}
                    </Typography>
                  </Box>
                </Box>
              )}
              {clockOutError.type === "hours" && (
                <Box
                  sx={{
                    bgcolor: "#fce4ec",
                    border: "1px solid #f48fb1",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ fontSize: 36, mb: 1 }}>&#128337;</Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#c62828" gutterBottom>
                    Working Hours Incomplete
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {clockOutError.message}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#ffebee",
                        borderRadius: 1.5,
                        py: 0.8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Worked
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#c62828">
                        {clockOutError.worked}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#ffebee",
                        borderRadius: 1.5,
                        py: 0.8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Required
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#c62828">
                        {clockOutError.required}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#fff3e0",
                        borderRadius: 1.5,
                        py: 0.8,
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Remaining
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#e65100">
                        {clockOutError.remaining}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <DialogContentText>
              Are you sure you want to clock out? {isOnBreak && "Your active break will also be ended."}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => {
              setClockOutDialogOpen(false);
              setClockOutError(null);
            }}
            variant="outlined"
            disabled={isClockOutLoading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {clockOutError ? "OK" : "Cancel"}
          </Button>
          {!clockOutError && (
            <Button
              onClick={handleClockOut}
              variant="contained"
              color="error"
              disabled={isClockOutLoading}
              startIcon={isClockOutLoading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              {isClockOutLoading ? "Clocking Out..." : "Clock Out"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Break Reason Dialog */}
      <Dialog
        open={breakDialogOpen}
        onClose={() => {
          if (!isBreakLoading) {
            setBreakDialogOpen(false);
            setBreakDescription("");
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "warning.main",
            color: "white",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <BreakfastDiningIcon />
          <Typography variant="h6" fontWeight={600}>
            Take a Break
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
            Enter a reason for your break
          </Typography>
          <TextField
            fullWidth
            label="Reason"
            value={breakDescription}
            onChange={(e) => setBreakDescription(e.target.value)}
            placeholder="E.g., Lunch, Tea/Coffee, Personal errand, etc."
            multiline
            rows={3}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            variant="outlined"
            helperText={`Max daily break: ${orgSettings.maxBreakDurationMinutes} minutes`}
            required
            error={breakDialogOpen && !breakDescription.trim()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            onClick={() => {
              setBreakDialogOpen(false);
              setBreakDescription("");
            }}
            variant="outlined"
            color="inherit"
            disabled={isBreakLoading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartBreak}
            variant="contained"
            color="warning"
            disabled={!breakDescription.trim() || isBreakLoading}
            startIcon={isBreakLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {isBreakLoading ? "Starting Break..." : "Start Break"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopNavbar;
