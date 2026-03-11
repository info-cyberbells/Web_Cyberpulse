import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Close,
  Person,
  CalendarMonth,
  WorkspacePremium,
} from "@mui/icons-material";
import { fetchAllWfhCredits } from "../../features/wfhCredit/wfhCreditSlice";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CRITERIA_CONFIG = [
  { key: "targetAchievement", label: "100% Target Achievement / Meeting Deadline", credits: 2 },
  { key: "attendance", label: "100% Attendance", credits: 1 },
  { key: "clientAppreciation", label: "Client Appreciation", credits: 1 },
  { key: "teamwork", label: "Teamwork", credits: 1 },
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

const WfhCreditList = () => {
  const dispatch = useDispatch();
  const { credits, loading, error } = useSelector((state) => state.wfhCredit);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [selectedCredit, setSelectedCredit] = useState(null);

  useEffect(() => {
    dispatch(fetchAllWfhCredits({ month, year }));
  }, [dispatch, month, year]);

  const eligibleCount = (credits || []).filter((c) => c.isEligible).length;
  const notEligibleCount = (credits || []).length - eligibleCount;

  return (
    <Box sx={{ p: 3 }}>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string" ? error : error?.message || "Failed to load credits"}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.slice(1).map((m, i) => (
                  <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Chip icon={<CheckCircle />} label={`Eligible: ${eligibleCount}`} color="success" variant="outlined" />
              <Chip icon={<Cancel />} label={`Not Eligible: ${notEligibleCount}`} color="error" variant="outlined" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (!credits || credits.length === 0) ? (
        <Alert severity="info">No evaluations found for {MONTHS[month]} {year}.</Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Target (2)</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Attendance (1)</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Client (1)</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Teamwork (1)</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Evaluated By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credits.map((credit) => (
                <TableRow
                  key={credit._id}
                  hover
                  onClick={() => setSelectedCredit(credit)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={credit.employeeId?.image} sx={{ width: 32, height: 32 }}>
                        {credit.employeeId?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {credit.employeeId?.name || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {credit.employeeId?.department}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  {["targetAchievement", "attendance", "clientAppreciation", "teamwork"].map((key) => (
                    <TableCell align="center" key={key}>
                      {credit.criteria?.[key]?.status ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">{credit.totalCredits}/5</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={credit.isEligible ? "Eligible" : "Not Eligible"}
                      color={credit.isEligible ? "success" : "error"}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{credit.evaluatorId?.name || "N/A"}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Modal */}
      <Dialog
        open={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCredit && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={selectedCredit.employeeId?.image} sx={{ width: 40, height: 40 }}>
                    {selectedCredit.employeeId?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedCredit.employeeId?.name || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCredit.employeeId?.department} | {MONTHS[selectedCredit.month]} {selectedCredit.year}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setSelectedCredit(null)} size="small">
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              {/* Eligibility Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "2px solid",
                  borderColor: selectedCredit.isEligible ? "success.main" : "error.main",
                  borderRadius: 2,
                  bgcolor: selectedCredit.isEligible ? "success.50" : "error.50",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WorkspacePremium sx={{ color: selectedCredit.isEligible ? "success.main" : "error.main" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Credits: {selectedCredit.totalCredits}/5
                    </Typography>
                  </Stack>
                  <Chip
                    label={selectedCredit.isEligible ? "WFH ELIGIBLE" : "NOT ELIGIBLE"}
                    color={selectedCredit.isEligible ? "success" : "error"}
                    variant="filled"
                    sx={{ fontWeight: "bold" }}
                  />
                </Stack>
              </Paper>

              {/* Criteria Details */}
              {CRITERIA_CONFIG.map(({ key, label, credits }) => (
                <Paper
                  key={key}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: selectedCredit.criteria?.[key]?.status ? "success.200" : "grey.200",
                    borderRadius: 2,
                    bgcolor: selectedCredit.criteria?.[key]?.status ? "success.50" : "grey.50",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {selectedCredit.criteria?.[key]?.status ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" fontWeight="600">{label}</Typography>
                    </Stack>
                    <Chip
                      label={selectedCredit.criteria?.[key]?.status ? `+${credits}` : "0"}
                      size="small"
                      color={selectedCredit.criteria?.[key]?.status ? "success" : "default"}
                      sx={{ minWidth: 35 }}
                    />
                  </Stack>
                  <Box sx={{ pl: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reason:</strong> {selectedCredit.criteria?.[key]?.reason || "N/A"}
                    </Typography>
                  </Box>
                </Paper>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Meta Info */}
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Evaluated by:</strong> {selectedCredit.evaluatorId?.name || "N/A"} ({selectedCredit.evaluatorId?.email || ""})
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonth fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Created:</strong> {formatDate(selectedCredit.createdAt)}
                  </Typography>
                </Stack>
                {selectedCredit.updatedAt !== selectedCredit.createdAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {formatDate(selectedCredit.updatedAt)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSelectedCredit(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default WfhCreditList;
