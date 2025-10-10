import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; // For Attendance
import EventBusyIcon from '@mui/icons-material/EventBusy'; 
import ComputerIcon from "@mui/icons-material/Computer";
import HomeIcon from "@mui/icons-material/Home";
import TuneIcon from "@mui/icons-material/Tune";
import ArchiveIcon from "@mui/icons-material/Archive";
import cyberbelllogo from "../assets/logocyberbells.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const Navbar = ({ isLoggedIn, onLogout, onLogin }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Styled ListItemText component with bold text
  const BoldListItemText = ({ primary, isActive }) => (
    <ListItemText 
      primary={primary} 
      primaryTypographyProps={{ 
        sx: { 
          fontWeight: 700,
          fontSize: '1.1rem',
          color: isActive ? '#1976d2' : 'inherit'
        } 
      }} 
    />
  );

  const drawerContent = (
    <Box sx={{ width: 250 }} onClick={toggleDrawer(false)}>
      <List>
        <ListItem 
          button 
          component={RouterLink} 
          to="/"
          sx={{ 
            backgroundColor: isActiveRoute('/') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': {
              backgroundColor: isActiveRoute('/') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon>
            <HomeIcon color={isActiveRoute('/') ? 'secondary' : 'inherit'} />
          </ListItemIcon>
          <BoldListItemText primary="Home" isActive={isActiveRoute('/')} />
        </ListItem>
        {isLoggedIn ? (
          <>
            {[
              { path: '/attendance', text: 'Attendance', icon: <EventAvailableIcon  /> },
              { path: '/add-employee', text: 'Employees', icon: <PersonAddIcon /> },
              { path: '/add-technology', text: 'Technology', icon: <ComputerIcon /> },
              { path: '/Archive', text: 'Archive', icon: <ArchiveIcon /> }
            ].map((item) => (
              <ListItem 
                key={item.path}
                button 
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  backgroundColor: isActiveRoute(item.path) ? 'secondary' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemIcon>
                  {React.cloneElement(item.icon, { 
                    color: isActiveRoute(item.path) ? 'primary' : 'inherit' 
                  })}
                </ListItemIcon>
                <BoldListItemText primary={item.text} isActive={isActiveRoute(item.path)} />
              </ListItem>
            ))}
            <ListItem button onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <BoldListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem 
            button 
            component={RouterLink} 
            to="/login"
            sx={{ 
              backgroundColor: isActiveRoute('/login') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: isActiveRoute('/login') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon>
              <LoginIcon color={isActiveRoute('/login') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <BoldListItemText primary="Login" isActive={isActiveRoute('/login')} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: "#bcd9f4" }}>
      <Toolbar>
        <img
          src={cyberbelllogo}
          alt="Cyberbell Logo"
          style={{ height: "120px", width: '180px', marginRight: "10px" }}
        />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            fontSize: '1.3rem'
          }}
        >
          PMS CYBERBELLS
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              aria-label="menu"
            >
              <TuneIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <Box>
            <Button
              color={isActiveRoute('/') ? 'secondary' : 'inherit'}
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              sx={{ 
                fontWeight: 700,
                fontSize: '1rem',
                backgroundColor: isActiveRoute('/') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActiveRoute('/') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Home
            </Button>
            {isLoggedIn ? (
              <>
                {[
                  { path: '/attendance', text: 'Attendance', icon: <EventAvailableIcon  /> },
                  { path: '/leave', text: 'Leave', icon: <EventBusyIcon /> },

                  { path: '/add-employee', text: 'Employees', icon: <PersonAddIcon /> },
                  { path: '/add-technology', text: 'Technology', icon: <ComputerIcon /> },
                  { path: '/Archive', text: 'Archive', icon: <ArchiveIcon /> }
                ].map((item) => (
                  <Button
                    key={item.path}
                    color={isActiveRoute(item.path) ? 'secondary' : 'inherit'}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isActiveRoute(item.path) ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={onLogout}
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                color={isActiveRoute('/login') ? 'secondary' : 'inherit'}
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{ 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  backgroundColor: isActiveRoute('/login') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActiveRoute('/login') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;