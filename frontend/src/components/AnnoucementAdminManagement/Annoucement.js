import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  Fab,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  Divider,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Announcement as AnnouncementIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Campaign as CampaignIcon } from '@mui/icons-material';
import { format } from "date-fns";
import {
  fetchAllAnnoucements,
  addNewAnnoucement,
  editExistingAnnoucement,
  removeAnnoucement,
  clearSuccessMessage,
  clearError,
} from "../../features/annoucement/AnnoucementSlice";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


// Styled Components
const AnnouncementCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  "&:hover": { boxShadow: theme.shadows[4] },
}));

const ANNOUNCEMENT_TYPES = ["Holiday", "Meeting", "Policy Update", "General"];

const AnnouncementManagement = () => {
  const dispatch = useDispatch();
  const { AnnoucementList, loading, error, successMessage } = useSelector(
    (state) => state.announcements
  );

  const [formData, setFormData] = useState({ type: "", description: "", date: "" });
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements
  useEffect(() => {
    dispatch(fetchAllAnnoucements());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      handleCloseDialog();
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);
  useEffect(() => {
    if (error && !error.toLowerCase().includes("no announcements")) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const storedData = localStorage.getItem("user");
  const userData = JSON.parse(storedData);
  const usertype = userData?.employee?.type;

  // Form validation
  const validateForm = (data) => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.date);

    if (!data.type) newErrors.type = "Type is required";
    if (!data.description?.trim()) newErrors.description = "Description is required";
    else if (data.description.length < 10) newErrors.description = "Minimum 10 characters";
    if (!data.date) newErrors.date = "Date is required";
    else if (selectedDate < today) newErrors.date = "Date cannot be in the past";

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      setErrors((prevErrors) => ({ ...prevErrors, [name]: validateForm(updated)[name] }));
      return updated;
    });
  };

  const handleOpenDialog = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    setFormData(
      announcement
        ? {
          type: announcement.type,
          description: announcement.description,
          date: new Date(announcement.date).toISOString().split("T")[0],
        }
        : { type: "", description: "", date: "" }
    );
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
    setErrors({});
    dispatch(clearError());
  };

  const handleSubmit = async () => {
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (selectedAnnouncement) {
        await dispatch(
          editExistingAnnoucement({ id: selectedAnnouncement._id, AnnoucementData: formData })
        ).unwrap();
      } else {
        await dispatch(addNewAnnoucement(formData)).unwrap();
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await dispatch(removeAnnoucement(id)).unwrap();
      dispatch(fetchAllAnnoucements());
    }
  };

  const AnnouncementItem = ({ announcement }) => (
    <AnnouncementCard elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {announcement.type}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {announcement.description}
            </Typography>
            <Divider />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Date: {format(new Date(announcement.date), "MMM-dd-yyyy")}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Created: {format(new Date(announcement.createdAt), "MMM-dd-yyyy")}
              </Typography>
            </Stack>
          </Box>
          <Box>
            <IconButton size="small" disabled={usertype === 2} onClick={() => handleOpenDialog(announcement)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" disabled={usertype === 2} onClick={() => handleDelete(announcement._id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </AnnouncementCard>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Announcements
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Stay updated with important company news, updates, and notifications
              </Typography>
            </Box>
            <AnnouncementIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>



      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : AnnoucementList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No announcements yet
          </Typography>
        </Paper>
      ) : (
        <List disablePadding>
          {AnnoucementList.map((announcement) => (
            <ListItem key={announcement._id} disableGutters>
              <AnnouncementItem announcement={announcement} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedAnnouncement ? "Edit Announcement" : "Add New Announcement"}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={formData.type} onChange={handleInputChange} label="Type" required>
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
            <TextField
              type="date"
              label="Date"
              name="date"
              fullWidth
              value={formData.date}
              onChange={handleInputChange}
              error={!!errors.date}
              helperText={errors.date}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined" color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {selectedAnnouncement ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      {usertype === 1 && (<Fab
        color="primary"
        onClick={() => handleOpenDialog()}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default AnnouncementManagement;
