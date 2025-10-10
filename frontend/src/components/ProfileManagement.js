import React, { useState, useEffect } from "react";
import {
  Box,
  Tooltip,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Container,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import { Lock as LockIcon } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff } from '@mui/icons-material';

import {
  editExistingEmployee,
  changePassword,
  clearSuccessMessage,
} from "../features/employees/employeeSlice";


const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


const ProfileManagement = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.employees
  );
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    address: "",
    department: "",
    joiningDate: null,
    phone: "",
    city: "",
    state: "",
    pincode: "",
    dob: null,
    position: "",
    jobRole: "",
    image: "",
    status: "1",
    type: 2,
    BankName: "",
    BankAccountNumber: "",
    BankAccountIFSCCode: "",
    NameOnBankAccount: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getNonEditableFieldStyle = (isEditMode) =>
    isEditMode ? {} : {
      '& .MuiOutlinedInput-root': {
        pointerEvents: 'none',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23) !important',
        }
      }
    };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
  };

  const handleTogglePasswordVisibility = (field) => {
    switch (field) {
      case 'currentPassword':
        setShowCurrentPassword((prev) => !prev);
        break;
      case 'newPassword':
        setShowNewPassword((prev) => !prev);
        break;
      case 'confirmPassword':
        setShowConfirmPassword((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // alert("hi")
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    // console.log("changePassword", changePassword)
    dispatch(
      changePassword({
        id: formData.id,
        passwordData: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      })
    )
      .unwrap()
      .then(() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password updated successfully");
      })
      .catch((error) => {
        setPasswordError(error.message || "Failed to update password");
      });
  };
  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
      newErrors.name = "Name should only contain letters and spaces";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    if (
      formData.phone &&
      !/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ""))
    ) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }
    // Bank Name validation (optional)
    if (formData.BankName && !/^[a-zA-Z\s]*$/.test(formData.BankName)) {
      newErrors.BankName = "Bank name should only contain letters and spaces";
    }

    // Bank Account Number validation (optional)
    if (formData.BankAccountNumber && !/^\d{9,18}$/.test(formData.BankAccountNumber)) {
      newErrors.BankAccountNumber = "Bank account number must be 9-18 digits";
    }

    // IFSC Code validation (optional)
    if (formData.BankAccountIFSCCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.BankAccountIFSCCode)) {
      newErrors.BankAccountIFSCCode = "IFSC code must be 11 characters (e.g., ABCD0123456)";
    }

    // Name on Bank Account validation (optional)
    if (formData.NameOnBankAccount && !/^[a-zA-Z\s]*$/.test(formData.NameOnBankAccount)) {
      newErrors.NameOnBankAccount = "Name on bank account should only contain letters and spaces";
    }

    // Date validations
    const currentDate = new Date();

    // DOB validation
    if (formData.dob) {
      const age = Math.floor(
        (currentDate - new Date(formData.dob)) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < 18) {
        newErrors.dob = "Employee must be at least 18 years old";
      } else if (age > 100) {
        newErrors.dob = "Please verify the date of birth";
      }
    }

    // Joining Date validation
    if (formData.joiningDate) {
      if (formData.joiningDate > currentDate) {
        newErrors.joiningDate = "Joining date cannot be in the future";
      }
      if (formData.dob && formData.joiningDate < formData.dob) {
        newErrors.joiningDate = "Joining date cannot be before date of birth";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    fetchEmployeeData();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      if (successMessage) {
        toast.success(successMessage);
        setEditMode(false);
      } else {
        toast.error(error);
      }
    }
    return () => {
      dispatch(clearSuccessMessage());
    };
  }, [successMessage, error, dispatch]);
  const updateLocalStorage = (updatedEmployee) => {
    try {
      const storedData = JSON.parse(localStorage.getItem("user"));
      const newData = {
        ...storedData,
        employee: {
          ...storedData.employee,
          ...updatedEmployee,
        },
      };
      localStorage.setItem("user", JSON.stringify(newData));
    } catch (err) {
      console.error("Error updating localStorage:", err);
    }
  };

  const convertImageUrlToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        const { employee } = JSON.parse(storedData);

        let imageData = employee.image;
        if (imageData && imageData.startsWith("http")) {
          imageData = await convertImageUrlToBase64(employee.image);
        }

        const formattedData = {
          ...employee,
          dob: employee.dob ? new Date(employee.dob) : null,
          joiningDate: employee.joiningDate
            ? new Date(employee.joiningDate)
            : null,
          image: imageData,
          BankName: employee.BankName || "",
          BankAccountNumber: employee.BankAccountNumber || "",
          BankAccountIFSCCode: employee.BankAccountIFSCCode || "",
          NameOnBankAccount: employee.NameOnBankAccount || "",
        };

        setFormData(formattedData);
        setImagePreview(imageData);
      }
    } catch (err) {
      toast.error("Failed to load profile data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let normalizedValue = value;

    // Normalize specific bank fields
    if (name === "BankAccountIFSCCode") {
      normalizedValue = value.toUpperCase();
    } else if (name === "BankAccountNumber") {
      normalizedValue = value.replace(/[\s-]/g, "");
    } else if (name === "BankName" || name === "NameOnBankAccount") {
      normalizedValue = value.trimStart(); // Trim leading spaces, allow trailing for real-time input
    }

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));

    // Clear error when date is changed
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should not exceed 1MB"
        }));
        toast.error("Image size should not exceed 1MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file"
        }));
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setImagePreview(imageData);
        setFormData((prev) => ({
          ...prev,
          image: imageData,
        }));
        // Clear error
        setErrors((prev) => ({
          ...prev,
          image: undefined,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors before submitting");
      return;
    }

    const dataToSubmit = {
      ...formData,
      dob: formData.dob ? formData.dob.toISOString() : null,
      joiningDate: formData.joiningDate
        ? formData.joiningDate.toISOString()
        : null,
    };

    dispatch(
      editExistingEmployee({ id: formData.id, employeeData: dataToSubmit })
    )
      .unwrap()
      .then((response) => {
        updateLocalStorage(response.employee);
        const updatedFormData = {
          ...response.employee,
          dob: response.employee.dob ? new Date(response.employee.dob) : null,
          joiningDate: response.employee.joiningDate
            ? new Date(response.employee.joiningDate)
            : null,
        };
        setFormData(updatedFormData);

        // toast.success("Profile updated successfully!");
        setEditMode(false);

        if (
          response.employee.image &&
          response.employee.image.startsWith("http")
        ) {
          convertImageUrlToBase64(response.employee.image).then(
            (base64Image) => {
              setImagePreview(base64Image);
              setFormData((prev) => ({
                ...prev,
                image: base64Image,
              }));
            }
          );
        }
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      });
  };

  const handleCancel = () => {
    fetchEmployeeData();
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Employee Profile
              </Typography>
              <Typography variant="body2" color="#6b7280">
                View and edit your personal information, contact details, and professional records.
              </Typography>
            </Box>
            {!editMode ? (
              // <Tooltip title="Edit Profile">
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                variant="outlined"
                color="primary"
                sx={{
                  borderRadius: '8px',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: '36px',
                  backgroundColor: '#f0f7ff',
                  '&:hover': {
                    backgroundColor: '#e0f0ff',
                    borderColor: '#90caf9',
                  },
                }}
              >
                Edit Profile
              </Button>
              // </Tooltip>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  sx={{
                    borderRadius: '8px',
                    paddingX: 2,
                    paddingY: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    backgroundColor: '#f0f7ff',
                    '&:hover': {
                      backgroundColor: '#e0f0ff',
                    },
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    borderRadius: '8px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    minHeight: '36px',
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Box>
        </CardContent>
      </HeaderCard>

      <Card elevation={3} sx={{ pb: 5 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* Profile Image Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 2
              }}
            >
              <Avatar
                src={imagePreview}
                sx={{ width: 150, height: 150, mb: 2 }}
                alt={formData.name}
              />
              {editMode && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ mb: 3 }}
                >
                  Upload Photo
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageUpload}
                  />
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setShowPasswordModal(true)}
                sx={{ width: "auto" }}
              >
                Change Password
              </Button>
            </Box>

            {/* Form Fields */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, pt: 3 }}>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },

                    }}
                    required
                    sx={getNonEditableFieldStyle(editMode)}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    disabled
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    error={!!errors.phone}
                    helperText={errors.name}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dob}
                      onChange={(date) => handleDateChange("dob", date)}
                      readOnly={!editMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dob,
                          helperText: errors.dob,
                        },
                      }}
                      sx={getNonEditableFieldStyle(editMode)}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(33% - 24px)", minWidth: "200px" }}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(33% - 24px)", minWidth: "200px" }}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    error={!!errors.state}
                    helperText={errors.state}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(33% - 24px)", minWidth: "200px" }}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    error={!!errors.pincode}
                    helperText={errors.pincode}
                  />
                </Box>


                <Box sx={{ width: "100%" }}>
                  <Divider sx={{ my: 2 }}>Bank Account Details</Divider>
                </Box>

                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: { xs: "200px", sm: "250px" } }}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="BankName"
                    value={formData.BankName}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                        inputProps: {
                          maxLength: 50,
                        },
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    placeholder="e.g., State Bank of India"
                    error={!!errors.BankName}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: { xs: "200px", sm: "250px" } }}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    name="BankAccountNumber"
                    value={formData.BankAccountNumber}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                        inputProps: {
                          maxLength: 18,
                          pattern: "\\d*",
                        },
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    placeholder="e.g., 123456789012"
                    error={!!errors.BankAccountNumber}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: { xs: "200px", sm: "250px" } }}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="BankAccountIFSCCode"
                    value={formData.BankAccountIFSCCode}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                        inputProps: {
                          maxLength: 11,
                          pattern: "[A-Z0-9]*",
                        },
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    placeholder="e.g., SBIN0001234"
                    error={!!errors.BankAccountIFSCCode}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 16px)", minWidth: { xs: "200px", sm: "250px" } }}>
                  <TextField
                    fullWidth
                    label="Your Name on Bank Account"
                    name="NameOnBankAccount"
                    value={formData.NameOnBankAccount}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                        inputProps: {
                          maxLength: 50,
                        },
                      },
                    }}
                    sx={getNonEditableFieldStyle(editMode)}
                    placeholder={`e.g., ${formData.name || "Full Name"}`}
                    error={!!errors.NameOnBankAccount}
                  />
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Divider sx={{ my: 2 }}>Professional Information</Divider>
                </Box>

                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    disabled
                    error={!!errors.department}
                    helperText={errors.department}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    disabled
                    error={!!errors.position}
                    helperText={errors.position}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <TextField
                    fullWidth
                    label="Job Role"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    slotProps={{
                      input: {
                        readOnly: !editMode,
                      },
                    }}
                    disabled
                    error={!!errors.jobRole}
                    helperText={errors.jobRole}
                  />
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 24px)", minWidth: "250px" }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Joining Date"
                      value={formData.joiningDate}
                      onChange={(date) => handleDateChange("joiningDate", date)}
                      readOnly={!editMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dob,
                          helperText: errors.dob,
                        },
                      }}
                      disabled
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                      error={!!errors.joiningDate}
                      helperText={errors.joiningDate}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError("");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Change Password</Typography>
            <IconButton
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError("");
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={!!passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('currentPassword')}
                      edge="end"
                    >
                      {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={!!passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('newPassword')}
                      edge="end"
                    >
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordError("");
              setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordSubmit}
            disabled={loading}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}></Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default ProfileManagement;
