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

              {showMonthlyData && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    label="Select Month"
                  >
                    {getLast12Months().map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {showMonthlyData && (
              <Box mt={3}>
                {loading ? (
                  <Box textAlign="center" p={3}>
                    <Typography>Loading...</Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Monthly Data -{" "}
                      {format(new Date(selectedMonth), "MMMM yyyy")}
                    </Typography>
                    {attendanceTasks?.data?.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        {attendanceTasks.data.map((day, index) => (
                          <StyledAccordion key={day.date || index}>
                            <AccordionSummary
                              expandIcon={<AddIcon />}
                              aria-controls={`panel${index}-content`}
                              id={`panel${index}-header`}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mr: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    color: "#1976d2",
                                  }}
                                >
                                  {formatDate(day.date)}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    "& .info-group": {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    },
                                  }}
                                >
                                  <Box className="info-group">
                                    <AccessTimeIcon
                                      sx={{
                                        fontSize: 18,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Clock In:{" "}
                                      {format(
                                        new Date(
                                          day.attendance?.clockInTime ||
                                            new Date()
                                        ),
                                        "hh:mm a"
                                      )}
                                    </Typography>
                                  </Box>
                                  <Box className="info-group">
                                    <AccessTimeIcon
                                      sx={{
                                        fontSize: 18,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Clock Out:{" "}
                                      {day.attendance?.clockOutTime
                                        ? format(
                                            new Date(
                                              day.attendance.clockOutTime
                                            ),
                                            "hh:mm a"
                                          )
                                        : "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box className="info-group">
                                    <AssignmentIcon
                                      sx={{
                                        fontSize: 18,
                                        color: "text.secondary",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Tasks: {day?.tasks?.length || 0}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Paper
                                    elevation={0}
                                    sx={{ p: 2, bgcolor: "#f8f9fa" }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="primary"
                                      gutterBottom
                                    >
                                      Clock In Details
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        mt: 1,
                                      }}
                                    >
                                      {day.attendance?.clockInSelfie ? (
                                        <Avatar
                                          src={day.attendance.clockInSelfie}
                                          alt="Clock In"
                                          sx={{
                                            width: 90,
                                            height: 90,
                                            cursor: "pointer",
                                            border: "2px solid #fff",
                                            boxShadow:
                                              "0 2px 4px rgba(0,0,0,0.1)",
                                          }}
                                          onClick={() =>
                                            window.open(
                                              day.attendance.clockInSelfie,
                                              "_blank"
                                            )
                                          }
                                        />
                                      ) : (
                                        <Box sx={{ color: "text.secondary" }}>
                                          No photo
                                        </Box>
                                      )}
                                      <Typography variant="body2">
                                        {day.attendance?.clockInTime
                                          ? format(
                                              new Date(
                                                day.attendance.clockInTime
                                              ),
                                              "MMM-dd-yyyy hh:mm a"
                                            )
                                          : "Not available"}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Paper
                                    elevation={0}
                                    sx={{ p: 2, bgcolor: "#f8f9fa" }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="primary"
                                      gutterBottom
                                    >
                                      Clock Out Details
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        mt: 1,
                                      }}
                                    >
                                      {day.attendance?.clockOutSelfie ? (
                                        <Avatar
                                          src={day.attendance.clockOutSelfie}
                                          alt="Clock Out"
                                          sx={{
                                            width: 90,
                                            height: 90,
                                            cursor: "pointer",
                                            border: "2px solid #fff",
                                            boxShadow:
                                              "0 2px 4px rgba(0,0,0,0.1)",
                                          }}
                                          onClick={() =>
                                            window.open(
                                              day.attendance.clockOutSelfie,
                                              "_blank"
                                            )
                                          }
                                        />
                                      ) : (
                                        <Box sx={{ color: "text.secondary" }}>
                                          No photo
                                        </Box>
                                      )}
                                      <Typography variant="body2">
                                        {day.attendance?.clockOutTime
                                          ? format(
                                              new Date(
                                                day.attendance.clockOutTime
                                              ),
                                              "MMM-dd-yyyy hh:mm a"
                                            )
                                          : "Not available"}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant="subtitle2"
                                      color="primary"
                                      gutterBottom
                                    >
                                      Tasks ({day?.tasks?.length || 0})
                                    </Typography>
                                    {day?.tasks?.length > 0 ? (
                                      <Grid container spacing={2}>
                                        {day.tasks.map((task, taskIndex) => (
                                          <Grid
                                            item
                                            xs={12}
                                            key={task.id || taskIndex}
                                          >
                                            <Paper
                                              elevation={0}
                                              sx={{
                                                p: 2,
                                                bgcolor: "#f8f9fa",
                                                borderLeft: "4px solid",
                                                borderColor:
                                                  task.status === "Completed"
                                                    ? "success.main"
                                                    : "warning.main",
                                              }}
                                            >
                                              <Box sx={{ mb: 2 }}>
                                                <Typography
                                                  variant="body1"
                                                  sx={{
                                                    fontWeight: 500,
                                                    mb: 1,
                                                  }}
                                                >
                                                  {task.description}
                                                </Typography>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 2,
                                                    flexWrap: "wrap",
                                                  }}
                                                >
                                                  <Chip
                                                    label={task.status}
                                                    size="small"
                                                    color={
                                                      task.status ===
                                                      "Completed"
                                                        ? "success"
                                                        : "warning"
                                                    }
                                                    sx={{
                                                      fontWeight: 500,
                                                      "& .MuiChip-label": {
                                                        px: 2,
                                                      },
                                                    }}
                                                  />
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                  >
                                                    Last Updated:{" "}
                                                    {task.updatedAt
                                                      ? format(
                                                          new Date(
                                                            task.updatedAt
                                                          ),
                                                          "MMM-dd-yyyy"
                                                        )
                                                      : "N/A"}
                                                  </Typography>
                                                </Box>
                                              </Box>

                                              <Grid
                                                container
                                                spacing={2}
                                                sx={{ mt: 1 }}
                                              >
                                                <Grid item xs={12} sm={6}>
                                                  <Box>
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                    >
                                                      Start Time
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      {formatTime(
                                                        task.startTime
                                                      )}
                                                    </Typography>
                                                  </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                  <Box>
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                    >
                                                      End Time
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      {formatTime(
                                                        task.completionTime
                                                      )}
                                                    </Typography>
                                                  </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                  <Box>
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                    >
                                                      Pause Time
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      {formatTime(
                                                        task.pauseTime
                                                      )}
                                                    </Typography>
                                                  </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                  <Box>
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                    >
                                                      Total Duration
                                                    </Typography>
                                                    <Typography variant="body2">
                                                      {typeof task.duration ===
                                                      "number"
                                                        ? `${task.duration} minutes`
                                                        : "N/A"}
                                                    </Typography>
                                                  </Box>
                                                </Grid>
                                                {task.workSessions &&
                                                  task.workSessions.length >
                                                    0 && (
                                                    <Grid item xs={12}>
                                                      <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                          display: "block",
                                                          mb: 1,
                                                        }}
                                                      >
                                                        Work Sessions
                                                      </Typography>
                                                      <Box sx={{ pl: 2 }}>
                                                        {task.workSessions.map(
                                                          (session, idx) => (
                                                            <Typography
                                                              key={
                                                                session._id ||
                                                                idx
                                                              }
                                                              variant="body2"
                                                              sx={{ mb: 0.5 }}
                                                            >
                                                              Session {idx + 1}:{" "}
                                                              {formatTime(
                                                                session.startTime
                                                              )}{" "}
                                                              -{" "}
                                                              {formatTime(
                                                                session.endTime
                                                              )}{" "}
                                                              (
                                                              {session.duration ||
                                                                0}{" "}
                                                              minutes)
                                                            </Typography>
                                                          )
                                                        )}
                                                      </Box>
                                                    </Grid>
                                                  )}
                                              </Grid>
                                            </Paper>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                      >
                                        No tasks for this day
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </StyledAccordion>
                        ))}
                      </Box>
                    ) : (
                      <Box textAlign="center" p={3}>
                        <Typography color="textSecondary">
                          No records found for this month
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
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
