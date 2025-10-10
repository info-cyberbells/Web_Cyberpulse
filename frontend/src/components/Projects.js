import React, { useState, useEffect } from 'react';
import { Container, Box, Fab, Modal, Card, CardContent, useMediaQuery, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';
import { createProject, updateProject, clearSuccessMessage, clearError } from '../features/projects/projectsSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { styled } from "@mui/material/styles";

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


function Projects() {
  const [showForm, setShowForm] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading, error, successMessage } = useSelector((state) => state.projects);
  const dispatch = useDispatch();

  const handleOpenForm = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  return (
    <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Projects
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Track ongoing projects, deadlines, and team progress
              </Typography>
            </Box>
            <WorkOutlineIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      <ProjectList isEditable={isAuthenticated} />
      {isAuthenticated && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 }
          }}
          onClick={handleOpenForm}
        >
          <AddIcon />
        </Fab>
      )}
      <Modal
        open={showForm}
        onClose={handleCloseForm}
        aria-labelledby="modal-project-form"
        aria-describedby="modal-project-form-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '50%', md: 600 },
            height: 'auto',
            maxHeight: { xs: '90%', sm: '80%' },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, sm: 3 },
            pt: { xs: 4, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            outline: 'none'
          }}
        >
          <IconButton
            onClick={handleCloseForm}
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              zIndex: 5000,
            }}
          >
            <CloseIcon />
          </IconButton>
          {/* <Box sx={{ height: '100vh', overflow: 'hidden' }}> */}
          <ProjectForm onSubmit={handleCloseForm} />
          {/* </Box> */}
        </Box>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
}

export default Projects;