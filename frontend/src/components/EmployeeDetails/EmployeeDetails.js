import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Grid,
    Tabs,
    Tab,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    TextField,
    InputLabel,
    DialogContent,
    MenuItem,
    Select,
    FormControl,
    DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Divider,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from '@mui/icons-material/Edit';
import { toast } from "react-toastify";
import { startOfMonth, addMonths, isAfter } from "date-fns";
import MaleSVG from "../../assets/male_svg.svg";
import FemaleSVG from "../../assets/female_svg.svg";
import { differenceInMinutes, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { fetchEmployeeDetails, setCurrentMonth, updateEmployeeDetails } from '../../features/employeeDetail/employeeDetailSlice';
import { API_BASE_URL } from "../../constants/apiConstants";


const EmployeeDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data, loading, error, currentMonth } = useSelector(state => state.employeeDetails);
    const { employeeId } = useParams();
    const [tabValue, setTabValue] = useState(0);
    const [openInfoDialog, setOpenInfoDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        jobRole: '',
        department: '',
        position: '',
        type: '',
        leaveQuota: '',
        salary: '',
        incrementcycle: '',
        IncrementAmount: '',
        incrementMonth: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        nameOnAccount: ''
    });

    const calculateProductiveHours = (clockIn, clockOut, breakTime) => {
        if (!clockIn || !clockOut) return 'N/A';
        const totalMinutes = differenceInMinutes(parseISO(clockOut), parseISO(clockIn)) - (breakTime || 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    useEffect(() => {
        if (employeeId) {
            dispatch(fetchEmployeeDetails({ monthDate: currentMonth, employeeId }));
        }
    }, [dispatch, employeeId, currentMonth]);

    const storedData = localStorage.getItem("user");
    const userData = JSON.parse(storedData);
    const userType = userData?.employee?.type;
    console.log("user type login", userType);


    // Populate edit form when data changes
    useEffect(() => {
        if (data && data.employeeInfo) {
            setEditFormData({
                name: data.employeeInfo.name || '',
                email: data.employeeInfo.email || '',
                phone: data.employeeInfo.phone || '',
                address: data.employeeInfo.address || '',
                city: data.employeeInfo.city || '',
                state: data.employeeInfo.state || '',
                pincode: data.employeeInfo.pincode || '',
                jobRole: data.employeeInfo.jobRole || '',
                department: data.employeeInfo.department || '',
                position: data.employeeInfo.position || '',
                type: data.employeeInfo.type || '',
                leaveQuota: data.employeeInfo.leaveQuota || '',
                salary: data.employeeInfo.salarydetails?.salary || '',
                incrementcycle: data.employeeInfo.salarydetails?.incrementcycle || '',
                IncrementAmount: data.employeeInfo.salarydetails?.IncrementAmount || '',
                incrementMonth: data.employeeInfo.salarydetails?.incrementMonth || '',
                accountNumber: data.employeeInfo.bankDetails?.accountNumber || '',
                bankName: data.employeeInfo.bankDetails?.bankName || '',
                ifscCode: data.employeeInfo.bankDetails?.ifscCode || '',
                nameOnAccount: data.employeeInfo.bankDetails?.nameOnAccount || ''
            });
        }
    }, [data]);

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenEditDialog = () => {
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleUpdateEmployee = async () => {
        const updateData = {
            name: editFormData.name,
            email: editFormData.email,
            phone: editFormData.phone,
            address: editFormData.address,
            city: editFormData.city,
            state: editFormData.state,
            pincode: editFormData.pincode,
            jobRole: editFormData.jobRole,
            department: editFormData.department,
            position: editFormData.position,
            type: parseInt(editFormData.type),
            leaveQuota: editFormData.leaveQuota,
            salarydetails: {
                salary: editFormData.salary,
                incrementcycle: editFormData.incrementcycle,
                IncrementAmount: editFormData.IncrementAmount,
                incrementMonth: editFormData.incrementMonth
            },
            bankDetails: {
                accountNumber: editFormData.accountNumber,
                bankName: editFormData.bankName,
                ifscCode: editFormData.ifscCode,
                nameOnAccount: editFormData.nameOnAccount
            }
        };

        try {
            await dispatch(updateEmployeeDetails({ employeeId, updateData })).unwrap();
            toast.success("Employee details updated successfully!");
            setOpenEditDialog(false);
            dispatch(fetchEmployeeDetails({ monthDate: currentMonth, employeeId }));

        } catch (error) {
            toast.error("Failed to update employee details");
            console.error("Update error:", error);
        }
    };


    const handleNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1);
        if (isAfter(nextMonth, startOfMonth(new Date()))) {
            toast.info("Cannot navigate to future months");
            return;
        }
        dispatch(setCurrentMonth(nextMonth));
    };

    const handlePreviousMonth = () => {
        dispatch(setCurrentMonth(addMonths(currentMonth, -1)));
    };

    const formatDuration = (duration) => {
        return duration || "N/A";
    };


    const downloadEmployeeReport = () => {
        if (!data || !data.employeeInfo) {
            toast.error("No data available to download");
            return;
        }

        const XLSX = require('xlsx');
        const wb = XLSX.utils.book_new();

        const wsData = [];

        wsData.push([`Employee: ${data.employeeInfo.name}`]);
        wsData.push([`Email: ${data.employeeInfo.email}`]);
        wsData.push([`Month: ${data.month}`]);
        wsData.push([]);

        // Add headers
        wsData.push([
            'Date',
            'Clock In Time',
            'Clock Out Time',
            'Auto Clock Out',
            'Productive Hours',
            'Break Details'
        ]);

        data.data.forEach((day) => {
            let breakDetails = '';
            if (day.attendance?.breakTimings?.length > 0) {
                breakDetails = day.attendance.breakTimings.map((breakItem, breakIndex) => {
                    const breakDuration = breakItem.startTime && breakItem.endTime
                        ? differenceInMinutes(parseISO(breakItem.endTime), parseISO(breakItem.startTime))
                        : 'N/A';
                    return `Break ${breakIndex + 1}: ${breakItem.name} (${formatTime(breakItem.startTime)} - ${formatTime(breakItem.endTime)} | ${breakDuration} minutes)`;
                }).join('; ');
            } else {
                breakDetails = 'No breaks recorded';
            }

            wsData.push([
                formatDisplayDate(day.date),
                day.attendance?.clockInTime ? formatTime(day.attendance.clockInTime) : 'Not Available',
                day.attendance?.clockOutTime ? formatTime(day.attendance.clockOutTime) : 'Not Available',
                day.attendance?.autoClockOut ? 'Yes' : 'No',
                calculateProductiveHours(day.attendance?.clockInTime, day.attendance?.clockOutTime, day.attendance?.breakTime),
                breakDetails
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 50 }
        ];

        const headerCells = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5'];
        headerCells.forEach(cell => {
            if (ws[cell]) {
                ws[cell].s = {
                    font: { bold: true, size: 11 },
                    fill: { fgColor: { rgb: "D3D3D3" } },
                    alignment: { horizontal: "center" },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                };
            }
        });

        ['A1', 'A2', 'A3'].forEach(cell => {
            if (ws[cell]) {
                ws[cell].s = {
                    font: { bold: true, size: 12 },
                    alignment: { horizontal: "center" }
                };
            }
        });

        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        const fileName = `${data.employeeInfo.name.replace(/\s+/g, '_')}_Report_${data.month.replace(/\s+/g, '_')}.csv`;
        XLSX.writeFile(wb, fileName, { bookType: 'csv' });
        toast.success("CSV report downloaded successfully!");
    };


    const formatDisplayDate = (date) => {
        return date
            ? new Date(date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "N/A";
    };

    const formatTime = (time) => {
        if (!time) return "N/A";
        return new Date(time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenInfoDialog = () => {
        setOpenInfoDialog(true);
    };

    const handleCloseInfoDialog = () => {
        setOpenInfoDialog(false);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    if (!data || !data.employeeInfo) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6">No data available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }} className="bg-gray-50 min-h-screen">
            {/* Employee Information Card */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    bgcolor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative',
                }}
            >
                <>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            borderRadius: 2,
                            px: 3,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                borderColor: '#1565c0',
                                bgcolor: 'rgba(25, 118, 210, 0.04)',
                            }
                        }}
                    >
                        Back
                    </Button>


                    <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<InfoIcon />}
                            onClick={handleOpenInfoDialog}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                bgcolor: '#1976d2',
                            }}
                        >
                            View All Info
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleOpenEditDialog}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': {
                                    borderColor: '#1565c0',
                                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                                }
                            }}
                        >
                            Edit Details
                        </Button>
                    </Box>
                </>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={3} className="flex justify-center">
                        <Box sx={{ width: 140, height: 140 }}>
                            <Box sx={{ width: 140, height: 140 }}>
                                {data.employeeInfo.image ? (
                                    <img
                                        src={`${API_BASE_URL.replace('/api', '')}${data.employeeInfo.image}`}
                                        alt={data.employeeInfo.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            border: '3px solid #1976d2',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'grey.300',
                                            borderRadius: '50%',
                                            border: '3px solid #1976d2',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <img
                                            src={data.employeeInfo.gender === 'female' ? FemaleSVG : MaleSVG}
                                            alt={data.employeeInfo.gender === 'female' ? 'Female Avatar' : 'Male Avatar'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    {console.log("employee gender", data.employeeInfo.gender)}
                    <Grid item xs={12} sm={9}>
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            color="primary"
                            sx={{ fontSize: '2.2rem', mb: 1 }}
                        >
                            {data.employeeInfo.name}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ mb: 3, fontSize: '1.2rem' }}
                        >
                            {data.employeeInfo.jobRole} | {data.employeeInfo.department}
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Email:</strong> {data.employeeInfo.email}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Phone:</strong> {data.employeeInfo.phone}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Address:</strong> {data.employeeInfo.address},{' '}
                                    {data.employeeInfo.city}, {data.employeeInfo.state},{' '}
                                    {data.employeeInfo.pincode}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Joining Date:</strong>{' '}
                                    {formatDisplayDate(data.employeeInfo.joiningDate)}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Date of Birth:</strong>{' '}
                                    {formatDisplayDate(data.employeeInfo.dob)}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                    <strong>Leave Quota:</strong> {data.employeeInfo.leaveQuota}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Full Employee Info Dialog */}
            <Dialog
                open={openInfoDialog}
                onClose={handleCloseInfoDialog}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: '1.8rem' }}>
                        Employee Information
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                sx={{ fontSize: '1.3rem', mb: 2 }}
                            >
                                Personal Details
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Name:</strong> {data.employeeInfo.name}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {data.employeeInfo.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Phone:</strong> {data.employeeInfo.phone}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Date of Birth:</strong>{' '}
                                {formatDisplayDate(data.employeeInfo.dob)}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Joining Date:</strong>{' '}
                                {formatDisplayDate(data.employeeInfo.joiningDate)}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Leave Quota:</strong> {data.employeeInfo.leaveQuota}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                sx={{ fontSize: '1.3rem', mb: 2 }}
                            >
                                Professional Details
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Job Role:</strong> {data.employeeInfo.jobRole}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Department:</strong> {data.employeeInfo.department}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Position:</strong> {data.employeeInfo.position}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Type:</strong>{' '}
                                {[1, 2, 3, 4, 5, 6].includes(data.employeeInfo.type) ? 'Permanent' : 'Contract'}
                            </Typography>

                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                sx={{ fontSize: '1.3rem', mb: 2 }}
                            >
                                Address
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Address:</strong> {data.employeeInfo.address}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>City:</strong> {data.employeeInfo.city}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>State:</strong> {data.employeeInfo.state}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Pincode:</strong> {data.employeeInfo.pincode}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                sx={{ fontSize: '1.3rem', mb: 2 }}
                            >
                                Salary Details
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Salary:</strong>{' '}
                                {data.employeeInfo.salarydetails?.salary || 'N/A'}
                                {console.log("salary console", data.employeeInfo.salarydetails?.salary)}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Increment Cycle:</strong>{' '}
                                {data.employeeInfo.salarydetails?.incrementcycle || 'N/A'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Increment Amount:</strong>{' '}
                                {data.employeeInfo.salarydetails?.IncrementAmount || 'N/A'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Increment Month:</strong>{' '}
                                {data.employeeInfo.salarydetails?.incrementMonth || 'N/A'}
                            </Typography>
                        </Grid>


                        <Grid item xs={12} sm={6}>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                sx={{ fontSize: '1.3rem', mb: 2 }}
                            >
                                Bank Details
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Account Number:</strong>{' '}
                                {data.employeeInfo.bankDetails?.accountNumber || 'N/A'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Bank Name:</strong>{' '}
                                {data.employeeInfo.bankDetails?.bankName || 'N/A'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>IFSC Code:</strong>{' '}
                                {data.employeeInfo.bankDetails?.ifscCode || 'N/A'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Name on Account:</strong>{' '}
                                {data.employeeInfo.bankDetails?.nameOnAccount || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleCloseInfoDialog}
                        sx={{ borderRadius: 2, px: 3, bgcolor: '#1976d2' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: '1.8rem' }}>
                        Edit Employee Details
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                label="Name"
                                value={editFormData.name}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="phone"
                                label="Phone"
                                value={editFormData.phone}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="jobRole"
                                label="Job Role"
                                value={editFormData.jobRole}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="department"
                                label="Department"
                                value={editFormData.department}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="position"
                                label="Position"
                                value={editFormData.position}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="leaveQuota"
                                label="Leave Quota"
                                value={editFormData.leaveQuota}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                                type="number"
                            />
                        </Grid>

                        {/* Address Fields */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Address Information</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="address"
                                label="Address"
                                value={editFormData.address}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="city"
                                label="City"
                                value={editFormData.city}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="state"
                                label="State"
                                value={editFormData.state}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="pincode"
                                label="Pincode"
                                value={editFormData.pincode}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>

                        {/* Salary Fields */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Salary Information</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="salary"
                                label="Salary"
                                value={editFormData.salary}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="incrementcycle"
                                label="Increment Cycle"
                                value={editFormData.incrementcycle}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="IncrementAmount"
                                label="Increment Amount"
                                value={editFormData.IncrementAmount}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="incrementMonth"
                                label="Increment Month"
                                value={editFormData.incrementMonth}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>

                        {/* Bank Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Bank Information</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="accountNumber"
                                label="Account Number"
                                value={editFormData.accountNumber}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="bankName"
                                label="Bank Name"
                                value={editFormData.bankName}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="ifscCode"
                                label="IFSC Code"
                                value={editFormData.ifscCode}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nameOnAccount"
                                label="Name on Account"
                                value={editFormData.nameOnAccount}
                                onChange={handleEditInputChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseEditDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3, borderColor: '#1976d2', color: '#1976d2' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateEmployee}
                        variant="contained"
                        disabled={loading}
                        sx={{ borderRadius: 2, px: 3, bgcolor: '#1976d2' }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Update Details'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tabs for Attendance and Documents */}
            <Paper
                sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1.1rem', px: 4 },
                        '& .MuiTabs-indicator': { height: 3, backgroundColor: '#1976d2' },
                    }}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Attendance & Tasks" />
                    <Tab label="Documents" />
                </Tabs>

                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={downloadEmployeeReport}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: '#1976d2',
                            fontWeight: 'medium',
                            fontSize: '0.8rem',
                            minWidth: 'auto',
                            '&:hover': {
                                bgcolor: '#1565c0',
                            }
                        }}
                    >
                        Download Report
                    </Button>
                )}
            </Paper>

            {/* Attendance and Tasks Section */}
            {tabValue === 0 && (
                <Box>
                    <Paper
                        sx={{
                            mb: 4,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="primary"
                                sx={{ fontSize: '1.8rem' }}
                            >
                                Attendance & Tasks ({data.month})
                            </Typography>
                            <Box>
                                <Button
                                    onClick={handlePreviousMonth}
                                    variant="outlined"
                                    sx={{
                                        mr: 2,
                                        borderRadius: 2,
                                        px: 4,
                                        fontWeight: 'medium',
                                        borderColor: '#1976d2',
                                        color: '#1976d2',
                                    }}
                                >
                                    Previous Month
                                </Button>
                                <Button
                                    onClick={handleNextMonth}
                                    variant="contained"
                                    sx={{
                                        borderRadius: 2,
                                        px: 4,
                                        fontWeight: 'medium',
                                        bgcolor: '#1976d2',
                                    }}
                                >
                                    Next Month
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                    <Box className="space-y-4">
                        {data.data.map((day) => (
                            <Card
                                key={day.date}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" alignItems="center" className="mb-3">
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: day.attendance ? '#4caf50' : '#f44336',
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="primary"
                                            sx={{ fontSize: '1.4rem' }}
                                        >
                                            {formatDisplayDate(day.date)}
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2} className="mb-3">
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                                <strong>Clock In:</strong>{' '}
                                                {day.attendance?.clockInTime ? formatTime(day.attendance.clockInTime) : 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                                <strong>Clock Out:</strong>{' '}
                                                {day.attendance?.clockOutTime ? formatTime(day.attendance.clockOutTime) : 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                                <strong>Auto Clock Out:</strong>{' '}
                                                {day.attendance?.autoClockOut ? 'Yes' : 'No'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                                <strong>Productive Hours:</strong>{' '}
                                                {calculateProductiveHours(
                                                    day.attendance?.clockInTime,
                                                    day.attendance?.clockOutTime,
                                                    day.attendance?.breakTime
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" sx={{ fontSize: '1.2rem', mt: 2, mb: 1 }}>
                                                Break Details
                                            </Typography>
                                            <TableContainer component={Paper}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Break Name</TableCell>
                                                            <TableCell>Start Time</TableCell>
                                                            <TableCell>End Time</TableCell>
                                                            <TableCell>Duration (min)</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {day.attendance?.breakTimings?.length > 0 ? (
                                                            day.attendance.breakTimings.map((breakItem) => (
                                                                <TableRow key={breakItem._id}>
                                                                    <TableCell>{breakItem.name}</TableCell>
                                                                    <TableCell>{formatTime(breakItem.startTime)}</TableCell>
                                                                    <TableCell>{formatTime(breakItem.endTime)}</TableCell>
                                                                    <TableCell>
                                                                        {breakItem.startTime && breakItem.endTime
                                                                            ? differenceInMinutes(parseISO(breakItem.endTime), parseISO(breakItem.startTime))
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={4}>No breaks recorded</TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>
                                    <Divider sx={{ my: 2, bgcolor: 'gray.200' }} />
                                    <Typography
                                        variant="h6"
                                        fontWeight="medium"
                                        sx={{ fontSize: '1.2rem', mb: 2, color: '#424242' }}
                                    >
                                        Tasks
                                    </Typography>
                                    {day.tasks.length > 0 ? (
                                        day.tasks.map((task) => (
                                            <Card
                                                key={task.id}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: 'gray.50',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                                                    <strong>Task Description:</strong>{' '}
                                                    <span
                                                        style={{ display: 'inline' }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: task.description.replace(/<(\/)?(div|p)>/g, '')
                                                        }}
                                                    />
                                                    {' - '}
                                                    <span style={{ fontWeight: 'bold' }}>{task.projectName}</span>
                                                </Typography>

                                                <Box display="flex" alignItems="center" className="mb-1">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontSize: '0.9rem', mr: 1 }}
                                                    >
                                                        <strong>Status:</strong>
                                                    </Typography>
                                                    <Chip
                                                        label={task.status}
                                                        color={task.status === 'Pending' ? 'warning' : 'success'}
                                                        size="small"
                                                        sx={{ fontWeight: 'medium' }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                                    <strong>Duration:</strong> {formatDuration(task.duration)}{' '}
                                                    | <strong>Estimated Time:</strong> {task.estimatedHours} hr{task.estimatedHours !== 1 ? 's' : ''}{' '}
                                                    {task.estimatedMinutes} min
                                                </Typography>


                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontSize: '0.9rem' }}
                                                >
                                                    <strong>Assigned Date:</strong>{' '}
                                                    {formatDisplayDate(task.assignedDate)}
                                                </Typography>
                                            </Card>
                                        ))
                                    ) : (
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ fontSize: '1rem', fontStyle: 'italic' }}
                                        >
                                            No tasks assigned
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Documents Section */}
            {tabValue === 1 && (
                <Box>
                    <Paper
                        sx={{
                            mb: 4,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="primary"
                            sx={{ fontSize: '1.8rem' }}
                        >
                            Documents
                        </Typography>
                    </Paper>
                    <Grid container spacing={3}>
                        {data.employeeInfo.documents.map((doc) => (
                            <Grid item xs={12} sm={6} md={4} key={doc._id}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="primary"
                                            sx={{ fontSize: '1.3rem', mb: 2 }}
                                        >
                                            {doc.documentType}
                                        </Typography>
                                        <Box className="mb-3">
                                            {doc.documentUrl.endsWith('.pdf') ? (
                                                <iframe
                                                    src={`${API_BASE_URL.replace('/api', '')}${doc.documentUrl}`}
                                                    title={doc.documentType}
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e0e0e0',
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={`${API_BASE_URL.replace('/api', '')}${doc.documentUrl}`}
                                                    alt={doc.documentType}
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e0e0e0',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.9rem', mb: 1 }}
                                        >
                                            <strong>Uploaded At:</strong>{' '}
                                            {formatDisplayDate(doc.uploadedAt)}
                                        </Typography>
                                        {/* <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.9rem', mb: 3 }}
                                        >
                                            <strong>Remarks:</strong> {doc.remarks || 'N/A'}
                                        </Typography> */}
                                        <Button
                                            variant="contained"
                                            onClick={() => setSelectedDocument(doc.documentUrl)}
                                            sx={{
                                                width: '100%',
                                                borderRadius: 2,
                                                py: 1.2,
                                                fontWeight: 'medium',
                                                bgcolor: '#1976d2',
                                            }}
                                        >
                                            Preview Document
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Document Preview Dialog */}
            <Dialog
                open={!!selectedDocument}
                onClose={() => setSelectedDocument(null)}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
                        Document Preview
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedDocument && (
                        selectedDocument.endsWith('.pdf') ? (
                            <iframe
                                src={`${API_BASE_URL.replace('/api', '')}${selectedDocument}`}
                                title="Document Preview"
                                style={{ width: '100%', height: '600px', border: 'none' }}
                            />
                        ) : (
                            <img
                                src={`${API_BASE_URL.replace('/api', '')}${selectedDocument}`}
                                alt="Document Preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                }}
                            />
                        )
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        component="a"
                        href={`${API_BASE_URL.replace('/api', '')}${selectedDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3, mr: 2, bgcolor: '#1976d2', color: 'white' }}
                    >
                        Show in New Page
                    </Button>
                    <Button
                        onClick={() => setSelectedDocument(null)}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3, borderColor: '#1976d2', color: '#1976d2' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeDetails;