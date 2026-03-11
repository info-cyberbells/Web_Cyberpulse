import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  EventNote as LeaveIcon,
  HomeWork as WfhIcon,
  Save as SaveIcon,
  NotificationsActive as PushIcon,
  Event as EventIcon,
  Campaign as AnnouncementIcon,
  SupportAgent as HelpdeskIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import {
  fetchSettings,
  saveSettings,
  fetchUserPreferences,
  saveUserPreferences,
} from "../../features/notifications/notificationSlice";

// Organization-level settings (HR/Admin only)
const ORG_SETTINGS_FIELDS = [
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
];

// Per-user preference fields (all users)
const USER_PREF_FIELDS = [
  {
    key: "clock_in",
    label: "Clock In",
    description: "When someone clocks in",
    icon: <LoginIcon sx={{ color: "#10b981" }} />,
  },
  {
    key: "clock_out",
    label: "Clock Out",
    description: "When someone clocks out",
    icon: <LogoutIcon sx={{ color: "#ef4444" }} />,
  },
  {
    key: "leave_request",
    label: "Leave Requests",
    description: "When a leave request is submitted",
    icon: <LeaveIcon sx={{ color: "#f59e0b" }} />,
  },
  {
    key: "leave_approved",
    label: "Leave Approved",
    description: "When your leave is approved",
    icon: <ApprovedIcon sx={{ color: "#10b981" }} />,
  },
  {
    key: "leave_rejected",
    label: "Leave Rejected",
    description: "When your leave is rejected",
    icon: <RejectedIcon sx={{ color: "#ef4444" }} />,
  },
  {
    key: "event_added",
    label: "Events",
    description: "When a new event is added",
    icon: <EventIcon sx={{ color: "#3b82f6" }} />,
  },
  {
    key: "announcement_added",
    label: "Announcements",
    description: "When a new announcement is posted",
    icon: <AnnouncementIcon sx={{ color: "#8b5cf6" }} />,
  },
  {
    key: "helpdesk_ticket",
    label: "Help Desk",
    description: "When a help desk ticket is updated",
    icon: <HelpdeskIcon sx={{ color: "#ec4899" }} />,
  },
  {
    key: "wfh_credit_request",
    label: "WFH Credits",
    description: "When WFH credit requests are made",
    icon: <WfhIcon sx={{ color: "#6366f1" }} />,
  },
  {
    key: "chat_message",
    label: "Chat Messages",
    description: "When you receive a new chat message",
    icon: <ChatIcon sx={{ color: "#0ea5e9" }} />,
  },
];

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const { settings, userPreferences, preferencesLoading, loading } = useSelector(
    (state) => state.notifications
  );

  // Get user type from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userType = storedUser?.type;
  const isAdminOrHR = [1, 4, 5].includes(userType);

  // Org-level settings state
  const [localSettings, setLocalSettings] = useState({
    clock_in: true,
    clock_out: true,
    leave_request: true,
    wfh_credit_request: true,
  });
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // Per-user preferences state
  const [localPrefs, setLocalPrefs] = useState({
    clock_in: true,
    clock_out: true,
    leave_request: true,
    leave_approved: true,
    leave_rejected: true,
    event_added: true,
    announcement_added: true,
    helpdesk_ticket: true,
    wfh_credit_request: true,
    chat_message: true,
  });
  const [pushEnabled, setPushEnabled] = useState(true);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchUserPreferences());
    if (isAdminOrHR) {
      dispatch(fetchSettings());
    }
  }, [dispatch, isAdminOrHR]);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        clock_in: settings.clock_in ?? true,
        clock_out: settings.clock_out ?? true,
        leave_request: settings.leave_request ?? true,
        wfh_credit_request: settings.wfh_credit_request ?? true,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (userPreferences) {
      const prefs = userPreferences.preferences || {};
      setLocalPrefs({
        clock_in: prefs.clock_in ?? true,
        clock_out: prefs.clock_out ?? true,
        leave_request: prefs.leave_request ?? true,
        leave_approved: prefs.leave_approved ?? true,
        leave_rejected: prefs.leave_rejected ?? true,
        event_added: prefs.event_added ?? true,
        announcement_added: prefs.announcement_added ?? true,
        helpdesk_ticket: prefs.helpdesk_ticket ?? true,
        wfh_credit_request: prefs.wfh_credit_request ?? true,
        chat_message: prefs.chat_message ?? true,
      });
      setPushEnabled(userPreferences.pushEnabled ?? true);
    }
  }, [userPreferences]);

  const handleOrgToggle = (key) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setOrgSaved(false);
  };

  const handleOrgSave = async () => {
    setOrgSaving(true);
    try {
      await dispatch(saveSettings(localSettings)).unwrap();
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 3000);
    } catch (err) {
      console.error("Error saving org settings:", err);
    } finally {
      setOrgSaving(false);
    }
  };

  const handlePrefToggle = (key) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setPrefSaved(false);
  };

  const handlePushToggle = () => {
    setPushEnabled((prev) => !prev);
    setPrefSaved(false);
  };

  const handlePrefSave = async () => {
    setPrefSaving(true);
    try {
      await dispatch(
        saveUserPreferences({ preferences: localPrefs, pushEnabled })
      ).unwrap();
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 3000);
    } catch (err) {
      console.error("Error saving user preferences:", err);
    } finally {
      setPrefSaving(false);
    }
  };

  if (loading || preferencesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 700, mx: "auto" }}>
      {/* My Notification Preferences - visible to ALL users */}
      <Paper
        elevation={0}
        sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}
      >
        <Typography variant="h5" fontWeight="700" color="#1f2937" gutterBottom>
          My Notification Preferences
        </Typography>
        <Typography variant="body2" color="#6b7280">
          Control which notifications you receive. These settings only apply to your account.
        </Typography>
      </Paper>

      {prefSaved && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Preferences saved successfully!
        </Alert>
      )}

      {/* Push Notifications Master Toggle */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden", mb: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3 },
            py: 2.5,
            bgcolor: pushEnabled ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: pushEnabled ? "#dcfce7" : "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PushIcon sx={{ color: pushEnabled ? "#16a34a" : "#dc2626" }} />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight="600" color="#1f2937">
                Push Notifications
              </Typography>
              <Typography variant="caption" color="#9ca3af">
                Receive browser push notifications even when the app is closed
              </Typography>
            </Box>
          </Stack>
          <Switch checked={pushEnabled} onChange={handlePushToggle} color="success" />
        </Box>
      </Paper>

      {/* Per-type toggles */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}
      >
        {USER_PREF_FIELDS.map((field, index) => (
          <React.Fragment key={field.key}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: { xs: 2, sm: 3 },
                py: 2,
                "&:hover": { bgcolor: "#f9fafb" },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
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
                  <Typography variant="body2" fontWeight="500" color="#1f2937">
                    {field.label}
                  </Typography>
                  <Typography variant="caption" color="#9ca3af">
                    {field.description}
                  </Typography>
                </Box>
              </Stack>
              <Switch
                checked={localPrefs[field.key]}
                onChange={() => handlePrefToggle(field.key)}
                color="primary"
                size="small"
              />
            </Box>
            {index < USER_PREF_FIELDS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Paper>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", mb: isAdminOrHR ? 5 : 0 }}>
        <Button
          variant="contained"
          startIcon={
            prefSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
          }
          onClick={handlePrefSave}
          disabled={prefSaving}
          sx={{
            textTransform: "none",
            bgcolor: "#2563eb",
            px: 4,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {prefSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </Box>

      {/* Organization-level Settings - HR/Admin only */}
      {isAdminOrHR && (
        <>
          <Divider sx={{ my: 3 }} />
          <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}
          >
            <Typography variant="h5" fontWeight="700" color="#1f2937" gutterBottom>
              Organization Settings
            </Typography>
            <Typography variant="body2" color="#6b7280">
              Control which notifications are enabled for your organization. These settings
              apply to all Admin, TL, HR, and Manager users.
            </Typography>
          </Paper>

          {orgSaved && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Organization settings saved successfully!
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}
          >
            {ORG_SETTINGS_FIELDS.map((field, index) => (
              <React.Fragment key={field.key}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 3 },
                    py: 2.5,
                    "&:hover": { bgcolor: "#f9fafb" },
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
                      <Typography variant="body1" fontWeight="500" color="#1f2937">
                        {field.label}
                      </Typography>
                      <Typography variant="caption" color="#9ca3af">
                        {field.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Switch
                    checked={localSettings[field.key]}
                    onChange={() => handleOrgToggle(field.key)}
                    color="primary"
                  />
                </Box>
                {index < ORG_SETTINGS_FIELDS.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Paper>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={
                orgSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
              }
              onClick={handleOrgSave}
              disabled={orgSaving}
              sx={{
                textTransform: "none",
                bgcolor: "#2563eb",
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {orgSaving ? "Saving..." : "Save Organization Settings"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default NotificationSettings;
