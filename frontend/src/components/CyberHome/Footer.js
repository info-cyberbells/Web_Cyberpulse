import React from "react";
import { Box, Typography } from '@mui/material';
import Instagram from '@mui/icons-material/Instagram';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Facebook from '@mui/icons-material/Facebook';
import YouTube from '@mui/icons-material/YouTube';
import X from '@mui/icons-material/X';

const Footer = () => {
    return (
        <Box sx={{ backgroundColor: '#1e1e1e', color: 'white', padding: '50px 5%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                <Box sx={{ minWidth: '200px' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px' }}>Product</Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Attendance Tracker
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Time & Attendance Software
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Timesheet App
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Time Clock Software
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Project Time Tracker
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Integrations
                    </Typography>
                </Box>

                <Box sx={{ minWidth: '200px' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px' }}>Industries</Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Enterprises
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Freelancers
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Construction
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Accountants
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Consultants
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#1d4ed8' } }}>
                        Healthcare
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Education
                    </Typography>
                </Box>

                <Box sx={{ minWidth: '200px' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px' }}>Resources</Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Timesheet Calculator
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Timesheet Templates
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Time Tracking Resources
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Articles
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Tutorials
                    </Typography>
                </Box>

                <Box sx={{ minWidth: '200px' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 2, fontSize: '16px' }}>Support</Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Feedback
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Help Center
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Time Tracking FAQ
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Time Attendance FAQ
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Schedule a Demo
                    </Typography>
                    <Typography sx={{ mb: 1, fontSize: '14px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Become a Partner
                    </Typography>
                </Box>

                <Box sx={{ minWidth: '250px' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '24px', mb: 1 }}>
                        <span style={{ color: '#2563eb' }}>⧖</span> CyberPulse
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: '14px', color: '#cccccc' }}>
                        Maximize your team's security today
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        <Box sx={{
                            width: '120px',
                            height: '40px',
                            backgroundColor: '#333',
                            border: '1px solid #555',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#444' }
                        }}>
                            App Store
                        </Box>
                        <Box sx={{
                            width: '120px',
                            height: '40px',
                            backgroundColor: '#333',
                            border: '1px solid #555',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#444' }
                        }}>
                            Google Play
                        </Box>
                        <Box sx={{
                            width: '120px',
                            height: '40px',
                            backgroundColor: '#333',
                            border: '1px solid #555',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#444' }
                        }}>
                            Chrome
                        </Box>
                        <Box sx={{
                            width: '120px',
                            height: '40px',
                            backgroundColor: '#333',
                            border: '1px solid #555',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#444' }
                        }}>
                            Mac App Store
                        </Box>
                    </Box>

                    <Typography sx={{ marginTop: '20px', fontSize: '14px', color: '#cccccc' }}>
                        Follow us
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Instagram sx={{ color: 'white', fontSize: 20, cursor: 'pointer', '&:hover': { color: '#2563eb' } }} />
                        <Facebook sx={{ color: 'white', fontSize: 20, cursor: 'pointer', '&:hover': { color: '#2563eb' } }} />
                        <YouTube sx={{ color: 'white', fontSize: 20, cursor: 'pointer', '&:hover': { color: '#2563eb' } }} />
                        <LinkedIn sx={{ color: 'white', fontSize: 20, cursor: 'pointer', '&:hover': { color: '#2563eb' } }} />
                        <X sx={{ color: 'white', fontSize: 20, cursor: 'pointer', '&:hover': { color: '#2563eb' } }} />
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                borderTop: '1px solid #444',
                mt: 4,
                pt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
            }}>
                <Typography sx={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                    Copyright © 2025 CyberPulse Group. 3790 El Camino Real, Palo Alto, CA 94306, USA
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '12px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        🌐 ENGLISH
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Terms & Conditions
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#cccccc', cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>
                        Privacy Policy
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;