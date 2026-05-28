import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isAfter,
} from "date-fns";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  styled,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Collapse,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { DateRange } from "@mui/icons-material";
import MaleSVG from "../../../src/assets/male_svg.svg";
import FemaleSVG from "../../../src/assets/female_svg.svg";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchCurrentEmpAttendanceAsync } from "../../features/attendance/attendanceSlice";
import { fetchWeeklyAttendanceAsync } from "../../features/attendance/attendanceSlice";

// ─── Styled Components  ───────────────────────────

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color, bgColor, borderColor;
  switch (status) {
    case "Present":
      color = theme.palette.success.dark;
      bgColor = alpha(theme.palette.success.main, 0.12);
      borderColor = alpha(theme.palette.success.main, 0.3);
      break;
    case "Absent":
      color = theme.palette.error.dark;
      bgColor = alpha(theme.palette.error.main, 0.12);
      borderColor = alpha(theme.palette.error.main, 0.3);
      break;
    case "On Leave":
      color = theme.palette.info.dark;
      bgColor = alpha(theme.palette.info.main, 0.12);
      borderColor = alpha(theme.palette.info.main, 0.3);
      break;
    case "Weekend":
      color = theme.palette.text.secondary;
      bgColor = alpha(theme.palette.grey[500], 0.12);
      borderColor = alpha(theme.palette.grey[500], 0.3);
      break;
    case "Holiday":
      color = theme.palette.warning.dark;
      bgColor = alpha(theme.palette.warning.main, 0.12);
      borderColor = alpha(theme.palette.warning.main, 0.3);
      break;
    case "Half Day":
      color = "#e65100";
      bgColor = alpha("#ff9800", 0.12);
      borderColor = alpha("#ff9800", 0.3);
      break;
    case "Three Quarter Day":
      color = "#1565c0";
      bgColor = alpha("#1976d2", 0.12);
      borderColor = alpha("#1976d2", 0.3);
      break;
    case "Quarter Day":
      color = "#6a1b9a";
      bgColor = alpha("#9c27b0", 0.12);
      borderColor = alpha("#9c27b0", 0.3);
      break;
    case "Clocked In":
      color = "#1565c0";
      bgColor = alpha("#1976d2", 0.12);
      borderColor = alpha("#1976d2", 0.3);
      break;
    default:
      color = theme.palette.grey[700];
      bgColor = theme.palette.grey[100];
      borderColor = theme.palette.grey[300];
  }
  return {
    backgroundColor: bgColor,
    color,
    fontWeight: 600,
    border: `1px solid ${borderColor}`,
    "& .MuiChip-icon": { color },
  };
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  color: theme.palette.primary.contrastText,
  width: theme.spacing(5),
  height: theme.spacing(5),
  fontWeight: 600,
  boxShadow: theme.shadows[2],
}));

