import React, { useState, useEffect } from "react";
import { format, parseISO, subMonths, addMonths, isAfter, startOfMonth } from "date-fns";
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
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  useTheme,
  alpha
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  BarChart as BarChartIcon,
  ViewModule as GridIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon
} from "@mui/icons-material";
import { Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DateRange } from "@mui/icons-material";
import MaleSVG from "../../../src/assets/male_svg.svg";
import FemaleSVG from "../../../src/assets/female_svg.svg";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchCurrentEmpAttendanceAsync, fetchMonthlyAttendanceAsync } from "../../features/attendance/attendanceSlice";



const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


// Enhanced styled components with refined color palette
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
    case "Leave":
      color = theme.palette.info.dark;
      bgColor = alpha(theme.palette.info.main, 0.12);
      borderColor = alpha(theme.palette.info.main, 0.3);
      break;
    case "Weekend":
      color = theme.palette.text.secondary;
      bgColor = alpha(theme.palette.grey[500], 0.12);
      borderColor = alpha(theme.palette.grey[500], 0.3);
      break;
    default:
      color = theme.palette.grey[700];
      bgColor = theme.palette.grey[100];
      borderColor = theme.palette.grey[300];
  }

  return {
    backgroundColor: bgColor,
    color: color,
    fontWeight: 600,
    border: `1px solid ${borderColor}`,
    '& .MuiChip-icon': {
      color: color
    }
  };
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  color: theme.palette.primary.contrastText,
  width: theme.spacing(5),
  height: theme.spacing(5),
  fontWeight: 600,
  boxShadow: theme.shadows[2]
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4]
    }
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
    case "Leave":
      bgColor = alpha(theme.palette.info.main, 0.12);
      textColor = theme.palette.info.dark;
      borderColor = alpha(theme.palette.info.main, 0.3);
      break;
    case "Weekend":
      bgColor = alpha(theme.palette.grey[400], 0.15);
      textColor = theme.palette.text.secondary;
      borderColor = alpha(theme.palette.grey[400], 0.3);
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
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: theme.spacing(8),
    justifyContent: 'center',
    transition: '200ms ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows[2],
      transform: 'scale(1.03)'
    }
  };
});

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '0.875rem'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    cursor: 'pointer'
  },
}));

