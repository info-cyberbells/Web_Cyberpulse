import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../../services/api';

const roleLabel = (type) => {
  const map = { 1: 'Admin', 2: 'Employee', 3: 'Team Lead', 4: 'HR', 5: 'Manager' };
  return map[type] || `Type ${type}`;
};

const SuperAdminOrgDetail = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [org, setOrg] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiClient.get(`/superadmin/organizations/${orgId}/employees`);
        setOrg(res.data.organization);
        setEmployees(res.data.employees || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [orgId]);

  // Fetch attendance when tab switches to attendance tab
  useEffect(() => {
    if (tab !== 1) return;
    const fetchAttendance = async () => {
      setAttendanceLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await apiClient.get(
          `/superadmin/organizations/${orgId}/attendance?date=${today}`
        );
        setAttendance(res.data.attendance || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch attendance');
      } finally {
        setAttendanceLoading(false);
      }
    };
    fetchAttendance();
  }, [tab, orgId]);

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
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Tooltip title="Back to organizations">
          <IconButton onClick={() => navigate('/superadmin/organizations')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {org?.orgName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {org?.location && `📍 ${org.location}`}
            {org?.orgType && `  •  ${org.orgType}`}
            {org?.email && `  •  ${org.email}`}
          </Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`Employees (${employees.length})`} />
        <Tab label="Today's Attendance" />
      </Tabs>

      {/* Employees Tab */}
      {tab === 0 && (
        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No employees found</TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={emp.image} sx={{ width: 34, height: 34 }}>
                          {emp.name?.[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {emp.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{emp.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.department || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.position || emp.jobRole || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={roleLabel(emp.type)} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Attendance Tab */}
      {tab === 1 && (
        attendanceLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Clock In</TableCell>
                  <TableCell>Clock Out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Platform</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No attendance records for today</TableCell>
                  </TableRow>
                ) : (
                  attendance.map((rec) => (
                    <TableRow key={rec._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar src={rec.employeeId?.image} sx={{ width: 34, height: 34 }}>
                            {rec.employeeId?.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {rec.employeeId?.name || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.employeeId?.department || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.clockInTime || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.clockOutTime || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rec.Employeestatus || (rec.clockOutTime ? 'clocked out' : 'active')}
                          size="small"
                          color={
                            rec.Employeestatus === 'active' || (!rec.clockOutTime && rec.clockInTime)
                              ? 'success'
                              : rec.Employeestatus === 'on break'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {rec.platform || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

export default SuperAdminOrgDetail;
