// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Modal,
//   Fab,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
//   IconButton,
//   Container,
//   Grid,
//   Paper,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import CloseIcon from "@mui/icons-material/Close";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   addNewEmployee,
//   fetchEmployeeList,
//   removeEmployee,
//   editExistingEmployee,
//   clearSuccessMessage,
// } from "../features/employees/employeeSlice";

// const EmployeeManagement = () => {
//   const dispatch = useDispatch();
//   const { loading, successMessage, error, employeeList } = useSelector(
//     (state) => state.employees
//   );

//   const [openModal, setOpenModal] = useState(false);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   // Form state
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [position, setPosition] = useState("");
//   const [address, setAddress] = useState("");
//   const [department, setDepartment] = useState("");
//   const [joiningDate, setJoiningDate] = useState("");
//   const [dob, setDob] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [state, setState] = useState("");
//   const [city, setCity] = useState("");
//   const [jobRole, setJobRole] = useState("");
//   const [country, setCountry] = useState("");

//   useEffect(() => {
//     dispatch(fetchEmployeeList());
//   }, [dispatch]);

//   useEffect(() => {
//     if (successMessage) {
//       toast.success(successMessage);
//       dispatch(clearSuccessMessage());
//       dispatch(fetchEmployeeList());
//       handleCloseModal();
//     }
//     if (error) {
//       toast.error(error);
//     }
//   }, [successMessage, error, dispatch]);

//   const formatDateWithTime = (date) => {
//     if (!date) return "";
//     return new Date(date).toISOString();
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     resetForm();
//   };

//   const handleCloseDeleteModal = () => {
//     setDeleteConfirmOpen(false);
//     setSelectedEmployee(null);
//   };

//   const handleDelete = () => {
//     if (selectedEmployee && selectedEmployee._id) {
//       dispatch(removeEmployee(selectedEmployee._id));
//       handleCloseDeleteModal();
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const employeeData = {
//       name,
//       email,
//       password,
//       position,
//       type: 2,
//       address,
//       phone,
//       joiningDate: formatDateWithTime(joiningDate),
//       dob: formatDateWithTime(dob),
//       department,
//       // country,
//       city,
//       state,
//       pincode,
//       jobRole,
//       status: "1"
//     };

//     if (selectedEmployee) {
//       dispatch(
//         editExistingEmployee({ id: selectedEmployee._id, employeeData })
//       );
//     } else {
//       dispatch(addNewEmployee(employeeData));
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setEmail("");
//     setPassword("");
//     setPosition("");
//     setAddress("");
//     setDepartment("");
//     setJoiningDate("");
//     setDob("");
//     setPhone("");
//     setPincode("");
//     setState("");
//     setCity("");
//     setJobRole("");
//     // setCountry("");
//     setSelectedEmployee(null);
//   };

//   const handleOpenModal = (employee = null) => {
//     if (employee) {
//       setName(employee.name || "");
//       setPassword(employee.password || "");
//       setEmail(employee.email || "");
//       setPosition(employee.position || "");
//       setAddress(employee.address || "");
//       setDepartment(employee.department || "");
//       setJoiningDate(employee.joiningDate ? employee.joiningDate.split('T')[0] : "");
//       setDob(employee.dob ? employee.dob.split('T')[0] : "");
//       setPhone(employee.phone || "");
//       setPincode(employee.pincode || "");
//       setState(employee.state || "");
//       setCity(employee.city || "");
//       setJobRole(employee.jobRole || "");
//       // setCountry(employee.country || "");
//       setSelectedEmployee(employee);
//     }
//     setOpenModal(true);
//   };

//   const handleOpenDeleteModal = (employee) => {
//     setSelectedEmployee(employee);
//     setDeleteConfirmOpen(true);
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: { xs: "16px 16px 50px 16px", sm: 4 } }}>
//       <Typography variant="h4" gutterBottom>
//         Employees
//       </Typography>

//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
//             {loading && (
//               <Box display="flex" justifyContent="center" my={2}>
//                 <CircularProgress />
//               </Box>
//             )}
//             {employeeList.length === 0 ? (
//               <Box textAlign="center" sx={{ p: 4 }}>
//                 <Typography variant="h6" color="textSecondary">
//                   There are no employees yet.
//                 </Typography>
//               </Box>
//             ) : (
//               <List>
//                 {employeeList.map((employee) => (
//                   <ListItem key={employee._id} divider>
//                     <ListItemText
//                       primary={employee.name}
//                       secondary={`${employee.email} | ${employee.position}`}
//                     />
//                     <ListItemSecondaryAction>
//                       <IconButton
//                         edge="end"
//                         aria-label="edit"
//                         onClick={() => handleOpenModal(employee)}
//                       >
//                         <EditIcon />
//                       </IconButton>
//                       <IconButton
//                         edge="end"
//                         aria-label="delete"
//                         onClick={() => handleOpenDeleteModal(employee)}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </ListItemSecondaryAction>
//                   </ListItem>
//                 ))}
//               </List>
//             )}
//           </Paper>
//         </Grid>
//       </Grid>

