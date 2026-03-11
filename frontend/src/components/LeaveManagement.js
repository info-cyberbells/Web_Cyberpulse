import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  TextField,
  Container,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  BusinessCenter as BusinessIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Timelapse as TimelapseIcon,
  HomeWork as HomeWorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Cake as CakeIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  addNewLeave,
  fetchLeaveList,
  deleteExistingLeave,
  editExistingLeave,
  clearSuccessMessage,
  fetchLeavesByEmployeeId,
} from "../features/leave/leaveSlice";
import { checkWfhEligibility, checkBirthdayLeaveEligibility, sendCreditUpdateRequest } from "../services/services";
import { Send as SendIcon } from "@mui/icons-material";
import { format } from "date-fns";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));

const LeaveCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid #e5e7eb",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderColor: "#d1d5db",
  },
}));

const FloatingButton = styled(Button)({
  position: "fixed",
  right: 24,
  bottom: 24,
  width: 56,
  height: 56,
  borderRadius: "50%",
  minWidth: "unset",
  backgroundColor: "#2563eb",
  color: "white",
  boxShadow: "0 4px 16px rgba(31, 41, 55, 0.3)",
  "&:hover": {
    backgroundColor: "#1d4ed8",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(31, 41, 55, 0.4)",
  },
});

const LeaveTypeButton = styled(Button)(({ selected }) => ({
  padding: "10px 12px",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 500,
  border: `1px solid ${selected ? "#1f2937" : "#d1d5db"}`,
  backgroundColor: selected ? "#1f2937" : "#ffffff",
  color: selected ? "#ffffff" : "#374151",
  "&:hover": {
    backgroundColor: selected ? "#111827" : "#f9fafb",
    borderColor: "#1f2937",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    border: "1px solid #e5e7eb",
  },
}));

