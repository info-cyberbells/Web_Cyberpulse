import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CardContent,
  Card,
  IconButton,
  Dialog,
  Fab,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  Container,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewTechnology,
  fetchTechnologyList,
  editExistingTechnology,
  deleteExistingTechnology,
  clearSuccessMessage,
} from "../features/technologies/technologySlice";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import { styled } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";
import '../index.css'
const AddTechnologyForm = () => {
  const dispatch = useDispatch();
  const { loading, technologyList, error, successMessage } = useSelector(
    (state) => state.technologies
  );

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  }));

  // Validation states
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  // UI states
  const [editing, setEditing] = useState(false);
  const [editTechnologyId, setEditTechnologyId] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [technologyToDelete, setTechnologyToDelete] = useState(null);
  const [touched, setTouched] = useState({
    name: false,
    description: false,
  });

  useEffect(() => {
    dispatch(fetchTechnologyList());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.dismiss();
      toast.success(successMessage);
      dispatch(fetchTechnologyList());
      dispatch(clearSuccessMessage());
      handleClose();
    }
    if (error) {
      toast.dismiss();
      toast.error(error);
    }
  }, [successMessage, error, dispatch]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Technology name is required";
        if (value.length < 2) return "Name must be at least 2 characters long";
        if (value.length > 50) return "Name must not exceed 50 characters";
        if (!/^[a-zA-Z0-9\s\-+#.]+$/.test(value)) {
          return "Name can only contain letters, numbers, spaces, and basic symbols (-, +, #, .)";
        }
        return "";

      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length < 10)
          return "Description must be at least 10 characters long";
        if (value.length > 500)
          return "Description must not exceed 500 characters";
        return "";

      default:
        return "";
    }
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field if it's been touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      description: validateField("description", formData.description),
    };
    setErrors(newErrors);
    return {
      isValid: !Object.values(newErrors).some((error) => error),
      errors: newErrors
    };
  };

  const handleOpen = () => {
    setOpen(true);
    setTouched({ name: false, description: false });
    setErrors({ name: "", description: "" });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", description: "" });
    setEditing(false);
    setEditTechnologyId(null);
    setTouched({ name: false, description: false });
    setErrors({ name: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Set all fields as touched
    setTouched({
      name: true,
      description: true,
    });

    const validation = validateForm();

    // DEBUG: Log what we're getting
    console.log("Validation result:", validation);
    console.log("Form data:", formData);

    if (!validation.isValid) {
      toast.dismiss();

      // Get all error messages from the fresh validation results
      const errorMessages = [];
      if (validation.errors.name) {
        console.log("Adding name error:", validation.errors.name);
        errorMessages.push(validation.errors.name);
      }
      if (validation.errors.description) {
        console.log("Adding description error:", validation.errors.description);
        errorMessages.push(validation.errors.description);
      }

      console.log("All error messages:", errorMessages);

      if (errorMessages.length > 0) {
        const errorText = errorMessages.length === 1
          ? errorMessages[0]
          : `Please fix the following errors:\n• ${errorMessages.join('\n• ')}`;

        console.log("Final error text:", errorText);

        toast.error(errorText, {
          style: { whiteSpace: 'pre-line' }
        });
      }
      return;
    }

    const techData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    if (editing) {
      dispatch(
        editExistingTechnology({ id: editTechnologyId, updatedData: techData })
      );
    } else {
      dispatch(addNewTechnology(techData));
    }
  };
  const handleEdit = (technology) => {
    setFormData({
      name: technology.name,
      description: technology.description,
    });
    setEditing(true);
    setEditTechnologyId(technology._id);
    setOpen(true);
    setTouched({ name: false, description: false });
    setErrors({ name: "", description: "" });
  };

  const handleDeleteClick = (technology) => {
    setTechnologyToDelete(technology);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (technologyToDelete) {
      toast.dismiss();
      dispatch(deleteExistingTechnology(technologyToDelete._id));
      setDeleteDialogOpen(false);
      setTechnologyToDelete(null);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4, p: { xs: "16px 16px 50px 16px", sm: 4 } }}
    >
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Technologies
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Explore company tools, platforms, and tech resources
              </Typography>
            </Box>
            <SettingsApplicationsIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>



      <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {technologyList.length === 0 ? (
          <Box textAlign="center" sx={{ p: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No technologies added yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            // background: 'red',
            justifyContent: 'flex-start'
          }}>
            {technologyList.map((technology, index) => (

              <Box
                key={technology._id}
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: 'calc(50% - 16px)',
                    md: 'calc(25% - 16px)'
                  },
                  minWidth: 0
                }}
              >
                <Card
                  sx={{
                    bgcolor: index % 2 === 0 ? '#e0f2f1' : '#fff8e1',
                    '&:hover': { boxShadow: 3 },
                    height: '100%',
                    gap: '17px',
                  }}
                >

                  <CardContent sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    p: 2,
                    '&:last-child': { pb: 2 }
                  }}>
                    <Box>
                      <Typography variant="subtitle1" component="h3">
                        {technology.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {technology.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(technology)}
                      >
                        <EditIcon color="primary" fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(technology)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      <Modal
        open={open}
        onClose={handleClose}
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
            <Typography variant="h6" component="h2">
              {editing ? "Edit Technology" : "Add Technology"}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Technology Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              multiline
              rows={4}
              margin="normal"
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Processing..." : editing ? "Update" : "Save"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {technologyToDelete?.name}? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AddTechnologyForm;
