import React from "react";
import {
  Typography,
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { format } from "date-fns";
import parse from 'html-react-parser';

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


const safeFormat = (dateString, formatString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return "N/A";
  }
  return format(new Date(dateString), formatString);
};


const MonthlyDataView = ({
  selectedMonth,
  handleMonthChange,
  getLast12Months,
  attendanceTasks,
  loading,
  formatTime,
  formatDate,
}) => {
  const TimeDisplay = ({ timeString }) => {
    if (!timeString) return 'N/A';

    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  return (
    <Box mt={3}>
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
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

      {loading ? (
        <Box textAlign="center" p={3}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Monthly Data - {format(new Date(selectedMonth), "MMMM yyyy")}
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            color: "#1976d2",
                          }}
                        >
                          {formatDate(day.date)}
                        </Typography>
                        {day.attendance?.autoClockOut && (
                          <Chip
                            label="Auto Clock Out"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
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
                          <Typography variant="body2" color="text.secondary">
                            Clock In: {safeFormat(day.attendance?.clockInTime, "hh:mm a")}
                          </Typography>
                        </Box>
                        <Box className="info-group">
                          <AccessTimeIcon
                            sx={{
                              fontSize: 18,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Clock Out: {safeFormat(day.attendance?.clockOutTime, "hh:mm a")}
                          </Typography>
                        </Box>
                        <Box className="info-group">
                          <AssignmentIcon
                            sx={{
                              fontSize: 18,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Tasks: {day?.tasks?.length || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "#f8f9fa" }}>
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
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                              {safeFormat(day.attendance?.clockInTime, "MMM-dd-yyyy hh:mm a")}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: "#f8f9fa" }}>
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
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                              {safeFormat(day.attendance?.clockOutTime, "MMM-dd-yyyy hh:mm a")}
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
                                <Grid item xs={12} key={task.id || taskIndex}>
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
                                        {parse(task.description)}
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
                                            task.status === "Completed"
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
                                        <Typography variant="caption" color="text.secondary">
                                          Last Updated: {safeFormat(task.updatedAt, "MMM-dd-yyyy")}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                      <Grid item xs={12} sm={6}>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            Start Time
                                          </Typography>
                                          <Typography variant="body2">
                                            <TimeDisplay timeString={task.startTime} />
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
                                            <TimeDisplay timeString={task.completionTime} />
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
                                            <TimeDisplay timeString={task.pauseTime} />
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
                                            {task?.duration}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      {task.workSessions &&
                                        task.workSessions.length > 0 && (
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
                                                    key={session._id || idx}
                                                    variant="body2"
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    Session {idx + 1}:{" "}
                                                    <TimeDisplay timeString={session.startTime} /> -{" "}
                                                    <TimeDisplay timeString={session.endTime} /> (
                                                    {session.duration})
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
  );
};

export default MonthlyDataView;
