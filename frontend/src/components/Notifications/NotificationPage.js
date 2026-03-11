import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Pagination,
  Stack,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  EventNote as LeaveIcon,
  HomeWork as WfhIcon,
  DoneAll as DoneAllIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  fetchNotifications,
  markRead,
  markAllRead,
} from "../../features/notifications/notificationSlice";
import { formatDistanceToNow, format } from "date-fns";
import NotificationSettings from "./NotificationSettings";

const getNotificationIcon = (type) => {
  switch (type) {
    case "clock_in":
      return <LoginIcon sx={{ color: "#10b981" }} />;
    case "clock_out":
      return <LogoutIcon sx={{ color: "#ef4444" }} />;
    case "leave_request":
      return <LeaveIcon sx={{ color: "#f59e0b" }} />;
    case "wfh_credit_request":
      return <WfhIcon sx={{ color: "#6366f1" }} />;
    default:
      return <NotificationsIcon sx={{ color: "#6b7280" }} />;
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case "clock_in":
      return "Clock In";
    case "clock_out":
      return "Clock Out";
    case "leave_request":
      return "Leave Request";
    case "wfh_credit_request":
      return "WFH Credit Request";
    default:
      return type;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case "clock_in":
      return "success";
    case "clock_out":
      return "error";
    case "leave_request":
      return "warning";
    case "wfh_credit_request":
      return "info";
    default:
      return "default";
  }
};

const NotificationPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, pagination, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "preferences" ? 1 : 0
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handlePageChange = (event, page) => {
    dispatch(fetchNotifications({ page, limit: 50 }));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markRead(id));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: "auto" }}>
      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{ mb: 3, borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              minHeight: 52,
            },
          }}
        >
          <Tab
            icon={<NotificationsIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          />
          <Tab
            icon={<SettingsIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Preferences"
          />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              bgcolor: "#ffffff",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight="700" color="#1f2937">
                  Notifications
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  {pagination.total} total &middot; {unreadCount} unread
                </Typography>
              </Box>
              {unreadCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<DoneAllIcon />}
                  onClick={handleMarkAllRead}
                  sx={{
                    textTransform: "none",
                    borderColor: "#2563eb",
                    color: "#2563eb",
                    "&:hover": { bgcolor: "#eff6ff", borderColor: "#1d4ed8" },
                  }}
                >
                  Mark All as Read
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Loading */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={40} />
            </Box>
          ) : notifications.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                border: "1px solid #e5e7eb",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 56, color: "#d1d5db", mb: 2 }} />
              <Typography variant="h6" fontWeight="600" color="#374151" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="#9ca3af">
                You're all caught up! Notifications will appear here.
              </Typography>
            </Paper>
          ) : (
            <>
              <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}
              >
                <List sx={{ p: 0 }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification._id}>
                      <ListItem
                        sx={{
                          px: { xs: 2, sm: 3 },
                          py: 2,
                          bgcolor: notification.isRead ? "transparent" : "#f0f7ff",
                          "&:hover": {
                            bgcolor: notification.isRead ? "#f9fafb" : "#e0edff",
                          },
                          alignItems: "flex-start",
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 52 }}>
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                                mb: 0.5,
                              }}
                            >
                              {!notification.isRead && (
                                <CircleIcon
                                  sx={{ fontSize: 8, color: "#2563eb", flexShrink: 0 }}
                                />
                              )}
                              <Typography
                                variant="body1"
                                fontWeight={notification.isRead ? 400 : 600}
                                color="#1f2937"
                              >
                                {notification.title}
                              </Typography>
                              <Chip
                                label={getTypeLabel(notification.type)}
                                size="small"
                                color={getTypeColor(notification.type)}
                                variant="outlined"
                                sx={{ height: 22, fontSize: "0.7rem" }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="#4b5563" sx={{ mb: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="#9ca3af">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })}
                                </Typography>
                                <Typography variant="caption" color="#d1d5db">
                                  &middot;
                                </Typography>
                                <Typography variant="caption" color="#9ca3af">
                                  {format(new Date(notification.createdAt), "MMM dd, yyyy hh:mm a")}
                                </Typography>
                              </Stack>
                            </>
                          }
                        />
                        {!notification.isRead && (
                          <IconButton
                            size="small"
                            onClick={() => handleMarkRead(notification._id)}
                            sx={{
                              mt: 1,
                              color: "#9ca3af",
                              "&:hover": { color: "#10b981" },
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        )}
                      </ListItem>
                      {index < notifications.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <NotificationSettings />
      )}
    </Box>
  );
};

export default NotificationPage;
