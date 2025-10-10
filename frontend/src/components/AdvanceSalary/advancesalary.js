import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Typography,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Card,
    CardContent,
    TextField,
    Alert,
    MenuItem,
    IconButton,
    DialogContent,
    Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useTheme } from '@mui/material/styles';
import { Fab, Dialog } from '@mui/material';
import { styled } from "@mui/material/styles";
import { Add, Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import PaymentsIcon from '@mui/icons-material/Payments';
import {
    submitAdvanceSalaryRequest,
    fetchMyAdvanceSalaryRequests,
    clearError,
    clearSuccessMessage,
    resetForm,
} from '../../features/advanceSalary/advanceSalarySlice';

const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));

const AdvanceSalary = () => {
    const dispatch = useDispatch();
    const {
        myRequests,
        myRequestsLoading: loadingRequests,
        submitLoading: loading,
        error,
        successMessage
    } = useSelector((state) => state.advanceSalary);
    const [openModal, setOpenModal] = useState(false);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [alert, setAlert] = useState(null);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const theme = useTheme();
    const userData = JSON.parse(localStorage.getItem('user'));
    const employeeId = userData?.employee?.id;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (hasPendingRequest) {
            setAlert({ type: 'error', message: 'You cannot submit a new request while a previous request is pending.' });
            return;
        }

        if (!month || !year || !amount) {
            setAlert({ type: 'error', message: 'Please fill in all required fields.' });
            return;
        }

        const payload = {
            employeeId,
            month,
            year,
            amount,
            reason,
            requestDate: new Date().toISOString()
        };

        dispatch(submitAdvanceSalaryRequest(payload));
    };

    const hasPendingRequest = React.useMemo(() => {
        return myRequests.some(req => req.status && req.status.toLowerCase() === 'pending');
    }, [myRequests]);

    useEffect(() => {
        if (employeeId) {
            dispatch(fetchMyAdvanceSalaryRequests(employeeId));
        }
    }, [employeeId, dispatch]);

    useEffect(() => {
        if (successMessage) {
            setAlert({ type: 'success', message: successMessage });
            dispatch(clearSuccessMessage());
            setMonth('');
            setYear('');
            setAmount('');
            setReason('');
            setOpenModal(false);
            if (employeeId) {
                dispatch(fetchMyAdvanceSalaryRequests(employeeId));
            }
            setTimeout(() => setAlert(null), 3000);
        }
    }, [successMessage, dispatch, employeeId]);
    useEffect(() => {
        if (error) {
            setAlert({ type: 'error', message: typeof error === 'string' ? error : 'Something went wrong. Please try again.' });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return theme.palette.success.main;
            case 'rejected': return theme.palette.error.main;
            default: return theme.palette.warning.main;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <HeaderCard>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                                Advance Salary Request
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Submit and track your advance salary requests. Monitor approval status and manage your financial needs
                            </Typography>
                        </Box>
                        <PaymentsIcon
                            fontSize="large"
                            sx={{ color: theme.palette.primary.main }}
                        />
                    </Box>
                </CardContent>
            </HeaderCard>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{
                    position: 'fixed',
                    right: 16,
                    bottom: 16,
                    zIndex: 1000,
                }}>
                    {hasPendingRequest ? (
                        <Alert severity="warning" sx={{ borderRadius: 1 }}>
                            You can't make another request since your last request is pending.
                        </Alert>
                    ) : (
                        <Fab
                            color="primary"
                            onClick={() => setOpenModal(true)}
                            sx={{
                                width: 56,
                                height: 56,
                                boxShadow: 3,
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <Add />
                        </Fab>
                    )}
                </Box>

                <Dialog
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    maxWidth="sm"
                    fullWidth
                    sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
                >
                    <Box sx={{
                        background: 'linear-gradient(to right, #f5f7fa, #e4e8f0)',
                        color: theme.palette.text.primary,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                        <EventIcon
                            fontSize="medium"
                            sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography variant="h6" fontWeight="600" fontFamily="'Poppins', sans-serif">
                            Advance Salary Request
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={() => setOpenModal(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: theme.palette.grey[500],
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                    <Box sx={{ p: 4 }}>
                        {alert && (
                            <Alert
                                severity={alert.type}
                                sx={{ mb: 3, borderRadius: 1 }}
                                variant="filled"
                            >
                                {alert.message}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <Box
                                    display="flex"
                                    gap={3}
                                    sx={{
                                        flexDirection: { xs: 'column', sm: 'row' }
                                    }}
                                >
                                    <TextField
                                        select
                                        label="Month"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        sx={{ bgcolor: 'background.paper' }}
                                    >
                                        {months.map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        label="Year"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        sx={{ bgcolor: 'background.paper' }}
                                    >
                                        {years.map((y) => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                                <TextField
                                    label="Amount (₹)"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <Box sx={{ color: 'text.secondary', mr: 1 }}>₹</Box>,
                                    }}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <TextField
                                    label="Reason for Advance"
                                    multiline
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Please provide a brief explanation for your advance salary request"
                                    sx={{
                                        bgcolor: 'background.paper',
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: theme.palette.divider,
                                            },
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.light,
                                            },
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            minWidth: 140,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            py: 1.2,
                                            boxShadow: 2
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                                    </Button>
                                </Box>
                            </Stack>
                        </form>
                    </Box>
                </Dialog>
            </Paper>
            <Paper elevation={3} sx={{ mt: 0, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 4 }}>
                    {loadingRequests ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : myRequests.length > 0 ? (
                        <>
                            <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)} maxWidth="md">
                                <DialogContent>
                                    {selectedImage && (
                                        <img
                                            src={selectedImage}
                                            alt="Zoomed Approval Document"
                                            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                        />
                                    )}
                                </DialogContent>
                            </Dialog>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    boxShadow: 'none',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                    maxHeight: 350
                                }}
                            >
                                <Table>
                                    <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Month</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Year</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Approval Image</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reason</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {myRequests.map((req) => (
                                            <TableRow key={req._id} hover>
                                                <TableCell>{req.month}</TableCell>
                                                <TableCell>{req.year}</TableCell>
                                                <TableCell>₹{req.amount}</TableCell>
                                                <TableCell sx={{ minWidth: 150 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'inline-block',
                                                            borderRadius: 1,
                                                            px: 1.5,
                                                            py: 0.5,
                                                            bgcolor: `${getStatusColor(req.status)}15`,
                                                            color: getStatusColor(req.status),
                                                            fontWeight: 'medium',
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.85rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {req.status === 'approved' && req.approvalImagePath
                                                            ? req.responseNote || req.status
                                                            : req.status}
                                                    </Box>
                                                </TableCell>

                                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    {req.approvalImagePath ? (
                                                        <img
                                                            src={req.approvalImagePath}
                                                            alt="Approval Document"
                                                            style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setSelectedImage(req.approvalImagePath);
                                                                setOpenImageModal(true);
                                                            }}
                                                        />
                                                    ) : (
                                                        ' '
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{
                                                    maxWidth: '180px',
                                                }}>
                                                    {req.reason || "No reason provided"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ) : (
                        <Box sx={{ py: 1, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No advance salary requests found.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container >
    );
};

export default AdvanceSalary;