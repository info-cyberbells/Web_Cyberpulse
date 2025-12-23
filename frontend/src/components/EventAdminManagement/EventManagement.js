import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Fab,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Grid,
  styled,
  Autocomplete,
  Checkbox,
  Tabs,
  Tab,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { format, isWithinInterval, addMonths, isSameMonth, differenceInDays } from "date-fns";
import {
  fetchAllEvents,
  addNewEvent,
  editExistingEvent,
  removeEvent,
  clearSuccessMessage,
  clearError,
  fetchUpcomingAnnouncements,
} from "../../features/events/eventSlice";
import { fetchEmployeeList } from "../../features/employees/employeeSlice";
import EventItem from "./EventItem";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const celebrationAnimation = `
  @keyframes confetti-fall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  .celebration-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  }
  
  .confetti {
    position: absolute;
    font-size: 20px;
    animation: confetti-fall 3s linear infinite;
  }
`;

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));

const EventCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginBottom: 0,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    boxShadow: "none",
  },
}));

const CelebrationCard = styled(Card)(({ theme, type }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(2),
  width: 250,
  height: 200,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: 16,
  boxShadow: theme.shadows[2],
  position: "relative",
  overflow: "hidden",
  background: type === "Birthday"
    ? "linear-gradient(135deg, #fff9c4 0%, #fff 100%)"
    : "linear-gradient(135deg, #bbdefb 0%, #fff 100%)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
    background: type === "Birthday"
      ? "linear-gradient(to right, #ffc107, #ff9800)"
      : "linear-gradient(to right, #2196f3, #03a9f4)",
  }
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

const CelebrationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const CelebrationHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(1),
}));

const CelebrationAvatar = styled(Avatar)(({ theme, type }) => ({
  width: 64,
  height: 64,
  margin: theme.spacing(1),
  backgroundColor: type === "Birthday" ? theme.palette.warning.main : theme.palette.primary.main,
}));

