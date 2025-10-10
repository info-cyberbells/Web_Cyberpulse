import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Toolbar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Computer as ComputerIcon,
  Home as HomeIcon,
  Archive as ArchiveIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import cyberbelllogo from "../assets/logocyberbells.png";

const drawerWidth = 260;

const sidebarItems = [
  {
    title: "Attendance",
    path: "/attendance",
    icon: <EventAvailableIcon />,
  },
  {
    title: "Leave",
    path: "/leave",
    icon: <EventBusyIcon />,
  },
  {
    title: "Profile",
    path: "/profile",
    icon: <PersonIcon />,
  },
];

const Sidebar = ({ isLoggedIn, onLogout, children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Previous drawer content remains the same */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "120px !important",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
          <img
            src={cyberbelllogo}
            alt="Cyberbell Logo"
            style={{
              height: "90px",
              width: "180px",
              display: open ? "block" : "none",
            }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          {open ? <CloseIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Toolbar>

      <Divider />

      <List sx={{ flex: 1, px: 2 }}>
        {sidebarItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                backgroundColor: location.pathname === item.path ? "rgba(25, 118, 210, 0.08)" : "transparent",
                color: location.pathname === item.path ? "secondary.main" : "inherit",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.12)",
                },
                justifyContent: open ? "initial" : "center",
                px: open ? 3 : 2.5,
                minHeight: 48,
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "secondary.main" : "inherit",
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
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
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
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Drawer */}
      {isMobile ? (
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
              width: drawerWidth,
              backgroundColor: "#bcd9f4",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop Drawer
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: open ? drawerWidth : theme.spacing(9),
              backgroundColor: "#bcd9f4",
              borderRight: "1px solid",
              borderColor: "divider",
              transition: theme.transitions.create(["width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)` },
          marginLeft: { md: open ? `${drawerWidth}px` : `${theme.spacing(9)}px` },
          transition: theme.transitions.create(['margin', 'width'], {
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