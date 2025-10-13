import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Button,
  Typography,
  Box,
  Modal,
  Fab,
  List,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  MenuItem,
  IconButton,
  Container,
  Grid,
  Chip,
  Paper,
  Dialog,
  DialogActions,
  InputLabel,
  Select,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  Stack,
} from "@mui/material";
import DepartmentManagementModal from "../DepartmentManagementModal";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import InfoIcon from "@mui/icons-material/Info";
import BusinessIcon from "@mui/icons-material/Business";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupsIcon from '@mui/icons-material/Groups';

import ImageZoomModal from "../HomeAndEmployeeSelfie/ImageZoomModal";
import { toast, ToastContainer } from "react-toastify";
import MaleSVG from "../../assets/male_svg.svg";
import FemaleSVG from "../../assets/female_svg.svg";
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import "react-toastify/dist/ReactToastify.css";
import {
  addNewEmployee,
  fetchEmployeeList,
  removeEmployee,
  editExistingEmployee,
  clearSuccessMessage,
  updateEmployeeStatusAsync,
} from "../../features/employees/employeeSlice";

import {
  fetchAllDepartments,
} from "../../features/department/departmentSlice";
import EmployeeDetails from "../EmployeeDetails";
import { getOrganizationId } from '../../services/globalOrg';

console.log("Org ID in employees is:", getOrganizationId());