//       <Fab
//         color="primary"
//         aria-label="add"
//         onClick={() => handleOpenModal()}
//         sx={{
//           position: "fixed",
//           bottom: 16,
//           right: 16,
//         }}
//       >
//         <AddIcon />
//       </Fab>

//       <Modal
//         open={openModal}
//         onClose={handleCloseModal}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           width: { xs: "90%", sm: "60%", md: "40%" },
//           bgcolor: "background.paper",
//           boxShadow: 24,
//           p: 4,
//           maxHeight: "90vh",
//           overflowY: "auto",
//         }}>
//           <Box sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}>
//             <Typography variant="h6" component="h2" gutterBottom>
//               {selectedEmployee ? "Edit Employee" : "Add New Employee"}
//             </Typography>
//             <IconButton onClick={handleCloseModal}>
//               <CloseIcon />
//             </IconButton>
//           </Box>
//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Name"
//               variant="outlined"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Email"
//               type="email"
//               variant="outlined"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               margin="normal"
//             />
//             {!selectedEmployee && (
//               <TextField
//                 fullWidth
//                 label="Password"
//                 type="password"
//                 variant="outlined"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 margin="normal"
//               />
//             )}
//             <TextField
//               fullWidth
//               label="Position"
//               variant="outlined"
//               value={position}
//               onChange={(e) => setPosition(e.target.value)}
//               required
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Address"
//               variant="outlined"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               multiline
//               rows={3}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Department"
//               variant="outlined"
//               value={department}
//               onChange={(e) => setDepartment(e.target.value)}
//               margin="normal"
//             />
//             {/* <TextField
//               fullWidth
//               label="Country"
//               variant="outlined"
//               value={country}
//               onChange={(e) => setCountry(e.target.value)}
//               margin="normal"
//             /> */}
//             <TextField
//               fullWidth
//               label="Joining Date"
//               type="date"
//               variant="outlined"
//               value={joiningDate}
//               onChange={(e) => setJoiningDate(e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Date of Birth"
//               type="date"
//               variant="outlined"
//               value={dob}
//               onChange={(e) => setDob(e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Phone"
//               variant="outlined"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               inputProps={{ maxLength: 10 }}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Pincode"
//               variant="outlined"
//               value={pincode}
//               onChange={(e) => setPincode(e.target.value)}
//               inputProps={{ maxLength: 6 }}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="State"
//               variant="outlined"
//               value={state}
//               onChange={(e) => setState(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="City"
//               variant="outlined"
//               value={city}
//               onChange={(e) => setCity(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Job Role"
//               variant="outlined"
//               value={jobRole}
//               onChange={(e) => setJobRole(e.target.value)}
//               margin="normal"
//             />
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               fullWidth
//               sx={{ mt: 2 }}
//             >
//               {selectedEmployee ? "Update" : "Save"}
//             </Button>
//           </form>
//         </Box>
//       </Modal>

//       <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteModal}>
//         <DialogTitle>{"Confirm Delete"}</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete {selectedEmployee?.name}?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDeleteModal} color="primary">
//             No
//           </Button>
//           <Button onClick={handleDelete} color="secondary" autoFocus>
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <ToastContainer position="bottom-right" autoClose={3000} />
//     </Container>
//   );
// };

// export default EmployeeManagement;

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
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Container,
  Grid,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addNewEmployee,
  fetchEmployeeList,
  removeEmployee,
  editExistingEmployee,
  clearSuccessMessage,
} from "../features/employees/employeeSlice";