const StyledEventList = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2, 0, 2),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`celebrations-tabpanel-${index}`}
      aria-labelledby={`celebrations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DateChip = styled(Chip)(({ theme, daysdiff }) => ({
  position: "absolute",
  top: 10,
  right: 10,
  backgroundColor: parseInt(daysdiff) <= 3
    ? theme.palette.error.main
    : parseInt(daysdiff) <= 7
      ? theme.palette.warning.main
      : theme.palette.success.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const NoEventsPlaceholder = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}));

const EventManagement = () => {
  const dispatch = useDispatch();
  const {
    eventList,
    employeeCelebrations,
    loading,
    celebrationsLoading,
    error,
    celebrationsError,
    successMessage
  } = useSelector((state) => state.events);
  const { employeeList } = useSelector((state) => state.employees);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState(null);

  useEffect(() => {
    dispatch(fetchUpcomingAnnouncements());
    dispatch(fetchAllEvents());
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  const processEmployeeData = (employees) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonth = addMonths(today, 1);
    const endOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    const events = [];

    employees.forEach(({ name, dob, joiningDate, image }) => {
      const dobDate = new Date(dob);
      const dojDate = new Date(joiningDate);

      // Birthday this year
      const dobThisYear = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
      // Birthday next year (for year-end case)
      const dobNextYear = new Date(today.getFullYear() + 1, dobDate.getMonth(), dobDate.getDate());

      // Work Anniversary this year
      const dojThisYear = new Date(today.getFullYear(), dojDate.getMonth(), dojDate.getDate());
      // Work Anniversary next year (for year-end case)
      const dojNextYear = new Date(today.getFullYear() + 1, dojDate.getMonth(), dojDate.getDate());

      // Check birthday this year
      if (dobThisYear >= today && dobThisYear <= endOfNextMonth) {
        events.push({
          name,
          date: dobThisYear,
          type: "Birthday",
          icon: <CakeIcon />,
          image,
          daysDiff: differenceInDays(dobThisYear, today)
        });
      }
      // Check birthday next year (for year-end)
      else if (dobNextYear >= today && dobNextYear <= endOfNextMonth) {
        events.push({
          name,
          date: dobNextYear,
          type: "Birthday",
          icon: <CakeIcon />,
          image,
          daysDiff: differenceInDays(dobNextYear, today)
        });
      }

      // Check work anniversary this year
      if (dojThisYear >= today && dojThisYear <= endOfNextMonth) {
        events.push({
          name,
          date: dojThisYear,
          type: "Work Anniversary",
          icon: <WorkIcon />,
          image,
          daysDiff: differenceInDays(dojThisYear, today)
        });
      }
      // Check work anniversary next year (for year-end)
      else if (dojNextYear >= today && dojNextYear <= endOfNextMonth) {
        events.push({
          name,
          date: dojNextYear,
          type: "Work Anniversary",
          icon: <WorkIcon />,
          image,
          daysDiff: differenceInDays(dojNextYear, today)
        });
      }
    });

    return events.sort((a, b) => a.date - b.date);
  };

  const getTodaysCelebrations = () => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();

    const processedCelebrations = processEmployeeData(employeeCelebrations);
    return processedCelebrations.filter(celebration => {
      const celebrationDate = new Date(celebration.date);
      return celebrationDate.getDate() === todayDay &&
        celebrationDate.getMonth() === todayMonth;
    });
  };

  const getTeamMemberDetails = (teamMemberIds, employeeList) => {
    if (!teamMemberIds || !employeeList) return [];
    return teamMemberIds
      .map((id) => {
        const employee = employeeList.find((emp) => emp._id === id._id);
        return employee
          ? {
            _id: employee._id,
            name: employee.name,
            designation: employee.designation,
            email: employee.email,
          }
          : null;
      })
      .filter(Boolean);
  };

  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData?.employee?.id || "";
    } catch (error) {
      console.error("Error parsing user data:", error);
      return "";
    }
  };

  const storedData = localStorage.getItem("user");
  const userData = JSON.parse(storedData);
  const usertype = userData?.employee?.type;

  const today = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    priority: "normal",
    type: "internal",
    status: "",
    createdBy: getUserId(),
    teamMembers: [],
  });

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      handleCloseDialog();
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = (data) => {
    const errors = {};
    if (!data.title?.trim()) errors.title = "Title is required";
    if (!data.description?.trim()) {
      errors.description = "Description is required";
    } else if (data.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long";
    } else if (data.description.trim().length > 255) {
      errors.description = "Description must be no more than 255 characters long";
    }
    if (!data.eventType?.trim()) errors.eventType = "Event type is required";
    if (!data.eventDate?.trim()) errors.eventDate = "Event date is required";
    if (!data.status?.trim()) errors.status = "Status is Required";

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = "End time must be after start time";
    }

    if (
      data.eventType === "meeting" &&
      (!data.teamMembers || data.teamMembers.length === 0)
    ) {
      errors.teamMembers = "Please select at least one team member for the meeting";
    }

    const eventDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      errors.eventDate = "Event date cannot be in the past";
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "eventType" && value !== "meeting") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        teamMembers: [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOpenDialog = (event = null) => {
    const userId = getUserId();
    if (event) {
      setSelectedEvent(event);
      const teamMembers = event.teamMembers || [];
      setFormData({
        ...event,
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        priority: event.priority || "normal",
        createdBy: event.createdBy || userId,
        teamMembers: teamMembers,
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: "",
        description: "",
        eventType: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        location: "",
        priority: "normal",
        type: "internal",
        status: "",
        createdBy: userId,
        teamMembers: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setErrors({});
    dispatch(clearError());
  };

  const handleSubmit = async () => {
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const eventDataWithCreatedBy = {
        ...formData,
        createdBy: getUserId(),
      };

      if (selectedEvent) {
        await dispatch(editExistingEvent({
          id: selectedEvent._id,
          eventData: eventDataWithCreatedBy,
        })).unwrap();
      } else {
        await dispatch(addNewEvent(eventDataWithCreatedBy)).unwrap();
      }
      await dispatch(fetchAllEvents());
      handleCloseDialog();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await dispatch(removeEvent(id)).unwrap();
        await dispatch(fetchAllEvents());
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const renderEmployeeSelection = () => {
    const memberIds = formData.teamMembers.map((member) => member._id || member);
    const selectedEmployees = employeeList.filter((emp) => emp && emp.status !== "0" && memberIds.includes(emp._id));

    return (
      <Grid item xs={12}>
        <Autocomplete
          multiple
          id="employee-selection"
          options={employeeList.filter(emp => emp && emp.status !== "0")}
          disableCloseOnSelect
          value={selectedEmployees}
          onChange={(event, newValue) => {
            setFormData((prev) => ({
              ...prev,
              teamMembers: newValue.map((emp) => emp._id),
            }));
            setErrors((prev) => ({ ...prev, teamMembers: "" }));
          }}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                {(option.designation || option.email) && (
                  <Typography variant="caption" color="text.secondary">
                    {option.designation && `${option.designation} `}
                    {option.email && `(${option.email})`}
                  </Typography>
                )}
              </Box>
            </li>
          )}
          filterOptions={(options, { inputValue }) => {
            const filterValue = inputValue.toLowerCase();
            return options.filter(
              (option) =>
                option.name?.toLowerCase().includes(filterValue) ||
                option.designation?.toLowerCase().includes(filterValue) ||
                option.email?.toLowerCase().includes(filterValue)
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Team Members"
              placeholder="Search team members..."
              error={!!errors.teamMembers}
              helperText={errors.teamMembers}
              required={formData.eventType === "meeting"}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option._id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" component="span">
                      {option.name}
                    </Typography>
                    {option.designation && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                        sx={{ ml: 0.5 }}
                      >
                        ({option.designation})
                      </Typography>
                    )}
                  </Box>
                }
                {...getTagProps({ index })}
                size="small"
              />
            ))
          }
        />
      </Grid>
    );
  };

  const sortEventsByDate = (events) => {
    if (!events || !Array.isArray(events)) return [];
    return [...events].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getCurrentMonthCelebrations = () => {
    const today = new Date();
    const processedCelebrations = processEmployeeData(employeeCelebrations);
    return processedCelebrations.filter(celebration =>
      isSameMonth(celebration.date, today)
    );
  };

  const getNextMonthCelebrations = () => {
    const today = new Date();
    const nextMonth = addMonths(today, 1);
    const processedCelebrations = processEmployeeData(employeeCelebrations);
    return processedCelebrations.filter(celebration =>
      isSameMonth(celebration.date, nextMonth)
    );
  };


  const getDefaultAvatar = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  const CelebrationBackground = ({ show, type }) => {
    if (!show) return null;

    const emojis = type === "Birthday"
      ? ['🎂', '🎉', '🎈', '🎁', '🥳', '🍰']
      : ['🎊', '🏆', '⭐', '🎯', '💼', '🎉'];

    return (
      <>
        <style>{celebrationAnimation}</style>
        <div className="celebration-bg">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {emojis[Math.floor(Math.random() * emojis.length)]}
            </div>
          ))}
        </div>
      </>
    );
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Event & Celebration Dashboard
              </Typography>
              <Typography variant="body2" color="#6b7280">
                View and stay updated on all company events and celebrations
              </Typography>
            </Box>
            <EventIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      {/* Celebrations Section */}
      <Card sx={{ mt: -2, mb: 0, borderRadius: 3, overflow: "visible", boxShadow: "none" }}>
        <CardContent>
          <Box sx={{ borderBottom: 0, borderColor: 'divider', mb: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label="This Month"
                icon={<CalendarMonthIcon />}
                iconPosition="start"
              />
              <Tab
                label="Next Month"
                icon={<EventIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>


          <TabPanel value={tabValue} index={0}>
            {(() => {
              const todaysCelebrations = getTodaysCelebrations();
              const hasTodaysCelebration = todaysCelebrations.length > 0;
              const celebrationType = todaysCelebrations.length > 0 ? todaysCelebrations[0].type : null;

              return (
                <>
                  <CelebrationBackground show={hasTodaysCelebration} type={celebrationType} />
                  {celebrationsError && <Alert severity="error" sx={{ mb: 2 }}>{celebrationsError}</Alert>}
                  {celebrationsLoading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : getCurrentMonthCelebrations().length === 0 ? (
                    <NoEventsPlaceholder>
                      <CalendarMonthIcon sx={{ fontSize: 60, mb: 2, opacity: 0.6 }} />
                      <Typography variant="h6">No Celebrations This Month</Typography>
                    </NoEventsPlaceholder>
                  ) : (
                    <CelebrationContainer>
                      {getCurrentMonthCelebrations().map((celebration, index) => {
                        const isToday = todaysCelebrations.some(tc => tc.name === celebration.name);

                        return (
                          <CelebrationCard
                            key={index}
                            type={celebration.type}
                            sx={{
                              animation: isToday ? 'bounce 2s infinite' : 'none',
                              border: isToday ? '3px solid gold' : 'none',
                              boxShadow: isToday ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'inherit'
                            }}
                          >
                            {isToday && (
                              <Box sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                fontSize: '24px',
                                animation: 'bounce 1s infinite'
                              }}>
                                🎉
                              </Box>
                            )}

                            <CelebrationHeader>
                              {celebration.type === "Birthday" ? <CakeIcon color="warning" /> : <WorkIcon color="primary" />}
                              <Typography variant="subtitle1" fontWeight="bold" ml={1}>
                                {celebration.type}
                              </Typography>
                            </CelebrationHeader>

                            <CelebrationAvatar
                              type={celebration.type}
                              src={celebration.image || null}
                              imgProps={{
                                onError: (e) => {
                                  e.target.src = null;
                                }
                              }}
                            >
                              {!celebration.image && getDefaultAvatar(celebration.name)}
                            </CelebrationAvatar>

                            <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                              {celebration.name}
                              {isToday && " 🎊"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" align="center">
                              {format(celebration.date, "MMM dd, yyyy")}
                              {isToday && (
                                <Typography component="span" sx={{ color: 'gold', fontWeight: 'bold', ml: 1 }}>
                                  TODAY!
                                </Typography>
                              )}
                            </Typography>
                          </CelebrationCard>
                        );
                      })}
                    </CelebrationContainer>
                  )}
                </>
              );
            })()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {eventError && <Alert severity="error" sx={{ mb: 2 }}>{eventError}</Alert>}
            {eventLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : getNextMonthCelebrations().length === 0 ? (
              <NoEventsPlaceholder>
                <EventIcon sx={{ fontSize: 60, mb: 2, opacity: 0.6 }} />
                <Typography variant="h6">No Celebrations Next Month</Typography>
              </NoEventsPlaceholder>
            ) : (
              <CelebrationContainer>
                {getNextMonthCelebrations().map((celebration, index) => (
                  <CelebrationCard key={index} type={celebration.type}>
                    <CelebrationHeader>
                      {celebration.type === "Birthday" ? <CakeIcon color="warning" /> : <WorkIcon color="primary" />}
                      <Typography variant="subtitle1" fontWeight="bold" ml={1}>
                        {celebration.type}
                      </Typography>
                    </CelebrationHeader>

                    <CelebrationAvatar
                      type={celebration.type}
                      src={celebration.image || null}
                      imgProps={{
                        onError: (e) => {
                          e.target.src = null;
                        }
                      }}
                    >
                      {!celebration.image && getDefaultAvatar(celebration.name)}
                    </CelebrationAvatar>

                    <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                      {celebration.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center">
                      {format(celebration.date, "MMM dd, yyyy")}
                    </Typography>
                  </CelebrationCard>
                ))}
              </CelebrationContainer>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      <Box mt={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : eventList.length === 0 ? (
          <NoEventsPlaceholder>
            <Typography variant="h6">No events scheduled</Typography>
          </NoEventsPlaceholder>
        ) : (
          <StyledEventList elevation={0}>
            <List disablePadding>
              {sortEventsByDate(eventList).map((event) => (
                <ListItem key={event._id} disableGutters sx={{ mb: 0 }}>
                  <EventCard elevation={0} sx={{ width: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {event.title}
                          </Typography>
                          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                            <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(event.eventDate), "MMM dd, yyyy")}
                              {event.startTime && ` · ${event.startTime}`}
                              {event.endTime && ` - ${event.endTime}`}
                            </Typography>
                          </Box>
                          {event.location && (
                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                              <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {event.location}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Box>
                          <StyledChip
                            label={event.eventType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />

                          {event.status && (
                            <StyledChip
                              label={event.status}
                              size="small"
                              color={
                                event.status === "completed" ? "success" :
                                  event.status === "cancelled" ? "error" : "default"
                              }
                            />
                          )}
                        </Box>
                      </Box>

                      {event.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                          {event.description}
                        </Typography>
                      )}

                      {event.teamMembers && event.teamMembers.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Team Members:
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {getTeamMemberDetails(event.teamMembers, employeeList).map((member) => (
                              <Chip
                                key={member._id}
                                icon={<PersonIcon />}
                                label={member.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {usertype !== 2 && (
                        <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(event)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(event._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </EventCard>
                </ListItem>
              ))}
            </List>
          </StyledEventList>
        )}
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedEvent ? "Edit Event" : "Add New Event"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Title"
                name="title"
                fullWidth
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                multiline
                rows={4}
                fullWidth
                required
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Enter event description..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Event Type"
                name="eventType"
                select
                fullWidth
                value={formData.eventType}
                onChange={handleInputChange}
                error={!!errors.eventType}
                helperText={errors.eventType}
                required
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="party">Party</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            {formData.eventType === "meeting" && renderEmployeeSelection()}

            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Event Date"
                name="eventDate"
                fullWidth
                value={formData.eventDate}
                onChange={handleInputChange}
                error={!!errors.eventDate}
                helperText={errors.eventDate}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: today,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="time"
                label="Start Time"
                name="startTime"
                fullWidth
                value={formData.startTime}
                onChange={handleInputChange}
                error={!!errors.startTime}
                helperText={errors.startTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="time"
                label="End Time"
                name="endTime"
                fullWidth
                value={formData.endTime}
                onChange={handleInputChange}
                error={!!errors.endTime}
                helperText={errors.endTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Priority"
                name="priority"
                select
                fullWidth
                value={formData.priority}
                onChange={handleInputChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Status"
                name="status"
                select
                required
                fullWidth
                value={formData.status}
                error={!!errors.status}
                helperText={errors.status}
                onChange={handleInputChange}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="postponed">Postponed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {selectedEvent ? "Update Event" : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      {usertype !== 2 && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <AddIcon />
        </Fab>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default EventManagement;