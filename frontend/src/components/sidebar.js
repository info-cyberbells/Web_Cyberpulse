import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Toolbar,
  AppBar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  MenuOpen as MenuOpenIcon,
  Event as EventIcon,
  Group as GroupIcon,
  WorkOutline as WorkOutlineIcon,
  SettingsApplications as SettingsApplicationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BeachAccess as BeachAccessIcon,
  SupportAgent as SupportAgentIcon,
  CalendarToday as CalendarTodayIcon,
  AccountCircle as AccountCircleIcon,
  EventAvailable as EventAvailableIcon,
  Announcement as AnnouncementIcon,
  PersonAdd as PersonAddIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Person as PersonIcon,
  Payments as PaymentsIcon,
  RequestPage as RequestPageIcon,
} from "@mui/icons-material";
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchiveIcon from "@mui/icons-material/Archive";
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ArticleIcon from '@mui/icons-material/Article';
import { DateRange } from "@mui/icons-material";
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from "react-router-dom";
import LOGO from "../assets/LOGO.png";
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Link } from 'react-router-dom';

export const drawerWidth = 260;

const Sidebar = ({ isLoggedIn, onLogout, children, onStartSlideshow }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // All possible sidebar items
  const allSidebarItems = [

    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      allowedTypes: [2, 3, 4],
    },
    {
      title: "Attendance",
      path: "/attendance",
      icon: <HowToRegIcon />,
      allowedTypes: [1, 2, 3, 4, 5],
    },
    {
      title: "Tasks",
      path: "/task",
      icon: <FactCheckIcon />,
      allowedTypes: [2, 3, 4],
    },
    {
      title: "Leave",
      path: "/leave",
      icon: <NoteAltIcon />,
      allowedTypes: [2, 3, 4],
    },
    {
      title: "Projects",
      path: "/projects",
      icon: <WorkOutlineIcon />,
      allowedTypes: [1, 3, 5],
    },
    {
      title: "Announcement",
      path: "/annoucement",
      icon: <AnnouncementIcon />,
      allowedTypes: [1, 2, 3, 4, 5]
    },
    {
      title: "Events",
      path: "/event",
      icon: <EventIcon />,
      allowedTypes: [1, 2, 3, 4, 5],
    },

    {
      title: "Employees",
      path: "/add-employee",
      icon: <GroupsIcon />,
      allowedTypes: [1, 4, 3, 5],
    },
    {
      title: "Help Desk",
      path: "/help-desk",
      icon: <SupportAgentIcon />,
      allowedTypes: [1, 2, 3, 4, 5],
    },
    {
      title: "Holidays",
      path: "/holidays",
      icon: <CalendarTodayIcon />,
      allowedTypes: [1, 2, 3, 4, 5],
    },
    {
      title: "Profile",
      path: "/profile",
      icon: <AccountCircleIcon />,
      allowedTypes: [2, 3, 4],
    },
    {
      title: "Documents",
      path: "/employee-documents",
      icon: <DescriptionIcon />,
      allowedTypes: [2, 3],
    },
    {
      title: "Active Employees",
      path: "/active-employees",
      icon: <GroupIcon />,
      allowedTypes: [3, 4],
    },



    {
      title: "Technologies",
      path: "/add-technology",
      icon: <SettingsApplicationsIcon />,
      allowedTypes: [1, 3, 5],
    },
    {
      title: "Archives",
      path: "/Archive",
      icon: <ArchiveIcon />,
      allowedTypes: [1, 5],
    },

    {
      title: "Leave Requests",
      path: "/leave-request",
      icon: <ArticleIcon />,
      allowedTypes: [1, 3, 4, 5],
    },
    {
      title: "Monthly Attendence",
      path: "/monthly-data",
      icon: <DateRange />,
      allowedTypes: [1, 3, 4, 5],
    },
    {
      title: "Advance Salary",
      path: "/advance-salary",
      icon: <PaymentsIcon />,
      allowedTypes: [2, 3],
    },
    {
      title: "Advance Salary",
      path: "/get-all-requests",
      icon: <PaymentsIcon />,
      allowedTypes: [1, 4, 5],
    },

    {
      title: "Salary Slips",
      path: "/salary-slips",
      icon: <ReceiptLongIcon />,
      allowedTypes: [4],
    },

    {
      title: "Suggestions and Complaint",
      path: "/Suggestion-desk",
      icon: <QuestionAnswerIcon />,
      allowedTypes: [4],
    },


    {
      title: "Salary Calculator",
      path: "/salary-calculator",
      icon: <CalculateIcon />,
      allowedTypes: [1],
    },


    {
      title: "Employee Handbooks",
      path: "/add-file",
      icon: <MenuBookIcon />,
      allowedTypes: [1, 4, 5],
    },


    {
      title: "Handbooks",
      path: "/employee-handbook",
      icon: <MenuBookIcon />,
      allowedTypes: [2, 3],
    },

    {
      title: "My Evaluation",
      path: "/my-performance",
      icon: <AssessmentIcon />,
      allowedTypes: [2],
    },

    {
      title: "Manage Invoices",
      path: "/invoice-management",
      icon: <RequestQuoteIcon />,
      allowedTypes: [1],
    },

    {
      title: "Chat",
      path: "/chat",
      icon: <ChatIcon />,
      allowedTypes: [1, 2, 3, 4, 5],
    },

    {
      title: "Delete Account",
      path: "/delete-account",
      icon: <DeleteForeverIcon />,
      allowedTypes: [2]
    },

    {
      title: "Slideshow",
      path: null,
      icon: <SlideshowIcon />,
      allowedTypes: [1],
      action: "startSlideshow",
    },
  ];


  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userType = parsedUser.employee.type;
        console.log("Full user data:", parsedUser);
        console.log("Employee data:", parsedUser.employee);
        console.log("User type:", userType);
        console.log("User ID (_id):", parsedUser.employee._id);
        console.log("User ID (id):", parsedUser.employee.id);
        console.log("User ID (employeeId):", parsedUser.employee.employeeId);

        const specificUserId = "68511c6bd5ab9a8291429ac5";
        const currentUserId = parsedUser.employee.id;

        const filteredItems = allSidebarItems.filter(item =>
          item.allowedTypes.includes(userType)
        );

        if (userType === 2 && currentUserId === specificUserId) {
          filteredItems.push({
            title: "Active Employees",
            path: "/active-employees",
            icon: <GroupIcon />,
          });
        }

        setSidebarItems(filteredItems);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setSidebarItems(allSidebarItems);
      }
    } else {

      setSidebarItems(allSidebarItems.filter(item =>
        item.allowedTypes.includes(1) // Default to type 1 items
      ));
    }
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >


      {/* Toolbar/Header */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "120px !important",
          px: isMobile ? 2 : open ? 7 : 2,
          position: isMobile ? "static" : "relative",
          flexShrink: 0, // don't shrink the header
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflow: "hidden",
            flex: isMobile ? "none" : 1,
          }}
        >
          <Link
            to="/"
            style={{
              display: open ? "block" : "none",
              width: "180px",
              height: "90px",
              lineHeight: 0, // removes extra line height spacing
              textDecoration: "none", // removes underline
            }}
          >
            <img
              src={LOGO}
              alt="Cyberbell Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Link>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: "white",
            position: isMobile ? "static" : open ? "relative" : "absolute",
            right: !isMobile && !open ? "12px" : "auto",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          {open ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <Divider />

      <List sx={{
        flex: 1,
        overflowY: "auto",
        px: 2,
        "&::-webkit-scrollbar": {
          display: "none"
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}>
        {sidebarItems.map((item) => (
          <ListItem key={item.path || item.title} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                if (item.action === "startSlideshow") {
                  onStartSlideshow();
                } else {
                  handleNavigation(item.path);
                }
              }}
              sx={{
                borderRadius: 1,
                backgroundColor:
                  location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/") ||
                    (item.path === "/invoice-management" && location.pathname === "/invoice-generator")
                    ? "rgba(105, 180, 238, 0.94)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(105, 180, 238, 0.94)",
                },
                justifyContent: open ? "initial" : "center",
                px: open ? 3 : 2.5,
                minHeight: 40,
                px: open ? 2 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: open ? 40 : 0,
                  mr: open ? "auto" : "none",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.title}
                  sx={{ color: "white" }}
                  primaryTypographyProps={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 0 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.08)",
            },
            justifyContent: open ? "initial" : "center",
            px: open ? 3 : 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              color: "error.main",
              minWidth: open ? 40 : 0,
              mr: open ? "auto" : "none",
              justifyContent: "center",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "error.main",
              }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "black",
            width: "100%",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <img
              src={LOGO}
              alt="Cyberbell Logo"
              style={{
                height: "50px",
                width: "100px",
              }}
            />
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "50%",
            backgroundColor: "black",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: open ? drawerWidth : theme.spacing(9),
            backgroundImage: "linear-gradient(to top, #1e1e2f, #3c3c5a)",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: theme.transitions.create(["width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
            overflowY: "hidden",
          },
        }}
        open={open}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            md: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)`,
          },
          marginLeft: {
            md: open ? `${drawerWidth}px` : `${theme.spacing(9)}px`,
          },
          marginTop: isMobile ? "64px" : 0,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};


export default Sidebar;
