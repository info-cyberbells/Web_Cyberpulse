import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Card,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import { Modal, IconButton } from "@mui/material";
import { Container, CardContent } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from 'react-redux';
import { styled } from "@mui/material/styles";
import {
  fetchAllHandbooks,
  uploadNewHandbook,
  removeHandbook,
  fetchEmployeesForHandbook,
  clearError,
  clearSuccessMessage,
} from '../../features/handbook/handbookSlice';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));

const EmployeeHandbookUpload = () => {
  const dispatch = useDispatch();

  const {
    handbooks,
    employees,
    loading,
    uploadLoading,
    error,
    successMessage
  } = useSelector((state) => state.handbook);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibleTo, setVisibleTo] = useState([]);
  const [file, setFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const storedData = localStorage.getItem("user");
  const userData = storedData ? JSON.parse(storedData) : null;
  const uploadedBy = userData?.employee?.id || null;




  useEffect(() => {
    dispatch(fetchEmployeesForHandbook());
    dispatch(fetchAllHandbooks());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.dismiss();
      // Show specific messages based on action
      if (successMessage.toLowerCase().includes('delete')) {
        toast.success("Handbook deleted successfully!");
      } else {
        toast.success("Handbook uploaded successfully!");
      }
      dispatch(clearSuccessMessage());

      setTitle("");
      setContent("");
      setVisibleTo([]);
      setFile(null);
      setModalOpen(false);

      dispatch(fetchAllHandbooks());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || "An error occurred";

      if (!errorMessage.toLowerCase().includes('no handbooks') &&
        !errorMessage.toLowerCase().includes('not found')) {
        toast.dismiss();
        toast.error(errorMessage);
      }

      dispatch(clearError());
    }
  }, [error, dispatch]);
  const handleDeleteHandbook = (id) => {
    dispatch(removeHandbook(id));
  };


  const handleFileUpload = () => {
    if (!title.trim()) {
      toast.dismiss();
      toast.error("Please enter a title for the handbook.");
      return;
    }

    if (!content.trim()) {
      toast.dismiss();
      toast.error("Please enter content/description for the handbook.");
      return;
    }

    if (!uploadedBy) {
      toast.dismiss();
      toast.error("Uploader information is missing.");
      return;
    }

    if (!file) {
      toast.dismiss();
      toast.error("Please select a file to upload.");
      return;
    }

    if (visibleTo.length === 0) {
      toast.dismiss();
      toast.error("Please select at least one employee to make the handbook visible to.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("uploadedBy", uploadedBy);
    formData.append("visibleTo", JSON.stringify(visibleTo.map(emp => emp._id)));
    formData.append("handbookFile", file);

    dispatch(uploadNewHandbook(formData));
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Manage Employee Handbooks
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Upload, manage and distribute company handbooks and policies to employees.
              </Typography>
            </Box>
            <MenuBookIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      <Box sx={{ mb: 3 }}>
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
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      borderColor: "#d1d5db",
                    },
                  }}
                >
                  {/* Header with title and actions */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2
                  }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        flex: 1,
                        mr: 2
                      }}
                    >
                      {handbook.title}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {handbook.fileUrl && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            // Force download
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
                            px: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              backgroundColor: "#1d4ed8",
                            },
                          }}
                        >
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeleteHandbook(handbook._id)}
                        disabled={loading}
                        sx={{
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          borderRadius: 2,
                          px: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: "#dc2626",
                            color: "#dc2626",
                            bgcolor: "#fef2f2"
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  {/* Content */}
                  {handbook.content && (
                    <Box sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      mb: 2
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#475569",
                          lineHeight: 1.6
                        }}
                      >
                        {handbook.content}
                      </Typography>
                    </Box>
                  )}

                  {/* Visible To Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Visible To:
                    </Typography>
                    <Box sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      maxHeight: "60px",
                      overflowY: "auto"
                    }}>
                      {handbook.visibleTo.map((emp) => (
                        <Chip
                          key={emp._id}
                          label={emp.name}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            "&:hover": {
                              bgcolor: "#dbeafe",
                            }
                          }}
                        />
                      ))}
                    </Box>
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
                        sx={{ color: "#64748b", fontWeight: 500 }}
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
                p: 2,
                borderRadius: 1,
                textAlign: "center",
                bgcolor: "#f9f9f9",
                border: "1px solid #eee",
              }}
            >
              <Typography variant="body2" sx={{ color: "#666" }}>
                No handbooks available.
              </Typography>
            </Box>
          )}

        <IconButton
          onClick={() => setModalOpen(true)}
          sx={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
            bgcolor: "#1976d2",
            color: "white",
            "&:hover": { bgcolor: "#115293" },
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            width: 56,
            height: 56,
          }}
        >
          <AddIcon sx={{ fontSize: "32px" }} />
        </IconButton>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 600,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
              <Typography variant="h5" gutterBottom sx={{ pb: 3 }}>
                Upload Employee Handbook
              </Typography>


              <TextField
                fullWidth
                required
                label="Handbook Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                required
                label="Content/Description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={3}
              />


              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => option.name || ""}
                value={visibleTo}
                onChange={(event, newValue) => setVisibleTo(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Visible To (Employees) *"
                    placeholder="Select employees"
                    sx={{ mb: 2 }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      sx={{ m: 0.5 }}
                    />
                  ))
                }
              />
              <Button variant="outlined" component="label" sx={{ mb: 3 }}>
                Choose File (PDF, DOC, DOCX) *
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Selected File: {file.name}
                </Typography>
              )}

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleFileUpload}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? <CircularProgress size={24} /> : "Upload"}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Modal>

      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>);
};

export default EmployeeHandbookUpload;