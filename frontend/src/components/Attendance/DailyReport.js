import React from "react";
import { Box, Typography, Stack, Paper, Chip, Link } from "@mui/material";
import SelfieDisplay from "./SelfieDisplay";
import parse from 'html-react-parser';
import { API_BASE_URL } from "../../constants/apiConstants";

const DailyReport = ({
  clockInData,
  clockOutData,
  totalHoursWorked,
  tasks,
  clockInSelfie,
  clockOutSelfie,
  clockInAddress,
  clockInLatitude,
  clockInLongitude,
}) => {

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: "8px 16px",
      borderRadius: "4px",
      marginBottom: "8px",
    };

    switch (status?.toLowerCase()) {
      case "completed":
        return {
          ...baseStyle,
          background: "rgba(76, 175, 80, 0.1)",
          border: "1px solid #4CAF50",
        };
      case "pending":
        return {
          ...baseStyle,
          background: "rgba(237, 108, 2, 0.1)",
          border: "1px solid #ed6c02",
        };
      case "in progress":
        return {
          ...baseStyle,
          background: "rgba(25, 118, 210, 0.1)",
          border: "1px solid #1976d2",
        };
      case "paused":
        return {
          ...baseStyle,
          background: "rgba(117, 117, 117, 0.1)",
          border: "1px solid #757575",
        };
      default:
        return {
          ...baseStyle,
          background: "#f5f5f5",
          border: "1px solid #ddd",
        };
    }
  };

  const getChipStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          backgroundColor: "#4CAF50",
          color: "#fff",
        };
      case "pending":
        return {
          backgroundColor: "#ed6c02",
          color: "#fff",
        };
      case "in progress":
        return {
          backgroundColor: "#1976d2",
          color: "#fff",
        };
      case "paused":
        return {
          backgroundColor: "#757575",
          color: "#fff",
        };
      default:
        return {
          backgroundColor: "#f5f5f5",
          color: "rgba(0, 0, 0, 0.87)",
        };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Time Summary
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Clock In Time
            </Typography>
            <Typography variant="body1">
              {formatDateTime(clockInData?.clockInTime)}
            </Typography>
            {clockInAddress && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                📍 {clockInAddress}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Clock Out Time
            </Typography>
            <Typography variant="body1">
              {formatDateTime(clockOutData?.clockOutTime)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Hours
            </Typography>
            <Typography variant="body1">
              {(() => {
                const hours = Math.floor(totalHoursWorked);
                const minutes = Math.round((totalHoursWorked - hours) * 60);
                return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
              })()}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <SelfieDisplay
          clockInSelfie={clockInSelfie}
          clockOutSelfie={clockOutSelfie}
          title="Today's Attendance Selfies"
        />
      </Paper>

      {clockInLatitude != null && clockInLongitude != null && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={500}>
            Clock In Location
          </Typography>
          {clockInAddress && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              📍 {clockInAddress}
            </Typography>
          )}
          <Link
            href={`https://www.google.com/maps?q=${clockInLatitude},${clockInLongitude}`}
            target="_blank"
            rel="noopener"
            underline="none"
          >
            <Box
              component="img"
              src={`${API_BASE_URL}/org-settings/static-map?lat=${clockInLatitude}&lng=${clockInLongitude}&zoom=16&size=600x260`}
              alt="Clock-in location map"
              sx={{
                width: "100%",
                borderRadius: 1,
                display: "block",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
              }}
            />
          </Link>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Tap to open in Google Maps
          </Typography>
        </Paper>
      )}

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={500}>
          Tasks Summary
        </Typography>
        <Stack spacing={2}>
          {tasks && tasks.length > 0 ? (
            tasks.map((task, index) => (
              <Box key={index}>
                <Box sx={getStatusStyle(task.status)}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        flex: 1,
                        wordBreak: "break-word",
                      }}
                    >
                    {parse(task.description)}
                    </Typography>
                    <Chip
                      label={task.status}
                      size="small"
                      sx={{
                        ...getChipStyle(task.status),
                        borderRadius: "4px",
                        fontWeight: 500,
                        padding: "5px 5px",

                        minWidth: "90px",
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" align="center" py={2}>
              No tasks recorded
            </Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default DailyReport;
