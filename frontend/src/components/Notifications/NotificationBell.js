import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Badge,
  Popover,
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
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  EventNote as LeaveIcon,
  HomeWork as WfhIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import {
  fetchUnreadCount,
  fetchNotifications,
  markRead,
  markAllRead,
  addRealtimeNotification,
} from "../../features/notifications/notificationSlice";
import socketService from "../../services/socketService";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type) => {
  switch (type) {
    case "clock_in":
      return <LoginIcon sx={{ fontSize: 20, color: "#10b981" }} />;
    case "clock_out":
      return <LogoutIcon sx={{ fontSize: 20, color: "#ef4444" }} />;
    case "leave_request":
      return <LeaveIcon sx={{ fontSize: 20, color: "#f59e0b" }} />;
    case "wfh_credit_request":
      return <WfhIcon sx={{ fontSize: 20, color: "#6366f1" }} />;
    default:
      return <NotificationsIcon sx={{ fontSize: 20, color: "#6b7280" }} />;
  }
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount, notifications, loading } = useSelector(
    (state) => state.notifications
  );
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    const handleNewNotification = (data) => {
      dispatch(addRealtimeNotification(data));
    };
    socketService.on("notification:new", handleNewNotification);
    return () => {
      socketService.off("notification:new", handleNewNotification);
    };
  }, [dispatch]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markRead(notification._id));
    }
    handleClose();
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleViewAll = () => {
    handleClose();
    navigate("/notifications");
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          color: "rgba(255,255,255,0.7)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.6rem",
              height: 16,
              minWidth: 16,
              bgcolor: "#ef4444",
              color: "#fff",
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxHeight: 480,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="subtitle1" fontWeight="600" color="#1f2937">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ textTransform: "none", color: "#2563eb", fontSize: "0.75rem" }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <NotificationsIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
            <Typography variant="body2" color="#9ca3af">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflowY: "auto" }}>
            {notifications.slice(0, 10).map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: notification.isRead ? "transparent" : "#eff6ff",
                    "&:hover": { bgcolor: notification.isRead ? "#f9fafb" : "#dbeafe" },
                    px: 2,
                    py: 1.5,
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44, mt: 0.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#f3f4f6",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {!notification.isRead && (
                          <CircleIcon sx={{ fontSize: 8, color: "#2563eb", flexShrink: 0 }} />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={notification.isRead ? 400 : 600}
                          color="#1f2937"
                          noWrap
                        >
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          color="#6b7280"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="#9ca3af">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.slice(0, 10).length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1, display: "flex", gap: 1 }}>
          <Button
            fullWidth
            onClick={handleViewAll}
            sx={{
              textTransform: "none",
              color: "#2563eb",
              fontWeight: 500,
              "&:hover": { bgcolor: "#eff6ff" },
            }}
          >
            View All
          </Button>
          <Button
            fullWidth
            onClick={() => {
              handleClose();
              navigate("/notifications?tab=preferences");
            }}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              fontWeight: 500,
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Preferences
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
