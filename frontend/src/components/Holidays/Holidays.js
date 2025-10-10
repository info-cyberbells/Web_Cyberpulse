// HolidayList.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  Container,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { ToastContainer, toast } from "react-toastify";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { startOfYear, endOfYear } from 'date-fns';
import "react-toastify/dist/ReactToastify.css";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  PersonOutline as PersonIcon,
  CategoryOutlined as CategoryIcon,
} from "@mui/icons-material";
import {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  removeHoliday,
  selectAllHolidays,
  selectHolidayLoading,
  selectHolidayError,
  selectHolidaySuccess,
  resetState,
} from "../../features/holiday/holidaySlice";

const HOLIDAY_TYPES = {
  RESTRICTED: "Restricted",
  OBSERVANCE: "Observance",
  GAZETTED: "Gazetted",
};

const HOLIDAY_COLORS = {
  [HOLIDAY_TYPES.RESTRICTED]: {
    primary: "#f59e0b",
    light: "#fef3c7",
    dark: "#d97706",
  },
  [HOLIDAY_TYPES.OBSERVANCE]: {
    primary: "#3b82f6",
    light: "#dbeafe",
    dark: "#2563eb",
  },
  [HOLIDAY_TYPES.GAZETTED]: {
    primary: "#10b981",
    light: "#d1fae5",
    dark: "#059669",
  },
};

const DEFAULT_COLORS = {
  primary: "#6b7280",
  light: "#f9fafb",
  dark: "#4b5563",
};

const getHolidayColors = (holidayType) => {
  if (HOLIDAY_COLORS[holidayType]) {
    return HOLIDAY_COLORS[holidayType];
  }

  const normalizedType = holidayType?.toLowerCase().trim();

  // Add safety check for normalizedType
  if (!normalizedType) {
    return DEFAULT_COLORS;
  }

  const matchingType = Object.keys(HOLIDAY_COLORS).find(
    (key) =>
      key.toLowerCase().includes(normalizedType) ||
      normalizedType.includes(key.toLowerCase())
  );

  return HOLIDAY_COLORS[matchingType] || DEFAULT_COLORS;
};

