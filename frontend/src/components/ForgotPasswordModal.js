import React, { useState } from "react";
import {
    Modal,
    Fade,
    Backdrop,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../constants/apiConstants'

const ForgotPasswordModal = ({ open, onClose }) => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    const handleRequestOtp = async () => {
        setLoading(true);
        setError(null);

        try {

            const response = await axios.post(
                `${API_BASE_URL}/employee/requestPassword`,
                { email },
                { timeout: 20000 }
            );

            if (response.status === 200) {
                setStep(2);
            } else {
                setError(response.data.message || "Error sending OTP. Try again.");
            }
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError("Request timed out. The server may be having issues processing email requests.");
            } else {
                setError(err.response?.data?.message || "Error sending OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/employee/verifyResetCode`,
                {
                    email,
                    code: otp,
                    newPassword,
                },
                { timeout: 15000 }
            );

            alert("Password reset successfully! Redirecting to login...");
            onClose();
            navigate("/login");
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError("Request timed out. Please try again.");
            } else {
                setError(err.response?.data?.message || "Failed to reset password. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        background: "linear-gradient(135deg, #1e1e2f 0%, #3c3c5a 100%)",
                        color: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {step === 1 ? "Request OTP" : "Reset Password"}
                    </Typography>

                    {error && (
                        <Typography color="error" variant="body2" mb={2}>
                            {error}
                        </Typography>
                    )}


                    {step === 1 && (
                        <>
                            <TextField
                                fullWidth
                                label="Enter your email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        color: 'white'
                                    },
                                    '& .MuiFormLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)'
                                        },
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleRequestOtp}
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? <CircularProgress size={24} /> : "Request OTP"}
                            </Button>
                        </>
                    )}


                    {step === 2 && (
                        <>
                            <TextField
                                fullWidth
                                label="Enter OTP"
                                variant="outlined"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        color: 'white'
                                    },
                                    '& .MuiFormLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                variant="outlined"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                                sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                            >
                                                {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        color: 'white'
                                    },
                                    '& .MuiFormLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleResetPassword}
                                disabled={loading || !otp || !newPassword}
                                fullWidth
                            >
                                {loading ? <CircularProgress size={24} /> : "Reset Password"}
                            </Button>
                        </>
                    )}
                </Box>
            </Fade>
        </Modal>
    );
};

export default ForgotPasswordModal;
