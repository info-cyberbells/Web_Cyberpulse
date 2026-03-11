import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Container,
  Avatar,
  CircularProgress,
  useTheme,
  Divider,
  Switch,
  Tab,
  Tabs,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  EventNote as LeaveIcon,
  HomeWork as WfhIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Event as EventIcon,
  Campaign as AnnouncementIcon,
  SupportAgent as HelpdeskIcon,
} from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getOrgSettings, updateOrgSettings } from "../services/services";
import {
  fetchSettings,
  saveSettings,
} from "../features/notifications/notificationSlice";

const NOTIFICATION_FIELDS = [
  {
    key: "clock_in",
    label: "Clock In Notifications",
    description: "Get notified when an employee clocks in",
    icon: <LoginIcon sx={{ color: "#10b981" }} />,
  },
  {
    key: "clock_out",
    label: "Clock Out Notifications",
    description: "Get notified when an employee clocks out",
    icon: <LogoutIcon sx={{ color: "#ef4444" }} />,
  },
  {
    key: "leave_request",
    label: "Leave Request Notifications",
    description: "Get notified when an employee applies for leave",
    icon: <LeaveIcon sx={{ color: "#f59e0b" }} />,
  },
  {
    key: "wfh_credit_request",
    label: "WFH Credit Request Notifications",
    description: "Get notified when an employee requests WFH credit evaluation",
    icon: <WfhIcon sx={{ color: "#6366f1" }} />,
  },
  {
    key: "leave_approved",
    label: "Leave Approved Notifications",
    description: "Notify employee when their leave request is approved",
    icon: <ApproveIcon sx={{ color: "#22c55e" }} />,
  },
  {
    key: "leave_rejected",
    label: "Leave Rejected Notifications",
    description: "Notify employee when their leave request is rejected",
    icon: <RejectIcon sx={{ color: "#dc2626" }} />,
  },
  {
    key: "event_added",
    label: "New Event Notifications",
    description: "Notify all employees when a new event is created",
    icon: <EventIcon sx={{ color: "#0ea5e9" }} />,
  },
  {
    key: "announcement_added",
    label: "New Announcement Notifications",
    description: "Notify all employees when a new announcement is posted",
    icon: <AnnouncementIcon sx={{ color: "#f97316" }} />,
  },
  {
    key: "helpdesk_ticket",
    label: "Help Desk Ticket Notifications",
    description: "Notify admins when a new help desk ticket is submitted",
    icon: <HelpdeskIcon sx={{ color: "#8b5cf6" }} />,
  },
];