const Holidays = () => {
  const dispatch = useDispatch();
  const holidays = useSelector(selectAllHolidays) || [];
  const loading = useSelector(selectHolidayLoading);
  const error = useSelector(selectHolidayError);
  const success = useSelector(selectHolidaySuccess);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [name, setName] = useState("");
  const [type, setType] = useState(HOLIDAY_TYPES.RESTRICTED);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);

  useEffect(() => {
    console.log("Fetching holidays...");
    dispatch(fetchHolidays());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      console.error("Error occurred:", error);
      toast.error(error);
      dispatch(resetState());
    }
    if (success) {
      toast.success("Operation completed successfully");
      dispatch(resetState());
    }
  }, [error, success, dispatch]);

  const currentYearStart = startOfYear(new Date());
  const currentYearEnd = endOfYear(new Date());

  const handleOpen = (edit = false) => {
    setOpen(true);
    setIsEditMode(edit);
    if (!edit) {
      resetForm();
    }
  };

  const getEMpId = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const id = userData?.employee?.id;
    return id;
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayOfWeek = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  const handleSaveHoliday = async () => {
    if (!name.trim()) {
      toast.error("Please enter a holiday name");
      return;
    }
    const holidayData = {
      date: formatDate(selectedDate),
      dayOfWeek: getDayOfWeek(selectedDate),
      name: name.trim(),
      type: type,
      createdBy: getEMpId(),
      updatedBy: getEMpId(),
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateHoliday({
            id: editingHolidayId,
            eventData: holidayData,
          })
        ).unwrap();
      } else {
        await dispatch(createHoliday(holidayData)).unwrap();
      }

      handleClose();

      // Always fetch fresh data from server to maintain proper order
      await dispatch(fetchHolidays()).unwrap();

    } catch (err) {
      console.error("Operation failed:", err);
      toast.error(err);
    }
  };

  const handleDeleteHoliday = async () => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        await dispatch(removeHoliday(editingHolidayId)).unwrap();
        handleClose();
        dispatch(fetchHolidays());
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Delete failed. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedDate(new Date());
    setType(HOLIDAY_TYPES.RESTRICTED);
    setEditingHolidayId(null);
    setIsEditMode(false);
  };

  const renderHolidays = () => {
    if (!Array.isArray(holidays)) {
      console.warn("Holidays is not an array:", holidays);
      return null;
    }

    return holidays.map((holiday) => {
      const colors = getHolidayColors(holiday.type);

      return (
        <TableRow
          key={holiday._id}
          hover
          onClick={() => {
            setSelectedDate(new Date(holiday.date));
            setName(holiday.name);
            setType(holiday.type);
            setEditingHolidayId(holiday._id);
            handleOpen(true);
          }}
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#f8fafc",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
            },
          }}
        >
          <TableCell sx={{ py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: colors.light,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: colors.primary,
                    lineHeight: 1,
                  }}
                >
                  {new Date(holiday.date).getDate()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.dark,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {new Date(holiday.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                  {holiday.dayOfWeek}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                  {new Date(holiday.date).getFullYear()}
                </Typography>
              </Box>
            </Box>
          </TableCell>

          <TableCell sx={{ py: 3 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#1e293b",
                  mb: 0.5,
                  fontSize: "1rem",
                }}
              >
                {holiday.name}
              </Typography>
              {holiday.createdBy?.name && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                  <PersonIcon sx={{ fontSize: 14, color: "#64748b" }} />
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Created by {holiday.createdBy.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </TableCell>

          <TableCell sx={{ py: 3 }}>
            <Chip
              label={holiday.type}
              sx={{
                backgroundColor: colors.light,
                color: colors.dark,
                border: `1px solid ${colors.primary}30`,
                fontWeight: 600,
                fontSize: "0.8rem",
                height: 32,
                borderRadius: 2,
                "& .MuiChip-label": {
                  px: 2,
                },
              }}
            />
          </TableCell>
        </TableRow>
      );
    });
  };

  if (loading && !holidays.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ color: "#2563eb" }} />
          <Typography sx={{ mt: 2, color: "#64748b" }}>Loading holidays...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        py: 4,
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Card
            elevation={0}
            sx={{
              mb: 4,
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent sx={{ py: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: "#2563eb",
                      mb: 1,
                    }}
                  >
                    Holiday Calendar
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                    }}
                  >
                    Manage and track company holidays
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarTodayIcon sx={{ fontSize: 32, color: "#2563eb" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Holidays Table */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#334155",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        py: 2.5,
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#334155",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        py: 2.5,
                      }}
                    >
                      Holiday Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#334155",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        py: 2.5,
                      }}
                    >
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Box sx={{
                          textAlign: "center",
                          py: 6,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}>
                          <CalendarIcon sx={{ fontSize: 64, color: "#cbd5e1" }} />
                          <Typography variant="h6" sx={{ color: "#64748b" }}>
                            No holidays found
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            Click the + button to add your first holiday
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    renderHolidays()
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>

        {/* Loading Overlay */}
        {loading && holidays.length > 0 && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>Processing...</Typography>
              </Box>
            </Card>
          </Box>
        )}

        {/* Floating Action Button */}
        <Fab
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            backgroundColor: "#2563eb",
            color: "white",
            "&:hover": {
              backgroundColor: "#1d4ed8",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)",
          }}
          onClick={() => handleOpen(false)}
        >
          <AddIcon />
        </Fab>

        {/* Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f8fafc",
              color: "#1e293b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 3,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CalendarIcon sx={{ color: "#2563eb" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isEditMode ? "Edit Holiday" : "Add New Holiday"}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "#64748b",
                "&:hover": {
                  backgroundColor: "#e2e8f0",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 1 }}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                  Select Date
                </Typography>

                <DatePicker
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  minDate={currentYearStart}
                  maxDate={currentYearEnd}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  Holiday Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter holiday name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                  Holiday Type
                </Typography>
                <RadioGroup
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  sx={{ gap: 1 }}
                >
                  {Object.values(HOLIDAY_TYPES).map((holidayType) => {
                    const colors = getHolidayColors(holidayType);
                    return (
                      <FormControlLabel
                        key={holidayType}
                        value={holidayType}
                        control={
                          <Radio
                            sx={{
                              color: colors.primary,
                              "&.Mui-checked": {
                                color: colors.primary,
                              },
                            }}
                          />
                        }
                        label={
                          <Chip
                            label={holidayType}
                            sx={{
                              backgroundColor: colors.light,
                              color: colors.dark,
                              border: `1px solid ${colors.primary}30`,
                              fontWeight: 600,
                              ml: 1,
                            }}
                          />
                        }
                      />
                    );
                  })}
                </RadioGroup>
              </Box>
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 3, gap: 2 }}>
            {isEditMode && (
              <Button
                color="error"
                variant="outlined"
                onClick={handleDeleteHoliday}
                sx={{
                  mr: "auto",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Delete Holiday
              </Button>
            )}
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveHoliday}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "#2563eb",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
                px: 3,
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                isEditMode ? "Save Changes" : "Add Holiday"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Holidays;