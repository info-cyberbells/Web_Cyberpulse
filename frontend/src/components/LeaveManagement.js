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

const LeaveTypeButton = styled(Button)(({ selected, theme }) => ({
  padding: "12px 16px",
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
}));

const LeaveManagement = () => {
  const dispatch = useDispatch();
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
  const [leaveQuota, setLeaveQuota] = useState(null);

  const leaveTypes = [
    {
      value: "casual",
      label: "Casual Leave",
      icon: BusinessIcon,
      description: "Personal time off"
    },
    {
      value: "sick",
      label: "Sick Leave",
      icon: HospitalIcon,
      description: "Medical leave"
    },
    {
      value: "half-day",
      label: "Half Day",
      icon: ScheduleIcon,
      description: "4 hours leave"
    },
    {
      value: "short-leave",
      label: "Short Leave",
      icon: TimelapseIcon,
      description: "2 hours leave"
    },
  ];

  const calculateLeaveDays = (start, end, type) => {
    switch (type) {
      case 'casual':
      case 'sick':
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      case 'half-day':
        return 0.5;
      case 'short-leave':
        return 0.25;
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

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setShowModal(false);
      resetForm();
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  const handleEditRequest = (request) => {
    setStartDate(new Date(request.startDate));
    setEndDate(new Date(request.endDate));
    setDescription(request.reason);
    setLeaveType(request.leaveType || "casual");
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
        // toast.success("Leave request deleted successfully");
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

    if (startDate > endDate && (leaveType === "casual" || leaveType === "sick")) {
      toast.error("End date cannot be before start date");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    const employeeId = userData?.employee?.id;

    if (!employeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    // Format dates for payload
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const leaveData = {
      employeeId: employeeId,
      startDate: formatDate(startDate),
      endDate: (leaveType === "half-day" || leaveType === "short-leave")
        ? formatDate(startDate)
        : formatDate(endDate),
      leaveType: leaveType,
      reason: description,
    };

    if (editingId) {
      const originalRequest = leaveList.find(leave => leave._id === editingId);
      leaveData.status = originalRequest?.status || "pending"; // ✅ Preserve status
    }

    try {
      if (editingId) {
        await dispatch(
          editExistingLeave({ id: editingId, leaveData })
        ).unwrap();
      } else {
        await dispatch(addNewLeave(leaveData)).unwrap();
      }

      const result = await dispatch(fetchLeavesByEmployeeId()).unwrap();
      if (result.employee && result.employee.leaveQuota) {
        setLeaveQuota(result.employee.leaveQuota);
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error(error.message || "Failed to submit leave request");
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setDescription("");
    setLeaveType("casual");
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: 3 }}>
      {/* Modal */}
      <StyledModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <Paper
          sx={{
            width: "95%",
            maxWidth: 650,
            p: { xs: 2, sm: 4 },
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
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              sx={{
                bgcolor: "#f3f4f6",
                "&:hover": { bgcolor: "#e5e7eb" }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2.5 },
            flex: 1,
            overflowY: "auto",
            pb: 1,
            pr: 1,
          }}>
            <Box>
              <Grid container spacing={{ xs: 0.5, sm: 1 }}>
                {leaveTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Grid item xs={6} key={type.value}>
                      <LeaveTypeButton
                        selected={leaveType === type.value}
                        onClick={() => setLeaveType(type.value)}
                        fullWidth
                        startIcon={<IconComponent sx={{ fontSize: 18 }} />}
                        sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                      >
                        <Box sx={{ textAlign: "left", width: '100%' }}>
                          <Typography variant="body2" fontWeight="500">
                            {type.label}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                            {type.description}
                          </Typography>
                        </Box>
                      </LeaveTypeButton>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

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
              />
            ) : (
              <>
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
                />

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
                />
              </>
            )}

            <TextField
              label="Reason"
              multiline
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide a reason for your leave"
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleSubmitRequest}
              fullWidth
              size="large"
              sx={{
                py: { xs: 1, sm: 1.5 },
                backgroundColor: "#2563eb",
                fontWeight: 600,
                mt: { xs: 1, sm: 0 },
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
              }}
            >
              {editingId ? "Update Request" : "Submit Request"}
            </Button>
          </Box>
        </Paper>
      </StyledModal>

      {/* Main Content */}
      <Container maxWidth="lg">
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
          <CardContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                  Leave Management
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Manage your leave requests and track your available quota
                </Typography>
              </Box>
              {leaveQuota !== null ? (
                <Box sx={{ textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, p: 2, border: "1px solid #e5e7eb" }}>
                  <Typography variant="h4" fontWeight="700" color="#1f2937">
                    {leaveQuota}
                  </Typography>
                  <Typography variant="caption" color="#6b7280">
                    Leave Quota
                  </Typography>
                </Box>
              ) : (
                <CircularProgress size={30} sx={{ color: "#6b7280" }} />
              )}
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
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <IconComponent sx={{ color: "#6b7280", fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="600" color="#1f2937" gutterBottom>
                            {typeInfo.label}
                          </Typography>
                          <Typography variant="body2" color="#6b7280">
                            {leaveDays} {(leaveDays === 0.25 || leaveDays === 0.5 || leaveDays === 1) ? 'day' : 'days'}
                          </Typography>

                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {(request.status === "pending" || (!request.status)) && (<>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRequest(request)}
                            sx={{
                              bgcolor: "#f3f4f6",
                              color: "#6b7280",
                              "&:hover": { bgcolor: "#e5e7eb", color: "#374151" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRequest(request._id)}
                            sx={{
                              bgcolor: "#fef2f2",
                              color: "#ef4444",
                              "&:hover": { bgcolor: "#fee2e2" },
                            }}
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

                    <Typography variant="body1" color="#374151" sx={{ mb: 2, lineHeight: 1.6 }}>
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
              <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2, border: "1px solid #e5e7eb" }}>
                <CalendarIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="600" color="#374151">
                  No leave requests found
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 3 }}>
                  Start by creating your first leave request
                </Typography>
                {/* <Button
                  variant="contained"
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    backgroundColor: "#1f2937",
                    "&:hover": {
                      backgroundColor: "#111827",
                    },
                  }}
                >
                  Create Leave Request
                </Button> */}
              </Paper>
            )}
          </Box>
        )}

        <FloatingButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <AddIcon />
        </FloatingButton>
      </Container>
    </Box>
  );
};

export default LeaveManagement;