import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Button, CircularProgress, Container, Paper, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Typography, Alert,
    Stack, Input
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useTheme } from '@mui/material/styles';
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdvanceSalaryRequests,
    updateSalaryRequestStatus,
    clearError,
    clearSuccessMessage,
    setActionLoading,
} from '../../features/advanceSalary/advanceSalarySlice';

const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));

const AdminAdvanceSalaryPanel = () => {
    const dispatch = useDispatch();

    // REPLACE local state with Redux state
    const {
        requests,
        loading,
        actionLoading,
        error,
        successMessage
    } = useSelector((state) => state.advanceSalary);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [alert, setAlert] = useState(null);
    const fileInputRef = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        dispatch(fetchAdvanceSalaryRequests());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            setAlert({ type: 'success', message: successMessage });
            dispatch(clearSuccessMessage());
            setTimeout(() => setAlert(null), 3000);
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (error) {
            setAlert({ type: 'error', message: error });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // REPLACE updateStatus function
    const updateStatus = (id, status) => {
        dispatch(updateSalaryRequestStatus({
            requestId: id,
            updateData: {
                status,
                responseNote: '',
            }
        }));
    };

    // UPDATE handleFileChange function
    const handleFileChange = async (event, requestId) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            dispatch(setActionLoading(requestId + 'upload'));

            const base64Image = await convertFileToBase64(file);

            // DISPATCH Redux action instead of direct API call
            await dispatch(updateSalaryRequestStatus({
                requestId,
                updateData: {
                    status: 'approved',
                    responseNote: 'Approved with document',
                    image: base64Image
                }
            })).unwrap();

        } catch (err) {
            console.error(err);
            setAlert({ type: 'error', message: 'Failed to upload file.' });
        } finally {
            dispatch(setActionLoading(null));
            event.target.value = '';
        }
    };



    // Helper function to convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUploadClick = (requestId) => {
        setCurrentRequestId(requestId);
        dispatch(setActionLoading(requestId + 'upload'));
        fileInputRef.current.click();
    };

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
                                All Advance Salary Requests
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Review and manage employee advance salary requests. Approve or reject requests and upload approval documents.
                            </Typography>
                        </Box>
                        <EventIcon
                            fontSize="large"
                            sx={{ color: theme.palette.primary.main }}
                        />
                    </Box>
                </CardContent>
            </HeaderCard>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                    <Input
                        type="file"
                        inputRef={fileInputRef}
                        sx={{ display: 'none' }}
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleFileChange(e, currentRequestId)}
                    />


                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : requests.length > 0 ? (
                        <TableContainer
                            component={Paper}
                            sx={{
                                boxShadow: 'none',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                maxHeight: 550
                            }}
                        >
                            <Table>
                                <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Month</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Year</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reason</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Requested On</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Approval Image</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((r) => (
                                        <TableRow key={r._id} hover>
                                            <TableCell>
                                                {r.employeeId?.name || 'N/A'}<br />
                                                <Typography variant="caption" color="text.secondary">
                                                    {r.employeeId?.employeeCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{r.month}</TableCell>
                                            <TableCell>{r.year}</TableCell>
                                            <TableCell>₹{r.amount}</TableCell>
                                            <TableCell sx={{ maxWidth: '180px' }}>{r.reason || ' '}</TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    display: 'inline-block',
                                                    borderRadius: 1,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    bgcolor: `${getStatusColor(r.status)}15`,
                                                    color: getStatusColor(r.status),
                                                    fontWeight: 'medium',
                                                    textTransform: 'capitalize',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {r.status === 'approved' && r.approvalImagePath ? r.responseNote || r.status : r.status}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {r.approvalImagePath ? (
                                                    <img
                                                        src={r.approvalImagePath}
                                                        alt="Approval Document"
                                                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                                        onClick={() => window.open(r.approvalImagePath, '_blank')}
                                                    />
                                                ) : (
                                                    ' '
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.approvalImagePath || r.status === 'rejected' ? (
                                                    ' '
                                                ) : r.status === 'approved' ? (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={actionLoading === r._id + 'upload'}
                                                        onClick={() => handleUploadClick(r._id)}
                                                        sx={{
                                                            borderRadius: 1,
                                                            textTransform: 'none',
                                                            boxShadow: 1,
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '0.85rem',
                                                            px: 1.5,
                                                            py: 0.5
                                                        }}
                                                    >
                                                        {actionLoading === r._id + 'upload' ? (
                                                            <CircularProgress size={24} color="inherit" />
                                                        ) : (
                                                            'Upload File'
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            disabled={actionLoading === r._id + 'approved'}
                                                            onClick={() => updateStatus(r._id, 'approved')}
                                                            sx={{
                                                                borderRadius: 1,
                                                                textTransform: 'none',
                                                                boxShadow: 1
                                                            }}
                                                        >
                                                            {actionLoading === r._id + 'approved' ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                'Approve'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            disabled={actionLoading === r._id + 'rejected'}
                                                            onClick={() => updateStatus(r._id, 'rejected')}
                                                            sx={{
                                                                borderRadius: 1,
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            {actionLoading === r._id + 'rejected' ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                'Reject'
                                                            )}
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No advance salary requests found.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminAdvanceSalaryPanel;