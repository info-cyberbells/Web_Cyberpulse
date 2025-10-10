import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Typography, CircularProgress, Box, Paper, Alert } from '@mui/material';
import { fetchProjects } from '../features/projects/projectsSlice';
import ProjectItem from './ProjectItem';
import '../styles/ProjectList.css';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading, error, successMessage } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // If loading, show loading spinner
  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Show error if any
  if (error) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  // Show success message if any
  if (successMessage) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Alert severity="success">{successMessage}</Alert>
      </Paper>
    );
  }

  const storedData = localStorage.getItem("user");
const userData = storedData ? JSON.parse(storedData) : {};
const userType = userData?.employee?.type;
const userDepartment = userData?.employee?.department;

  const visibleProjects = projects.filter(project => {
    const isNotArchived = project?.status !== 'Archive'; 
    

    if (userType === 3) {
      if (userDepartment === 'Software Development') {
        return isNotArchived && project.department === 'Development';
      } else {
        return isNotArchived && project.department !== 'Development';
      }
    }

    return isNotArchived;
  });

  // If no projects, show message
  if (visibleProjects.length === 0) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" align="center" mt={4} color="textSecondary">
          There are no projects listed yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {visibleProjects.map((project) => (
        <Grid item xs={12} sm={6} md={6} key={project._id}>
          <ProjectItem project={project} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectList;