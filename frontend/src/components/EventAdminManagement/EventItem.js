import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  CardContent,
  Stack,
  Chip,
  styled,
  Card,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

// Styled Components
const EventCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  "&.priority-high": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  "&.priority-normal": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
  "&.priority-low": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
}));

const EventTypeChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  "&.eventType-meeting": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  "&.eventType-party": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
  "&.eventType-training, &.eventType-workshop, &.eventType-other": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
}));

const StatusChip = styled(Chip)(({ theme, expired }) => ({
  margin: theme.spacing(0.5),
  ...(expired && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
}));

const EventItem = ({ 
  event, 
  onEdit, 
  onDelete, 
  employeeList,
  getTeamMemberDetails 
}) => {
  const teamMembers = getTeamMemberDetails(event.teamMembers, employeeList);
  
  const isEventExpired = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDay = new Date(event.eventDate);
    eventDay.setHours(0, 0, 0, 0);
    return eventDay < today;
  };

  const getStatusColor = () => {
    if (isEventExpired()) return 'error';
    switch (event.status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    if (isEventExpired()) return 'Expired';
    return event.status.charAt(0).toUpperCase() + event.status.slice(1);
  };

  return (
    <EventCard elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {event.description}
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  {format(new Date(event.eventDate), "MMM dd, yyyy")}
                </Typography>
                <AccessTimeIcon color="primary" fontSize="small" sx={{ ml: 2 }} />
                <Typography variant="body2">
                  {event.startTime} - {event.endTime}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  {event.location || "No location specified"}
                </Typography>
              </Stack>

              {event.eventType === "meeting" && teamMembers.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PersonIcon fontSize="small" sx={{ color: "primary.main" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Team Members
                    </Typography>
                  </Stack>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {teamMembers.map((member) => (
                      <StyledChip
                        key={member._id}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="body2" component="span">
                              {member.name}
                            </Typography>
                            {member.designation && (
                              <Typography variant="caption" color="text.secondary" component="span">
                                ({member.designation})
                              </Typography>
                            )}
                          </Box>
                        }
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <EventTypeChip
                  label={event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).toLowerCase()}
                  className={`eventType-${event.eventType.toLowerCase()}`}
                  variant="outlined"
                  size="small"
                />
                <StatusChip
                  label={getStatusText()}
                  color={getStatusColor()}
                  expired={isEventExpired()}
                  size="small"
                />
                {event.priority && (
                  <StyledChip
                    label={event.priority.charAt(0).toUpperCase() + event.priority.slice(1).toLowerCase()}
                    className={`priority-${event.priority}`}
                    size="small"
                  />
                )}
              </Stack>
            </Stack>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit(event)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(event._id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </EventCard>
  );
};

export default EventItem;