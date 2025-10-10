import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProjectItem from './ProjectItem';
import { styled } from "@mui/material/styles";
import { Grid, Typography, CircularProgress, Box, Paper, Card, CardContent, Container } from '@mui/material';
import { fetchProjects, clearSuccessMessage } from '../features/projects/projectsSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ArchiveIcon from '@mui/icons-material/Archive';

const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));
const ArchivedProjectList = () => {
    const dispatch = useDispatch();
    const { projects, loading, error, successMessage, clearError } = useSelector((state) => state.projects);
    console.log(projects)

    useEffect(() => {
        // Fetch all projects when the component mounts
        dispatch(fetchProjects());
    }, [dispatch]);

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

    // If still loading, show a loading spinner
    // if (loading) {
    //     return (
    //         <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
    //             <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
    //                 <CircularProgress />
    //             </Box>
    //         </Paper>
    //     );
    // }

    // Filter archived projects
    const archivedProjects = projects.filter(project => project.status[0].name === 'Archive');
    // console.log(archivedProjects)
    //     // If no archived projects are found, show a message
    //     if (archivedProjects.length === 0) {
    //         return (
    //             <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
    //                 <Typography variant="h6" align="center" mt={4} color="textSecondary">
    //                     No archived projects found.
    //                 </Typography>
    //                 {/* <ToastContainer position="bottom-right" autoClose={3000} /> */}
    //             </Paper>
    //         );
    //     }

    return (
        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            {/* Heading */}
            <HeaderCard>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                                Archived Projects
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Access and review completed or inactive projects for reference
                            </Typography>
                        </Box>
                        <ArchiveIcon
                            fontSize="large"
                            sx={{ color: "#2563eb" }}
                        />
                    </Box>
                </CardContent>
            </HeaderCard>


            {/* Loading spinner */}
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* If no archived projects are found */}
            {!loading && archivedProjects.length === 0 && (
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" align="center" mt={4} color="textSecondary">
                        No archived projects found.
                    </Typography>
                </Paper>
            )}

            {/* Archived project list */}
            {!loading && archivedProjects.length > 0 && (
                <Grid container spacing={3}>
                    {archivedProjects.map((project) => (
                        <Grid item xs={12} sm={6} md={6} key={project.id}>
                            <ProjectItem project={project} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Toast notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} />
        </Container>
    );
};

export default ArchivedProjectList;
