import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeaveList,
  editExistingLeave,
  clearSuccessMessage,
  clearSelectedLeave,
} from "../../features/leave/leaveSlice";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Button,
  Avatar,
  Grid,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Collapse,
} from "@mui/material";
import {
  CalendarToday,
  Person,
  FilterList,
  Check,
  Close,
  Schedule,
  BusinessCenter,
  ExpandMore,
  ExpandLess,
  DateRange,
  AccessTime,
  EventNote,
  MedicalServices,
} from "@mui/icons-material";
import ArticleIcon from '@mui/icons-material/Article';
import { format } from "date-fns";
import MaleSVG from "../../assets/male_svg.svg";
import FemaleSVG from "../../assets/female_svg.svg";

const LeaveRequests = () => {
  const dispatch = useDispatch();
  const { leaveList, loading, error, successMessage } = useSelector(
    (state) => state.leaves
  );
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionDialog, setActionDialog] = useState({
    open: false,
    leave: null,
    action: null,
  });
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  useEffect(() => {
    dispatch(fetchLeaveList());
  }, [dispatch]);


  const filteredLeaves = leaveList.filter((leave) => {
    const statusMatch = filterStatus === "all"
      ? true
      : leave.status.toLowerCase() === filterStatus.toLowerCase();

    const employeeMatch = selectedEmployee === "all"
      ? true
      : leave.employeeId?._id === selectedEmployee;

    return statusMatch && employeeMatch;
  });


  const uniqueEmployees = leaveList.reduce((acc, leave) => {
    if (leave.employeeId && !acc.find(emp => emp._id === leave.employeeId._id)) {
      acc.push({
        _id: leave.employeeId._id,
        name: leave.employeeId.name
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        if (error) dispatch(clearSelectedLeave());
        if (successMessage) {
          dispatch(clearSuccessMessage());
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleActionClick = (leave, action) => {
    setActionDialog({
      open: true,
      leave,
      action,
    });
  };

  const confirmAction = async () => {
    const { leave, action } = actionDialog;
    try {
      await dispatch(
        editExistingLeave({
          id: leave._id,
          leaveData: {
            ...leave,
            status: action,
          },
        })
      ).unwrap();

      setActionDialog({ open: false, leave: null, action: null });
      dispatch(fetchLeaveList());
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  const toggleCardExpansion = (leaveId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(leaveId)) {
      newExpanded.delete(leaveId);
    } else {
      newExpanded.add(leaveId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "sick leave":
        return <MedicalServices fontSize="small" />;
      case "casual leave":
        return <EventNote fontSize="small" />;
      case "short leave":
        return <AccessTime fontSize="small" />;
      default:
        return <DateRange fontSize="small" />;
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatShortDate = (date) => {
    try {
      return format(new Date(date), "MMM dd");
    } catch (error) {
      return "Invalid";
    }
  };

  const calculateDays = (startDate, endDate, leaveType) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;


      if (leaveType?.toLowerCase().includes('short')) {
        return 0.25;
      } else if (leaveType?.toLowerCase().includes('half')) {
        return 0.5;
      }

      return diffDays;
    } catch (error) {
      return 1;
    }
  };

  const renderActionButtons = (leave) => {
    if (leave.status?.toLowerCase() !== "pending" && leave.status) {
      return (
        <Chip
          label={leave.status}
          color={getStatusColor(leave.status)}
          size="small"
          variant="filled"
          sx={{
            borderRadius: 1.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}
        />
      );
    }

    return (
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={() => handleActionClick(leave, "Approved")}
          startIcon={<Check fontSize="small" />}
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Approve
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => handleActionClick(leave, "Rejected")}
          startIcon={<Close fontSize="small" />}
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  const errorMessage = error ? (typeof error === 'object' ? JSON.stringify(error) : error) : null;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArticleIcon sx={{ fontSize: 20 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Leave Management
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Review and manage employee leave requests
              </Typography>
            </Box>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "grey.50",
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 2
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">

              {/* Employee Filter */}
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: 'white'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5 }}>
                  <Select
                    size="small"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    displayEmpty
                    sx={{
                      minWidth: 200,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      '& .MuiSelect-select': {
                        py: 1
                      }
                    }}
                  >
                    <MenuItem value="all">
                      <Typography variant="body2" fontWeight="500">
                        All Employees
                      </Typography>
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    {uniqueEmployees.map((employee) => (
                      <MenuItem key={employee._id} value={employee._id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.light'
                            }}
                          >
                            {employee.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">
                            {employee.name}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Paper>

              {/* Status Filter */}
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: 'white'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5 }}>
                  <Schedule fontSize="small" sx={{ color: 'primary.main' }} />
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      minWidth: 180,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      '& .MuiSelect-select': {
                        py: 1
                      }
                    }}
                  >
                    <MenuItem value="all">
                      <Typography variant="body2" fontWeight="500">
                        All Status
                      </Typography>
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem value="Pending">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'warning.main'
                          }}
                        />
                        <Typography variant="body2">Pending</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="Approved">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main'
                          }}
                        />
                        <Typography variant="body2">Approved</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="Rejected">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'error.main'
                          }}
                        />
                        <Typography variant="body2">Rejected</Typography>
                      </Stack>
                    </MenuItem>
                  </Select>
                </Stack>
              </Paper>

              {/* Clear Filters Button */}
              {(selectedEmployee !== "all" || filterStatus !== "all") && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSelectedEmployee("all");
                    setFilterStatus("all");
                  }}
                  startIcon={<Close fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1.5,
                    borderColor: 'grey.300',
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: 'error.main',
                      color: 'error.main',
                      bgcolor: 'error.50'
                    }
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Alerts */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {typeof successMessage === 'object' ? JSON.stringify(successMessage) : successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Error loading leave requests: {errorMessage}
        </Alert>
      )}

      {/* Leave Cards */}
      <Stack spacing={2}>
        {filteredLeaves.map((leave) => {
          const isExpanded = expandedCards.has(leave._id);
          return (
            <Card
              key={leave._id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: leave.status?.toLowerCase() === "rejected" ? "error.light" : "grey.200",
                borderRadius: 3,
                bgcolor: 'white',
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderColor: "primary.light",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="flex-start">
                  {/* Employee Info */}
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={
                          leave.employeeId?.image
                            ? leave.employeeId.image
                            : leave.employeeId?.gender === "female"
                              ? FemaleSVG
                              : MaleSVG
                        }
                        sx={{
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                          {leave.employeeId?.name || "Employee Name"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          {leave.employeeId?.department || "Department"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Leave Details */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ color: 'primary.main' }}>
                          {getLeaveTypeIcon(leave.leaveType)}
                        </Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                          {leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1)}
                        </Typography>
                        <Chip
                          label={`${calculateDays(leave.startDate, leave.endDate, leave.leaveType)} Day${calculateDays(leave.startDate, leave.endDate, leave.leaveType) > 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            fontWeight: 600,
                            borderRadius: 1.5
                          }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={4} alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight="500" color="text.secondary">
                            {formatShortDate(leave.startDate)} - {formatShortDate(leave.endDate)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Leave Description Preview */}
                      {leave.reason && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: isExpanded ? 'none' : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5,
                              maxWidth: '100%'
                            }}
                          >
                            <strong>Reason:</strong> {leave.reason}
                          </Typography>
                          {leave.reason.length > 100 && (
                            <Button
                              size="small"
                              onClick={() => toggleCardExpansion(leave._id)}
                              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                              sx={{
                                mt: 1,
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </Button>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12} md={3}>
                    <Stack alignItems="flex-end" spacing={1}>
                      {renderActionButtons(leave)}
                      <Typography variant="caption" color="text.secondary" textAlign="right">
                        Applied: {formatDate(leave.createdAt || leave.startDate)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Expanded Content */}
                <Collapse in={isExpanded}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Full Duration:</strong> {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </Typography>
                    {leave.reason && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Complete Reason:</strong> {leave.reason}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}

        {filteredLeaves.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "grey.300",
              bgcolor: 'white'
            }}
          >
            <Schedule sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h5" color="text.primary" fontWeight="600" gutterBottom>
              No Leave Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filterStatus === "all"
                ? "There are currently no leave requests to review"
                : `No ${filterStatus.toLowerCase()} leave requests found`}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, leave: null, action: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="600">
            Confirm Leave {actionDialog.action}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {actionDialog.leave && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to <strong>{actionDialog.action?.toLowerCase()}</strong> this leave request?
              </Typography>
              <Paper sx={{ mt: 2, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Employee
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {actionDialog.leave.employeeId?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Leave Type
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {actionDialog.leave.leaveType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {formatDate(actionDialog.leave.startDate)} - {formatDate(actionDialog.leave.endDate)}
                      ({calculateDays(actionDialog.leave.startDate, actionDialog.leave.endDate, actionDialog.leave.leaveType)} day{calculateDays(actionDialog.leave.startDate, actionDialog.leave.endDate, actionDialog.leave.leaveType) > 1 ? 's' : ''})

                    </Typography>
                  </Grid>
                  {actionDialog.leave.reason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reason
                      </Typography>
                      <Typography variant="body2">
                        {actionDialog.leave.reason}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setActionDialog({ open: false, leave: null, action: null })}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionDialog.action === "Approved" ? "success" : "error"}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3 }}
          >
            {actionDialog.action === "Approved" ? "Approve Request" : "Reject Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests;