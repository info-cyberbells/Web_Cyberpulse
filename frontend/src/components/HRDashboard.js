import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  Stack,
  Tab,
  Tabs,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventIcon from "@mui/icons-material/Event";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";

// Redux
import { fetchCurrentEmpAttendanceAsync } from "../features/attendance/attendanceSlice";
import { fetchEmployeeList } from "../features/employees/employeeSlice";
import { fetchLeaveList } from "../features/leave/leaveSlice";
import {
  fetchAllAnnoucements,
} from "../features/annoucement/AnnoucementSlice";
import { fetchAllEvents } from "../features/events/eventSlice";
import { fetchHolidays } from "../features/holiday/holidaySlice";
import { fetchHelpdeskTickets } from "../features/helpDesk/helpSlice";

// ─── Styled Components ───────────────────────────────────────────────────────

const SectionCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  border: "1px solid #e8eaf0",
  marginBottom: 20,
  background: "#fff",
}));

const AttendanceRow = styled(Box)(({ bordercolor }) => ({
  borderLeft: `4px solid ${bordercolor}`,
  padding: "10px 14px",
  marginBottom: 8,
  background: "#fafbfc",
  borderRadius: "0 8px 8px 0",
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  minHeight: 52,
}));

const StatCard = styled(Paper)(({ bgcolor }) => ({
  padding: "14px 10px",
  borderRadius: 10,
  background: bgcolor || "#fff",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  border: "1px solid #f0f0f0",
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },
}));

const QuickActionBtn = styled(Button)(({ btncolor }) => ({
  borderRadius: 9,
  padding: "9px 14px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.84rem",
  justifyContent: "flex-start",
  gap: 8,
  backgroundColor: btncolor || "#1976d2",
  color: "#fff",
  "&:hover": {
    backgroundColor: btncolor || "#1565c0",
    opacity: 0.88,
  },
}));