const EmployeeManagement = () => {
  const dispatch = useDispatch();
  const { loading, successMessage, error, employeeList } = useSelector(
    (state) => state.employees
  );

  const [openModal, setOpenModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
  const [jobRole, setJobRole] = useState("");

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    position: false,
    department: false,
    joiningDate: false,
    dob: false,
    phone: false,
    pincode: false,
    state: false,
    city: false,
    jobRole: false,
  });
  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      handleCloseModal();
      dispatch(fetchEmployeeList());
    }
    if (error) {
      toast.error(error);
    }
  }, [successMessage, error, dispatch]);

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validate(field);
  };

 

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleCloseDeleteModal = () => {
    setDeleteConfirmOpen(false);
    setSelectedEmployee(null);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPosition("");
    setAddress("");
    setDepartment("");
    setJoiningDate("");
    setDob("");
    setPhone("");
    setPincode("");
    setState("");
    setCity("");
    setJobRole("");
    setSelectedEmployee(null);
    setTouched({
      name: false,
      email: false,
      password: false,
      position: false,
      department: false,
      joiningDate: false,
      dob: false,
      phone: false,
      pincode: false,
      state: false,
      city: false,
      jobRole: false,
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  // Set all fields as touched
  setTouched(prev => Object.keys(prev).reduce((acc, key) => ({
    ...acc,
    [key]: true
  }), {}));

  if (!validate()) {
    toast.error("Please fix the validation errors");
    return;
  }
    const employeeData = {
      name: name.trim(),
      email: email.trim(),
      password,
      position: position.trim(),
      type: 2,
      address: address.trim(),
      phone: phone.trim(),
      joiningDate,
      dob,
      department: department.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      jobRole: jobRole.trim(),
      status: "1",
    };

    if (selectedEmployee) {
      dispatch(
        editExistingEmployee({ id: selectedEmployee._id, employeeData })
      );
    } else {
      dispatch(addNewEmployee(employeeData));
    }
  };

  const handleDelete = () => {
    if (selectedEmployee && selectedEmployee._id) {
      dispatch(removeEmployee(selectedEmployee._id));
      handleCloseDeleteModal();
    }
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setName(employee.name || "");
      setEmail(employee.email || "");
      setPosition(employee.position || "");
      setAddress(employee.address || "");
      setDepartment(employee.department || "");
      setJoiningDate(
        employee.joiningDate ? employee.joiningDate.split("T")[0] : ""
      );
      setDob(employee.dob ? employee.dob.split("T")[0] : "");
      setPhone(employee.phone || "");
      setPincode(employee.pincode || "");
      setState(employee.state || "");
      setCity(employee.city || "");
      setJobRole(employee.jobRole || "");
      setSelectedEmployee(employee);
    }
    setErrors({});
    setOpenModal(true);
  };

  const validate = (fieldName = null) => {
    let tempErrors = { ...errors };
    let isValid = true;
    const currentDate = new Date();
  
    const fieldsToValidate = fieldName 
      ? [fieldName]  
      : [            
          'name', 'email', 'password', 'position', 
          'department', 'joiningDate', 'dob', 'phone',
          'pincode', 'state', 'city', 'jobRole'
        ];
  
    fieldsToValidate.forEach(field => {
      switch (field) {
        case 'name':
          if (!name.trim()) {
            tempErrors.name = "Name is required";
            isValid = false;
          } else if (!/^[a-zA-Z\s]{2,}$/.test(name.trim())) {
            tempErrors.name = "Name should only contain letters and be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.name;
          }
          break;
  
        case 'email':
          if (!email.trim()) {
            tempErrors.email = "Email is required";
            isValid = false;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            tempErrors.email = "Please enter a valid email address";
            isValid = false;
          } else {
            delete tempErrors.email;
          }
          break;
  
        case 'password':
          if (!selectedEmployee) {  // Only validate password for new employees
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
            }
          }
          break;
  
        case 'position':
          if (!position.trim()) {
            tempErrors.position = "Position is required";
            isValid = false;
          } else if (position.trim().length < 2) {
            tempErrors.position = "Position must be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.position;
          }
          break;
  
        case 'department':
          if (!department.trim()) {
            tempErrors.department = "Department is required";
            isValid = false;
          } else if (department.trim().length < 2) {
            tempErrors.department = "Department must be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.department;
          }
          break;
  
        case 'joiningDate':
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
          break;
  
        case 'dob':
          if (!dob) {
            tempErrors.dob = "Date of birth is required";
            isValid = false;
          } else {
            const selectedDob = new Date(dob);
            const age = currentDate.getFullYear() - selectedDob.getFullYear();
            const monthDiff = currentDate.getMonth() - selectedDob.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < selectedDob.getDate()) 
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
          break;
  
        case 'phone':
          if (!phone.trim()) {
            tempErrors.phone = "Phone number is required";
            isValid = false;
          } else if (!/^\d{10}$/.test(phone.trim())) {
            tempErrors.phone = "Please enter a valid 10-digit phone number";
            isValid = false;
          } else {
            delete tempErrors.phone;
          }
          break;
  
        case 'pincode':
          if (pincode && !/^\d{6}$/.test(pincode.trim())) {
            tempErrors.pincode = "Please enter a valid 6-digit pincode";
            isValid = false;
          } else {
            delete tempErrors.pincode;
          }
          break;
  
        case 'state':
          if (state && state.trim().length < 2) {
            tempErrors.state = "State name should be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.state;
          }
          break;
  
        case 'city':
          if (city && city.trim().length < 2) {
            tempErrors.city = "City name should be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.city;
          }
          break;
  
        case 'jobRole':
          if (jobRole && jobRole.trim().length < 2) {
            tempErrors.jobRole = "Job role should be at least 2 characters long";
            isValid = false;
          } else {
            delete tempErrors.jobRole;
          }
          break;
  
        default:
          break;
      }
    });
  
    setErrors(tempErrors);
    return isValid;
  };

  const handleOpenDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setDeleteConfirmOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            {loading ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {employeeList.map((employee) => (
                  <ListItem key={employee._id} divider>
                    <ListItemText
                      primary={employee.name}
                      secondary={`${employee.email} | ${employee.position}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenModal(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleOpenDeleteModal(employee)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "60%", md: "40%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {selectedEmployee ? "Edit Employee" : "Add New Employee"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
             
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  // Only validate if field has been touched
                  validate("name");
                }
              }}
              onBlur={() => handleBlur("name")}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              margin="normal"
            />

            <TextField
              fullWidth
             
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  // Only validate if field has been touched
                  validate("email");
                }
              }}
              onBlur={() => handleBlur("email")}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              margin="normal"
            />

            {!selectedEmployee && (
              <TextField
                fullWidth
             
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    // Only validate if field has been touched
                    validate("password");
                  }
                }}
                onBlur={() => handleBlur("password")}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                margin="normal"
              />
            )}

            <TextField
              fullWidth
            
              label="Position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                if (touched.position) {
                  // Only validate if field has been touched
                  validate("position");
                }
              }}
              onBlur={() => handleBlur("position")}
              error={touched.position && !!errors.position}
              helperText={touched.position && errors.position}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (touched.address) {
                  // Only validate if field has been touched
                  validate("address");
                }
              }}
              onBlur={() => handleBlur("address")}
              error={touched.address && !!errors.address}
              helperText={touched.address && errors.address}
              margin="normal"
            />

            <TextField
              fullWidth
            
              label="Department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (touched.department) {
                  // Only validate if field has been touched
                  validate("department");
                }
              }}
              onBlur={() => handleBlur("department")}
              error={touched.department && !!errors.department}
              helperText={touched.department && errors.department}
              margin="normal"
            />

            <TextField
              fullWidth
             
              label="Joining Date"
              type="date"
              value={joiningDate}
              onChange={(e) => {
                setJoiningDate(e.target.value);
                if (touched.joiningDate) {
                  // Only validate if field has been touched
                  validate("joiningDate");
                }
              }}
              onBlur={() => handleBlur("joiningDate")}
              error={touched.joiningDate && !!errors.joiningDate}
              helperText={touched.joiningDate && errors.joiningDate}
              margin="normal"
            />

            <TextField
              fullWidth
           
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (touched.dob) {
                  // Only validate if field has been touched
                  validate("dob");
                }
              }}
              onBlur={() => handleBlur("dob")}
              error={touched.dob && !!errors.dob}
              helperText={touched.dob && errors.dob}
              margin="normal"
            />

            <TextField
              fullWidth
            
              label="Phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (touched.phone) {
                  // Only validate if field has been touched
                  validate("phone");
                }
              }}
              onBlur={() => handleBlur("phone")}
              error={touched.phone && !!errors.phone}
              helperText={touched.phone && errors.phone}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Pincode"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                if (touched.pincode) {
                  // Only validate if field has been touched
                  validate("pincode");
                }
              }}
              onBlur={() => handleBlur("pincode")}
              error={touched.pincode && !!errors.pincode}
              helperText={touched.pincode && errors.pincode}
              margin="normal"
            />

            <TextField
              fullWidth
              label="State"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (touched.state) {
                  // Only validate if field has been touched
                  validate("state");
                }
              }}
              onBlur={() => handleBlur("emstateail")}
              error={touched.state && !!errors.state}
              helperText={touched.state && errors.state}
              margin="normal"
            />

            <TextField
              fullWidth
              label="City"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (touched.city) {
                  // Only validate if field has been touched
                  validate("city");
                }
              }}
              onBlur={() => handleBlur("city")}
              error={touched.city && !!errors.city}
              helperText={touched.city && errors.city}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Job Role"
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value);
                if (touched.jobRole) {
                  // Only validate if field has been touched
                  validate("jobRole");
                }
              }}
              onBlur={() => handleBlur("jobRole")}
              error={touched.jobRole && !!errors.jobRole}
              helperText={touched.jobRole && errors.jobRole}
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              {selectedEmployee ? "Update Employee" : "Add Employee"}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedEmployee?.name}? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
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

export default EmployeeManagement;