const StyledStatCard = styled(Paper)(({ theme, colorType }) => {
  let mainColor, textColor, borderColor;
  switch (colorType) {
    case "present":
      mainColor = alpha(theme.palette.success.main, 0.15);
      textColor = theme.palette.success.dark;
      borderColor = alpha(theme.palette.success.main, 0.3);
      break;
    case "absent":
      mainColor = alpha(theme.palette.error.main, 0.15);
      textColor = theme.palette.error.dark;
      borderColor = alpha(theme.palette.error.main, 0.3);
      break;
    case "leave":
      mainColor = alpha(theme.palette.info.main, 0.15);
      textColor = theme.palette.info.dark;
      borderColor = alpha(theme.palette.info.main, 0.3);
      break;
    default:
      mainColor = theme.palette.background.paper;
      textColor = theme.palette.text.primary;
      borderColor = theme.palette.divider;
  }
  return {
    backgroundColor: mainColor,
    color: textColor,
    borderTop: `3px solid ${borderColor}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2.5),
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    transition: "transform 0.2s ease-in-out",
    "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[4] },
  };
});

const CalendarDay = styled(Box)(({ theme, status }) => {
  let bgColor, textColor, borderColor;
  switch (status) {
    case "Present":
      bgColor = alpha(theme.palette.success.main, 0.12);
      textColor = theme.palette.success.dark;
      borderColor = alpha(theme.palette.success.main, 0.3);
      break;
    case "Absent":
      bgColor = alpha(theme.palette.error.main, 0.12);
      textColor = theme.palette.error.dark;
      borderColor = alpha(theme.palette.error.main, 0.3);
      break;
    case "On Leave":
      bgColor = alpha(theme.palette.info.main, 0.12);
      textColor = theme.palette.info.dark;
      borderColor = alpha(theme.palette.info.main, 0.3);
      break;
    case "Weekend":
      bgColor = alpha(theme.palette.grey[400], 0.15);
      textColor = theme.palette.text.secondary;
      borderColor = alpha(theme.palette.grey[400], 0.3);
      break;
    case "Holiday":
      bgColor = alpha(theme.palette.warning.main, 0.12);
      textColor = theme.palette.warning.dark;
      borderColor = alpha(theme.palette.warning.main, 0.3);
      break;
    case "Half Day":
      bgColor = alpha("#ff9800", 0.12);
      textColor = "#e65100";
      borderColor = alpha("#ff9800", 0.3);
      break;
    case "Three Quarter Day":
      bgColor = alpha("#1976d2", 0.12);
      textColor = "#1565c0";
      borderColor = alpha("#1976d2", 0.3);
      break;
    case "Quarter Day":
      bgColor = alpha("#9c27b0", 0.12);
      textColor = "#6a1b9a";
      borderColor = alpha("#9c27b0", 0.3);
      break;
    case "Upcoming":
      bgColor = alpha(theme.palette.grey[300], 0.2);
      textColor = theme.palette.text.disabled;
      borderColor = alpha(theme.palette.grey[300], 0.4);
      break;
    case "Clocked In":
      bgColor = alpha("#1976d2", 0.12);
      textColor = "#1565c0";
      borderColor = alpha("#1976d2", 0.3);
      break;
    default:
      bgColor = theme.palette.background.paper;
      textColor = theme.palette.text.primary;
      borderColor = theme.palette.divider;
  }
  return {
    backgroundColor: bgColor,
    color: textColor,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${borderColor}`,
    padding: theme.spacing(1),
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: theme.spacing(8),
    justifyContent: "center",
    transition: "200ms ease-in-out",
    "&:hover": { boxShadow: theme.shadows[2], transform: "scale(1.03)" },
  };
});

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: "0.875rem",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.02)
        : alpha(theme.palette.common.black, 0.02),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    cursor: "pointer",
  },
}));

// ─── Component ───────────────────────────────────────────────────────────────

