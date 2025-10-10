import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Snackbar,
    Card,
    CardContent,
    Alert,
    Chip,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { styled } from "@mui/material/styles";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
    fetchHandbooks,
    clearError,
} from '../../features/handbook/handbookSlice';

const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));


const EmployeeHandbookView = () => {
    const dispatch = useDispatch();
    const {
        handbooks,
        loading,
        error
    } = useSelector((state) => state.handbook);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const storedData = localStorage.getItem("user");
    const userData = storedData ? JSON.parse(storedData) : null;
    const userId = userData?.employee?.id || null;

    useEffect(() => {
        if (!userId) {
            setSnackbar({
                open: true,
                message: "User information is missing. Please log in.",
                severity: "error",
            });
            return;
        }

        dispatch(fetchHandbooks(userId));
    }, [userId, dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({
                open: false,
                message: "Failed to fetch handbooks.",
                severity: "error",
            });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleCloseSnackbar = () =>
        setSnackbar((prev) => ({ ...prev, open: false }));

    return (
        <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
            <HeaderCard>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                                Available Handbooks
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Access and download company handbooks, policies, and important documents
                            </Typography>
                        </Box>
                        <MenuBookIcon
                            fontSize="large"
                            sx={{ color: "#2563eb" }}
                        />
                    </Box>
                </CardContent>
            </HeaderCard>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) :
                handbooks.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {handbooks.map((handbook) => (
                            <Paper
                                key={handbook._id}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    border: "1px solid #e2e8f0",
                                    bgcolor: "#fff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        borderColor: "#d1d5db",
                                    },
                                }}
                            >
                                {/* Header Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        mb: 2
                                    }}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#1e293b",
                                                lineHeight: 1.3,
                                                flex: 1,
                                                mr: 2
                                            }}
                                        >
                                            {handbook.title}
                                        </Typography>

                                        {handbook.fileUrl && (
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                onClick={() => {
                                                    // Force download instead of opening
                                                    const link = document.createElement('a');
                                                    link.href = handbook.fileUrl;
                                                    link.download = handbook.title + '.pdf';
                                                    link.target = '_blank';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                sx={{
                                                    backgroundColor: "#2563eb",
                                                    color: "white",
                                                    borderRadius: 2,
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    "&:hover": {
                                                        backgroundColor: "#1d4ed8",
                                                        transform: "translateY(-1px)",
                                                    },
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                Download
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Content Preview */}
                                    {handbook.content && (
                                        <Box sx={{
                                            p: 3,
                                            bgcolor: "#f8fafc",
                                            borderRadius: 2,
                                            border: "1px solid #e2e8f0",
                                            mb: 3
                                        }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: "#475569",
                                                    lineHeight: 1.6,
                                                    fontStyle: "italic"
                                                }}
                                            >
                                                {handbook.content}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Footer Info */}
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    pt: 2,
                                    borderTop: "1px solid #f1f5f9"
                                }}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#64748b", mb: 0.5, fontWeight: 500 }}
                                        >
                                            Uploaded by: {handbook.uploadedBy.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "#94a3b8" }}
                                        >
                                            {handbook.uploadedBy.email}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#94a3b8",
                                            bgcolor: "#f1f5f9",
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontWeight: 500
                                        }}
                                    >
                                        {new Date(handbook.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            textAlign: "center",
                            bgcolor: "#f9f9f9",
                            border: "1px solid #eee",
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "#666" }}>
                            No handbooks available for you.
                        </Typography>
                    </Box>
                )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EmployeeHandbookView;