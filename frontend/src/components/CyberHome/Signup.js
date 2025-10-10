import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, setRegistrationStep, clearRegistrationState, setAdminEmail } from '../../features/auth/authSlice';
import {
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

const SignUpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { registrationLoading, registrationError, registrationStep, organizationId, adminEmail } = useSelector(state => state.auth);

    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        // Organization data
        orgName: '',
        location: '',
        orgType: '',
        description: '',
        orgSize: '',
        orgPhone: '',
        orgEmail: '',

        // Admin data
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const steps = ['Organization Details', 'Admin Profile', 'Email Verification'];

    useEffect(() => {
        console.log('registrationStep changed:', registrationStep);
        setStep(registrationStep - 1);
    }, [registrationStep]);


    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleOtpChange = (event) => {
        setOtp(event.target.value);
    };

    const validateStep1 = () => {
        const { orgName, location, orgType, description, orgSize, orgPhone, orgEmail } = formData;
        if (!orgName || !location || !orgType || !description || !orgSize || !orgPhone || !orgEmail) {
            alert('Please fill all organization fields');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(orgEmail)) {
            alert('Please enter a valid organization email');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const { name, email, password, confirmPassword, phone } = formData;
        if (!name || !email || !password || !confirmPassword || !phone) {
            alert('Please fill all admin fields');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email');
            return false;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleStep1Submit = async () => {
        if (!validateStep1()) return;

        const orgData = {
            orgName: formData.orgName,
            location: formData.location,
            orgType: formData.orgType,
            description: formData.description,
            orgSize: formData.orgSize,
            phone: formData.orgPhone,
            email: formData.orgEmail
        };

        try {
            const result = await dispatch(registerUser({
                step: 1,
                orgData
            })).unwrap();

            if (result.success && result.orgId) {
                console.log('Organization created successfully, orgId:', result.orgId);
                console.log('Current registrationStep after API:', registrationStep);
                // Force update step if Redux doesn't trigger
                setStep(1);
            }
        } catch (error) {
            console.error('Step 1 failed:', error);
        }
    };

    const handleStep2Submit = async () => {
        if (!validateStep2()) return;

        console.log('Step 2 - formData.email:', formData.email);
        if (!organizationId) {
            alert('Organization ID not found. Please start over.');
            return;
        }

        const adminData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            organizationId: organizationId
        };

        try {
            const result = await dispatch(registerUser({
                step: 2,
                adminData
            })).unwrap();

            if (result.success && result.message === "OTP sent to email") {
                console.log('Saving email:', formData.email);
                dispatch(setAdminEmail(formData.email));
                console.log('OTP sent successfully');
            }
        } catch (error) {
            console.error('Step 2 failed:', error);
        }
    };

    const handleOtpSubmit = async () => {
        console.log('Step 3 - adminEmail:', adminEmail);
        console.log('Step 3 - formData.email:', formData.email);
        if (!otp || otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        const adminData = {
            email: adminEmail
        };


        try {
            const result = await dispatch(registerUser({
                step: 3,
                adminData,
                otp
            })).unwrap();

            if (result.success && result.token) {
                alert('Registration successful! Redirecting to login...');
                dispatch(clearRegistrationState());
                navigate('/login');
            }
        } catch (error) {
            console.error('OTP verification failed:', error);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            dispatch(setRegistrationStep(step)); // step is already 0-indexed, so this works
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            padding: '40px 20px',
            fontFamily: "'Inter', sans-serif",
        },
        mainWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '80px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
        },
        leftSection: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
        },
        heroImage: {
            width: '100%',
            maxWidth: '500px',  // Constrain to left section only
            height: '650px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        heroTitle: {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontSize: '2.5rem',
            fontWeight: 700,
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            zIndex: 2,
            margin: 0,
        },

        heroSubtitle: {
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#f1f5f9',
            fontSize: '1.1rem',
            fontWeight: 400,
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            zIndex: 2,
            margin: 0,
        },

        rightSection: {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
        },
        formContainer: {
            padding: '40px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
        stepper: {
            display: 'flex',
            marginBottom: '40px',
            alignItems: 'flex-start',
            position: 'relative',
            height: '60px', // Add fixed height
        },
        stepItem: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
        },
        stepCircle: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            marginRight: '12px',
            border: '2px solid',
        },
        stepLabel: {
            fontSize: '14px',
            fontWeight: 600,
        },
        stepConnector: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: '16.66%',
            right: '16.66%',
            height: '2px',
            zIndex: 1,
        },
        sectionHeader: {
            marginBottom: '30px',
            textAlign: 'center',
        },
        sectionSubtitle: {
            fontSize: '1rem',
            fontWeight: "bold",
            color: '#6c757d',
            margin: 0,
        },
        formGroup: {
            marginBottom: '24px',
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a1a',
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
        },
        inputFocus: {
            borderColor: '#3b82f6',
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        },
        textarea: {
            minHeight: '100px',
            resize: 'vertical',
        },
        passwordWrapper: {
            position: 'relative',
        },
        passwordToggle: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6c757d',
            padding: '4px',
        },
        buttonGroup: {
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
        },
        formRow: {
            display: 'flex',
            gap: '20px',
        },
        formColumn: {
            flex: 1,
        },
        formGroupFullWidth: {
            marginBottom: '24px',
            width: '100%',
        },
        button: {
            padding: '14px 28px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            disabled: 'false',
        },
        primaryButton: {
            backgroundColor: '#3b82f6',
            color: 'white',
            flex: 1,
        },
        primaryButtonHover: {
            backgroundColor: '#2563eb',
        },
        primaryButtonDisabled: {
            backgroundColor: '#cccccc',
            cursor: 'not-allowed',
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            flex: 1,
        },
        secondaryButtonHover: {
            backgroundColor: '#eff6ff',
        },
        errorMessage: {
            color: '#dc3545',
            fontSize: '14px',
            marginTop: '10px',
            textAlign: 'center',
        },
        otpContainer: {
            textAlign: 'center',
        },
        otpInput: {
            fontSize: '24px',
            letterSpacing: '8px',
            textAlign: 'center',
            width: '200px',
            margin: '0 auto',
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div>
                        <div style={styles.sectionHeader}>
                            <p style={styles.sectionSubtitle}>Enter your organization details to get started</p>
                        </div>

                        <div>
                            {/* Row 1: Organization Name + Location */}
                            <div style={styles.formRow}>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Organization Name *</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Enter your organization name"
                                            value={formData.orgName}
                                            onChange={handleInputChange('orgName')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Location *</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Enter your business location"
                                            value={formData.location}
                                            onChange={handleInputChange('location')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Organization Type + Company Size */}
                            <div style={styles.formRow}>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Organization Type *</label>
                                        <select
                                            style={styles.input}
                                            value={formData.orgType}
                                            onChange={handleInputChange('orgType')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        >
                                            <option value="">Select organization type</option>
                                            <option value="IT">IT</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Education">Education</option>
                                            <option value="Manufacturing">Manufacturing</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Company Size *</label>
                                        <select
                                            style={styles.input}
                                            value={formData.orgSize}
                                            onChange={handleInputChange('orgSize')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        >
                                            <option value="">Select company size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-100">51-100 employees</option>
                                            <option value="101-500">101-500 employees</option>
                                            <option value="500+">500+ employees</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Phone + Email */}
                            <div style={styles.formRow}>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Phone Number *</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Enter organization number"
                                            value={formData.orgPhone}
                                            onChange={handleInputChange('orgPhone')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formColumn}>
                                    <div style={styles.formGroupInline}>
                                        <label style={styles.label}>Organization Email *</label>
                                        <input
                                            style={styles.input}
                                            type="email"
                                            placeholder="Enter organization email"
                                            value={formData.orgEmail}
                                            onChange={handleInputChange('orgEmail')}
                                            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Full Width: Business Description */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Business Description *</label>
                                <textarea
                                    style={{ ...styles.input, ...styles.textarea }}
                                    placeholder="Briefly describe your business and industry"
                                    value={formData.description}
                                    onChange={handleInputChange('description')}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                />
                            </div>

                            {registrationError && (
                                <div style={styles.errorMessage}>{registrationError}</div>
                            )}

                            <button
                                style={{
                                    ...styles.button,
                                    ...(registrationLoading ? styles.primaryButtonDisabled : styles.primaryButton),
                                    width: '100%'
                                }}
                                onClick={handleStep1Submit}
                                disabled={registrationLoading}
                                onMouseEnter={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButtonHover)}
                                onMouseLeave={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButton)}
                            >
                                {registrationLoading ? 'Creating Organization...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Admin Account</h2>
                            <p style={styles.sectionSubtitle}>Create your administrator account</p>
                        </div>

                        <div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name *</label>
                                <input
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address *</label>
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number *</label>
                                <input
                                    style={styles.input}
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange('phone')}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password *</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        style={styles.input}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a secure password"
                                        value={formData.password}
                                        onChange={handleInputChange('password')}
                                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                        onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                    />
                                    <button
                                        style={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                        type="button"
                                    >
                                        {showPassword ? <Visibility style={{ fontSize: '18px' }} /> : <VisibilityOff style={{ fontSize: '18px' }} />}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Confirm Password *</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        style={styles.input}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange('confirmPassword')}
                                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                        onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                    />
                                    <button
                                        style={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        type="button"
                                    >
                                        {showConfirmPassword ? <Visibility style={{ fontSize: '18px' }} /> : <VisibilityOff style={{ fontSize: '18px' }} />}
                                    </button>
                                </div>
                            </div>

                            {registrationError && (
                                <div style={styles.errorMessage}>{registrationError}</div>
                            )}

                            <div style={styles.buttonGroup}>
                                <button
                                    style={{ ...styles.button, ...styles.secondaryButton }}
                                    onClick={handleBack}
                                    onMouseEnter={(e) => Object.assign(e.target.style, styles.secondaryButtonHover)}
                                    onMouseLeave={(e) => Object.assign(e.target.style, styles.secondaryButton)}
                                >
                                    Back
                                </button>

                                <button
                                    style={{
                                        ...styles.button,
                                        ...(registrationLoading ? styles.primaryButtonDisabled : styles.primaryButton),
                                        flex: 2
                                    }}
                                    onClick={handleStep2Submit}
                                    disabled={registrationLoading}
                                    onMouseEnter={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButtonHover)}
                                    onMouseLeave={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButton)}
                                >
                                    {registrationLoading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Email Verification</h2>
                            <p style={styles.sectionSubtitle}>Enter the 6-digit OTP sent to {formData.email}</p>
                        </div>

                        <div style={styles.otpContainer}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Enter OTP</label>
                                <input
                                    style={{ ...styles.input, ...styles.otpInput }}
                                    placeholder="000000"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
                                />
                            </div>

                            {registrationError && (
                                <div style={styles.errorMessage}>{registrationError}</div>
                            )}

                            <div style={styles.buttonGroup}>
                                <button
                                    style={{ ...styles.button, ...styles.secondaryButton }}
                                    onClick={handleBack}
                                    onMouseEnter={(e) => Object.assign(e.target.style, styles.secondaryButtonHover)}
                                    onMouseLeave={(e) => Object.assign(e.target.style, styles.secondaryButton)}
                                >
                                    Back
                                </button>

                                <button
                                    style={{
                                        ...styles.button,
                                        ...(registrationLoading ? styles.primaryButtonDisabled : styles.primaryButton),
                                        flex: 2
                                    }}
                                    onClick={handleOtpSubmit}
                                    disabled={registrationLoading}
                                    onMouseEnter={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButtonHover)}
                                    onMouseLeave={(e) => !registrationLoading && Object.assign(e.target.style, styles.primaryButton)}
                                >
                                    {registrationLoading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainWrapper}>
                {/* Left Side - Image */}
                <div style={styles.leftSection}>
                    <img
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                        alt="Organization Management"
                        style={styles.heroImage}
                    />
                    <h1 style={styles.heroTitle}>Welcome to CyberPulse</h1>
                    <p style={styles.heroSubtitle}>Professional organization management platform</p>
                </div>

                {/* Right Side - Form */}
                <div style={styles.rightSection}>
                    <div style={styles.formContainer}>
                        {/* Stepper */}
                        {/* Stepper */}
                        <div style={styles.stepper}>
                            <div
                                style={{
                                    ...styles.stepConnector,
                                    backgroundColor: step > 0 ? '#3b82f6' : '#e0e0e0',
                                }}
                            />
                            <div
                                style={{
                                    ...styles.stepConnector,
                                    left: '50%',
                                    right: '16.66%',
                                    backgroundColor: step > 1 ? '#3b82f6' : '#e0e0e0',
                                }}
                            />
                            {steps.map((label, index) => (
                                <div key={label} style={styles.stepItem}>
                                    <div
                                        style={{
                                            ...styles.stepCircle,
                                            backgroundColor: index <= step ? '#3b82f6' : '#ffffff',
                                            color: index <= step ? 'white' : '#6c757d',
                                            borderColor: index <= step ? '#3b82f6' : '#d1d5db',
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <span
                                        style={{
                                            ...styles.stepLabel,
                                            color: index <= step ? '#3b82f6' : '#6c757d',
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Form Content */}
                        {renderStepContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;