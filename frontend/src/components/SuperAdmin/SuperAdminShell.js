import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import SuperAdminOrganizations from './SuperAdminOrganizations';

// All existing admin page components
import Home from '../Home';
import Projects from '../Projects';
import ProjectDetailView from '../ProjectDetailView';
import EventManagement from '../EventAdminManagement/EventManagement';
import Announcement from '../AnnoucementAdminManagement/Annoucement';
import EmployeeManagement from '../Employees/EmployeeManagement';
import PerformanceAnalysisModal from '../Employees/PerformanceAnalysisModal';
import AddTechnologyForm from '../AddTechnologyForm';
import ArchivedProjectList from '../ArchivedProjectList';
import LeaveRequest from '../LeaveRequest/LeaveRequest';
import Holidays from '../Holidays/Holidays';
import HelpDesk from '../HelpDesk';
import Monthlydata from '../MonthlyEmployeeData/Monthlydata';
import AdminAdvanceSalary from '../AdvanceSalary/AdminAdvanceSalary';
import SalaryCalculator from '../SalaryCalculator/SalaryCalculator';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import AdminSide from '../Handbook/AdminSide';
import InvoiceManagement from '../InVoiceGenerator/InvoiceManagement';
import InvoiceGenerator from '../InVoiceGenerator/invoiceGenerator';
import ChatContainer from '../Chat/ChatContainer';
import WfhCreditsPage from '../WfhCredit/WfhCreditsPage';
import NotificationPage from '../Notifications/NotificationPage';
import Settings from '../OrganizationSettings';

const SuperAdminShell = ({ lastPath }) => {
  const navigate = useNavigate();

  const [selectedOrg, setSelectedOrg] = useState(() => {
    try {
      const saved = localStorage.getItem('superAdminSelectedOrg');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSelectOrg = (org) => {
    const orgData = { id: org._id, name: org.orgName };
    localStorage.setItem('superAdminSelectedOrgId', org._id);
    localStorage.setItem('superAdminSelectedOrg', JSON.stringify(orgData));
    setSelectedOrg(orgData);
    navigate('/attendance');
  };

  const handleSwitchOrg = () => {
    localStorage.removeItem('superAdminSelectedOrgId');
    localStorage.removeItem('superAdminSelectedOrg');
    setSelectedOrg(null);
    navigate('/superadmin/organizations');
  };

  // No org selected — show org picker
  if (!selectedOrg) {
    return (
      <Routes>
        <Route
          path="/superadmin/organizations"
          element={<SuperAdminOrganizations onSelectOrg={handleSelectOrg} />}
        />
        <Route path="*" element={<Navigate to="/superadmin/organizations" />} />
      </Routes>
    );
  }

  // Org selected — show full admin routes for that org
  return (
    <Box>
      {/* Org context banner */}
      <Box
        sx={{
          px: 3,
          py: 0.8,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <BusinessIcon sx={{ color: 'white', fontSize: 18 }} />
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
          Viewing:
        </Typography>
        <Chip
          label={selectedOrg.name}
          size="small"
          sx={{ bgcolor: 'white', fontWeight: 600, color: 'primary.main' }}
        />
        <Button
          size="small"
          startIcon={<SwapHorizIcon />}
          onClick={handleSwitchOrg}
          sx={{ color: 'white', ml: 'auto', textTransform: 'none', fontWeight: 500 }}
        >
          Switch Organization
        </Button>
      </Box>

      {/* Full admin routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/attendance" />} />
        <Route path="/attendance" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetailView />} />
        <Route path="/event" element={<EventManagement />} />
        <Route path="/annoucement" element={<Announcement />} />
        <Route path="/add-employee" element={<EmployeeManagement />} />
        <Route path="/performance-analysis/:employeeId" element={<PerformanceAnalysisModal />} />
        <Route path="/add-technology" element={<AddTechnologyForm />} />
        <Route path="/Archive" element={<ArchivedProjectList />} />
        <Route path="/leave-request" element={<LeaveRequest />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/help-desk" element={<HelpDesk />} />
        <Route path="/monthly-data" element={<Monthlydata />} />
        <Route path="/get-all-requests" element={<AdminAdvanceSalary />} />
        <Route path="/salary-calculator" element={<SalaryCalculator />} />
        <Route path="/add-employee/:employeeId" element={<EmployeeDetails />} />
        <Route path="/add-file" element={<AdminSide />} />
        <Route path="/invoice-management" element={<InvoiceManagement />} />
        <Route path="/invoice-generator" element={<InvoiceGenerator />} />
        <Route path="/chat" element={<ChatContainer />} />
        <Route path="/wfh-credits" element={<WfhCreditsPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to={lastPath || '/attendance'} />} />
      </Routes>
    </Box>
  );
};

export default SuperAdminShell;
