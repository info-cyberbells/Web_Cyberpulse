import React from "react";
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import cbLogo from '../../assets/CB.png';
import Instagram from '@mui/icons-material/Instagram';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Facebook from '@mui/icons-material/Facebook';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

const AppStoreIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

const PlayStoreIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
);

const Footer = () => {
    const quickLinks = [
        { label: 'Privacy Policy', to: '/privacy-policy', internal: true },
        { label: 'Support', to: '/support', internal: true },
        { label: 'AI Solutions', to: 'https://web.cyberbells.com/demos/AI_Projects/all_portfolio.html', internal: false },
    ];

    return (
        <Box sx={{ backgroundColor: '#1e1e1e', color: 'white', padding: '16px 6%' }}>

            {/* Main Footer Content */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '40px',
            }}>

                {/* Left - Brand */}
                <Box sx={{ maxWidth: '280px' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '22px', mb: 1, letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif" }}>
                        <span style={{ color: '#2563eb' }}>Cyber</span>Pulse
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, mb: 2.5 }}>
                        A complete HR & project management platform built to streamline your workforce operations.
                    </Typography>

                    {/* App Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
                            borderRadius: '10px', px: 1.5, py: 0.8, cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { backgroundColor: '#333', borderColor: '#2563eb' }
                        }}>
                            <AppStoreIcon />
                            <Box>
                                <Typography sx={{ fontSize: '9px', color: '#888', lineHeight: 1 }}>Download on the</Typography>
                                <Typography sx={{ fontSize: '13px', color: 'white', fontWeight: 600, lineHeight: 1.3 }}>App Store</Typography>
                            </Box>
                        </Box>
                        <Box onClick={() => window.open('https://play.google.com/store/apps/details?id=com.cyberpulse.app', '_blank')} sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
                            borderRadius: '10px', px: 1.5, py: 0.8, cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { backgroundColor: '#333', borderColor: '#2563eb' }
                        }}>
                            <PlayStoreIcon />
                            <Box>
                                <Typography sx={{ fontSize: '9px', color: '#888', lineHeight: 1 }}>Get it on</Typography>
                                <Typography sx={{ fontSize: '13px', color: 'white', fontWeight: 600, lineHeight: 1.3 }}>Google Play</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Social */}
                    <Typography sx={{ fontSize: '13px', color: '#94a3b8', mb: 1 }}>Follow us</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {[
                            { Icon: Instagram, url: 'https://www.instagram.com/cyberbells_official?igsh=dG1vcTdqbGxrOTFr' },
                            { Icon: Facebook, url: null },
                            { Icon: LinkedIn, url: 'https://www.linkedin.com/company/cyberbells-ites-services-ltd' },
                        ].map(({ Icon, url }, i) => (
                            <Box key={i} onClick={url ? () => window.open(url, '_blank') : undefined} sx={{
                                width: 34, height: 34, borderRadius: '8px',
                                backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                            }}>
                                <Icon sx={{ fontSize: 18, color: 'white' }} />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Middle - Quick Links */}
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'white', mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Quick Links
                    </Typography>
                    {quickLinks.map((link, i) => (
                        link.internal ? (
                            <Typography
                                key={i}
                                component={RouterLink}
                                to={link.to}
                                sx={{ display: 'block', mb: 1.2, fontSize: '13px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: '#2563eb' } }}
                            >
                                {link.label}
                            </Typography>
                        ) : (
                            <Typography
                                key={i}
                                onClick={link.to ? () => window.open(link.to, '_blank') : undefined}
                                sx={{ display: 'block', mb: 1.2, fontSize: '13px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#2563eb' } }}
                            >
                                {link.label}
                            </Typography>
                        )
                    ))}
                </Box>

                {/* Right - Contact */}
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'white', mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Contact Us
                    </Typography>
                    {[
                        { Icon: EmailOutlinedIcon, text: 'info@cyberbells.com', href: 'mailto:info@cyberbells.com' },
                        { Icon: PhoneOutlinedIcon, text: '+91 98765 43210' },
                        { Icon: LocationOnOutlinedIcon, text: 'Industrial Area Phase II, Chandigarh' },
                    ].map(({ Icon, text, href }, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 1.8 }}>
                            <Icon sx={{ fontSize: 17, color: '#2563eb', mt: '2px' }} />
                            {href ? (
                                <Typography
                                    component="a"
                                    href={href}
                                    sx={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, textDecoration: 'none', '&:hover': { color: '#2563eb' } }}
                                >
                                    {text}
                                </Typography>
                            ) : (
                                <Typography sx={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{text}</Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Bottom Bar */}
            <Box sx={{
                borderTop: '1px solid #2a2a2a',
                mt: 4, pt: 2.5,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: '#aaa' }}>Powered by</Typography>
                    <Box
                        component="a"
                        href="https://cyberbells.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.8, textDecoration: 'none', '&:hover img': { opacity: 1 } }}
                    >
                        <img src={cbLogo} alt="Cyberbells" style={{ height: '20px', width: 'auto', opacity: 0.85 }} />
                        <Typography sx={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            Cyberbells ITES Services Pvt. Ltd.
                        </Typography>
                    </Box>
                </Box>

                <Typography sx={{ fontSize: '12px', color: '#aaa' }}>
                    © {new Date().getFullYear()} CyberPulse. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