const Settings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  // --- Organization Settings State ---
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSettings, setOrgSettings] = useState({
    workingHoursRequired: 8,
    maxBreakDurationMinutes: 60,
    minClockOutHour: 18,
    minClockOutMinute: 0,
  });

  // --- Notification Settings State ---
  const { settings: notifSettings, loading: notifLoading } = useSelector(
    (state) => state.notifications
  );
  const [localNotifSettings, setLocalNotifSettings] = useState({
    clock_in: true,
    clock_out: true,
    leave_request: true,
    wfh_credit_request: true,
    leave_approved: true,
    leave_rejected: true,
    event_added: true,
    announcement_added: true,
    helpdesk_ticket: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const getOrgId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData?.employee?.organizationId;
    } catch {
      return null;
    }
  };

  // Fetch org settings
  useEffect(() => {
    const fetchOrgSettings = async () => {
      try {
        const orgId = getOrgId();
        if (!orgId) {
          setOrgLoading(false);
          return;
        }
        const response = await getOrgSettings(orgId);
        if (response?.success && response?.data) {
          setOrgSettings({
            workingHoursRequired: response.data.workingHoursRequired ?? 8,
            maxBreakDurationMinutes: response.data.maxBreakDurationMinutes ?? 60,
            minClockOutHour: response.data.minClockOutHour ?? 18,
            minClockOutMinute: response.data.minClockOutMinute ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch org settings:", error);
      } finally {
        setOrgLoading(false);
      }
    };
    fetchOrgSettings();
  }, []);

  // Fetch notification settings
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (notifSettings) {
      setLocalNotifSettings({
        clock_in: notifSettings.clock_in ?? true,
        clock_out: notifSettings.clock_out ?? true,
        leave_request: notifSettings.leave_request ?? true,
        wfh_credit_request: notifSettings.wfh_credit_request ?? true,
        leave_approved: notifSettings.leave_approved ?? true,
        leave_rejected: notifSettings.leave_rejected ?? true,
        event_added: notifSettings.event_added ?? true,
        announcement_added: notifSettings.announcement_added ?? true,
        helpdesk_ticket: notifSettings.helpdesk_ticket ?? true,
      });
    }
  }, [notifSettings]);

  // --- Org Settings Handlers ---
  const handleOrgSave = async () => {
    const orgId = getOrgId();
    if (!orgId) {
      toast.error("Organization not found");
      return;
    }
    if (orgSettings.workingHoursRequired < 1 || orgSettings.workingHoursRequired > 24) {
      toast.error("Working hours must be between 1 and 24");
      return;
    }
    if (orgSettings.maxBreakDurationMinutes < 0) {
      toast.error("Break duration cannot be negative");
      return;
    }
    if (orgSettings.minClockOutHour < 0 || orgSettings.minClockOutHour > 23) {
      toast.error("Clock out hour must be between 0 and 23");
      return;
    }
    if (orgSettings.minClockOutMinute < 0 || orgSettings.minClockOutMinute > 59) {
      toast.error("Clock out minute must be between 0 and 59");
      return;
    }

    setOrgSaving(true);
    try {
      const response = await updateOrgSettings(orgId, orgSettings);
      if (response?.success) {
        toast.success("Organization settings saved");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to update org settings:", error);
      toast.error(error?.response?.data?.error || "Failed to update settings");
    } finally {
      setOrgSaving(false);
    }
  };

  const formatClockOutTime = () => {
    const h = orgSettings.minClockOutHour;
    const m = orgSettings.minClockOutMinute;
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  // --- Notification Settings Handlers ---
  const handleNotifToggle = (key) => {
    setLocalNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotifSave = async () => {
    setNotifSaving(true);
    try {
      await dispatch(saveSettings(localNotifSettings)).unwrap();
      toast.success("Notification settings saved");
    } catch (err) {
      console.error("Error saving notification settings:", err);
      toast.error("Failed to save notification settings");
    } finally {
      setNotifSaving(false);
    }
  };

  const isLoading = orgLoading || notifLoading;

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2, mt: -1 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "white",
              color: "primary.main",
              width: 48,
              height: 48,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <SettingsIcon />
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage organization and notification preferences
            </Typography>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 52,
            },
          }}
        >
          <Tab icon={<TuneIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Organization" />
          <Tab icon={<NotificationsActiveIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Notifications" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Working Hours */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Required Working Hours
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Minimum hours an employee must work before clocking out without a warning
                </Typography>
                <TextField
                  type="number"
                  value={orgSettings.workingHoursRequired}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, workingHoursRequired: Number(e.target.value) })
                  }
                  inputProps={{ min: 1, max: 24 }}
                  size="small"
                  sx={{ width: 200, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  helperText="Between 1 and 24 hours"
                />
              </Box>

              <Divider />

              {/* Max Break Duration */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Maximum Daily Break Duration (minutes)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Total break time allowed per day. Displayed to employees as a guideline.
                </Typography>
                <TextField
                  type="number"
                  value={orgSettings.maxBreakDurationMinutes}
                  onChange={(e) =>
                    setOrgSettings({ ...orgSettings, maxBreakDurationMinutes: Number(e.target.value) })
                  }
                  inputProps={{ min: 0 }}
                  size="small"
                  sx={{ width: 200, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  helperText="In minutes (e.g., 60 = 1 hour)"
                />
              </Box>

              <Divider />

              {/* Earliest Clock Out Time */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Earliest Clock Out Time
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Employees cannot clock out before this time (currently: {formatClockOutTime()})
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="number"
                    label="Hour (0-23)"
                    value={orgSettings.minClockOutHour}
                    onChange={(e) =>
                      setOrgSettings({ ...orgSettings, minClockOutHour: Number(e.target.value) })
                    }
                    inputProps={{ min: 0, max: 23 }}
                    size="small"
                    sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Typography variant="h6" color="text.secondary">:</Typography>
                  <TextField
                    type="number"
                    label="Minute (0-59)"
                    value={orgSettings.minClockOutMinute}
                    onChange={(e) =>
                      setOrgSettings({ ...orgSettings, minClockOutMinute: Number(e.target.value) })
                    }
                    inputProps={{ min: 0, max: 59 }}
                    size="small"
                    sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              <Divider />

              <Box sx={{ textAlign: "right" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOrgSave}
                  disabled={orgSaving}
                  startIcon={orgSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: 2,
                  }}
                >
                  {orgSaving ? "Saving..." : "Save Organization Settings"}
                </Button>
              </Box>
            </Stack>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ px: 4, pt: 3, pb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Control which notifications are enabled for your organization. These
                settings apply to all Admin, TL, HR, and Manager users.
              </Typography>
            </Box>

            <Box sx={{ px: 2 }}>
              {NOTIFICATION_FIELDS.map((field, index) => (
                <React.Fragment key={field.key}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 2.5,
                      "&:hover": { bgcolor: "#f9fafb" },
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {field.icon}
                      </Box>
                      <Box>
                        <Typography variant="body1" fontWeight={500} color="text.primary">
                          {field.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={localNotifSettings[field.key]}
                      onChange={() => handleNotifToggle(field.key)}
                      color="primary"
                    />
                  </Box>
                  {index < NOTIFICATION_FIELDS.length - 1 && <Divider sx={{ mx: 2 }} />}
                </React.Fragment>
              ))}
            </Box>

            <Box sx={{ p: 3, textAlign: "right", borderTop: "1px solid", borderColor: "divider" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNotifSave}
                disabled={notifSaving}
                startIcon={notifSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 2,
                }}
              >
                {notifSaving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      <ToastContainer position="top-right" />
    </Container>
  );
};

export default Settings;
