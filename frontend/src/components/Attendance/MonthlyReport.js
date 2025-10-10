import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import SelfieDisplay from './SelfieDisplay';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import parse from 'html-react-parser';

const MonthlyReport = ({ selectedDate, onDateChange, monthlyAttendance }) => {
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const safeFormatDate = (dateString, formatPattern = 'dd MMM yyyy') => {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return format(date, formatPattern);
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "completed") return "success";
    if (normalizedStatus === "partial") return "warning";
    return "error";
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            label="Select Month and Year"
            minDate={new Date('2021-01-01')}
            maxDate={new Date()}
            value={selectedDate}
            onChange={onDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Box>

      {!monthlyAttendance || monthlyAttendance.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No attendance records found for selected month
          </Typography>
        </Paper>
      ) : (
        monthlyAttendance.map((day) => (
          <Accordion
            key={day.date}
            expanded={expanded === day.date}
            onChange={handleAccordionChange(day.date)}
            sx={{
              mb: 2,
              '&:before': { display: 'none' },
              boxShadow: 1,
              borderRadius: '8px !important',
              '& .MuiAccordionSummary-root': {
                borderRadius: expanded === day.date ? '8px 8px 0 0' : '8px',
              }
            }}
          >
            <AccordionSummary
              expandIcon={expanded === day.date ? <RemoveIcon /> : <AddIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {safeFormatDate(day.date)}
                </Typography>
                <Chip
                  label={day.attendance ? "Present" : "Absent"}
                  color={day.attendance ? "success" : "error"}
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {day.tasks?.length || 0} Tasks
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 2 }}>
              <Stack spacing={3}>
                {/* Attendance Info */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Attendance Details
                  </Typography>
                  {day.attendance ? (
                    <Stack direction="row" spacing={3}>
                      <Typography variant="body2" color="text.secondary">
                        Clock In: {safeFormatDate(day.attendance.clockInTime, 'hh:mm:ss a')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Clock Out: {safeFormatDate(day.attendance.clockOutTime, 'hh:mm:ss a')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="error.main">
                      No attendance record for this day
                    </Typography>
                  )}
                </Box>

                {/* Selfies Section */}
                {day.attendance && (
                  <Box>
                    <SelfieDisplay
                      clockInSelfie={day.attendance.clockInSelfie}
                      clockOutSelfie={day.attendance.clockOutSelfie}
                      title="Attendance Selfies"
                    />
                  </Box>
                )}

                {/* Tasks Section */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Tasks
                  </Typography>
                  {day.tasks && day.tasks.length > 0 ? (
                    <Stack spacing={2}>
                      {day.tasks.map((task) => (
                        <Card
                          key={task.id}
                          variant="outlined"
                          sx={{
                            bgcolor: 'background.default',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={2}
                            >
                              <Box flex={1}>
                                <Typography>{parse(task.description)}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Created: {safeFormatDate(task.createdAt, 'hh:mm:ss a')}
                                  {task.updatedAt !== task.createdAt &&
                                    ` • Updated: ${safeFormatDate(task.updatedAt, 'hh:mm:ss a')}`}
                                </Typography>
                              </Box>
                              <Chip
                                label={task.status || 'No Status'}
                                size="small"
                                color={getStatusColor(task.status)}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No tasks recorded for this day
                    </Typography>
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default MonthlyReport; 