const WeeklyAttendance = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const {
    weeklyAttendanceData,
    totalWeekWorkingDays,
    weeklyLoading: loading,
    weeklyError: error,
  } = useSelector((state) => state.attendances);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [localLoading, setLocalLoading] = useState(true);
  const [downloadError, setDownloadError] = useState(null);

  // Week navigation — store current week's Monday as a Date
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const thisWeekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const isCurrentWeek = currentWeekStart.getTime() === thisWeekStart.getTime();
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

  const weekLabel = `${format(currentWeekStart, "dd MMM")} – ${format(currentWeekEnd, "dd MMM yyyy")}`;
  const weekNavLabel = isCurrentWeek
    ? "Current Week"
    : format(currentWeekStart, "dd MMM yyyy");

  // ── Fetch on week change ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLocalLoading(true);

        const weekParam = `${currentWeekStart.getFullYear()}-${String(
          currentWeekStart.getMonth() + 1,
        ).padStart(2, "0")}-${String(currentWeekStart.getDate()).padStart(
          2,
          "0",
        )}`;

        await dispatch(
          fetchWeeklyAttendanceAsync({ week: weekParam }),
        ).unwrap();

        setLocalLoading(false);
      } catch (err) {
        console.error("Weekly API Error:", err);
        setLocalLoading(false);
      }
    };

    fetchData();
  }, [currentWeekStart, dispatch]);

  const attendanceData = weeklyAttendanceData;

  // ── Week navigation ──
  const goToPrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const goToNextWeek = () => {
    if (!isCurrentWeek) {
      setCurrentWeekStart((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  };

  // ── Helpers ──
  const formatHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const isFutureDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircleIcon fontSize="small" />;
      case "Absent":
        return <CancelIcon fontSize="small" />;
      case "On Leave":
        return <EventAvailableIcon fontSize="small" />;
      case "Weekend":
        return <CalendarIcon fontSize="small" />;
      case "Holiday":
        return <EventAvailableIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

const handleDownloadExcel = () => {
  try {

    const excelRows = [];

    // ===== REPORT HEADER =====

    excelRows.push([
      `Weekly Attendance Report - ${weekLabel}`
    ]);

    excelRows.push([]);

    excelRows.push([
      `Total Working Days : ${totalWeekWorkingDays}`
    ]);

    excelRows.push([]);

    // ===== WEEKLY SUMMARY =====

    excelRows.push([
      "Employee Name",
      "Email",
      "Present",
      "Absent",
      "Leaves",
      "Weekly Hours",
      "Extra Hours",
      "Deficit Hours",
    ]);

    attendanceData.forEach((emp) => {

      excelRows.push([

        emp.name || "N/A",

        emp.email || "N/A",

        emp.daysPresent || 0,

        emp.daysAbsent || 0,

        emp.leavesTaken || 0,

        emp.totalWorkedHours > 0
          ? formatHoursMinutes(
              emp.totalWorkedHours
            )
          : "—",

        emp.extraHours > 0
          ? formatHoursMinutes(
              emp.extraHours
            )
          : "—",

        emp.deficitHours > 0
          ? formatHoursMinutes(
              emp.deficitHours
            )
          : "—",

      ]);

    });

    excelRows.push([]);
    excelRows.push([]);

    // ===== DATE WISE TITLE =====

    const dateWiseTitleRow =
      excelRows.length;

    excelRows.push([
      "DATE WISE ATTENDANCE"
    ]);

    excelRows.push([]);

    // ===== GROUP DATA DATE WISE =====

    const groupedData = {};

    attendanceData.forEach((emp) => {

      emp.attendance?.forEach((day) => {

        if (!groupedData[day.date]) {
          groupedData[day.date] = [];
        }

        groupedData[day.date].push({

          employeeName:
            emp.name || "N/A",

          email:
            emp.email || "N/A",

          clockIn:
            day.clockIn
              ? format(
                  new Date(
                    day.clockIn
                  ),
                  "hh:mm a"
                )
              : "—",

          clockOut:
            day.clockOut
              ? format(
                  new Date(
                    day.clockOut
                  ),
                  "hh:mm a"
                )
              : "—",

          workingHours:
            day.hoursWorked > 0
              ? formatHoursMinutes(
                  day.hoursWorked
                )
              : "—",

          status:
            day.status || "—",

        });

      });

    });

    Object.keys(groupedData)
      .sort()
      .forEach((date) => {

        excelRows.push([
          `Date : ${date}`
        ]);

        excelRows.push([
          "Employee Name",
          "Email",
          "Clock In",
          "Clock Out",
          "Working Hours",
          "Status",
        ]);

        groupedData[date]
          .forEach((emp) => {

            excelRows.push([

              emp.employeeName,

              emp.email,

              emp.clockIn,

              emp.clockOut,

              emp.workingHours,

              emp.status,

            ]);

          });

        excelRows.push([]);

      });

    // ===== CREATE SHEET =====

    const ws =
      XLSX.utils.aoa_to_sheet(
        excelRows
      );

    ws["!cols"] = [

      { wch: 25 },

      { wch: 32 },

      { wch: 14 },

      { wch: 14 },

      { wch: 15 },

      { wch: 18 },

      { wch: 15 },

      { wch: 15 },

    ];

    ws["!merges"] = [

      // Report title
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 7 },
      },

      // Total days
      {
        s: { r: 2, c: 0 },
        e: { r: 2, c: 7 },
      },

      // Date wise title
      {
        s: {
          r: dateWiseTitleRow,
          c: 0
        },
        e: {
          r: dateWiseTitleRow,
          c: 5
        },
      },

    ];

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Weekly Attendance"
    );

    const buffer =
      XLSX.write(
        wb,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

    saveAs(

      new Blob(
        [buffer],
        {
          type:
            "application/octet-stream",
        }
      ),

      `Weekly_Attendance_${weekLabel}.xlsx`

    );

  } catch (err) {

    console.error(
      "Excel error:",
      err
    );

    setDownloadError(
      "Failed to generate report. Please try again."
    );

  }
};

  if (loading || localLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body1" color="text.secondary">
          Loading weekly attendance...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading attendance data: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* ── Header ── */}
        <HeaderCard>
          <CardContent sx={{ py: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DateRange sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="#2563eb">
                    Weekly Attendance
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    View and download weekly attendance reports
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {/* ── Week Navigator ── */}
                <Button
                  onClick={goToPrevWeek}
                  startIcon={<PrevIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                >
                  Prev
                </Button>

                <Box sx={{ textAlign: "center", mx: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {isCurrentWeek ? "Current Week" : ""}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="#2563eb"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {weekLabel}
                  </Typography>
                </Box>

                <Button
                  onClick={goToNextWeek}
                  endIcon={<NextIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                  disabled={isCurrentWeek}
                >
                  Next
                </Button>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Button
                  onClick={handleDownloadExcel}
                  startIcon={<BarChartIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                >
                  Download Report
                </Button>
              </Box>
            </Box>
          </CardContent>
        </HeaderCard>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: theme.palette.primary.main,
            textAlign: "center",
          }}
        >
          Total Working Days: {totalWeekWorkingDays}
        </Typography>

        {/* ── Employee Table ── */}
        <Card
          sx={{
            mb: 4,
            boxShadow: theme.shadows[3],
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell align="center">Leaves</TableCell>
                  <TableCell align="center">Total Hours</TableCell>
                  <TableCell align="center">Extra Hours</TableCell>
                  <TableCell align="center">Deficit Hours</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {attendanceData.map((employee) => (
                  <StyledTableRow
                    key={employee.employeeId}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {employee.image ? (
                          <Avatar
                            sx={{ width: 40, height: 40 }}
                            src={employee.image}
                          />
                        ) : (
                          <Avatar
                            sx={{ width: 40, height: 40 }}
                            src={
                              employee.gender === "male"
                                ? MaleSVG
                                : employee.gender === "female"
                                  ? FemaleSVG
                                  : undefined
                            }
                          >
                            {!employee.gender &&
                              employee.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, ml: 1.5 }}
                        >
                          {employee.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {employee.email}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ color: "#2e7d32", fontWeight: 600 }}>
                        {employee.daysPresent}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ color: "#c62828", fontWeight: 600 }}>
                        {employee.daysAbsent}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ color: "#0277bd", fontWeight: 600 }}>
                        {employee.leavesTaken}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        {employee.totalWorkedHours > 0
                          ? formatHoursMinutes(employee.totalWorkedHours)
                          : "—"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color:
                            employee.extraHours > 0 ? "#2e7d32" : "#9e9e9e",
                          fontWeight: 600,
                        }}
                      >
                        {employee.extraHours > 0 && (
                          <TrendingUpIcon sx={{ fontSize: 16 }} />
                        )}
                        {employee.extraHours > 0
                          ? formatHoursMinutes(employee.extraHours)
                          : "—"}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color:
                            employee.deficitHours > 0 ? "#c62828" : "#9e9e9e",
                          fontWeight: 600,
                        }}
                      >
                        {employee.deficitHours > 0 && (
                          <TrendingDownIcon sx={{ fontSize: 16 }} />
                        )}
                        {employee.deficitHours > 0
                          ? formatHoursMinutes(employee.deficitHours)
                          : "—"}
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {attendanceData.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              gap: 2,
            }}
          >
            <CalendarIcon sx={{ fontSize: 64, color: "#d1d5db" }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              No Attendance Data Found
            </Typography>
            <Typography variant="body2" color="#9ca3af">
              No records for this week.
            </Typography>
          </Box>
        )}

        {/* ── Employee Detail Dialog ── */}
        <Dialog
          open={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selectedEmployee && (
            <>
              <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StyledAvatar sx={{ mr: 2 }}>
                      {selectedEmployee.name.charAt(0)}
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedEmployee.name}'s Weekly Attendance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEmployee.email} · {weekLabel}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setSelectedEmployee(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>

              <DialogContent dividers sx={{ p: 3 }}>
                {/* ── Summary Stats ── */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <StyledStatCard colorType="present">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.daysPresent}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 1,
                        }}
                      >
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight={500}>
                          Present
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StyledStatCard colorType="absent">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.daysAbsent}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 1,
                        }}
                      >
                        <CancelIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight={500}>
                          Absent
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StyledStatCard colorType="leave">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.leavesTaken}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 1,
                        }}
                      >
                        <EventAvailableIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight={500}>
                          Leaves
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        textAlign: "center",
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderTop: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {formatHoursMinutes(
                          selectedEmployee.totalWorkedHours || 0,
                        )}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 1,
                        }}
                      >
                        <AccessTimeIcon
                          sx={{ mr: 1, color: theme.palette.primary.main }}
                        />
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color="primary.main"
                        >
                          Total Hours
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  {selectedEmployee.extraHours > 0 && (
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          textAlign: "center",
                          borderRadius: 1,
                          bgcolor: alpha("#2e7d32", 0.08),
                          borderTop: `3px solid ${alpha("#2e7d32", 0.4)}`,
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="#2e7d32"
                        >
                          {formatHoursMinutes(selectedEmployee.extraHours)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: 1,
                          }}
                        >
                          <TrendingUpIcon sx={{ mr: 1, color: "#2e7d32" }} />
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            color="#2e7d32"
                          >
                            Extra Hours
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  {selectedEmployee.deficitHours > 0 && (
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          textAlign: "center",
                          borderRadius: 1,
                          bgcolor: alpha("#c62828", 0.08),
                          borderTop: `3px solid ${alpha("#c62828", 0.4)}`,
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="#c62828"
                        >
                          {formatHoursMinutes(selectedEmployee.deficitHours)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: 1,
                          }}
                        >
                          <TrendingDownIcon sx={{ mr: 1, color: "#c62828" }} />
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            color="#c62828"
                          >
                            Deficit Hours
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* ── Detailed Table ── */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PersonIcon
                      sx={{ mr: 1, color: theme.palette.primary.main }}
                    />
                    Day-by-Day Breakdown
                  </Box>
                  <IconButton>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Typography>

                <Card
                  variant="outlined"
                  sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}
                >
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <TableContainer>
                      <Table>
                        <StyledTableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Day</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Clock In</TableCell>
                            <TableCell align="center">Clock Out</TableCell>
                            <TableCell align="center">Hours</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {selectedEmployee.attendance
                            .filter((day) => !isFutureDate(day.date))
                            .map((day) => (
                              <TableRow
                                key={day.date}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.04,
                                    ),
                                  },
                                }}
                              >
                                <TableCell sx={{ fontWeight: 500 }}>
                                  {format(parseISO(day.date), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell sx={{ color: "text.secondary" }}>
                                  {day.day}
                                </TableCell>
                                <TableCell align="center">
                                  <StatusChip
                                    label={day.status}
                                    status={day.status}
                                    size="small"
                                    icon={getStatusIcon(day.status)}
                                  />
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  {day.clockIn
                                    ? format(new Date(day.clockIn), "hh:mm a")
                                    : "—"}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  {day.clockOut
                                    ? format(new Date(day.clockOut), "hh:mm a")
                                    : "—"}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: 600,
                                    color:
                                      day.hoursWorked > 0
                                        ? "#2e7d32"
                                        : "#9e9e9e",
                                  }}
                                >
                                  {day.hoursWorked > 0
                                    ? formatHoursMinutes(day.hoursWorked)
                                    : "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Collapse>
                </Card>

                {/* ── Week Calendar View ── */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CalendarIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  Week View
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                    }}
                  >
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (d) => (
                        <Box
                          key={d}
                          sx={{
                            p: 1,
                            textAlign: "center",
                            fontWeight: 600,
                            color:
                              d === "Sat" || d === "Sun"
                                ? theme.palette.error.main
                                : theme.palette.text.secondary,
                          }}
                        >
                          {d}
                        </Box>
                      ),
                    )}
                    {selectedEmployee.attendance.map((day) => (
                      <CalendarDay
                        key={day.date}
                        status={
                          isFutureDate(day.date) && day.status !== "Weekend"
                            ? "Upcoming"
                            : day.status
                        }
                      >
                        <Typography variant="body1" fontWeight="bold">
                          {format(parseISO(day.date), "d")}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            fontSize: "0.65rem",
                            textAlign: "center",
                          }}
                        >
                          {isFutureDate(day.date) && day.status !== "Weekend"
                            ? "Upcoming"
                            : day.status}
                        </Typography>
                        {(!isFutureDate(day.date) ||
                          day.status === "Weekend") &&
                          day.hoursWorked > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.65rem", fontWeight: 600 }}
                            >
                              {formatHoursMinutes(day.hoursWorked)}
                            </Typography>
                          )}
                      </CalendarDay>
                    ))}
                  </Box>
                </Card>
              </DialogContent>

              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={() => setSelectedEmployee(null)}
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 1.5, px: 3 }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default WeeklyAttendance;
