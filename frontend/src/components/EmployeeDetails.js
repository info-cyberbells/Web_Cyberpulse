import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { Person as PersonIcon } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchAttendanceTasksAsync } from "../features/attendance/attendanceSlice";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { format } from "date-fns";
import MonthlyDataView from "./MonthlyDataView";

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: "8px 0",
  borderRadius: "8px !important",
  border: "1px solid #e0e0e0",
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    padding: theme.spacing(1, 3),
    "& .MuiAccordionSummary-expandIconWrapper": {
      transform: "rotate(0deg)",
      transition: "transform 0.2s ease",
      "&.Mui-expanded": {
        transform: "rotate(135deg)",
      },
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: theme.spacing(2, 3, 3),
    borderTop: "1px solid #e0e0e0",
  },
}));

const EmployeeDetails = ({ open, onClose, employee }) => {
  const dispatch = useDispatch();
  const [showMonthlyData, setShowMonthlyData] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  const { attendanceTasks, loading } = useSelector(
    (state) => state.attendances
  );

  const getLast12Months = () => {
    const months = [];
    const today = new Date();
    // Get the first day of the current month
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get the first month (11 months ago)
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    // Generate months from start date to current month
    let currentDate = new Date(startDate);

    while (currentDate <= currentMonth) {
      months.push({
        value: format(currentDate, "yyyy-MM"),
        label: format(currentDate, "MMMM yyyy"),
      });
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }

    return months;
  };

  useEffect(() => {
    if (employee?._id && showMonthlyData) {
      const [year, month] = selectedMonth.split("-");
      const date = new Date(year, month - 1, 2).toISOString().split("T")[0];
      dispatch(
        fetchAttendanceTasksAsync({
          date: date,
          employeeId: employee._id,
        })
      );
    }
  }, [dispatch, employee?._id, showMonthlyData, selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString || isNaN(new Date(timeString).getTime())) {
      return "N/A";
    }
    return new Date(timeString).toLocaleTimeString(
      "en-US",
      TIME_FORMAT_OPTIONS
    );
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return format(new Date(dateString), "MMM-dd-yyyy");
  };
  const TIME_FORMAT_OPTIONS = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            borderBottom: "2px solid #e0e0e0",
            pb: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#1976d2",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PersonIcon sx={{ fontSize: 28 }} />
            Employee Details
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {employee ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="primary">
                  Personal Information
                </Typography>
                <Box mt={2}>
                  <Typography>
                    <strong>Name:</strong> {employee.name || "Not available"}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {employee.email || "Not available"}
                  </Typography>
                  <Typography>
                    <strong>Position:</strong>{" "}
                    {employee.position || "Not available"}
                  </Typography>
                  <Typography>
                    <strong>Department:</strong>{" "}
                    {employee.department || "Not available"}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {employee.phone || "Not available"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="primary">
                  Work Information
                </Typography>
                <Box mt={2}>
                  <Typography>
                    <strong>Job Role:</strong>{" "}
                    {employee.jobRole || "Not available"}
                  </Typography>
                  <Typography>
                    <strong>Joining Date:</strong>{" "}
                    {formatDate(employee.joiningDate)}
                  </Typography>
                  <Typography>
                    <strong>Date Of Birth:</strong> {formatDate(employee.dob)}
                  </Typography>
                  <Typography>
                    <strong>Location:</strong>{" "}
                    {employee.city && employee.state
                      ? `${employee.city}, ${employee.state}`
                      : "Not available"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mt={4} display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowMonthlyData(!showMonthlyData)}
              >
                {showMonthlyData ? "Hide Monthly Data" : "View Monthly Data"}
              </Button>
            </Box>

            {/* Monthly Data View Component */}
            {showMonthlyData && (
              <MonthlyDataView
                selectedMonth={selectedMonth}
                handleMonthChange={handleMonthChange}
                getLast12Months={getLast12Months}
                attendanceTasks={attendanceTasks}
                loading={loading}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            )}
          </>
        ) : (
          <Box textAlign="center" p={2}>
            <Typography color="textSecondary">
              No employee data available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetails;
