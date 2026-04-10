import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import apiClient from '../../services/api';

const SuperAdminOrganizations = ({ onSelectOrg }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await apiClient.get('/superadmin/organizations');
        setOrganizations(res.data.organizations || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        All Organizations
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Click on an organization to manage it
      </Typography>

      {organizations.length === 0 ? (
        <Typography color="text.secondary">No organizations found.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {organizations.map((org) => (
            <Box key={org._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardActionArea onClick={() => onSelectOrg(org)} sx={{ p: 1, height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} lineHeight={1.2}>
                          {org.orgName}
                        </Typography>
                        {org.orgType && (
                          <Chip label={org.orgType} size="small" sx={{ mt: 0.5 }} />
                        )}
                      </Box>
                    </Box>

                    {org.location && (
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        📍 {org.location}
                      </Typography>
                    )}

                    <Box display="flex" gap={2} mt={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {org.employeeCount} employees
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="text.secondary">
                          {org.todayAttendanceCount} present today
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SuperAdminOrganizations;