const LeaveManagement = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { leaveList, loading, error, successMessage } = useSelector(
    (state) => state.leaves
  );
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [localLeaveList, setLocalLeaveList] = useState([]);

  // Form states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [halfDayType, setHalfDayType] = useState("1st-half");
  const [shortLeaveStartTime, setShortLeaveStartTime] = useState("10:00");
  const [leaveQuota, setLeaveQuota] = useState(null);

  // WFH eligibility
  const [wfhEligibility, setWfhEligibility] = useState(null);
  const [wfhLoading, setWfhLoading] = useState(true);

  // Birthday leave eligibility
  const [birthdayEligibility, setBirthdayEligibility] = useState(null);

  // Credit update request
  const [showCreditRequestDialog, setShowCreditRequestDialog] = useState(false);
  const [creditRequestMessage, setCreditRequestMessage] = useState("");
  const [creditRequestLoading, setCreditRequestLoading] = useState(false);
  const [creditRequestMonth, setCreditRequestMonth] = useState(new Date().getMonth() + 1);
  const [creditRequestYear, setCreditRequestYear] = useState(new Date().getFullYear());
  const [disputedCriteria, setDisputedCriteria] = useState({});

  const CRITERIA_LABELS = {
    targetAchievement: "100% Target Achievement / Meeting Deadline",
    attendance: "100% Attendance",
    clientAppreciation: "Client Appreciation",
    teamwork: "Teamwork",
  };

  const leaveTypes = [
    { value: "casual", label: "Casual Leave", icon: BusinessIcon, description: "Personal time off" },
    { value: "sick", label: "Sick Leave", icon: HospitalIcon, description: "Medical leave" },
    { value: "half-day", label: "Half Day", icon: ScheduleIcon, description: "4 hours leave" },
    { value: "short-leave", label: "Short Leave", icon: TimelapseIcon, description: "2 hours leave" },
    { value: "wfh", label: "Work From Home", icon: HomeWorkIcon, description: "Remote work day" },
    { value: "birthday", label: "Birthday Leave", icon: CakeIcon, description: "Annual birthday off" },
  ];

  // Helper to calculate +2hr end time for short leave
  const calculateEndTime = (startTimeStr) => {
    const [hours, minutes] = startTimeStr.split(":").map(Number);
    let endHours = hours + 2;
    if (endHours > 23) endHours = 23;
    return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // Format 24hr time to 12hr display
  const formatTime12hr = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${String(hr).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const calculateLeaveDays = (start, end, type) => {
    switch (type) {
      case 'casual':
      case 'sick':
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      case 'half-day':
        return 0.5;
      case 'short-leave':
        return 0.25;
      case 'wfh':
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      default:
        return 0;
    }
  };

  useEffect(() => {
    setLocalLeaveList(leaveList);
  }, [leaveList]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(fetchLeavesByEmployeeId()).unwrap();
        if (result.employee && result.employee.leaveQuota) {
          setLeaveQuota(result.employee.leaveQuota);
        } else {
          setLeaveQuota(null);
        }
      } catch (err) {
        console.error("Error fetching leave data:", err);
        setLeaveQuota(null);
      }
    };
    fetchData();
  }, [dispatch]);

  // Check WFH eligibility on mount
  useEffect(() => {
    const fetchWfhStatus = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData?.employee?.id;
        if (employeeId) {
          const result = await checkWfhEligibility(employeeId);
          setWfhEligibility(result.data);
        }
      } catch (err) {
        console.error("Error checking WFH eligibility:", err);
        setWfhEligibility(null);
      } finally {
        setWfhLoading(false);
      }
    };
    fetchWfhStatus();
  }, []);

  // Check Birthday Leave eligibility on mount
  useEffect(() => {
    const fetchBirthdayStatus = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData?.employee?.id;
        if (employeeId) {
          const result = await checkBirthdayLeaveEligibility(employeeId);
          setBirthdayEligibility(result.data);
        }
      } catch (err) {
        console.error("Error checking birthday eligibility:", err);
        setBirthdayEligibility(null);
      }
    };
    fetchBirthdayStatus();
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setShowModal(false);
      resetForm();
      dispatch(clearSuccessMessage());
      // Re-check eligibilities after submit
      const refetchEligibilities = async () => {
        try {
          const userData = JSON.parse(localStorage.getItem("user"));
          const employeeId = userData?.employee?.id;
          if (employeeId) {
            const wfhResult = await checkWfhEligibility(employeeId);
            setWfhEligibility(wfhResult.data);
            const birthdayResult = await checkBirthdayLeaveEligibility(employeeId);
            setBirthdayEligibility(birthdayResult.data);
          }
        } catch (err) { /* ignore */ }
      };
      refetchEligibilities();
    }
  }, [successMessage, dispatch]);

  const handleEditRequest = (request) => {
    setStartDate(new Date(request.startDate));
    setEndDate(new Date(request.endDate));
    setDescription(request.reason);
    setLeaveType(request.leaveType || "casual");
    setHalfDayType(request.halfDayType || "1st-half");
    // Restore short leave start time (convert 12hr back to 24hr for input)
    if (request.leaveType === "short-leave" && request.startTime) {
      const match = request.startTime.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        setShortLeaveStartTime(`${String(h).padStart(2, "0")}:${m}`);
      }
    } else {
      setShortLeaveStartTime("10:00");
    }
    setEditingId(request._id);
    setShowModal(true);
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await dispatch(deleteExistingLeave(requestId)).unwrap();
        setLocalLeaveList((prevList) =>
          prevList.filter((leave) => leave._id !== requestId)
        );
        const result = await dispatch(fetchLeavesByEmployeeId()).unwrap();
        if (result.employee && result.employee.leaveQuota) {
          setLeaveQuota(result.employee.leaveQuota);
        }
        // Re-check WFH eligibility
        const userData = JSON.parse(localStorage.getItem("user"));
        const employeeId = userData?.employee?.id;
        if (employeeId) {
          const wfhResult = await checkWfhEligibility(employeeId);
          setWfhEligibility(wfhResult.data);
        }
      } catch (error) {
        console.error("Error deleting leave request:", error);
        toast.error("Failed to delete leave request");
      }
    }
  };

  const handleSubmitRequest = async () => {
    if (!description.trim()) {
      toast.error("Please provide a reason for your leave request");
      return;
    }

    if (startDate > endDate && (leaveType === "casual" || leaveType === "sick" || leaveType === "wfh")) {
      toast.error("End date cannot be before start date");
      return;
    }

    // WFH validation
    if (leaveType === "wfh") {
      if (!wfhEligibility?.isEligible) {
        toast.error("You are not eligible for WFH this month");
        return;
      }
      const requestedDays = calculateLeaveDays(startDate, endDate, "wfh");
      if (requestedDays > wfhEligibility.wfhDaysRemaining) {
        toast.error(`Only ${wfhEligibility.wfhDaysRemaining} WFH day(s) remaining this month`);
        return;
      }
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const employeeId = userData?.employee?.id;

    if (!employeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    const formatDateStr = (date) => date.toISOString().split('T')[0];

    const leaveData = {
      employeeId: employeeId,
      startDate: formatDateStr(startDate),
      endDate: (leaveType === "half-day" || leaveType === "short-leave")
        ? formatDateStr(startDate)
        : formatDateStr(endDate),
      leaveType: leaveType,
      reason: description,
      ...(leaveType === "half-day" && { halfDayType }),
      ...(leaveType === "short-leave" && {
        startTime: formatTime12hr(shortLeaveStartTime),
        endTime: formatTime12hr(calculateEndTime(shortLeaveStartTime)),
      }),
    };

    if (editingId) {
      const originalRequest = leaveList.find(leave => leave._id === editingId);
      leaveData.status = originalRequest?.status || "pending";
    }

    try {
      if (editingId) {
        await dispatch(editExistingLeave({ id: editingId, leaveData })).unwrap();
      } else {
        await dispatch(addNewLeave(leaveData)).unwrap();
      }

      const result = await dispatch(fetchLeavesByEmployeeId()).unwrap();
      if (result.employee && result.employee.leaveQuota) {
        setLeaveQuota(result.employee.leaveQuota);
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error(error?.error || error?.message || "Failed to submit leave request");
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setDescription("");
    setLeaveType("casual");
    setHalfDayType("1st-half");
    setShortLeaveStartTime("10:00");
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "#10b981",
      pending: "#f59e0b",
      rejected: "#ef4444",
    };
    return colors[status?.toLowerCase()] || "#6b7280";
  };

  const getLeaveTypeInfo = (type) => {
    return leaveTypes.find(lt => lt.value === type) || leaveTypes[0];
  };

  const isWfhDisabled = !wfhEligibility?.isEligible || wfhEligibility?.wfhDaysRemaining <= 0;

  const handleSendCreditUpdateRequest = async () => {
    // Build disputed criteria array from selected ones with reasons
    const disputedArr = Object.entries(disputedCriteria)
      .filter(([, val]) => val.selected && val.reason?.trim())
      .map(([key, val]) => ({
        key,
        label: CRITERIA_LABELS[key],
        reason: val.reason.trim(),
      }));

    if (!creditRequestMessage.trim() && disputedArr.length === 0) {
      toast.error("Please provide a message or select criteria to dispute");
      return;
    }

    setCreditRequestLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const organizationId = userData?.employee?.organizationId;
      await sendCreditUpdateRequest({
        message: creditRequestMessage.trim() || `Re-evaluation request for ${disputedArr.map(d => d.label).join(", ")}`,
        organizationId,
        month: creditRequestMonth,
        year: creditRequestYear,
        disputedCriteria: disputedArr,
      });
      toast.success("Re-evaluation request sent successfully!");
      setShowCreditRequestDialog(false);
      setCreditRequestMessage("");
      setDisputedCriteria({});
    } catch (error) {
      const msg = error?.response?.data?.error || error?.message || "Failed to send request";
      toast.error(msg);
    } finally {
      setCreditRequestLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: { xs: 1.5, sm: 3 } }}>
      {/* Modal */}
      <StyledModal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
      >
        <Paper
          sx={{
            width: { xs: "95%", sm: "90%", md: 650 },
            p: { xs: 2, sm: 3, md: 4 },
            maxHeight: "90vh",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" fontWeight="600" color="#1f2937">
              {editingId ? "Edit Leave Request" : "New Leave Request"}
            </Typography>
            <IconButton
              onClick={() => { setShowModal(false); resetForm(); }}
              sx={{ bgcolor: "#f3f4f6", "&:hover": { bgcolor: "#e5e7eb" } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
            flex: 1,
            overflowY: "auto",
            pb: 1,
            pr: 0.5,
          }}>
            {/* Leave Type Selection */}
            <Box>
              <Grid container spacing={{ xs: 0.5, sm: 1 }}>
                {leaveTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isWfh = type.value === "wfh";
                  const isBirthday = type.value === "birthday";
                  const isBirthdayDisabled = isBirthday && (!birthdayEligibility?.hasDob || birthdayEligibility?.alreadyTaken);
                  const disabled = (isWfh && isWfhDisabled) || isBirthdayDisabled;

                  const handleTypeClick = () => {
                    setLeaveType(type.value);
                    if (isBirthday && birthdayEligibility?.birthdayThisYear) {
                      const bday = new Date(birthdayEligibility.birthdayThisYear + "T00:00:00");
                      setStartDate(bday);
                      setEndDate(bday);
                      setDescription("Birthday Leave");
                    }
                  };

                  return (
                    <Grid item xs={6} sm={4} key={type.value}>
                      <LeaveTypeButton
                        selected={leaveType === type.value}
                        onClick={handleTypeClick}
                        fullWidth
                        disabled={disabled}
                        startIcon={<IconComponent sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        sx={{ justifyContent: 'flex-start', textAlign: 'left', py: { xs: 1, sm: 1.5 } }}
                      >
                        <Box sx={{ textAlign: "left", width: '100%', overflow: "hidden" }}>
                          <Typography variant="body2" fontWeight="500" noWrap sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                            {type.label}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: { xs: "0.6rem", sm: "0.7rem" } }}>
                            {isWfh
                              ? (wfhEligibility?.isEligible
                                ? `${wfhEligibility.wfhDaysRemaining} day(s) left`
                                : "Not eligible")
                              : isBirthday
                                ? (!birthdayEligibility?.hasDob
                                  ? "Set DOB first"
                                  : birthdayEligibility?.alreadyTaken
                                    ? "Already used"
                                    : "1 day/year")
                                : type.description
                            }
                          </Typography>
                        </Box>
                      </LeaveTypeButton>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Half-Day Type Selection */}
            {leaveType === "half-day" && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" color="#374151" sx={{ mb: 1 }}>
                  Select Half Day Type
                </Typography>
                <RadioGroup
                  row
                  value={halfDayType}
                  onChange={(e) => setHalfDayType(e.target.value)}
                >
                  <FormControlLabel
                    value="1st-half"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="500">1st Half</Typography>
                        <Typography variant="caption" color="text.secondary">09:30 AM - 01:30 PM</Typography>
                      </Box>
                    }
                    sx={{ mr: { xs: 2, sm: 4 } }}
                  />
                  <FormControlLabel
                    value="2nd-half"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="500">2nd Half</Typography>
                        <Typography variant="caption" color="text.secondary">01:30 PM - 06:30 PM</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Paper>
            )}

            {/* Short Leave Time Picker */}
            {leaveType === "short-leave" && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" color="#374151" sx={{ mb: 1.5 }}>
                  Select Time Slot (2 Hours)
                </Typography>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={shortLeaveStartTime}
                      onChange={(e) => setShortLeaveStartTime(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 900 }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    <Typography variant="body2" color="#9ca3af">to</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={calculateEndTime(shortLeaveStartTime)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      disabled
                      sx={{ "& .Mui-disabled": { WebkitTextFillColor: "#374151" } }}
                    />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="#9ca3af" sx={{ mt: 1, display: "block" }}>
                  {formatTime12hr(shortLeaveStartTime)} - {formatTime12hr(calculateEndTime(shortLeaveStartTime))}
                </Typography>
              </Paper>
            )}

            {/* WFH Not Eligible - Request Banner */}
            {leaveType === "wfh" && !wfhEligibility?.isEligible && (
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <Typography variant="body2" color="#991b1b" fontWeight="500" sx={{ mb: 1 }}>
                  {wfhEligibility?.isEvaluated
                    ? `Not eligible — ${wfhEligibility.totalCredits}/5 credits for ${["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][wfhEligibility.evaluationMonth]} ${wfhEligibility.evaluationYear}`
                    : "Your WFH credits have not been evaluated yet."
                  }
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => {
                    setShowModal(false);
                    if (wfhEligibility?.evaluationMonth) setCreditRequestMonth(wfhEligibility.evaluationMonth);
                    if (wfhEligibility?.evaluationYear) setCreditRequestYear(wfhEligibility.evaluationYear);
                    setShowCreditRequestDialog(true);
                  }}
                  sx={{
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    textTransform: "none",
                    "&:hover": { borderColor: "#b91c1c", bgcolor: "#fef2f2" },
                  }}
                >
                  {wfhEligibility?.isEvaluated ? "Request Re-evaluation" : "Request Evaluation"}
                </Button>
              </Paper>
            )}

            {/* WFH Info Banner */}
            {leaveType === "wfh" && wfhEligibility?.isEligible && (
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="#065f46" fontWeight="500">
                    WFH Days This Quarter
                  </Typography>
                  <Chip
                    label={`${wfhEligibility.wfhDaysUsed} / ${wfhEligibility.wfhDaysAllowed} used`}
                    size="small"
                    color={wfhEligibility.wfhDaysRemaining > 0 ? "success" : "error"}
                    variant="outlined"
                  />
                </Stack>
              </Paper>
            )}

            {/* Date Selection */}
            {leaveType === "half-day" || leaveType === "short-leave" ? (
              <TextField
                label="Date"
                type="date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedDate = value ? new Date(value) : null;
                  setStartDate(selectedDate);
                  setEndDate(selectedDate);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                size={isMobile ? "small" : "medium"}
              />
            ) : (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate ? startDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStartDate(value ? new Date(value) : null);
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split("T")[0] }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEndDate(value ? new Date(value) : null);
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: startDate
                        ? startDate.toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            )}

            <TextField
              label="Reason"
              multiline
              rows={isMobile ? 2 : 3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide a reason for your leave"
              fullWidth
              size={isMobile ? "small" : "medium"}
            />

            <Button
              variant="contained"
              onClick={handleSubmitRequest}
              fullWidth
              size="large"
              sx={{
                py: { xs: 1, sm: 1.5 },
                backgroundColor: leaveType === "wfh" ? "#059669" : "#2563eb",
                fontWeight: 600,
                mt: { xs: 0.5, sm: 0 },
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: leaveType === "wfh" ? "#047857" : "#1d4ed8",
                },
              }}
            >
              {editingId ? "Update Request" : "Submit Request"}
            </Button>
          </Box>
        </Paper>
      </StyledModal>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Header Card */}
        <HeaderCard>
          <CardContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
            }}>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700" color="#2563eb" gutterBottom>
                  Leave Management
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Manage your leave requests and track your available quota
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} justifyContent={{ xs: "space-between", sm: "flex-end" }}>
                {/* Leave Quota */}
                {leaveQuota !== null ? (
                  <Box sx={{ textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid #e5e7eb", minWidth: 80 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="#1f2937">
                      {leaveQuota}
                    </Typography>
                    <Typography variant="caption" color="#6b7280">Leave Quota</Typography>
                  </Box>
                ) : (
                  <CircularProgress size={30} sx={{ color: "#6b7280" }} />
                )}
                {/* WFH Days */}
                {!wfhLoading && wfhEligibility?.isEligible && (
                  <Box sx={{ textAlign: "center", bgcolor: "#ecfdf5", borderRadius: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid #a7f3d0", minWidth: 80 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="#065f46">
                      {wfhEligibility.wfhDaysRemaining}
                    </Typography>
                    <Typography variant="caption" color="#065f46">WFH Days</Typography>
                  </Box>
                )}
                {/* Not Eligible - Request Update */}
                {!wfhLoading && !wfhEligibility?.isEligible && (
                  <Box sx={{ textAlign: "center", bgcolor: "#fef2f2", borderRadius: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid #fecaca", minWidth: 80, cursor: "pointer" }}
                    onClick={() => {
                      if (wfhEligibility?.evaluationMonth) setCreditRequestMonth(wfhEligibility.evaluationMonth);
                      if (wfhEligibility?.evaluationYear) setCreditRequestYear(wfhEligibility.evaluationYear);
                      setShowCreditRequestDialog(true);
                    }}
                  >
                    <SendIcon sx={{ color: "#dc2626", fontSize: 24, mb: 0.5 }} />
                    <Typography variant="caption" color="#dc2626" display="block" fontWeight="600">
                      {wfhEligibility?.isEvaluated ? "Re-evaluate" : "Request WFH"}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </CardContent>
        </HeaderCard>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress size={40} sx={{ color: "#6b7280" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {leaveList && leaveList.map((request) => {
              const typeInfo = getLeaveTypeInfo(request.leaveType);
              const leaveDays = calculateLeaveDays(
                new Date(request.startDate),
                new Date(request.endDate),
                request.leaveType
              );
              const IconComponent = typeInfo.icon;

              return (
                <LeaveCard key={request._id}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "stretch", sm: "flex-start" },
                      gap: { xs: 1.5, sm: 0 },
                      mb: 2,
                    }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Box sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: 2,
                          bgcolor: request.leaveType === "wfh" ? "#ecfdf5" : "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <IconComponent sx={{ color: request.leaveType === "wfh" ? "#059669" : "#6b7280", fontSize: { xs: 20, sm: 24 } }} />
                        </Box>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant={isMobile ? "body1" : "h6"} fontWeight="600" color="#1f2937">
                              {typeInfo.label}
                            </Typography>
                            {request.leaveType === "half-day" && request.halfDayType && (
                              <Chip
                                label={`${request.halfDayType === "1st-half" ? "1st Half" : "2nd Half"} (${request.startTime || (request.halfDayType === "1st-half" ? "09:30 AM" : "01:30 PM")} - ${request.endTime || (request.halfDayType === "1st-half" ? "01:30 PM" : "06:30 PM")})`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 22 }}
                              />
                            )}
                            {request.leaveType === "short-leave" && request.startTime && (
                              <Chip
                                label={`${request.startTime} - ${request.endTime}`}
                                size="small"
                                variant="outlined"
                                color="info"
                                sx={{ fontSize: "0.7rem", height: 22 }}
                              />
                            )}
                          </Stack>
                          <Typography variant="body2" color="#6b7280">
                            {leaveDays} {(leaveDays === 0.25 || leaveDays === 0.5 || leaveDays === 1) ? 'day' : 'days'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: { xs: "flex-end", sm: "flex-start" } }}>
                        {(request.status === "pending" || (!request.status)) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRequest(request)}
                              sx={{ bgcolor: "#f3f4f6", color: "#6b7280", "&:hover": { bgcolor: "#e5e7eb", color: "#374151" } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRequest(request._id)}
                              sx={{ bgcolor: "#fef2f2", color: "#ef4444", "&:hover": { bgcolor: "#fee2e2" } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        <Chip
                          label={request.status || request.leaveStatus || 'Pending'}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(request.status || request.leaveStatus || 'pending'),
                            color: "white",
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                      <CalendarIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                      <Typography variant="body2" color="#6b7280">
                        {format(new Date(request.startDate), "MMM dd, yyyy")}
                        {request.startDate !== request.endDate &&
                          ` - ${format(new Date(request.endDate), "MMM dd, yyyy")}`
                        }
                      </Typography>
                    </Box>

                    <Typography variant="body1" color="#374151" sx={{ mb: 2, lineHeight: 1.6, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                      {request.reason}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimeIcon sx={{ color: "#9ca3af", fontSize: 16 }} />
                      <Typography variant="caption" color="#9ca3af">
                        Applied on {format(new Date(request.appliedDate), "MMM dd, yyyy")}
                      </Typography>
                    </Box>
                  </CardContent>
                </LeaveCard>
              );
            })}

            {(!leaveList || leaveList.length === 0) && !loading && (
              <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: "center", borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <CalendarIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="600" color="#374151">
                  No leave requests found
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 3 }}>
                  Start by creating your first leave request
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        <FloatingButton
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <AddIcon />
        </FloatingButton>
      </Container>

      {/* Credit Update Request Dialog */}
      <Dialog
        open={showCreditRequestDialog}
        onClose={() => { setShowCreditRequestDialog(false); setCreditRequestMessage(""); setDisputedCriteria({}); setCreditRequestMonth(new Date().getMonth() + 1); setCreditRequestYear(new Date().getFullYear()); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1f2937" }}>
          {wfhEligibility?.isEvaluated ? "Request Re-evaluation" : "Request Credit Evaluation"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#6b7280" sx={{ mb: 2 }}>
            {wfhEligibility?.isEvaluated
              ? "Your WFH credits were evaluated but you are not eligible. Select the criteria you want to dispute and provide your reason."
              : "Your WFH credits have not been evaluated yet. Send a request to your TL/HR/Manager to evaluate."
            }
          </Typography>

          {/* Month / Year selector */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={creditRequestMonth}
                  label="Month"
                  onChange={(e) => setCreditRequestMonth(e.target.value)}
                >
                  {["January","February","March","April","May","June","July","August","September","October","November","December"]
                    .map((m, i) => ({ label: m, value: i + 1 }))
                    .filter((m) => creditRequestYear < new Date().getFullYear() || m.value <= new Date().getMonth() + 1)
                    .map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select
                  value={creditRequestYear}
                  label="Year"
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setCreditRequestYear(newYear);
                    if (newYear === new Date().getFullYear() && creditRequestMonth > new Date().getMonth() + 1) {
                      setCreditRequestMonth(new Date().getMonth() + 1);
                    }
                  }}
                >
                  {Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => 2024 + i).map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Show criteria details if evaluated */}
          {wfhEligibility?.isEvaluated && wfhEligibility?.criteria && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: "#374151" }}>
                Evaluation Summary ({wfhEligibility.totalCredits}/5 Credits)
              </Typography>
              {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                const passed = wfhEligibility.criteria?.[key]?.status;
                const evalReason = wfhEligibility.criteria?.[key]?.reason;
                return (
                  <Paper
                    key={key}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: "1px solid",
                      borderColor: passed ? "#a7f3d0" : "#fecaca",
                      borderRadius: 2,
                      bgcolor: passed ? "#ecfdf5" : "#fef2f2",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {passed
                        ? <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                        : <CancelIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                      }
                      <Typography variant="body2" fontWeight="600" sx={{ flex: 1 }}>
                        {label}
                      </Typography>
                      <Chip
                        label={passed ? "Passed" : "Failed"}
                        size="small"
                        color={passed ? "success" : "error"}
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    </Stack>
                    {evalReason && (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5, display: "block", mt: 0.5 }}>
                        Evaluator: {evalReason}
                      </Typography>
                    )}

                    {/* Dispute checkbox for failed criteria */}
                    {!passed && (
                      <Box sx={{ pl: 3.5, mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={disputedCriteria[key]?.selected || false}
                              onChange={(e) => {
                                setDisputedCriteria((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], selected: e.target.checked },
                                }));
                              }}
                            />
                          }
                          label={<Typography variant="caption" fontWeight="600" color="#b91c1c">Dispute this criteria</Typography>}
                        />
                        {disputedCriteria[key]?.selected && (
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder={`Explain why "${label}" should be reconsidered...`}
                            value={disputedCriteria[key]?.reason || ""}
                            onChange={(e) => {
                              setDisputedCriteria((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], reason: e.target.value },
                              }));
                            }}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}

          <TextField
            label="Additional Message (Optional)"
            multiline
            rows={2}
            fullWidth
            value={creditRequestMessage}
            onChange={(e) => setCreditRequestMessage(e.target.value)}
            placeholder={wfhEligibility?.isEvaluated ? "Any additional context for re-evaluation..." : "Explain why you should be evaluated for WFH credits..."}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setShowCreditRequestDialog(false); setCreditRequestMessage(""); setDisputedCriteria({}); setCreditRequestMonth(new Date().getMonth() + 1); setCreditRequestYear(new Date().getFullYear()); }}
            sx={{ color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendCreditUpdateRequest}
            disabled={creditRequestLoading || (!creditRequestMessage.trim() && Object.values(disputedCriteria).filter(v => v.selected && v.reason?.trim()).length === 0)}
            startIcon={creditRequestLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
          >
            {creditRequestLoading ? "Sending..." : wfhEligibility?.isEvaluated ? "Request Re-evaluation" : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
