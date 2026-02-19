import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  styled,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import LOGO from "../assets/LOGO.png";
import { loginUser, clearMessage } from "../features/auth/authSlice";
import ForgotPasswordModal from "./ForgotPasswordModal";

const StyledTextField = styled(TextField)({
  '& .MuiFormLabel-root': {
    color: '#64748b',
    fontSize: '16px',
    fontWeight: 500,
  },
  '& .MuiFormLabel-root.Mui-focused': {
    color: '#2563eb',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    '& .MuiInputBase-input': {
      color: '#1e293b',
      fontSize: '16px',
      padding: '16px 14px',
    },
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '14px',
    marginLeft: 4,
  },
});

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Error clearing effect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    } else if (message) {
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  // Open/Close Forgot Password modal
  const handleForgotPasswordOpen = () => setForgotPasswordOpen(true);
  const handleForgotPasswordClose = () => setForgotPasswordOpen(false);

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  // Handle blur events
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    if (field === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(email)
      }));
    } else if (field === 'password') {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(password)
      }));
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value.toLowerCase();
    setEmail(newEmail);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError
    });

    setTouched({
      email: true,
      password: true
    });

    // Only dispatch if there are no errors
    if (!emailError && !passwordError) {
      await dispatch(loginUser({ email, password }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '88.1vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '15px',
        paddingTop: '60px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          borderRadius: '12px',
          padding: '30px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Logo */}
        <img
          src={LOGO}
          alt="CyberPulse Logo"
          style={{
            height: "70px",
            width: "auto",
            display: "block",
            margin: "0 auto 25px auto",
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))',
          }}
        />
        {/* Error/Success Messages */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '8px', backgroundColor: '#2a1215',
              color: '#fecaca',
              fontSize: '14px',
            }}
          >
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: '8px',
              backgroundColor: '#0f3d2e',
              color: '#bbf7d0',
              fontSize: '16px',
            }}
          >
            {message}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Email Field */}
            <StyledTextField
              label="Email Address"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
              autoComplete="off"
              inputProps={{
                autoComplete: 'new-password',
              }}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              required
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#9ca3af', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <StyledTextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              inputProps={{
                autoComplete: 'new-password',
              }}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              required
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#9ca3af', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: '#9ca3af' }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="text"
                onClick={handleForgotPasswordOpen}
                sx={{
                  color: "#64748b",
                  textTransform: "none",
                  fontSize: '16px',
                  padding: '8px 12px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '16px',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                transition: 'background-color 0.2s ease',
                mt: 1,
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#1e3a5a',
                  color: '#cbd5e1',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#cbd5e1' }} />
                  Signing in...
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Sign Up Link */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748b', fontSize: '16px' }}>
                Don't have an account?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/signup')}
                  sx={{
                    color: '#3b82f6',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    minWidth: 'auto',
                    padding: '4px 8px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            </Box>
          </Box>
        </form>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          open={forgotPasswordOpen}
          onClose={handleForgotPasswordClose}
        />
      </Box>
    </Box>
  );
};

export default LoginForm;