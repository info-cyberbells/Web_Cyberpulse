import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardHeader,
  useTheme,
  Stack,
  LinearProgress,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  HowToReg as HowToRegIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Today as TodayIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from 'date-fns';
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import {
  fetchAllAnnoucements,
  clearSuccessMessage,
} from "../features/annoucement/AnnoucementSlice";
import {
  fetchAllEvents,
} from "../features/events/eventSlice";
import { fetchMonthlySummary } from '../features/attendance/attendanceSlice';

// Professional Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 12,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transform: "translateY(-2px)",
  },
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: 16,
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(50%, -50%)',
  }
}));

const ActionButton = styled(Button)(({ theme, bgColor }) => ({
  height: "120px",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  backgroundColor: bgColor || theme.palette.primary.main,
  color: theme.palette.common.white,
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    "&::before": {
      opacity: 1,
    }
  },
  "& > *": {
    position: 'relative',
    zIndex: 1,
  }
}));

const StatsCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: 16,
  background: gradient || `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
  },
}));

const MetricBox = styled(Box)(({ theme, color }) => ({
  textAlign: 'center',
  padding: theme.spacing(2.5),
  borderRadius: 12,
  background: color ? alpha(color, 0.1) : theme.palette.background.paper,
  border: `2px solid ${color ? alpha(color, 0.2) : theme.palette.grey[200]}`,
  transition: 'all 0.2s ease',
  "&:hover": {
    borderColor: color || theme.palette.primary.main,
  }
}));

const InfoCard = styled(StyledCard)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
}));

const Dashboard = () => {
  const dispatch = useDispatch();
  const { monthlySummary, monthlySummaryLoading } = useSelector((state) => state.attendances);
  const { AnnoucementList } = useSelector((state) => state.announcements);
  const { eventList } = useSelector((state) => state.events);

  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const [greeting, setGreeting] = useState("");

  // Fetch monthly summary on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const employeeId = userData?.employee?.id;

    if (employeeId) {
      const currentDate = new Date().toISOString().split('T')[0];
      dispatch(fetchMonthlySummary({
        employeeId: employeeId,
        date: currentDate
      }));
    }
  }, [dispatch]);

  // Fetch announcements and events
  useEffect(() => {
    dispatch(fetchAllAnnoucements());
    dispatch(fetchAllEvents());
  }, [dispatch]);

  // Update greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      id: "1",
      title: "Attendance",
      icon: <HowToRegIcon sx={{ fontSize: 32 }} />,
      bgColor: theme.palette.success.main,
      onClick: () => navigate("/attendance"),
    },
    {
      id: "2",
      title: "Apply Leave",
      icon: <NoteAltIcon sx={{ fontSize: 32 }} />,
      bgColor: theme.palette.warning.main,
      onClick: () => navigate("/leave"),
    },
    {
      id: "3",
      title: "Tasks",
      icon: <FactCheckIcon sx={{ fontSize: 32 }} />,
      bgColor: theme.palette.info.main,
      onClick: () => navigate("/task"),
    },
  ];

  const userData = JSON.parse(localStorage.getItem('user'));
  const employeeName = userData?.employee?.name;
  const attendanceRate = monthlySummary?.attendanceRate || 0;

  const getAttendanceColor = () => {
    if (attendanceRate >= 90) return theme.palette.success.main;
    if (attendanceRate >= 75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <WelcomeCard>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={monthlySummary?.employeeImage || undefined}
              sx={{
                width: 50,
                height: 50,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '20px',
                fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {!monthlySummary?.employeeImage && <PersonIcon sx={{ fontSize: 28 }} />}
            </Avatar>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {greeting}, {employeeName}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
          </Stack>
        </WelcomeCard>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Attendance Stats */}
          <Grid item xs={12} md={6}>
            <StatsCard
              gradient={`linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)`}
              sx={{ height: 300 }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 44,
                      height: 44,
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    <HowToRegIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Attendance Overview
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    This month's performance
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 1, minHeight: 200 }}>
                {monthlySummaryLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <MetricBox
                          color={theme.palette.primary.main}
                          sx={{
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                              border: '1px solid rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {monthlySummary?.totalAttendance || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Present Days
                          </Typography>
                        </MetricBox>
                      </Grid>
                      <Grid item xs={6}>
                        <MetricBox
                          color={theme.palette.grey[600]}
                          sx={{
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                              border: '1px solid rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.grey[700] }}>
                            {monthlySummary?.totalLeave || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Leave Days
                          </Typography>
                        </MetricBox>
                      </Grid>
                    </Grid>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Attendance Rate
                        </Typography>
                        <Chip
                          label={`${attendanceRate}%`}
                          sx={{
                            bgcolor: '#14B8A6',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={attendanceRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#14B8A6',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#14B8A6',
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Task Stats */}
          <Grid item xs={12} md={6}>
            <StatsCard
              gradient={`linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)`}
              sx={{ height: 300 }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 44,
                      height: 44,
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    <FactCheckIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Task Overview
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Your productivity metrics
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 1, minHeight: 200 }}>
                {monthlySummaryLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <MetricBox
                        color={theme.palette.success.main}
                        sx={{
                          border: '1px solid rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          {monthlySummary?.completedTasks || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Completed
                        </Typography>
                      </MetricBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MetricBox
                        color={theme.palette.warning.main}
                        sx={{
                          border: '1px solid rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                          {monthlySummary?.pendingTasks || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Pending
                        </Typography>
                      </MetricBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MetricBox
                        color={theme.palette.info.main}
                        sx={{
                          border: '1px solid rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#FBC02D" }}>
                          {monthlySummary?.inProgressTasks || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          In Progress
                        </Typography>
                      </MetricBox>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3.5}> {/* Slightly more gap */}
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={4} key={action.id}>
                <Box sx={{ maxWidth: '360px', margin: '0 auto' }}> {/* Limit width */}
                  <ActionButton
                    fullWidth
                    onClick={action.onClick}
                    bgColor={action.bgColor}
                  >
                    {action.icon}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {action.title}
                    </Typography>
                  </ActionButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>


        {/* Information Section */}
        <Grid container spacing={3}>
          {/* Announcements */}
          <Grid item xs={12} lg={6}>
            <InfoCard>
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.warning.main,
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <AnnouncementIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Latest Announcements
                  </Typography>
                }
                action={
                  AnnoucementList.length > 1 && (
                    <Button
                      size="small"
                      onClick={() => setShowAllAnnouncements((prev) => !prev)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2,
                      }}
                    >
                      {showAllAnnouncements ? "Show Less" : "View All"}
                    </Button>
                  )
                }

              />
              <Divider />
              <List sx={{ py: 0 }}>
                {(showAllAnnouncements
                  ? AnnoucementList
                  : AnnoucementList?.slice(0, 1)
                )?.map((announcement, index) => (
                  <React.Fragment key={announcement._id}>
                    <ListItem sx={{ py: 2, px: 3 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            width: 40,
                            height: 40
                          }}
                        >
                          <AnnouncementIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {announcement.type}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {announcement.description}
                            </Typography>
                            <Chip
                              icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                              label={format(new Date(announcement.date), 'MMM dd, yyyy')}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < (showAllAnnouncements ? AnnoucementList.length - 1 : Math.min(2, AnnoucementList.length - 1)) &&
                      <Divider sx={{ mx: 2 }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </InfoCard>
          </Grid>

          {/* Events */}
          <Grid item xs={12} lg={6}>
            <InfoCard>
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.info.main,
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <EventIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upcoming Events
                  </Typography>
                }
                action={
                  eventList.length > 1 && (
                    <Button
                      size="small"
                      onClick={() => setShowAllEvents((prev) => !prev)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2
                      }}
                    >
                      {showAllEvents ? "Show Less" : "View All"}
                    </Button>
                  )
                }
              />
              <Divider />
              <List sx={{ py: 0 }}>
                {(showAllEvents ? eventList : eventList?.slice(0, 1))?.map(
                  (event, index) => (
                    <React.Fragment key={event._id}>
                      <ListItem sx={{ py: 2, px: 3 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              width: 40,
                              height: 40
                            }}
                          >
                            <EventIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {event.title}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                {event.status}
                              </Typography>
                            </Box>

                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {event.description}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip
                                  icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                                  label={format(new Date(event.eventDate), 'MMM dd, yyyy')}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                                <Chip
                                  icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                  label={`${event.startTime} - ${event.endTime}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              </Stack>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (showAllEvents ? eventList.length - 1 : Math.min(2, eventList.length - 1)) &&
                        <Divider sx={{ mx: 2 }} />
                      }
                    </React.Fragment>
                  )
                )}
              </List>
            </InfoCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;