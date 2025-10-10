import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    Fab,
    Stack,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
    Paper,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    CalendarMonth as CalendarIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart
} from 'recharts';
import AddRatingModal from './AddRatingModal';
import { fetchEmployeeRatingsAsync } from '../../features/employeeRating/employeeRatingSlice';
import { fetchEmployeeList } from '../../features/employees/employeeSlice';

const PerformanceAnalysisPage = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { ratings, loading, error } = useSelector(state => state.employeeRatings);
    const { employeeList } = useSelector(state => state.employees);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [employee, setEmployee] = useState(null);

    const [addRatingModalOpen, setAddRatingModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [editingRating, setEditingRating] = useState(null);

    const handleOpenDetailsModal = (rating) => {
        setSelectedRating(rating);
        setDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedRating(null);
    };

    const handleEditRating = (rating) => {
        setEditingRating(rating);
        setDetailsModalOpen(false);
        setAddRatingModalOpen(true);
    };

    useEffect(() => {
        if (employeeId) {
            dispatch(fetchEmployeeRatingsAsync(employeeId));
            dispatch(fetchEmployeeList());
        }
    }, [employeeId, dispatch]);

    useEffect(() => {
        if (employeeList.length > 0 && employeeId) {
            const foundEmployee = employeeList.find(emp => emp._id === employeeId);
            setEmployee(foundEmployee);
        }
    }, [employeeList, employeeId]);


    useEffect(() => {
        const isEmployeeRoute = window.location.pathname === '/my-performance';

        if (isEmployeeRoute && !employeeId) {
            const userData = JSON.parse(localStorage.getItem("user"));
            const userEmployeeId = userData?.employee?.id || userData?.employee?._id;

            if (userEmployeeId) {
                dispatch(fetchEmployeeRatingsAsync(userEmployeeId));
                dispatch(fetchEmployeeList());

                if (userData?.employee) {
                    setEmployee(userData.employee);
                }
            }
        }
    }, [employeeId, dispatch]);

    const handleOpenAddRating = () => {
        setAddRatingModalOpen(true);
    };

    const handleCloseAddRating = () => {
        setAddRatingModalOpen(false);
        setEditingRating(null);
        if (employeeId) {
            dispatch(fetchEmployeeRatingsAsync(employeeId));
        } else if (window.location.pathname === '/my-performance') {
            const userData = JSON.parse(localStorage.getItem("user"));
            const userEmployeeId = userData?.employee?.id || userData?.employee?._id;
            if (userEmployeeId) {
                dispatch(fetchEmployeeRatingsAsync(userEmployeeId));
            }
        }
    };

    const renderStars = (rating) => {
        const stars = [];

        for (let i = 0; i < 5; i++) {
            const starPosition = i + 1; // 1, 2, 3, 4, 5

            if (rating >= starPosition) {
                // Full star - rating is >= this star position
                stars.push(<StarIcon key={i} sx={{ color: '#ffc107', fontSize: 18 }} />);
            } else if (rating > starPosition - 1) {
                // Partial star - rating is between (starPosition-1) and starPosition
                const partialAmount = rating - (starPosition - 1);
                const fillPercentage = Math.round(partialAmount * 100);

                stars.push(
                    <Box key={i} sx={{ position: 'relative', display: 'inline-block' }}>
                        <StarBorderIcon sx={{ color: '#e0e0e0', fontSize: 18 }} />
                        <StarIcon sx={{
                            color: '#ffc107',
                            fontSize: 18,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
                        }} />
                    </Box>
                );
            } else {
                // Empty star
                stars.push(<StarBorderIcon key={i} sx={{ color: '#e0e0e0', fontSize: 18 }} />);
            }
        }
        return stars;
    };

    const getMonthName = (monthString) => {
        const [year, month] = monthString.split('-');
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const getFullMonthName = (monthString) => {
        const [year, month] = monthString.split('-');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const getPerformanceColor = (stars) => {
        if (stars >= 4.5) return '#4caf50'; // Green
        if (stars >= 3.5) return '#2196f3'; // Blue  
        if (stars >= 2.5) return '#ff9800'; // Orange
        if (stars >= 1.5) return '#f44336'; // Red
        return '#9e9e9e'; // Grey
    };

    const getPerformanceLevel = (rating) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 3.5) return 'Good';
        if (rating >= 2.5) return 'Average';
        if (rating >= 1.5) return 'Below Average';
        return 'Poor';
    };

    // Prepare chart data
    const chartData = ratings
        ? [...ratings]
            .sort((a, b) => {
                return a.month.localeCompare(b.month);
            })
            .map(rating => ({
                month: getMonthName(rating.month),
                fullMonth: getFullMonthName(rating.month),
                manualRating: Number(rating.rating.toFixed(1)),
                attendanceRating: Number(rating.SystemRating.toFixed(1)),
                avgRating: Number(((rating.rating + rating.SystemRating) / 2).toFixed(1))
            }))
        : [];

    // Calculate overall stats
    const overallStats = ratings?.length > 0 ? {
        avgManualRating: (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1),
        avgAttendanceRating: (ratings.reduce((sum, r) => sum + r.SystemRating, 0) / ratings.length).toFixed(1),
        totalRatings: ratings.length,
        latestRating: [...ratings].sort((a, b) => new Date(b.givenAt) - new Date(a.givenAt))[0]
    } : null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper
                    sx={{
                        p: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        {payload[0]?.payload?.fullMonth}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color, fontWeight: 500 }}
                        >
                            {entry.name}: {entry.value}/5
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">

                        <AssessmentIcon />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                {window.location.pathname === '/my-performance' ? 'My Performance' : 'Performance Analysis'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                {employee?.name} • {employee?.position}
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{ color: 'white', textTransform: 'none' }}
                            >
                                Back
                            </Button>
                        </Box>
                    </Stack>
                </Box>

                {/* Content */}
                <Box sx={{ overflow: 'auto' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress size={48} />
                        </Box>
                    ) : error ? (
                        <Box p={3}>
                            <Alert severity="error">
                                Failed to load performance data: {error}
                            </Alert>
                        </Box>
                    ) : (
                        <Box>
                            {/* Employee Info Header */}
                            <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderBottom: '1px solid #e0e0e0' }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            bgcolor: '#1976d2',
                                            fontSize: '1.5rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {employee?.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Typography variant="h5" fontWeight="600" gutterBottom>
                                            {employee?.name}
                                        </Typography>
                                        <Stack direction="row" spacing={2} mb={1}>
                                            <Chip
                                                label={employee?.department}
                                                size="medium"
                                                sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                                            />
                                            <Chip
                                                label={employee?.position}
                                                size="medium"
                                                variant="outlined"
                                            />
                                        </Stack>
                                        {overallStats && (
                                            <Stack direction="row" spacing={3} mt={1}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Avg Manual Rating
                                                    </Typography>
                                                    <Typography variant="h6" color="#1976d2" fontWeight="600">
                                                        {overallStats.avgManualRating}/5
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Avg Attendance
                                                    </Typography>
                                                    <Typography variant="h6" color="#ff9800" fontWeight="600">
                                                        {overallStats.avgAttendanceRating}/5
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Total Reviews
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="600">
                                                        {overallStats.totalRatings}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        )}
                                    </Box>
                                    {window.location.pathname !== '/my-performance' && (
                                        <Tooltip title={
                                            (ratings && ratings.length > 0 && ratings.some(rating => {
                                                const currentDate = new Date();
                                                const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                                                const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
                                                return rating.month === previousMonthValue;
                                            })) ? "Rating already given for previous month" : "Add New Rating"
                                        }>
                                            <span>
                                                <Fab
                                                    size="medium"
                                                    color="primary"
                                                    onClick={handleOpenAddRating}
                                                    disabled={
                                                        ratings && ratings.length > 0 && ratings.some(rating => {
                                                            const currentDate = new Date();
                                                            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                                                            const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
                                                            return rating.month === previousMonthValue;
                                                        })
                                                    }
                                                    sx={{
                                                        boxShadow: (ratings && ratings.length > 0 && ratings.some(rating => {
                                                            const currentDate = new Date();
                                                            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                                                            const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
                                                            return rating.month === previousMonthValue;
                                                        })) ? 'none' : '0 4px 12px rgba(25,118,210,0.3)',
                                                        '&:hover': {
                                                            transform: (ratings && ratings.length > 0 && ratings.some(rating => {
                                                                const currentDate = new Date();
                                                                const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                                                                const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
                                                                return rating.month === previousMonthValue;
                                                            })) ? 'none' : 'scale(1.05)'
                                                        },
                                                        opacity: (ratings && ratings.length > 0 && ratings.some(rating => {
                                                            const currentDate = new Date();
                                                            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                                                            const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
                                                            return rating.month === previousMonthValue;
                                                        })) ? 0.6 : 1
                                                    }}
                                                >
                                                    <AddIcon />
                                                </Fab>
                                            </span>
                                        </Tooltip>
                                    )}
                                </Stack>
                            </Box>

                            {/* Performance Chart */}
                            {ratings && ratings.length > 0 && (
                                <Box sx={{ p: 3, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <TrendingUpIcon sx={{ color: '#1976d2' }} />
                                        <Typography variant="h6" fontWeight="600">
                                            Performance Trends
                                        </Typography>
                                    </Stack>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2,
                                            bgcolor: 'white'
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="manualGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.05} />
                                                    </linearGradient>
                                                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0.05} />
                                                    </linearGradient>
                                                    <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0.05} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{ fontSize: 12 }}
                                                    stroke="#666"
                                                />
                                                <YAxis
                                                    domain={[0, 5]}
                                                    tick={{ fontSize: 12 }}
                                                    stroke="#666"
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="manualRating"
                                                    stroke="#1976d2"
                                                    strokeWidth={3}
                                                    fill="url(#manualGradient)"
                                                    name="Manual Rating"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="attendanceRating"
                                                    stroke="#ff9800"
                                                    strokeWidth={3}
                                                    fill="url(#attendanceGradient)"
                                                    name="Attendance Rating"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="avgRating"
                                                    stroke="#4caf50"
                                                    strokeWidth={3}
                                                    fill="url(#overallGradient)"
                                                    name="Overall Rating"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Box>
                            )}

                            {/* Monthly Performance Details */}
                            <Box sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                    <ScheduleIcon sx={{ color: '#1976d2' }} />
                                    <Typography variant="h6" fontWeight="600">
                                        Monthly Performance Details
                                    </Typography>
                                </Stack>

                                {!ratings || ratings.length === 0 ? (
                                    <Box textAlign="center" py={6}>
                                        <AssessmentIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="500">
                                            No Performance Ratings Yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mb={3}>
                                            {window.location.pathname === '/my-performance'
                                                ? 'Your performance ratings will appear here once your manager adds them'
                                                : `Start tracking ${employee?.name}'s performance by adding their first rating`
                                            }
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {[...ratings]
                                            .sort((a, b) => new Date(b.givenAt) - new Date(a.givenAt))
                                            .map((rating, index) => (
                                                <Grid item xs={12} lg={6} key={rating._id || index}>
                                                    <Card
                                                        elevation={0}
                                                        sx={{
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s ease',
                                                            height: 'auto',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                borderColor: '#1976d2'
                                                            }
                                                        }}
                                                    >
                                                        <CardContent sx={{ p: 2 }}>
                                                            {/* Month Header */}
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                                    <Box
                                                                        sx={{
                                                                            width: 36,
                                                                            height: 36,
                                                                            borderRadius: 1,
                                                                            bgcolor: '#f5f5f5',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <CalendarIcon sx={{ color: '#666', fontSize: 20 }} />
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight="600">
                                                                            {getFullMonthName(rating.month)}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Rated on {new Date(rating.givenAt).toLocaleDateString()}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </Stack>

                                                            {/* Overall Performance (Always Visible) */}
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: '#f8f9fa',
                                                                    borderRadius: 2,
                                                                    border: '1px solid #e0e0e0',
                                                                    textAlign: 'center',
                                                                    mb: 2
                                                                }}
                                                            >
                                                                <Typography variant="caption" color="text.secondary" fontWeight="600" gutterBottom>
                                                                    OVERALL PERFORMANCE
                                                                </Typography>
                                                                <Stack direction="row" justifyContent="center" spacing={0.5} my={1}>
                                                                    {renderStars((rating.rating + rating.SystemRating) / 2)}
                                                                </Stack>
                                                                <Typography variant="h5" fontWeight="700" color={getPerformanceColor((rating.rating + rating.SystemRating) / 2)}>
                                                                    {((rating.rating + rating.SystemRating) / 2).toFixed(1)}/5
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                                                    {getPerformanceLevel((rating.rating + rating.SystemRating) / 2)}
                                                                </Typography>
                                                            </Paper>

                                                            {/* View Details Button */}
                                                            <Box textAlign="center" mb={2}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => handleOpenDetailsModal(rating)}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        borderRadius: 1.5,
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </Box>

                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Add Rating Modal */}
            <AddRatingModal
                open={addRatingModalOpen}
                onClose={handleCloseAddRating}
                employee={employee}
                editingRating={editingRating}
            />

            <Dialog
                open={detailsModalOpen}
                onClose={handleCloseDetailsModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        Performance Details - {selectedRating && getFullMonthName(selectedRating.month)}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedRating && (
                        <Box>
                            {/* Ratings Grid */}
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            bgcolor: '#fafafa',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                            MANUAL RATING
                                        </Typography>
                                        <Box my={1}>
                                            <Stack direction="row" justifyContent="center" spacing={0.3}>
                                                {renderStars(selectedRating.rating)}
                                            </Stack>
                                        </Box>
                                        <Typography variant="h6" fontWeight="600" color="#1976d2">
                                            {selectedRating.rating}/5
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {getPerformanceLevel(selectedRating.rating)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            bgcolor: '#fafafa',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                            ATTENDANCE RATING
                                        </Typography>
                                        <Box my={1}>
                                            <Stack direction="row" justifyContent="center" spacing={0.3}>
                                                {renderStars(selectedRating.SystemRating)}
                                            </Stack>
                                        </Box>
                                        <Typography variant="h6" fontWeight="600" color="#ff9800">
                                            {selectedRating.SystemRating}/5
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {getPerformanceLevel(selectedRating.SystemRating)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Details */}
                            <Stack spacing={2}>
                                {selectedRating.behaviour && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                                            Behaviour Assessment
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                                            {selectedRating.behaviour}
                                        </Typography>
                                    </Box>
                                )}

                                {selectedRating.leadershipAndResponsibility && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                                            Leadership & Responsibility
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#333', fontWeight: 500 }}>
                                            {selectedRating.leadershipAndResponsibility}
                                        </Typography>
                                    </Box>
                                )}

                                {selectedRating.comments && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                                            Comments
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.5 }}>
                                            {selectedRating.comments}
                                        </Typography>
                                    </Box>
                                )}

                                <Divider />

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PersonIcon sx={{ fontSize: 16, color: '#999' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Rated by: {selectedRating.givenBy}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {window.location.pathname !== '/my-performance' && (
                        <Button
                            onClick={() => handleEditRating(selectedRating)}
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{ mr: 1 }}
                        >
                            Edit Rating
                        </Button>
                    )}
                    <Button onClick={handleCloseDetailsModal} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PerformanceAnalysisPage;