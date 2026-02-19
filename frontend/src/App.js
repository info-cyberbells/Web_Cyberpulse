import React, { useState, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from 'react-router-dom';
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./store";
import Navbar from "./components/Navbar";
// import Projects from "./components/Projects";
import Projects from "./components/Projects";

import LoginForm from "./components/LoginForm";
import EmployeeManagement from "./components/Employees/EmployeeManagement";
import AddTechnologyForm from "./components/AddTechnologyForm";
import {
  logoutUser,
  setUserFromStorage,
  setLastPath,
  setAuthLoaded,
} from "../src/features/auth/authSlice";
import ArchivedProjectList from "./components/ArchivedProjectList";
import AttendanceManagement from "./components/AttendanceManagement";
import LeaveManagement from "./components/LeaveManagement";
import ProfileManagement from "./components/ProfileManagement";
import Dashboard from "./components/Dashboard";
import TaskManagement from "./components/TaskManagement";
import EventManagement from "./components/EventAdminManagement/EventManagement";
import Announcement from "./components/AnnoucementAdminManagement/Annoucement";
import Sidebar from "./components/sidebar";
import Home from "./components/Home";
import Holidays from "./components/Holidays/Holidays"
import LeaveRequest from "./components/LeaveRequest/LeaveRequest";
import HelpDesk from "./components/HelpDesk";
import HelpDeskUser from "./components/HelpDeskUser/HelpDesk";
import HolidaysUser from "./components/Holidays/HolidaysUser";
import Monthlydata from "./components/MonthlyEmployeeData/Monthlydata";
import AdvanceSalary from "./components/AdvanceSalary/advancesalary";
import AdminAdvanceSalary from "./components/AdvanceSalary/AdminAdvanceSalary";
import SalaryCalculator from "./components/SalaryCalculator/SalaryCalculator";
import Documents from './components/Documentation/Documents';
import EmployeeDetails from "./components/EmployeeDetails/EmployeeDetails";
import SalarySlip from "./components/SalarySlip/SalarySlip";
import AdminSide from "./components/Handbook/AdminSide";
import EmployeeHandbookView from "./components/Handbook/UserSide";
import PerformanceAnalysisModal from "./components/Employees/PerformanceAnalysisModal";
import HomePage from "./components/CyberHome/HomePage";
import SignUpPage from "./components/CyberHome/Signup";
import InvoiceManagement from './components/InVoiceGenerator/InvoiceManagement';
import InvoiceGenerator from "./components/InVoiceGenerator/invoiceGenerator";
import Slideshow from "./components/SlideShow";
import PrivacyPolicy from "./features/PrivacyPolicy/PrivacyPolicy";
import DeleteAccount from "./components/DeleteAccount/DeleteAccount";
import ChatContainer from "./components/Chat/ChatContainer";



const theme = createTheme({
  // Your theme configuration
});

function AppContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, lastPath } = useSelector((state) => state.auth);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const storedData = localStorage.getItem("user");
  const employeeData = storedData ? JSON.parse(storedData).employee : null;
  const userType = employeeData?.type || null;

  useEffect(() => {
    if (storedData) {
      dispatch(setUserFromStorage(JSON.parse(storedData)));
    } else {
      dispatch(setAuthLoaded());
    }
  }, [dispatch]);

  useEffect(() => {
    let isInitialRender = true;
    if (isAuthenticated && location.pathname !== "/login" && !isInitialRender) {
      dispatch(setLastPath(location.pathname));
    } else if (!isAuthenticated && location.pathname !== "/login" && !isInitialRender) {
      dispatch(setLastPath(location.pathname));
    }
    isInitialRender = false;
  }, [location.pathname, isAuthenticated, dispatch]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };
  // Two completely separate route sets
  const TypeOneRoutes = () => (
    <Routes>
      <Route path="/" element={<Navigate to="/attendance" />} /> {/* Redirect root to /attendance */}
      <Route path="/attendance" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
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
      <Route path="*" element={<Navigate to={lastPath || "/attendance"} />} /> {/* Use lastPath with fallback */}
    </Routes>
  );

  const UnauthorizedRoutes = () => (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
  // Render content based on authentication and user type
  const renderContent = () => {

    if (isSlideshowActive) {
      return <Slideshow onExit={() => setIsSlideshowActive(false)} />;
    }
    if (!isAuthenticated) {
      return (
        <>
          <Navbar isLoggedIn={false} onLogout={handleLogout} />
          <UnauthorizedRoutes />
        </>
      );
    }

    if (userType === 1) {  //admin
      return (
        <>
          <Sidebar
            isLoggedIn={true}
            onLogout={handleLogout}
            userType={userType}
            userName={employeeData?.name}
            userRole={employeeData?.jobRole}
            onStartSlideshow={() => setIsSlideshowActive(true)}
          >
            <TypeOneRoutes />
          </Sidebar>
        </>
      );
    }
    // In your AppContent component
    if (userType === 2) {  //user
      const specificUserId = "68511c6bd5ab9a8291429ac5";
      const currentUserId = employeeData?.id;
      return (
        <Sidebar
          isLoggedIn={true}
          onLogout={handleLogout}
          userType={userType}
          userName={employeeData?.name}
          userRole={employeeData?.jobRole}
          onStartSlideshow={() => setIsSlideshowActive(true)}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/attendance" />} /> {/* Redirect root to /attendance */}
            <Route path="/help-desk" element={<HelpDeskUser />} />
            <Route path="/holidays" element={<HolidaysUser />} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/my-performance" element={<PerformanceAnalysisModal />} />
            <Route path="/annoucement" element={<Announcement />} />
            <Route path="/event" element={<EventManagement />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/advance-salary" element={<AdvanceSalary />} />
            <Route path="/employee-documents" element={<Documents />} />
            <Route path="/employee-handbook" element={<EmployeeHandbookView />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/chat" element={<ChatContainer />} />
            {currentUserId === specificUserId && (
              <Route path="/active-employees" element={<Home />} />
            )}
            <Route path="*" element={<Navigate to={lastPath || "/attendance"} />} /> {/* Use lastPath with fallback */}
          </Routes>        </Sidebar>
      );
    }

    if (userType === 3) { //TL
      return (
        <Sidebar
          isLoggedIn={true}
          onLogout={handleLogout}
          userType={userType}
          userName={employeeData?.name}
          userRole={employeeData?.jobRole}
          onStartSlideshow={() => setIsSlideshowActive(true)}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/attendance" />} /> {/* Redirect root to /attendance */}
            <Route path="/active-employees" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/help-desk" element={<HelpDeskUser />} />
            <Route path="/holidays" element={<HolidaysUser />} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/annoucement" element={<Announcement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/add-technology" element={<AddTechnologyForm />} />
            <Route path="/event" element={<EventManagement />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/performance-analysis/:employeeId" element={<PerformanceAnalysisModal />} />
            <Route path="/advance-salary" element={<AdvanceSalary />} />
            <Route path="/monthly-data" element={<Monthlydata />} />
            <Route path="/employee-documents" element={<Documents />} />
            <Route path="/employee-handbook" element={<EmployeeHandbookView />} />
            <Route path="/add-employee" element={<EmployeeManagement />} />
            <Route path="/add-employee/:employeeId" element={<EmployeeDetails />} />
            <Route path="/chat" element={<ChatContainer />} />
            <Route path="*" element={<Navigate to={lastPath || "/attendance"} />} /> {/* Use lastPath with fallback */}
          </Routes>
        </Sidebar>
      );
    }


    if (userType === 4) {  //HR
      return (
        <Sidebar
          isLoggedIn={true}
          onLogout={handleLogout}
          userType={userType}
          userName={employeeData?.name}
          userRole={employeeData?.jobRole}
          onStartSlideshow={() => setIsSlideshowActive(true)}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/attendance" />} /> {/* Redirect root to /attendance */}
            <Route path="/active-employees" element={<Home />} />
            <Route path="/add-employee" element={<EmployeeManagement />} />
            <Route path="/add-employee/:employeeId" element={<EmployeeDetails />} />
            <Route path="/help-desk" element={<HelpDeskUser />} />
            <Route path="/annoucement" element={<Announcement />} />
            <Route path="/holidays" element={<HolidaysUser />} />
            <Route path="/task" element={<TaskManagement />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/performance-analysis/:employeeId" element={<PerformanceAnalysisModal />} />
            <Route path="/event" element={<EventManagement />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/monthly-data" element={<Monthlydata />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/Suggestion-desk" element={<HelpDesk />} />
            <Route path="/get-all-requests" element={<AdminAdvanceSalary />} />
            <Route path="/salary-slips" element={<SalarySlip />} />
            <Route path="/add-file" element={<AdminSide />} />
            <Route path="/chat" element={<ChatContainer />} />
            <Route path="*" element={<Navigate to={lastPath || "/attendance"} />} /> {/* Use lastPath with fallback */}
          </Routes>
        </Sidebar>
      );
    }

    if (userType === 5) {  //Manager
      return (
        <Sidebar
          isLoggedIn={true}
          onLogout={handleLogout}
          userType={userType}
          userName={employeeData?.name}
          userRole={employeeData?.jobRole}
          onStartSlideshow={() => setIsSlideshowActive(true)}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/attendance" />} /> {/* Redirect root to /attendance */}
            <Route path="/attendance" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
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
            <Route path="/add-employee/:employeeId" element={<EmployeeDetails />} />
            <Route path="/add-file" element={<AdminSide />} />
            <Route path="/chat" element={<ChatContainer />} />
            <Route path="*" element={<Navigate to={lastPath || "/attendance"} />} /> {/* Use lastPath with fallback */}
          </Routes>
        </Sidebar>
      );
    }
  };

  return renderContent();
}
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
export default function RootApp() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