const EmployeeManagement = ({ open, onClose, onConfirm }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, successMessage, error, employeeList } = useSelector(
    (state) => state.employees
  );
  const {
    departmentsList,
    positionsMap,
    loading: departmentsLoading
  } = useSelector((state) => state.departments);

  console.log("ERROR", error, "successMessage", successMessage);
  const [zoomImage, setZoomImage] = useState({
    open: false,
    image: null,
    name: "",
  });
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [salary, setSalary] = useState("");
  const [incrementCycle, setIncrementCycle] = useState("Annual");
  const [incrementAmount, setIncrementAmount] = useState("");
  const [incrementMonth, setIncrementMonth] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [reason, setReason] = React.useState('');
  const [comments, setComments] = React.useState('');

  const [lastWorkingDay, setLastWorkingDay] = React.useState('');
  const [duesStatus, setDuesStatus] = React.useState('');
  const [lastDuePayDate, setLastDuePayDate] = React.useState('');

  const [futureHiring, setFutureHiring] = React.useState('maybe');

  const [gender, setGender] = useState("");
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    position: false,
    department: false,
    joiningDate: false,
    dob: false,
    phone: false,
    pincode: false,
    state: false,
    city: false,
    gender: false,
    jobRole: false,
    role: false,
  });

  const roleOptions = () => {
    return [
      { label: "Employee", value: "employee", type: 2 },
      { label: "Team Leader", value: "teamleader", type: 3 },
      { label: "Human Resource", value: "hr", type: 4 },
      { label: "Manager", value: "manager", type: 5 },
    ];
  };

  const handleConfirm = async () => {
    if (!reason) {
      toast.dismiss();
      toast.error("Please select a reason for removal");
      return;
    }

    
  if (!lastWorkingDay) {
    toast.dismiss();
    toast.error("Please select the last working day");
    return;
  }

  if (!duesStatus) {
    toast.dismiss();
    toast.error("Please select the dues status");
    return;
  }

  if (duesStatus === "pending" && !lastDuePayDate) {
    toast.dismiss();
    toast.error("Please specify the last due pay date");
    return;
  }

    if (selectedEmployee && selectedEmployee._id) {
      try {
        const statusData = {
          status: "0",
          reason,
          comments,
          futureHiring,
          lastWorkingDay,
          lastDuePayDate,
          duesStatus
        };

        await dispatch(updateEmployeeStatusAsync({
          employeeId: selectedEmployee._id,
          statusData
        })).unwrap();

        dispatch(fetchEmployeeList());
        handleCloseDeleteModal();
      } catch (error) {
        toast.dismiss();
        toast.error(error.error || "Failed to deactivate employee");
      }
    }
  };

  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  const handleOpenDepartmentModal = () => {
    setIsDepartmentModalOpen(true);
  };

  // Method to close department management modal
  const handleCloseDepartmentModal = () => {
    setIsDepartmentModalOpen(false);
  };

  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      dispatch(fetchEmployeeList());
      handleCloseModal();
    }
    if (error) {
      const errorMessage = typeof error === "object" ? error.error : error;
      if (errorMessage === "Email already exists") {
        setErrors((prev) => ({
          ...prev,
          email: "Email already exists",
        }));
        setTouched((prev) => ({
          ...prev,
          email: true,
        }));
      } else {
        toast.error(errorMessage);
      }
    }
  }, [successMessage, error, dispatch]);

  const formatDateWithTime = (date) => {
    if (!date) return "";
    return new Date(date).toISOString();
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    validate(field);
  };

  const handleEmployeeClick = (employee) => {
    const currentUrl = window.location.pathname;
    const newUrl = `${currentUrl}/${employee._id}`;
    navigate(newUrl);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
    setErrors({});
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setPosition("");
    if (touched.department) validate('department');
  };

  const handlePositionChange = (e) => {
    setPosition(e.target.value);
    if (touched.position) validate('position');
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfirmOpen(false);
    setSelectedEmployee(null);
    setReason("");
    setComments("");
    setDuesStatus("");
    setLastWorkingDay("");
    setLastDuePayDate("");
    setFutureHiring("maybe");
  };


  const handleDelete = () => {
    if (selectedEmployee && selectedEmployee._id) {
      dispatch(removeEmployee(selectedEmployee._id));
      handleCloseDeleteModal();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {}
      )
    );

    if (!validate()) {
      const relevantErrors = Object.keys(errors).filter(field =>
        touched[field] && errors[field]
      ).slice(0, 3);

      if (relevantErrors.length > 0) {
        const message = relevantErrors.length === Object.keys(errors).length
          ? `Please fix errors in: ${relevantErrors.join(", ")}`
          : `Please fix errors in: ${relevantErrors.join(", ")}${relevantErrors.length < Object.keys(errors).length ? ' and others' : ''}`;
        toast.error(message);
      } else {
        toast.error("Please fill in all required fields");
      }
      return;
    }
    if (!selectedEmployee) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
    }

    const getEmployeeType = () => {
      const selectedRole = roleOptions().find(r => r.value === role);
      return selectedRole ? selectedRole.type : 2; // default to employee type
    };

    const employeeData = {
      name,
      email,
      password,
      position,
      type: getEmployeeType(),
      address,
      phone,
      joiningDate: formatDateWithTime(joiningDate),
      dob: formatDateWithTime(dob),
      department,
      city,
      state,
      pincode,
      jobRole,
      gender,
      status: selectedEmployee?.status === "0" ? "1" : "1",
      reason: selectedEmployee?.status === "0" ? "" : undefined,
      comments: selectedEmployee?.status === "0" ? "" : undefined,
    
      lastWorkingDay : selectedEmployee?.status === "0" ? "" : undefined,
      duesStatus : selectedEmployee?.status === "0" ? "" : undefined,
      lastDuePayDate : selectedEmployee?.status === "0" ? "" : undefined,

      futureHiring: selectedEmployee?.status === "0" ? "" : undefined,
      salary,
      incrementcycle: incrementCycle,
      IncrementAmount: incrementAmount,
      incrementMonth,
    };

    if (selectedEmployee) {
      dispatch(
        editExistingEmployee({ id: selectedEmployee._id, employeeData })
      );
    } else {
      dispatch(addNewEmployee(employeeData));
    }
  };
  const resetForm = () => {
    setName("");
    setEmail("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPosition("");
    setAddress("");
    setDepartment("");
    setJoiningDate("");
    setDob("");
    setPhone("");
    setPincode("");
    setState("");
    setCity("");
    setGender("");
    setJobRole("");
    setSalary("");
    setIncrementCycle("Annual");
    setIncrementAmount("");
    setIncrementMonth("");
    setRole("");
    setSelectedEmployee(null);

    setTouched({
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
      position: false,
      department: false,
      joiningDate: false,
      dob: false,
      phone: false,
      pincode: false,
      state: false,
      city: false,
      gender: false,
      jobRole: false,
      role: false,
    });
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      console.log("employee", employee.name);
      setName(employee.name || "rahul");
      setPassword(employee.password || "");
      setConfirmPassword(employee.confirmPassword || "");
      setEmail(employee.email || "");
      setPosition(employee.position || "");
      setAddress(employee.address || "");
      setDepartment(employee.department || "");
      setGender(employee.gender || "");
      setJoiningDate(
        employee.joiningDate ? employee.joiningDate.split("T")[0] : ""
      );
      setDob(employee.dob ? employee.dob.split("T")[0] : "");
      setPhone(employee.phone || "");
      setPincode(employee.pincode || "");
      setState(employee.state || "");
      setCity(employee.city || "");
      setJobRole(employee.jobRole || "");
      setSalary(employee.salary || "");
      setIncrementAmount(employee.IncrementAmount || "");
      setIncrementCycle(employee.incrementcycle || "");
      setIncrementMonth(employee.incrementMonth || "");
      setSelectedEmployee(employee);
    }
    setOpenModal(true);
  };

  const storedData = localStorage.getItem("user");
  const userData = JSON.parse(storedData);
  const userType = userData?.employee?.type;
  const userDepartment = userData?.employee?.department;
  console.log("user type login", userType);
  console.log("User Department", userDepartment);

  const validate = (fieldName = null) => {
    let tempErrors = { ...errors };
    let isValid = true;
    const currentDate = new Date();

    const fieldsToValidate = fieldName
      ? [fieldName]
      : [
        "name",
        "email",
        "password",
        "position",
        "department",
        "gender",
        "joiningDate",
        "dob",
        "phone",
        "role"
      ];

    fieldsToValidate.forEach((field) => {
      if (field === "name") {
        if (!name.trim()) {
          tempErrors.name = "Name is required";
          isValid = false;
        } else {
          delete tempErrors.name;
        }
      } else if (field === "email") {
        if (!email.trim()) {
          tempErrors.email = "Email is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          tempErrors.email = "Please enter a valid email address";
          isValid = false;
        } else {
          delete tempErrors.email;
        }
      } else if (field === "password") {
        if (!selectedEmployee) {
          // Only validate password for new employees
          if (!password) {
            tempErrors.password = "Password is required";
            isValid = false;
          } else if (password.length < 6) {
            tempErrors.password = "Password must be at least 6 characters long";
            isValid = false;
          } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            tempErrors.password = "Password must contain at least one uppercase letter and one number";
            isValid = false;
          } else {
            delete tempErrors.password;
            if (confirmPassword && password !== confirmPassword) {
              tempErrors.confirmPassword = "Passwords do not match";
            } else if (confirmPassword && password === confirmPassword) {
              delete tempErrors.confirmPassword;
            }
          }
        }
      } else if (field === "confirmPassword") {
        if (!selectedEmployee) {
          if (!confirmPassword) {
            tempErrors.confirmPassword = "Please confirm your password";
            isValid = false;
          } else if (password !== confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match";
            isValid = false;
          } else {
            delete tempErrors.confirmPassword;
          }
        }
      } else if (field === "role") {
        if (!role.trim()) {
          tempErrors.role = "Role is required";
          isValid = false;
        } else {
          delete tempErrors.role;
        }

      } else if (field === "position") {
        if (!position.trim()) {
          tempErrors.position = "Position is required";
          isValid = false;
        } else if (position.trim().length < 2) {
          tempErrors.position = "Position must be at least 2 characters long";
          isValid = false;
        } else {
          delete tempErrors.position;
        }
      } else if (field === "department") {
        if (!department) {
          tempErrors.department = "Department is required";
          isValid = false;
        } else {
          delete tempErrors.department;
        }
      } else if (field === "gender") {
        if (!gender.trim()) {
          tempErrors.gender = "Gender is required";
          isValid = false;
        } else {
          delete tempErrors.gender;
        }
      } else if (field === "joiningDate") {
        if (!joiningDate) {
          tempErrors.joiningDate = "Joining date is required";
          isValid = false;
        } else {
          const selectedJoiningDate = new Date(joiningDate);
          if (selectedJoiningDate > currentDate) {
            tempErrors.joiningDate = "Joining date cannot be in the future";
            isValid = false;
          } else {
            delete tempErrors.joiningDate;
          }
        }
      } else if (field === "dob") {
        if (!dob) {
          tempErrors.dob = "Date of birth is required";
          isValid = false;
        } else {
          const selectedDob = new Date(dob);
          const age = currentDate.getFullYear() - selectedDob.getFullYear();
          const monthDiff = currentDate.getMonth() - selectedDob.getMonth();
          const actualAge =
            monthDiff < 0 ||
              (monthDiff === 0 && currentDate.getDate() < selectedDob.getDate())
              ? age - 1
              : age;

          if (selectedDob > currentDate) {
            tempErrors.dob = "Date of birth cannot be in the future";
            isValid = false;
          } else if (actualAge < 18) {
            tempErrors.dob = "Employee must be at least 18 years old";
            isValid = false;
          } else {
            delete tempErrors.dob;
          }
        }
      } else if (field === "phone") {
        if (!phone.trim()) {
          tempErrors.phone = "Phone number is required";
          isValid = false;
        } else if (!/^\d{10}$/.test(phone.trim())) {
          tempErrors.phone = "Please enter a valid 10-digit phone number";
          isValid = false;
        } else {
          delete tempErrors.phone;
        }
      } else if (field === "pincode") {
        if (pincode && !/^\d{6}$/.test(pincode.trim())) {
          tempErrors.pincode = "Please enter a valid 6-digit pincode";
          isValid = false;
        } else {
          delete tempErrors.pincode;
        }
      } else if (field === "state") {
        if (state && state.trim().length < 2) {
          tempErrors.state = "State name should be at least 2 characters long";
          isValid = false;
        } else {
          delete tempErrors.state;
        }
      } else if (field === "city") {
        if (city && city.trim().length < 2) {
          tempErrors.city = "City name should be at least 2 characters long";
          isValid = false;
        } else {
          delete tempErrors.city;
        }
      } else if (field === "jobRole") {
        if (jobRole && jobRole.trim().length < 2) {
          tempErrors.jobRole = "Job role should be at least 2 characters long";
          isValid = false;
        } else {
          delete tempErrors.jobRole;
        }
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  //------------------------------------------------------------------------------------
  const handleOpenDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setDeleteConfirmOpen(true);
    setIsViewOnly(employee.status === "0");
    if (employee.status === "0") {
      setReason(employee.reason || "");
      setComments(employee.comments || "");
      setLastWorkingDay(employee.lastWorkingDay ? employee.lastWorkingDay.slice(0, 10) : "");
      setDuesStatus(employee.duesStatus || "");
      setLastDuePayDate(employee.lastDuePayDate ? employee.lastDuePayDate.slice(0, 10) : "");
      setFutureHiring(employee.futureHiring || "maybe");
    } else {
      setReason("");
      setComments("");
      setDuesStatus("");
      setLastDuePayDate("");
      setLastWorkingDay("");
      setFutureHiring("maybe");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#1976d2',
                color: 'white',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GroupsIcon sx={{ fontSize: 20 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight="700" color="#1976d2" gutterBottom>
                Employee Management
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Manage your team members and their information
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: "grey.50",
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <FilterListIcon fontSize="small" color="action" />
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    minWidth: 160,
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    fontWeight: 500
                  }}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="active">Current Employees</MenuItem>
                  <MenuItem value="inactive">Former Employees</MenuItem>
                </Select>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              size="small"
              startIcon={<AccountTreeIcon />}
              onClick={handleOpenDepartmentModal}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Department Info
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <DepartmentManagementModal
        isOpen={isDepartmentModalOpen}
        onClose={handleCloseDepartmentModal}
      />

      {/* Employee Cards */}
      <Stack spacing={2}>
        {employeeList.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "grey.300",
              bgcolor: 'white'
            }}
          >
            <GroupsIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.primary" fontWeight="600" gutterBottom>
              No Employees Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first team member
            </Typography>
          </Paper>
        ) : (
          [...employeeList]
            .filter((employee) => {
              if (statusFilter === "all") return true;
              return statusFilter === "active"
                ? employee.status === "1"
                : employee.status === "0";
            })
            .sort((a, b) => b.status - a.status)
            .map((employee) => (
              <Card
                key={employee._id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: employee.status === "0" ? "error.light" : "grey.200",
                  borderRadius: 2,
                  bgcolor: 'white',
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderColor: "#1976d2",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Employee Info */}
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {employee.status === "0" ? (
                          <Badge
                            badgeContent={<PersonOffIcon sx={{ fontSize: 10, color: 'white' }} />}
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#d32f2f',
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                top: 2,
                                right: 2,
                                border: '2px solid white'
                              }
                            }}
                          >
                            <Avatar
                              onClick={() =>
                                setZoomImage({
                                  open: true,
                                  image: employee.image
                                    ? `${employee.image}`
                                    : employee.gender === "male"
                                      ? MaleSVG
                                      : employee.gender === "female"
                                        ? FemaleSVG
                                        : null,
                                  name: employee.name,
                                })
                              }
                              sx={{
                                width: 48,
                                height: 48,
                                cursor: 'pointer',
                                border: '2px solid #f44336',
                              }}
                              src={employee.image ? `${employee.image}` : undefined}
                            >
                              {!employee.image && (
                                employee.gender === "male" ? (
                                  <img src={MaleSVG} alt="Male Avatar" style={{ width: '100%', height: '100%' }} />
                                ) : employee.gender === "female" ? (
                                  <img src={FemaleSVG} alt="Female Avatar" style={{ width: '100%', height: '100%' }} />
                                ) : (
                                  employee.name.charAt(0).toUpperCase()
                                )
                              )}
                            </Avatar>
                          </Badge>
                        ) : (
                          <Avatar
                            onClick={() =>
                              setZoomImage({
                                open: true,
                                image: employee.image
                                  ? `${employee.image}`
                                  : employee.gender === "male"
                                    ? MaleSVG
                                    : employee.gender === "female"
                                      ? FemaleSVG
                                      : null,
                                name: employee.name,
                              })
                            }
                            sx={{
                              width: 48,
                              height: 48,
                              cursor: 'pointer',
                              border: '2px solid #e0e0e0',
                              '&:hover': {
                                border: '2px solid #1976d2',
                              }
                            }}
                            src={employee.image ? `${employee.image}` : undefined}
                          >
                            {!employee.image && (
                              employee.gender === "male" ? (
                                <img src={MaleSVG} alt="Male Avatar" style={{ width: '100%', height: '100%' }} />
                              ) : employee.gender === "female" ? (
                                <img src={FemaleSVG} alt="Female Avatar" style={{ width: '100%', height: '100%' }} />
                              ) : (
                                employee.name.charAt(0).toUpperCase()
                              )
                            )}
                          </Avatar>
                        )}

                        <Box>
                          <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1rem', mb: 0.5 }}>
                            {employee.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Employee Details */}
                    <Grid item xs={12} md={5}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <EmailIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {employee.email}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <BusinessIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {employee.position} • {employee.department}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Tooltip title="View Profile">
                          <IconButton
                            onClick={() => handleEmployeeClick(employee)}
                            size="small"
                            sx={{
                              backgroundColor: '#e8f4fd',
                              color: '#1976d2',
                              width: 36,
                              height: 36,
                              '&:hover': {
                                backgroundColor: '#d1e9fc',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <AccountCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {userType !== 3 && (
                          <Tooltip title="Edit Details">
                            <IconButton
                              onClick={() => handleOpenModal(employee)}
                              size="small"
                              sx={{
                                backgroundColor: '#f3e5f5',
                                color: '#7b1fa2',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  backgroundColor: '#e1bee7',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditNoteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                      
                          <Tooltip title="Performance Analysis">
                            <IconButton
                              onClick={() => navigate(`/performance-analysis/${employee._id}`)}
                              size="small"
                              sx={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  backgroundColor: '#c8e6c9',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <AssessmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                      


                        <Tooltip title={employee.status === "0" ? "View Removal Details" : "Remove Employee"}>
                          <IconButton
                            onClick={() => handleOpenDeleteModal(employee)}
                            size="small"
                            sx={{
                              backgroundColor: '#ffebee',
                              color: '#d32f2f',
                              width: 36,
                              height: 36,
                              '&:hover': {
                                backgroundColor: '#ffcdd2',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {employee.status === "0" ? <InfoIcon fontSize="small" /> : <PersonRemoveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
        )}
      </Stack>

      <EmployeeDetails
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        employee={selectedEmployeeDetails}
      />

      {/* Floating Action Button */}
      <Fab
        variant="extended"
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          borderRadius: "16px",
          paddingX: 2.5,
          paddingY: 1,
          fontWeight: "500",
          textTransform: "none",
          fontSize: '0.875rem',
        }}
      >
        <PersonAddIcon sx={{ mr: 1 }} />
        New Employee
      </Fab>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "70%", md: "50%" },
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              p: 3,
              bgcolor: '#1976d2',
              color: 'white',
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1200,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              {selectedEmployee ? "Edit Employee" : "Add New Employee"}
            </Typography>
          </Box>

          {/* Modal Content */}
          <Box
            sx={{
              overflowY: "auto",
              flex: 1,
              p: 3,
              bgcolor: "background.paper",
              "&::-webkit-scrollbar": {
                width: '6px',
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: '3px',
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: '3px',
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#a8a8a8",
              },
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Hidden fields to trick autocomplete */}
              <Box sx={{ display: 'none' }}>
                <input type="text" autoComplete="username" />
                <input type="password" autoComplete="current-password" />
              </Box>

              <Grid container spacing={2}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: '#1a202c', fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                    Personal Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    size="small"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) validate('name');
                    }}
                    onBlur={() => handleBlur('name')}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    size="small"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      if (touched.email) validate('email');
                    }}
                    onBlur={() => handleBlur('email')}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                {!selectedEmployee && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        size="small"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setTimeout(() => {
                            validate('password');
                            if (confirmPassword) {
                              validate('confirmPassword');
                            }
                          }, 0);
                        }}
                        onBlur={() => handleBlur('password')}
                        error={touched.password && !!errors.password}
                        helperText={touched.password && errors.password}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        variant="outlined"
                        size="small"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setTimeout(() => {
                            validate('confirmPassword');
                          }, 0);
                        }}
                        onBlur={() => handleBlur('confirmPassword')}
                        error={touched.confirmPassword && !!errors.confirmPassword}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    size="small"
                    value={phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      setPhone(onlyNums);
                      if (touched.phone) validate('phone');
                    }}
                    onBlur={() => handleBlur('phone')}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ color: '#374151', fontWeight: 500, mb: 1, fontSize: '0.875rem' }}>
                      Gender
                    </FormLabel>
                    <RadioGroup
                      row
                      aria-label="gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        setTouched((prev) => ({ ...prev, gender: true }));
                        if (errors.gender) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.gender;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <FormControlLabel
                        value="male"
                        control={<Radio size="small" />}
                        label="Male"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      />
                      <FormControlLabel
                        value="female"
                        control={<Radio size="small" />}
                        label="Female"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={dob}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                      min: new Date(new Date().setFullYear(new Date().getFullYear() - 70)).toISOString().split('T')[0],
                    }}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (touched.dob) validate('dob');
                    }}
                    onBlur={() => handleBlur('dob')}
                    error={touched.dob && !!errors.dob}
                    helperText={touched.dob && errors.dob}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Joining Date"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={joiningDate}
                    onChange={(e) => {
                      setJoiningDate(e.target.value);
                      if (touched.joiningDate) validate('joiningDate');
                    }}
                    sx={{
                      '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' },
                      '& .MuiInputLabel-shrink': { transform: 'translate(14px, -9px) scale(0.75)' },
                    }}
                    slotProps={{
                      input: { max: new Date().toISOString().split('T')[0] },
                      inputLabel: { shrink: true },
                    }}
                    onBlur={() => handleBlur('joiningDate')}
                    error={touched.joiningDate && !!errors.joiningDate}
                    helperText={touched.joiningDate && errors.joiningDate}
                  />
                </Grid>

                {/* Professional Information Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#1a202c', fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                    Professional Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Role"
                    variant="outlined"
                    size="small"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (touched.role) validate('role');
                    }}
                    onBlur={() => handleBlur('role')}
                    error={touched.role && !!errors.role}
                    helperText={touched.role && errors.role}
                  >
                    {roleOptions().map((roleOption) => (
                      <MenuItem key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Department"
                    variant="outlined"
                    size="small"
                    value={department}
                    onChange={handleDepartmentChange}
                    onBlur={() => handleBlur('department')}
                    error={touched.department && !!errors.department}
                    helperText={touched.department && errors.department}
                    disabled={departmentsLoading || departmentsList.length === 0}
                  >
                    {departmentsList.length > 0 ? (
                      departmentsList.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No departments available</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Position"
                    variant="outlined"
                    size="small"
                    value={position}
                    onChange={handlePositionChange}
                    onBlur={() => handleBlur('position')}
                    error={touched.position && !!errors.position}
                    helperText={touched.position && errors.position}
                    disabled={!department || departmentsLoading || !positionsMap[department]?.length}
                  >
                    {positionsMap[department]?.length > 0 ? (
                      positionsMap[department].map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        {department ? 'No positions available' : 'Select a department first'}
                      </MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Role"
                    variant="outlined"
                    size="small"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Salary"
                    variant="outlined"
                    size="small"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    type="number"
                  />
                </Grid>

                {/* Address Information Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#1a202c', fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                    Address Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    size="small"
                    value={address}
                    multiline
                    rows={2}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (touched.address) validate('address');
                    }}
                    onBlur={() => handleBlur('address')}
                    error={touched.address && !!errors.address}
                    helperText={touched.address && errors.address}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    variant="outlined"
                    size="small"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (touched.city) validate('city');
                    }}
                    onBlur={() => handleBlur('city')}
                    error={touched.city && !!errors.city}
                    helperText={touched.city && errors.city}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    variant="outlined"
                    size="small"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (touched.state) validate('state');
                    }}
                    onBlur={() => handleBlur('state')}
                    error={touched.state && !!errors.state}
                    helperText={touched.state && errors.state}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    variant="outlined"
                    size="small"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      if (touched.pincode) validate('pincode');
                    }}
                    onBlur={() => handleBlur('pincode')}
                    error={touched.pincode && !!errors.pincode}
                    helperText={touched.pincode && errors.pincode}
                  />
                </Grid>

                {/* Increment Information Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#1a202c', fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                    Increment Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Increment Cycle"
                    variant="outlined"
                    size="small"
                    value={incrementCycle}
                    onChange={(e) => setIncrementCycle(e.target.value)}
                  >
                    <MenuItem value="Annual">Annual</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Increment Amount"
                    variant="outlined"
                    size="small"
                    value={incrementAmount}
                    onChange={(e) => setIncrementAmount(e.target.value)}
                    type="number"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Increment Month"
                    variant="outlined"
                    size="small"
                    value={incrementMonth}
                    onChange={(e) => setIncrementMonth(e.target.value)}
                  >
                    {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December",
                    ].map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {/* Modal Footer */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  position: 'sticky',
                  bottom: -24,
                  zIndex: 1200,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCloseModal}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                  }}
                >
                  {selectedEmployee ? 'Update Employee' : 'Save Employee'}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>

      {/* Keep the original delete dialog unchanged */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteModal}
        disableBackdropClick
        sx={{
          '& .MuiDialog-paper': {
            width: '750px',
            maxHeight: '490px',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: '#1a237e',
            paddingBottom: '12px',
          }}
        >
          Employee Removal
        </DialogTitle>
        <DialogContent sx={{ padding: '20px' }}>
          <DialogContentText sx={{ color: '#424242', fontSize: '1.1rem' }}>
            {isViewOnly
              ? `Viewing removal details for ${selectedEmployee?.name}.`
              : 'Please provide details for employee removal.'}
          </DialogContentText>
          <FormControl fullWidth margin="normal" sx={{ marginBottom: '20px' }}>
            <InputLabel
              sx={{
                fontWeight: 500,
                color: !reason ? '#d32f2f' : '#1a237e'
              }}
            >
              Reason for Removal *
            </InputLabel>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              label="Reason for Removal"
              disabled={isViewOnly}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                '& .MuiSelect-select': { padding: '12px' },
              }}
            >
              <MenuItem value="Terminate">Termination</MenuItem>
              <MenuItem value="performance">Performance Issues</MenuItem>
              <MenuItem value="misconduct">Misconduct</MenuItem>
              <MenuItem value="resignation">Resignation</MenuItem>
              <MenuItem value="departmentChange">Department Change</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Comments"
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            variant="outlined"
            disabled={isViewOnly}
            sx={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#3f51b5' },
              },
            }}
          />
          
          {/* New Fields Start Here */}
            <TextField
              fullWidth
              margin="normal"
              label="Last Working Day"
              type="date"
              value={lastWorkingDay}
              onChange={(e) => setLastWorkingDay(e.target.value)}
              disabled={isViewOnly}
              InputLabelProps={{ shrink: true }}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ fontWeight: 500, color: '#1a237e' }}>
                Dues Status
              </InputLabel>
              <Select
                value={duesStatus}
                onChange={(e) => setDuesStatus(e.target.value)}
                label="Dues Status"
                disabled={isViewOnly}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  '& .MuiSelect-select': { padding: '12px' },
                }}
              >
                <MenuItem value="cleared">Cleared</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Last Due Pay Date"
              type="date"
              value={lastDuePayDate}
              onChange={(e) => setLastDuePayDate(e.target.value)}
              disabled={isViewOnly}
              InputLabelProps={{ shrink: true }}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&:hover fieldset': { borderColor: '#3f51b5' },
                },
              }}
            />
            
            {/* New Fields End */}
          <FormControl component="fieldset" margin="normal">
            <DialogContentText sx={{ color: '#424242', fontWeight: 500 }}>
              Consider for hiring in future?
            </DialogContentText>
            <RadioGroup
              value={futureHiring}
              onChange={(e) => setFutureHiring(e.target.value)}
              row
              disabled={isViewOnly}
            >
              <FormControlLabel
                value="yes"
                control={<Radio sx={{ color: '#3f51b5' }} />}
                label="Yes"
                sx={{ marginRight: '24px' }}
                disabled={isViewOnly}
              />
              <FormControlLabel
                value="no"
                control={<Radio sx={{ color: '#3f51b5' }} />}
                label="No"
                sx={{ marginRight: '24px' }}
                disabled={isViewOnly}
              />
              <FormControlLabel
                value="maybe"
                control={<Radio sx={{ color: '#3f51b5' }} />}
                label="Maybe"
                disabled={isViewOnly}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ padding: '0 20px 20px' }}>
          <Button
            onClick={handleCloseDeleteModal}
            sx={{
              color: '#fff',
              backgroundColor: '#757575',
              borderRadius: '8px',
              padding: '8px 16px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#616161',
              },
            }}
          >
            Close
          </Button>
          {isViewOnly && (
            <Button
              onClick={() => {
                handleCloseDeleteModal();
                handleOpenModal(selectedEmployee);
              }}
              sx={{
                color: '#fff',
                backgroundColor: '#3f51b5',
                borderRadius: '8px',
                padding: '8px 16px',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#303f9f',
                },
              }}
            >
              Edit Details
            </Button>
          )}
          {!isViewOnly && (
            <Button
              onClick={handleConfirm}
              autoFocus
              sx={{
                color: '#fff',
                backgroundColor: '#d32f2f',
                borderRadius: '8px',
                padding: '8px 16px',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#b71c1c',
                },
              }}
            >
              Confirm Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>


      <ImageZoomModal
        open={zoomImage.open}
        onClose={() => setZoomImage({ open: false, image: null, name: "" })}
        imageSrc={zoomImage.image}
        employeeName={zoomImage.name}
      />
      <ToastContainer position="top-right" autoClose={3000} />

    </Box>
  );
};

export default EmployeeManagement;