// ─── Component ───────────────────────────────────────────────────────────────

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  // Redux state
  const { currentDayAttendance, currentDayLoading: attLoading } = useSelector(
    (state) => state.attendances
  );
  const { employeeList: rawEmployeeList } = useSelector((state) => state.employees);
  const employeeList = (Array.isArray(rawEmployeeList) ? rawEmployeeList : []).filter(
    (emp) => emp.status !== "0" && emp.status !== 0
  );
  const { leaveList } = useSelector((state) => state.leaves);
  const { AnnoucementList } = useSelector((state) => state.announcements);
  const { eventList } = useSelector((state) => state.events);
  const { holidays } = useSelector((state) => state.holiday);
  const { tickets } = useSelector((state) => state.helpdesk);

  // Local state
  const [search, setSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [holidayIndex, setHolidayIndex] = useState(0);

  // Fetch on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    dispatch(fetchCurrentEmpAttendanceAsync({ date: today, isInitialFetch: true }));
    dispatch(fetchEmployeeList());
    dispatch(fetchLeaveList());
    dispatch(fetchAllAnnoucements());
    dispatch(fetchAllEvents());
    dispatch(fetchHolidays());
    dispatch(fetchHelpdeskTickets());
  }, [dispatch]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const attendanceArr = Array.isArray(currentDayAttendance) ? currentDayAttendance : [];

  const onLeaveFromAttendance = attendanceArr.filter(
    (emp) => emp.leaveRequest?.status === "Approved" &&
      (!emp.attendance?.todayClockIn || !!emp.attendance?.todayClockOut)
  );
  const notClockedIn = attendanceArr.filter(
    (emp) => !emp.attendance?.todayClockIn &&
      !(emp.leaveRequest?.status === "Approved")
  );
  const clockedOut = attendanceArr.filter(
    (emp) => emp.attendance?.todayClockIn && emp.attendance?.todayClockOut &&
      !(emp.leaveRequest?.status === "Approved")
  );
  const clockedIn = attendanceArr.filter(
    (emp) => emp.attendance?.todayClockIn && !emp.attendance?.todayClockOut
  );

  const safeLeaveList = Array.isArray(leaveList) ? leaveList : [];

  const pendingLeaves = safeLeaveList.filter(
    (l) => l.status?.toLowerCase() === "pending"
  );

  const onLeaveToday = safeLeaveList.filter((l) => {
    if (l.status?.toLowerCase() !== "approved") return false;
    const from = new Date(l.startDate);
    const to = new Date(l.endDate);
    return from <= today && to >= today;
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingHolidays = (Array.isArray(holidays) ? holidays : [])
    .filter((h) => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return d >= todayStart;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingEvents = (Array.isArray(eventList) ? eventList : [])
    .filter((e) => {
      const d = new Date(e.eventDate);
      d.setHours(0, 0, 0, 0);
      return d >= todayStart;
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const openTickets = (Array.isArray(tickets) ? tickets : []).filter(
    (t) => !["resolved", "closed"].includes(t.status?.toLowerCase())
  );

  const recentEmployees = (Array.isArray(employeeList) ? employeeList : [])
    .filter((emp) => emp.joiningDate)
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 6);

  const todayJoiners = recentEmployees.filter(
    (emp) => format(new Date(emp.joiningDate), "yyyy-MM-dd") === todayStr
  );
  const recentNonTodayJoiners = recentEmployees.filter(
    (emp) => format(new Date(emp.joiningDate), "yyyy-MM-dd") !== todayStr
  );

  const latestAnnouncement = (Array.isArray(AnnoucementList) ? AnnoucementList : []).slice(0, 1);
  const hasOldAnnouncements = (AnnoucementList?.length || 0) > 1;

  const currentHoliday = upcomingHolidays[holidayIndex] || null;

  // Search filter for not-clocked-in employees
  const filteredNotClockedIn = notClockedIn.filter((emp) =>
    (emp.employeeName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Helper: get employee avatar initial
  const initial = (name) => (name || "E")[0].toUpperCase();

  // ── Attendance employee pill (avatar + name side by side) ────────────────
  const EmpChip = ({ emp, color }) => {
    const name = emp.employeeName || emp.name || "Employee";
    const imgSrc = emp.image || null;
    return (
      <Tooltip title={name} arrow placement="top">
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            bgcolor: alpha(color, 0.08),
            border: `1px solid ${alpha(color, 0.22)}`,
            borderRadius: "20px",
            px: 1,
            py: 0.4,
            cursor: "default",
            transition: "background 0.15s",
            "&:hover": { bgcolor: alpha(color, 0.15) },
          }}
        >
          <Avatar
            src={imgSrc}
            sx={{
              width: 26,
              height: 26,
              fontSize: 11,
              bgcolor: color,
              flexShrink: 0,
            }}
          >
            {!imgSrc && initial(name)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#333",
              maxWidth: 100,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh", py: 2.5, px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2.5}>
        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <Grid item xs={12} lg={8}>

          {/* ── Noticeboard ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important", pt: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <CampaignIcon sx={{ color: "#1976d2", fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={700} fontSize="0.97rem">
                    Noticeboard
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate("/annoucement")}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    boxShadow: "none",
                  }}
                >
                  New Notice
                </Button>
              </Stack>

              {latestAnnouncement.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 1.8,
                    color: "text.secondary",
                    bgcolor: "#f5f7fa",
                    borderRadius: 2,
                    fontSize: "0.85rem",
                  }}
                >
                  No new notices
                </Box>
              ) : (
                latestAnnouncement.map((ann) => (
                  <Box
                    key={ann._id}
                    sx={{
                      bgcolor: "#eef3ff",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1,
                      border: "1px solid #c5d3f0",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {ann.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: "0.82rem" }}>
                      {ann.description}
                    </Typography>
                    {ann.date && (
                      <Typography variant="caption" color="text.disabled">
                        {format(new Date(ann.date), "dd MMM yyyy")}
                      </Typography>
                    )}
                  </Box>
                ))
              )}

              {hasOldAnnouncements && (
                <Box sx={{ textAlign: "right", mt: 0.5 }}>
                  <Button
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", fontSize: "0.8rem" }}
                    onClick={() => navigate("/annoucement")}
                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  >
                    View old notices
                  </Button>
                </Box>
              )}
            </CardContent>
          </SectionCard>

          {/* ── Who's In Today ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" fontWeight={700} fontSize="0.97rem">
                  Who's in today @ my department
                </Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, fontSize: "0.82rem", bgcolor: "#f5f7fa", height: 34 },
                    }}
                    sx={{ width: 140 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterListIcon fontSize="small" />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      height: 34,
                      borderColor: "#d0d7e3",
                      color: "text.secondary",
                    }}
                    onClick={() => navigate("/active-employees")}
                  >
                    Filter
                  </Button>
                </Stack>
              </Stack>

              {attLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <>
                  {/* Not clocked-in */}
                  <AttendanceRow bordercolor="#f44336">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ width: "100%", mb: 0.8, color: "#333", fontSize: "0.82rem" }}
                    >
                      Not clocked-in yet
                    </Typography>
                    {filteredNotClockedIn.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        All employees have clocked in
                      </Typography>
                    ) : (
                      filteredNotClockedIn.slice(0, 12).map((emp) => (
                        <EmpChip key={emp.employeeId} emp={emp} color="#f44336" />
                      ))
                    )}
                  </AttendanceRow>

                  {/* Clocked-out */}
                  <AttendanceRow bordercolor="#ff9800">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ width: "100%", mb: 0.8, color: "#333", fontSize: "0.82rem" }}
                    >
                      Clocked-out
                    </Typography>
                    {clockedOut.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No employee clocked-out yet
                      </Typography>
                    ) : (
                      clockedOut.slice(0, 12).map((emp) => (
                        <EmpChip key={emp.employeeId} emp={emp} color="#ff9800" />
                      ))
                    )}
                  </AttendanceRow>

                  {/* Clocked-in */}
                  <AttendanceRow bordercolor="#2196f3">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ width: "100%", mb: 0.8, color: "#333", fontSize: "0.82rem" }}
                    >
                      Clocked-in
                    </Typography>
                    {clockedIn.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No employee clocked-in yet
                      </Typography>
                    ) : (
                      clockedIn.slice(0, 12).map((emp) => (
                        <EmpChip key={emp.employeeId} emp={emp} color="#2196f3" />
                      ))
                    )}
                  </AttendanceRow>

                  {/* On leave */}
                  <AttendanceRow bordercolor="#ff9800">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ width: "100%", mb: 0.8, color: "#333", fontSize: "0.82rem" }}
                    >
                      On Leave Today
                    </Typography>
                    {onLeaveFromAttendance.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No employee on leave
                      </Typography>
                    ) : (
                      onLeaveFromAttendance.slice(0, 12).map((emp) => (
                        <Tooltip
                          key={emp.employeeId}
                          title={`${emp.employeeName} — ${emp.leaveRequest?.leaveType || "Leave"} (Approved)`}
                          arrow
                          placement="top"
                        >
                          <Box>
                            <EmpChip emp={emp} color="#ff9800" />
                          </Box>
                        </Tooltip>
                      ))
                    )}
                  </AttendanceRow>
                </>
              )}
            </CardContent>
          </SectionCard>

          {/* ── Pending Leave Requests ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700} fontSize="0.97rem">
                    Pending Leave Requests
                  </Typography>
                  {pendingLeaves.length > 0 && (
                    <Chip
                      label={pendingLeaves.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        bgcolor: "#ff9800",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Stack>
                <Button
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", fontSize: "0.8rem" }}
                  onClick={() => navigate("/leave")}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                >
                  View all
                </Button>
              </Stack>

              {pendingLeaves.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2,
                    bgcolor: "#f5f7fa",
                    borderRadius: 2,
                    color: "text.secondary",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28, mb: 0.5 }} />
                  <Typography variant="body2">No pending leave requests</Typography>
                </Box>
              ) : (
                pendingLeaves.slice(0, 4).map((leave) => (
                  <Box
                    key={leave._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.2,
                      px: 1.8,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: "#fff9ee",
                      border: "1px solid #ffd580",
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "#ff9800" }}>
                        {initial(leave.employeeId?.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} fontSize="0.84rem">
                          {leave.employeeId?.name || "Employee"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.leaveType || leave.type} ·{" "}
                          {leave.startDate
                            ? format(new Date(leave.startDate), "dd MMM")
                            : ""}
                          {" - "}
                          {leave.endDate
                            ? format(new Date(leave.endDate), "dd MMM yyyy")
                            : ""}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{
                        bgcolor: "#ff9800",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        height: 22,
                      }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </SectionCard>

          {/* ── New Joiners ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Typography variant="subtitle1" fontWeight={700} fontSize="0.97rem" mb={1.5}>
                New Joiners
              </Typography>

              {/* Today's Joiners */}
              <Box sx={{ bgcolor: "#f5f7fa", borderRadius: 2, p: 1.5, mb: 1.5 }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.secondary"
                  fontSize="0.82rem"
                  mb={1}
                >
                  Today's Joiners
                </Typography>
                {todayJoiners.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 1.2 }}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.82rem">
                      🎉 No new joiners today
                    </Typography>
                  </Box>
                ) : (
                  todayJoiners.map((emp) => (
                    <Stack key={emp._id} direction="row" alignItems="center" gap={1.5} mb={1}>
                      <Avatar src={emp.image} sx={{ width: 32, height: 32, fontSize: 13 }}>
                        {initial(emp.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} fontSize="0.84rem">
                          {emp.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.jobRole}
                        </Typography>
                      </Box>
                    </Stack>
                  ))
                )}
              </Box>

              {/* Recent Joiners */}
              {recentNonTodayJoiners.length > 0 && (
                <>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="text.secondary"
                    fontSize="0.82rem"
                    mb={1}
                  >
                    Recent Joiners
                  </Typography>
                  {recentNonTodayJoiners.slice(0, 4).map((emp) => (
                    <Stack
                      key={emp._id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={emp.image} sx={{ width: 32, height: 32, fontSize: 13 }}>
                          {initial(emp.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700} fontSize="0.84rem">
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.jobRole}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(emp.joiningDate), "dd MMM yyyy")}
                      </Typography>
                    </Stack>
                  ))}
                </>
              )}

              <Box sx={{ textAlign: "right", mt: 0.5 }}>
                <Button
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", fontSize: "0.8rem" }}
                  onClick={() => navigate("/add-employee")}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                >
                  Manage Employees
                </Button>
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>

        {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
        <Grid item xs={12} lg={4}>

          {/* ── Quick Stats ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <StatCard bgcolor="#e8f5e9" onClick={() => navigate("/add-employee")}>
                    <GroupIcon sx={{ color: "#2e7d32", fontSize: 26, mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={800} color="#2e7d32" lineHeight={1.2}>
                      {employeeList?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.72rem">
                      Total Employees
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={6}>
                  <StatCard bgcolor="#e3f2fd" onClick={() => navigate("/active-employees")}>
                    <CheckCircleIcon sx={{ color: "#1565c0", fontSize: 26, mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={800} color="#1565c0" lineHeight={1.2}>
                      {clockedIn.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.72rem">
                      Present Today
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={6}>
                  <StatCard bgcolor="#fff3e0" onClick={() => navigate("/active-employees")}>
                    <WorkOffIcon sx={{ color: "#e65100", fontSize: 26, mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={800} color="#e65100" lineHeight={1.2}>
                      {onLeaveFromAttendance.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.72rem">
                      On Leave
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={6}>
                  <StatCard bgcolor="#fce4ec" onClick={() => navigate("/help-desk")}>
                    <SupportAgentIcon sx={{ color: "#880e4f", fontSize: 26, mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={800} color="#880e4f" lineHeight={1.2}>
                      {openTickets.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.72rem">
                      Open Tickets
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>

          {/* ── Events & Holidays ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{
                  mb: 1.5,
                  minHeight: 36,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    minWidth: 0,
                    px: 1.5,
                    minHeight: 36,
                  },
                  "& .MuiTabs-indicator": { height: 3, borderRadius: 2 },
                }}
              >
                <Tab label="Upcoming Events" />
                <Tab label="Holidays" />
              </Tabs>

              {/* Events Tab */}
              {tabValue === 0 && (
                <>
                  {upcomingEvents.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
                      <EventIcon sx={{ fontSize: 28, color: "#bdbdbd", mb: 0.5 }} />
                      <Typography variant="body2" fontSize="0.82rem">
                        No upcoming events
                      </Typography>
                    </Box>
                  ) : (
                    upcomingEvents.slice(0, 4).map((event) => (
                      <Box
                        key={event._id}
                        sx={{ display: "flex", gap: 1.5, mb: 1.8, alignItems: "flex-start" }}
                      >
                        <Box
                          sx={{
                            minWidth: 44,
                            bgcolor: "#e3f2fd",
                            borderRadius: 2,
                            p: 0.8,
                            textAlign: "center",
                            border: "1px solid #bbdefb",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="#1565c0"
                            fontWeight={700}
                            display="block"
                            lineHeight={1}
                            fontSize="0.65rem"
                          >
                            {event.eventDate
                              ? format(new Date(event.eventDate), "MMM").toUpperCase()
                              : ""}
                          </Typography>
                          <Typography
                            variant="h6"
                            color="#1565c0"
                            fontWeight={800}
                            lineHeight={1.3}
                            fontSize="1.2rem"
                          >
                            {event.eventDate ? format(new Date(event.eventDate), "dd") : ""}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} fontSize="0.84rem">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.startTime}
                            {event.endTime ? ` - ${event.endTime}` : ""}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                  {upcomingEvents.length > 0 && (
                    <Button
                      size="small"
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: 600, mt: 0.5, fontSize: "0.8rem" }}
                      onClick={() => navigate("/event")}
                    >
                      View all events
                    </Button>
                  )}
                </>
              )}

              {/* Holidays Tab */}
              {tabValue === 1 && (
                <>
                  {upcomingHolidays.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
                      <BeachAccessIcon sx={{ fontSize: 28, color: "#bdbdbd", mb: 0.5 }} />
                      <Typography variant="body2" fontSize="0.82rem">
                        No upcoming holidays
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <IconButton
                          size="small"
                          onClick={() => setHolidayIndex(Math.max(0, holidayIndex - 1))}
                          disabled={holidayIndex === 0}
                        >
                          <NavigateBeforeIcon fontSize="small" />
                        </IconButton>

                        {currentHoliday && (
                          <Box sx={{ textAlign: "center", flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800} fontSize="1rem">
                              {currentHoliday.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontSize="0.82rem">
                              {currentHoliday.date
                                ? format(new Date(currentHoliday.date), "EEE, do MMMM yyyy")
                                : ""}
                            </Typography>
                          </Box>
                        )}

                        <IconButton
                          size="small"
                          onClick={() =>
                            setHolidayIndex(
                              Math.min(upcomingHolidays.length - 1, holidayIndex + 1)
                            )
                          }
                          disabled={holidayIndex >= upcomingHolidays.length - 1}
                        >
                          <NavigateNextIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <Button
                        size="small"
                        fullWidth
                        variant="text"
                        sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", fontSize: "0.8rem" }}
                        onClick={() => navigate("/holidays")}
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      >
                        View all
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </SectionCard>

          {/* ── Important Links / Quick Actions ── */}
          <SectionCard>
            <CardContent sx={{ pb: "14px !important" }}>
              <Typography variant="subtitle1" fontWeight={700} fontSize="0.97rem" mb={1.5}>
                Important Links
              </Typography>
              <Stack gap={1}>
                <QuickActionBtn
                  btncolor="#1976d2"
                  onClick={() => navigate("/add-employee")}
                  startIcon={<PersonAddIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Employee Management
                </QuickActionBtn>

                <QuickActionBtn
                  btncolor="#388e3c"
                  onClick={() => navigate("/leave")}
                  startIcon={<WorkOffIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Leave Requests
                </QuickActionBtn>

                <QuickActionBtn
                  btncolor="#f57c00"
                  onClick={() => navigate("/annoucement")}
                  startIcon={<CampaignIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Announcements
                </QuickActionBtn>

                <QuickActionBtn
                  btncolor="#6a1b9a"
                  onClick={() => navigate("/monthly-data")}
                  startIcon={<AssessmentIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Monthly Data
                </QuickActionBtn>

                <QuickActionBtn
                  btncolor="#00838f"
                  onClick={() => navigate("/salary-slips")}
                  startIcon={<MonetizationOnIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Salary Slips
                </QuickActionBtn>

                <QuickActionBtn
                  btncolor="#c62828"
                  onClick={() => navigate("/help-desk")}
                  startIcon={<SupportAgentIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                >
                  Help Desk
                  {openTickets.length > 0 && (
                    <Chip
                      label={openTickets.length}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        bgcolor: "rgba(255,255,255,0.25)",
                        color: "#fff",
                        fontWeight: 700,
                        ml: "auto",
                      }}
                    />
                  )}
                </QuickActionBtn>
              </Stack>
            </CardContent>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