const MonthlyAttendance = () => {
  const dispatch = useDispatch();

  const {
    monthlyAttendanceData,
    totalWorkingDays,
    monthlyLoading: loading,
    monthlyError: error
  } = useSelector((state) => state.attendances);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expanded, setExpanded] = useState(true);
  const [downloadError, setDownloadError] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const theme = useTheme();
  const [zoomImage, setZoomImage] = useState({
    open: false,
    image: null,
    name: "",
  });

  const formattedMonth = format(currentDate, "MMMM yyyy");
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };




  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLocalLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = format(new Date(), 'yyyy-MM-dd');

        // DISPATCH Redux action instead of direct API call
        const monthlyResponse = await dispatch(
          fetchMonthlyAttendanceAsync({ year, month })
        ).unwrap();

        // Fetch current day attendance data (for images and additional fields)
        const currentDayResponse = await dispatch(
          fetchCurrentEmpAttendanceAsync({ date: today, isInitialFetch: true })
        ).unwrap();

        // Merge the two datasets
        const employeesData = monthlyResponse.employees || [];
        const mergedData = employeesData.map(monthlyEmployee => {
          const currentEmployee = currentDayResponse.find(
            curr => curr.employeeId === monthlyEmployee.employeeId
          );
          return {
            ...monthlyEmployee,
            todayClockInSelfie: currentEmployee?.attendance?.todayClockInSelfie || null,
            image: currentEmployee?.image || null,
            gender: currentEmployee?.gender || null,
            position: currentEmployee?.position || "N/A",
            todayClockIn: currentEmployee?.attendance?.todayClockIn || null,
            todayClockOut: currentEmployee?.attendance?.todayClockOut || null,
            leaveRequest: currentEmployee?.leaveRequest || null
          };
        });

        setAttendanceData(mergedData);
        setLocalLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setLocalLoading(false);
      }
    };

    fetchAttendanceData();
  }, [currentDate, dispatch]);

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    const today = new Date();
    if (!isAfter(startOfMonth(nextMonth), startOfMonth(today))) {
      setCurrentDate(nextMonth);
    }
  };

  const isNextMonthDisabled = () => {
    const nextMonth = addMonths(currentDate, 1);
    const today = new Date();
    return isAfter(startOfMonth(nextMonth), startOfMonth(today));
  };




  const handleDownloadExcel = () => {
    try {
      const data = [
        // Header row
        ["Name", "Email", "Present Days", "Absent Days", "Leaves Taken"],
        // Data rows
        ...attendanceData.map((employee) => [
          employee.name || "N/A",
          employee.email || "N/A",
          employee.daysPresent?.toString() || "0",
          employee.daysAbsent?.toString() || "0",
          employee.leavesTaken?.toString() || "0",
        ]),
      ];

      // Create the worksheet with title, total working days, and table data
      const ws = XLSX.utils.aoa_to_sheet([
        [`Monthly Attendance Report - ${formattedMonth}`],
        [], // Empty row for spacing
        [`Total Working Days: ${totalWorkingDays}`],
        [], // Empty row for spacing
        ...data,
      ]);

      // Ensure cells exist before applying styles (fix for styling issues)
      if (!ws["A1"]) ws["A1"] = { v: `Monthly Attendance Report - ${formattedMonth}` };
      if (!ws["A3"]) ws["A3"] = { v: `Total Working Days: ${totalWorkingDays}` };

      // Style the title (Monthly Attendance Report)
      ws["A1"].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Style the total working days
      ws["A3"].s = {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Style the table headers (bold) - Headers are in row 5 (index 4 in zero-based indexing)
      const headerRowIndex = 4; // Row 5 (A5 to E5)
      const columns = ["A", "B", "C", "D", "E"];
      columns.forEach((col, index) => {
        const cellAddress = `${col}${headerRowIndex + 1}`; // e.g., A5, B5, etc.
        if (!ws[cellAddress]) ws[cellAddress] = { v: data[0][index] }; // Ensure cell exists
        ws[cellAddress].s = {
          font: { bold: true, sz: 12 },
          alignment: { horizontal: "center", vertical: "center" },
        };
      });

      // Set column widths for better readability
      ws["!cols"] = [
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Present Days
        { wch: 15 }, // Absent Days
        { wch: 15 }, // Leaves Taken
      ];

      // Merge cells for the title and total working days
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge A1 to E1 for title
        { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Merge A3 to E3 for total working days
      ];

      // Debug: Log the worksheet to verify data and styles
      console.log("Worksheet:", ws);

      // Create a workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Generate the Excel file and trigger download
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `Attendance_Report_${formattedMonth}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel document:", error);
      setDownloadError("Failed to generate the report. Please try again.");
    }
  };

  {
    downloadError && (
      <Alert
        severity="error"
        sx={{
          m: 2,
          boxShadow: theme.shadows[3],
          borderRadius: 1
        }}
        onClose={() => setDownloadError(null)}
      >
        {downloadError}
      </Alert>
    )
  }

  if (loading || localLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
          gap: 2
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body1" color="text.secondary">
          Loading attendance records...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          m: 2,
          boxShadow: theme.shadows[3],
          borderRadius: 1
        }}
      >
        Error loading attendance data: {error}
      </Alert>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircleIcon fontSize="small" />;
      case "Absent":
        return <CancelIcon fontSize="small" />;
      case "Leave":
        return <EventAvailableIcon fontSize="small" />;
      case "Weekend":
        return <CalendarIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header with Month Navigation */}
        {!loading && !localLoading && !error && attendanceData.length > 0 && (
          <>
            <HeaderCard>
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap' }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
                      <DateRange sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h5" fontWeight={700} color="#2563eb">
                        Monthly Attendance
                      </Typography>
                      <Typography variant="body2" color="#6b7280">
                        View and download monthly attendance reports
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mt: { xs: 2, sm: 0 } }}>
                    <Button
                      onClick={goToPreviousMonth}
                      startIcon={<PrevIcon />}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 1.5 }}
                    >
                      Prev
                    </Button>

                    <Typography
                      variant="h6"
                      sx={{
                        mx: 2,
                        fontWeight: 600,
                        color: "#2563eb",
                      }}
                    >
                      {formattedMonth}
                    </Typography>

                    <Button
                      onClick={goToNextMonth}
                      endIcon={<NextIcon />}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 1.5 }}
                      disabled={isNextMonthDisabled()}
                    >
                      Next
                    </Button>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

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
                mb: { xs: 2, sm: 0 },
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: "15px",
                textAlign: "center",
              }}
            >
              Total Working Days : {totalWorkingDays}
            </Typography>

            <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 2, overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Present</TableCell>
                      <TableCell align="center">Absent</TableCell>
                      <TableCell align="center">Leaves</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {attendanceData.map((employee) => (
                      <StyledTableRow
                        key={employee.employeeId}
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {employee.attendance?.todayClockInSelfie ? (
                              <Avatar
                                src={employee.attendance.todayClockInSelfie}
                                sx={{ cursor: "pointer", width: 40, height: 40 }}
                                onClick={() => setZoomImage({ open: true, image: employee.attendance.todayClockInSelfie, name: employee.employeeName })}
                              />
                            ) : employee.image ? (
                              <Avatar sx={{ width: 40, height: 40 }} src={`${employee.image}`} />
                            ) : (
                              <Avatar
                                sx={{ width: 40, height: 40 }}
                                src={employee.gender === "male" ? MaleSVG : employee.gender === "female" ? FemaleSVG : undefined}
                              >
                                {!employee.gender && employee.employeeName?.charAt(0).toUpperCase()}
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
                        <TableCell sx={{ color: 'text.secondary' }}>{employee.email}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minWidth: '40px',
                              height: '28px',
                              borderRadius: '14px',
                              color: '#2e7d32',
                              fontWeight: 600,
                              fontSize: '0.975rem',
                              background: 'transparent',
                            }}
                          >
                            {employee.daysPresent}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minWidth: '40px',
                              height: '28px',
                              borderRadius: '14px',
                              color: '#c62828',
                              fontWeight: 600,
                              fontSize: '0.975rem',
                              background: 'transparent',
                            }}
                          >
                            {employee.daysAbsent}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minWidth: '40px',
                              height: '28px',
                              color: '#0277bd',
                              fontWeight: 600,
                              fontSize: '0.975rem',
                              background: 'transparent',
                            }}
                          >
                            {employee.leavesTaken}
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </>
        )}


        {/* Attendance Detail Dialog */}
        <Dialog
          open={!!selectedEmployee}
          onClose={closeModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: theme.shadows[10]
            }
          }}
        >
          {selectedEmployee && (
            <>
              <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StyledAvatar sx={{ mr: 2 }}>
                      {selectedEmployee.name.charAt(0)}
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{selectedEmployee.name}'s Attendance</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEmployee.email}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={closeModal}
                    size="large"
                    sx={{
                      color: theme.palette.grey[500],
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.grey[500], 0.1)
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 3 }}>
                {/* Summary Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <StyledStatCard colorType="present">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.daysPresent}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={500}>
                          Present Days
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StyledStatCard colorType="absent">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.daysAbsent}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                        <CancelIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={500}>
                          Absent Days
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StyledStatCard colorType="leave">
                      <Typography variant="h3" fontWeight="bold">
                        {selectedEmployee.leavesTaken}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                        <EventAvailableIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={500}>
                          Leave Days
                        </Typography>
                      </Box>
                    </StyledStatCard>
                  </Grid>
                </Grid>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={handleExpandClick}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }} >
                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Detailed Attendance for {formattedMonth}
                  </div>
                  <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                  >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Typography>

                <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <TableContainer>
                      <Table>
                        <StyledTableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Day</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Leave Applied</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {selectedEmployee.attendance.map((day) => (
                            <TableRow key={day.date} sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04)
                              }
                            }}>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {format(parseISO(day.date), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell sx={{ color: 'text.secondary' }}>{day.day}</TableCell>
                              <TableCell align="center">
                                <StatusChip
                                  label={day.status}
                                  status={day.status}
                                  size="small"
                                  icon={getStatusIcon(day.status)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={day.leaveApplied ? "Yes" : "No"}
                                  size="small"
                                  variant={day.leaveApplied ? "filled" : "outlined"}
                                  color={day.leaveApplied ? "primary" : "default"}
                                  sx={{ minWidth: '60px' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Collapse>
                </Card>

                {/* Calendar View */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Calendar View
                </Typography>

                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                      mb: 2
                    }}
                  >
                    {/* Weekday headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <Box
                        key={day}
                        sx={{
                          p: 1,
                          textAlign: "center",
                          fontWeight: 600,
                          color: day === "Sun" || day === "Sat" ? theme.palette.error.main : theme.palette.text.secondary
                        }}
                      >
                        {day}
                      </Box>
                    ))}

                    {/* Calendar days */}
                    {selectedEmployee.attendance.map((day) => {
                      const date = parseISO(day.date);
                      const dayOfWeek = date.getDay();

                      return (
                        <CalendarDay
                          key={day.date}
                          status={day.status}
                          sx={{ gridColumn: dayOfWeek + 1 }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {format(date, "d")}
                          </Typography>
                          <Typography variant="caption" sx={{ mt: 0.5 }}>
                            {day.status}
                          </Typography>
                        </CalendarDay>
                      );
                    })}
                  </Box>
                </Card>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={closeModal}
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 1.5,
                    px: 3
                  }}
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

export default MonthlyAttendance;