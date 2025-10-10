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
import { Link as RouterLink, useLocation } from "react-router-dom";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import cyberbelllogo from "../assets/logocyberbells.png";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = (item) => {
    setDropdownStates(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const menuItems = ['Product', 'Solution', 'Integration', 'Resources'];

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
          <ListItem key={item} sx={{ py: 1.5 }}>
            <ListItemText
              primary={item}
              primaryTypographyProps={{
                sx: { fontWeight: 600, fontSize: "18px", color: "#2c3e50" }
              }}
            />
            <KeyboardArrowDown sx={{ color: "#2c3e50" }} />
          </ListItem>
        ))}

        <ListItem sx={{ py: 1.5, mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
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
          borderBottom: "1px solid rgba(0,0,0,0.08)"
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
                color: "#2c3e50",
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
                    key={item}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      "&:hover": {
                        '& .menu-text': {
                          color: '#3b82f6'
                        },
                        '& .menu-arrow': {
                          color: '#3b82f6',
                          transform: 'translateY(-2px)'
                        }
                      }
                    }}
                  >
                    <Typography
                      className="menu-text"
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#2c3e50',
                        mr: 0.5,
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "-0.01em",
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {item}
                    </Typography>
                    <KeyboardArrowDown
                      className="menu-arrow"
                      sx={{
                        fontSize: '18px',
                        color: '#2c3e50',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Right Side Controls */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
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
                  color: "#2c3e50",
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
    </>
  );
};

export default Navbar;