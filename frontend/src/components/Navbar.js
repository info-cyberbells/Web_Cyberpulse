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
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import cyberbelllogo from "../assets/logocyberbells.png";
import DemoPage from "./CyberHome/DemoPage";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { label: 'Features', action: () => navigate('/') },
    { label: 'AI Solutions', action: () => window.open('https://web.cyberbells.com/demos/AI_Projects/all_portfolio.html', '_blank') },
    { label: 'Organisation', action: () => navigate('/signup') },
    { label: 'Contact', action: () => navigate('/support') },
  ];

  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer}
      sx={{
        "& .MuiDrawer-paper": {
          width: "100%",
          backgroundColor: "white",
          padding: "20px",
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <img
          src={cyberbelllogo}
          alt="CyberPulse Logo"
          style={{ height: "50px", width: "50px" }}
        />
        <IconButton onClick={toggleDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} onClick={() => { toggleDrawer(); item.action(); }} sx={{ py: 1.5, cursor: 'pointer' }}>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: { fontWeight: 600, fontSize: "18px", color: "#2c3e50" }
              }}
            />
          </ListItem>
        ))}

        <ListItem sx={{ py: 1.5, mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => { toggleDrawer(); setDemoOpen(true); }}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.5,
              fontSize: '16px',
              fontFamily: "'Inter', sans-serif",
              "&:hover": {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Book Demo
          </Button>
        </ListItem>

        <ListItem sx={{ py: 1.5 }}>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            fullWidth
            onClick={toggleDrawer}
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.5,
              fontSize: '16px',
              fontFamily: "'Inter', sans-serif",
              "&:hover": {
                borderColor: '#2563eb',
              }
            }}
          >
            Login
          </Button>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{
          minHeight: "80px !important",
          px: { xs: 2, md: 6 },
          display: "flex",
          alignItems: "center"
        }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              gap: 1.5,
              "&:hover": {
                transform: "scale(1.02)",
                transition: "transform 0.2s ease",
              },
            }}
          >
            <img
              src={cyberbelllogo}
              alt="CyberPulse Logo"
              style={{
                height: "45px",
                width: "45px",
                filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))"
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "#1e293b",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                letterSpacing: "-0.01em"
              }}
            >
              CyberPulse
            </Typography>
          </Box>

          {/* Desktop Menu */}
          {!isMobile && (
            <>
              {/* Center Menu Items */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                ml: 8,
                flex: 1,
                justifyContent: 'center'
              }}>
                {menuItems.map((item) => (
                  <Box
                    key={item.label}
                    onClick={item.action}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      "&:hover": {
                        '& .menu-text': { color: '#3b82f6' },
                      }
                    }}
                  >
                    <Typography
                      className="menu-text"
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#64748b',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "-0.01em",
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Right Side Controls */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setDemoOpen(true)}
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1.2,
                    fontSize: '15px',
                    fontFamily: "'Inter', sans-serif",
                    minWidth: '120px',
                    height: '44px',
                    "&:hover": {
                      borderColor: '#2563eb',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Book Demo
                </Button>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1.2,
                    fontSize: '15px',
                    fontFamily: "'Inter', sans-serif",
                    minWidth: '120px',
                    height: '44px',
                    "&:hover": {
                      borderColor: '#2563eb',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Login
                </Button>
              </Box>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                onClick={toggleDrawer}
                sx={{
                  color: "#1e293b",
                  p: 1,
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.08)",
                    color: "#3b82f6"
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && <MobileDrawer />}

      {/* Book Demo Modal */}
      <DemoPage open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
};

export default Navbar;