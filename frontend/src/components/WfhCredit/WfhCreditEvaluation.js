import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  WorkspacePremium,
  Send,
  Verified,
  Edit as EditIcon,
  Person,
  CalendarMonth,
} from "@mui/icons-material";
import { submitWfhEvaluation, fetchAllWfhCredits, clearSuccessMessage, clearError } from "../../features/wfhCredit/wfhCreditSlice";
import { fetchEmployeeList } from "../../features/employees/employeeSlice";
import { getAllCreditUpdateRequests, updateCreditUpdateRequestStatus } from "../../services/services";
import { Notifications as NotificationsIcon, DoneAll, Close as CloseIcon } from "@mui/icons-material";

const CRITERIA_CONFIG = [
  { key: "targetAchievement", label: "100% Target Achievement / Meeting Deadline", credits: 2 },
  { key: "attendance", label: "100% Attendance", credits: 1 },
  { key: "clientAppreciation", label: "Client Appreciation", credits: 1 },
  { key: "teamwork", label: "Teamwork", credits: 1 },
];

const DEFAULT_CRITERIA = {
  targetAchievement: { status: false, reason: "" },
  attendance: { status: false, reason: "" },
  clientAppreciation: { status: false, reason: "" },
  teamwork: { status: false, reason: "" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const WfhCreditEvaluation = () => {
  const dispatch = useDispatch();
  const { loading, successMessage, error, credits } = useSelector((state) => state.wfhCredit);
  const { employeeList } = useSelector((state) => state.employees);
  const activeEmployeeList = (Array.isArray(employeeList) ? employeeList : []).filter(emp => emp && emp.status !== 0 && emp.status !== "0");

  const currentDate = new Date();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [criteria, setCriteria] = useState({ ...DEFAULT_CRITERIA });
  const [validationErrors, setValidationErrors] = useState({});
  const [creditRequests, setCreditRequests] = useState([]);

  useEffect(() => {
    dispatch(fetchEmployeeList());
    fetchCreditRequests();
  }, [dispatch]);

  const fetchCreditRequests = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const orgId = userData?.employee?.organizationId;
      const result = await getAllCreditUpdateRequests(orgId, "pending");
      setCreditRequests(result.data || []);
    } catch (err) {
      console.error("Error fetching credit update requests:", err);
    }
  };

  const handleCreditRequestAction = async (id, status) => {
    try {
      await updateCreditUpdateRequestStatus(id, status);
      setCreditRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error updating credit request:", err);
    }
  };

  // Fetch all credits for selected month/year (used for green ticks + auto-fill)
  useEffect(() => {
    if (month && year) {
      dispatch(fetchAllWfhCredits({ month, year }));
    }
  }, [dispatch, month, year]);

  // Build a map: employeeId -> evaluation data (for quick lookup)
  const evaluatedMap = useMemo(() => {
    const map = {};
    (credits || []).forEach((c) => {
      const empId = c.employeeId?._id || c.employeeId;
      if (empId) map[empId] = c;
    });
    return map;
  }, [credits]);

  // Find existing evaluation for currently selected employee
  const existingEvaluation = selectedEmployee ? evaluatedMap[selectedEmployee] || null : null;
  const alreadyEvaluated = !!existingEvaluation;

  // Auto-fill form when employee changes
  useEffect(() => {
    if (existingEvaluation) {
      setCriteria({
        targetAchievement: {
          status: existingEvaluation.criteria?.targetAchievement?.status || false,
          reason: existingEvaluation.criteria?.targetAchievement?.reason || "",
        },
        attendance: {
          status: existingEvaluation.criteria?.attendance?.status || false,
          reason: existingEvaluation.criteria?.attendance?.reason || "",
        },
        clientAppreciation: {
          status: existingEvaluation.criteria?.clientAppreciation?.status || false,
          reason: existingEvaluation.criteria?.clientAppreciation?.reason || "",
        },
        teamwork: {
          status: existingEvaluation.criteria?.teamwork?.status || false,
          reason: existingEvaluation.criteria?.teamwork?.reason || "",
        },
      });
    } else {
      setCriteria({ ...DEFAULT_CRITERIA });
    }
    setValidationErrors({});
  }, [selectedEmployee, existingEvaluation]);

  useEffect(() => {
    if (successMessage) {
      // Re-fetch to update green ticks
      dispatch(fetchAllWfhCredits({ month, year }));
      setValidationErrors({});
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, month, year]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleStatusChange = (key) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: !prev[key].status },
    }));
    setValidationErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleReasonChange = (key, value) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: { ...prev[key], reason: value },
    }));
    if (value.trim()) {
      setValidationErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const calculateTotalCredits = () => {
    let total = 0;
    if (criteria.targetAchievement.status) total += 2;
    if (criteria.attendance.status) total += 1;
    if (criteria.clientAppreciation.status) total += 1;
    if (criteria.teamwork.status) total += 1;
    return total;
  };

  const handleSubmit = () => {
    const errors = {};
    if (!selectedEmployee) errors.employee = "Please select an employee";
    CRITERIA_CONFIG.forEach(({ key }) => {
      if (!criteria[key].reason.trim()) errors[key] = "Reason is required";
    });
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    dispatch(submitWfhEvaluation({ employeeId: selectedEmployee, month, year, criteria }));
  };

  const totalCredits = calculateTotalCredits();
  const isEligible = totalCredits === 5;

  // Employee list filtered to type 2
  const employees = useMemo(() => {
    return activeEmployeeList.filter((emp) => emp.type === 2);
  }, [activeEmployeeList]);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string" ? error : error?.message || "Something went wrong"}
        </Alert>
      )}

      {/* Credit Update Requests from Employees */}
      {creditRequests.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid",
            borderColor: "warning.main",
            borderRadius: 2,
            bgcolor: "#fffbeb",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <NotificationsIcon sx={{ color: "warning.main" }} />
            <Typography variant="subtitle1" fontWeight="600" color="#92400e">
              Credit Update Requests ({creditRequests.length})
            </Typography>
          </Stack>
          {creditRequests.map((req) => (
            <Paper
              key={req._id}
              sx={{
                p: 2,
                mb: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                bgcolor: "#ffffff",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" fontWeight="600">
                    {req.employeeId?.name || "Unknown"}{" "}
                    <Typography component="span" variant="caption" color="text.secondary">
                      ({req.employeeId?.email})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    "{req.message}"
                  </Typography>
                  {/* Show disputed criteria if any */}
                  {req.disputedCriteria && req.disputedCriteria.length > 0 && (
                    <Box sx={{ mt: 1, pl: 1, borderLeft: "3px solid #f59e0b" }}>
                      <Typography variant="caption" fontWeight="600" color="#92400e">
                        Disputed Criteria:
                      </Typography>
                      {req.disputedCriteria.map((dc, idx) => (
                        <Box key={idx} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" fontWeight="600" color="#b91c1c">
                            {dc.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 1 }}>
                            Employee says: "{dc.reason}"
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {MONTHS[req.month - 1]} {req.year} &middot; {formatDate(req.createdAt)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<DoneAll />}
                    onClick={() => {
                      handleCreditRequestAction(req._id, "reviewed");
                      // Auto-select this employee and set month/year from request
                      const empId = req.employeeId?._id || req.employeeId;
                      if (empId) setSelectedEmployee(empId);
                      if (req.month) setMonth(req.month);
                      if (req.year) setYear(req.year);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Evaluate
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleCreditRequestAction(req._id, "dismissed")}
                    sx={{ textTransform: "none" }}
                  >
                    Dismiss
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Paper>
      )}

      {/* Employee & Month Selection */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!validationErrors.employee}>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Select Employee"
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, employee: null }));
                }}
                renderValue={(selected) => {
                  const emp = employees.find((e) => e._id === selected);
                  if (!emp) return "";
                  const evaluated = !!evaluatedMap[selected];
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {evaluated && <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />}
                      <span>{emp.name} - {emp.department}</span>
                    </Box>
                  );
                }}
              >
                {employees.map((emp) => {
                  const evaluated = !!evaluatedMap[emp._id];
                  const evalData = evaluatedMap[emp._id];
                  return (
                    <MenuItem key={emp._id} value={emp._id}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {evaluated ? (
                          <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                        ) : (
                          <Person sx={{ color: "grey.400", fontSize: 20 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <span>{emp.name}</span>
                            {evaluated && (
                              <Chip
                                label={`${evalData?.totalCredits}/5`}
                                size="small"
                                color={evalData?.isEligible ? "success" : "error"}
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        }
                        secondary={emp.department}
                      />
                    </MenuItem>
                  );
                })}
              </Select>
              {validationErrors.employee && (
                <Typography variant="caption" color="error">{validationErrors.employee}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map((m, i) => (
                  <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </Grid>
        </Grid>

        {/* Already Evaluated Banner */}
        {alreadyEvaluated && existingEvaluation && (
          <Alert
            severity="success"
            icon={<Verified />}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" fontWeight="600">
              Already evaluated for {MONTHS[month - 1]} {year} — {existingEvaluation.totalCredits}/5 Credits
              {existingEvaluation.isEligible ? " (Eligible)" : " (Not Eligible)"}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                <strong>Evaluated by:</strong> {existingEvaluation.evaluatorId?.name || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Created:</strong> {formatDate(existingEvaluation.createdAt)}
              </Typography>
              {existingEvaluation.updatedAt !== existingEvaluation.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  <strong>Last Updated:</strong> {formatDate(existingEvaluation.updatedAt)}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: "block" }}>
              You can edit the values below and click "Update Evaluation" to update.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Criteria Cards */}
      {CRITERIA_CONFIG.map(({ key, label, credits }) => (
        <Card
          key={key}
          elevation={0}
          sx={{
            mb: 2,
            border: "1px solid",
            borderColor: criteria[key].status ? "success.light" : "grey.200",
            borderRadius: 2,
            transition: "border-color 0.3s",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {criteria[key].status ? <CheckCircle color="success" /> : <Cancel color="error" />}
                <Typography variant="subtitle1" fontWeight="600">{label}</Typography>
                <Chip
                  label={`${credits} Credit${credits > 1 ? "s" : ""}`}
                  size="small"
                  color={criteria[key].status ? "success" : "default"}
                  variant="outlined"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={criteria[key].status}
                    onChange={() => handleStatusChange(key)}
                    color="success"
                  />
                }
                label={criteria[key].status ? "Yes" : "No"}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Reason (Required)"
              placeholder={criteria[key].status ? "Why does this employee qualify?" : "Why does this employee not qualify?"}
              value={criteria[key].reason}
              onChange={(e) => handleReasonChange(key, e.target.value)}
              error={!!validationErrors[key]}
              helperText={validationErrors[key]}
              size="small"
            />
          </CardContent>
        </Card>
      ))}

      {/* Summary & Submit */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          border: "2px solid",
          borderColor: isEligible ? "success.main" : "error.main",
          borderRadius: 2,
          bgcolor: isEligible ? "success.50" : "error.50",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WorkspacePremium sx={{ fontSize: 40, color: isEligible ? "success.main" : "error.main" }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">Total Credits: {totalCredits}/5</Typography>
              <Typography variant="body2" color="text.secondary">
                {isEligible ? "Employee is eligible for WFH next month" : "Employee is NOT eligible for WFH next month"}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
            color={isEligible ? "success" : "error"}
            variant="filled"
            sx={{ fontWeight: "bold", fontSize: "0.9rem", px: 2, py: 2.5 }}
          />
        </Box>
      </Paper>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : alreadyEvaluated ? <EditIcon /> : <Send />}
          sx={{ px: 4 }}
          color={alreadyEvaluated ? "warning" : "primary"}
        >
          {loading ? "Submitting..." : alreadyEvaluated ? "Update Evaluation" : "Submit Evaluation"}
        </Button>
      </Box>
    </Box>
  );
};

export default WfhCreditEvaluation;
