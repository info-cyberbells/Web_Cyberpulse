import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import South from '@mui/icons-material/South';
import North from '@mui/icons-material/North';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import timetrack from "../../assets/HomePage/timetrack.png"

import tesla from '../../assets/HomePage/tesla.webp';
import pizzahut from '../../assets/HomePage/pizzahut.webp';
import harvard from '../../assets/HomePage/harvard.webp';
import hyundai from '../../assets/HomePage/hyundai.webp';
import neom from '../../assets/HomePage/neom.webp';
import nhs from '../../assets/HomePage/nhs.webp';
import pepsi from '../../assets/HomePage/pepsi.webp';
import jll from '../../assets/HomePage/jll.webp';

import capterra from "../../assets/HomePage/capterra.webp"
import googleplay from "../../assets/HomePage/googleplay.webp"
import appstore from "../../assets/HomePage/appstore.svg"
import forbes from "../../assets/HomePage/forbes-1.svg"

import employemanagent from "../../assets/HomePage/employemanagent.png"
import attendance from "../../assets/HomePage/attendance.png"
import leavemanage from "../../assets/HomePage/leavemanage.png"
import tasktrack from "../../assets/HomePage/tasktrack.png"
import salarycalculate from "../../assets/HomePage/salarycalculate.png"

// Improved styles object
const styles = {
    outerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '90vh',
        backgroundColor: 'rgba(142, 209, 252, 0.06)',
        paddingBottom: '60px',
        paddingTop: '15px', // Reduced from 40px to 15px
    },

    contentBox: {
        width: '95%',
        maxWidth: '1400px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: { xs: '20px 20px', md: '40px 40px' }, // Reduced top padding from 80px to 40px on desktop, 40px to 20px on mobile
        gap: { xs: '40px', md: '60px' },
        flexDirection: { xs: 'column', md: 'row' },
    },

    textBox: {
        flex: '1 1 50%',
        maxWidth: '600px',
        textAlign: { xs: 'center', md: 'left' },
    },

    heading: {
        fontSize: { xs: '32px', sm: '38px', md: '44px', lg: '48px' }, // Increased font sizes
        fontWeight: '700', // Increased from 600 to 700
        lineHeight: '1.2', // Tighter line height for better visual impact
        color: '#1a202c', // Darker color for better contrast
        marginBottom: '16px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        letterSpacing: '-0.02em', // Slightly more negative letter spacing for modern look
    },

    subText: {
        fontSize: { xs: '16px', sm: '17px', md: '18px' },
        lineHeight: '1.6',
        color: '#64748b',
        marginBottom: '24px',
        fontWeight: '400',
        fontFamily: "'Inter', sans-serif",
        maxWidth: '480px',
    },

    button: {
        color: 'white',
        borderRadius: '8px',
        fontSize: { xs: '14px', md: '15px' },
        fontWeight: '600',
        textTransform: 'none',
        backgroundColor: '#3b82f6',
        border: 'none',
        padding: { xs: '12px 24px', md: '14px 28px' },
        marginBottom: '20px',
        fontFamily: "'Inter', sans-serif",
        '&:hover': {
            backgroundColor: '#2563eb',
        },
        transition: 'all 0.2s ease',
    },

    statText: {
        fontSize: { xs: '13px', md: '14px' },
        color: '#94a3b8',
        fontWeight: '400',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'flex-start' },
        gap: '6px',
        '&::before': {
            content: '"✓"',
            color: '#10b981',
            fontWeight: '600',
            fontSize: '14px',
        }
    },

    mainImage: {
        maxHeight: '600px',
        maxWidth: '100%',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },

    brandLogoWrap: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '50px',
        flexWrap: 'wrap',
        padding: '40px 20px',
        backgroundColor: 'white',
        width: '100%',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
    },
    sectionWrap: {
        width: '100%',
        textAlign: 'center',
        paddingTop: { xs: '30px', sm: '40px', md: '45px' },
        paddingBottom: { xs: '60px', sm: '70px', md: '80px' },
        paddingLeft: '20px',
        paddingRight: '20px',
    },
    sectionTitle: {
        fontSize: '42px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '60px',
        lineHeight: '1.3',
    },
    bannerRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        marginBottom: '60px',
        padding: '20px',
    },
    ratingSection: {
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
        flexWrap: 'wrap',
        marginBottom: '60px',
    },
    ratingCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '150px',
    },
    ratingText: {
        fontSize: '16px',
        fontWeight: 500,
        marginTop: '10px',
    },
    videoSection: {
        margin: '60px 0',
    },
    videoImage: {
        maxHeight: '400px',
        maxWidth: '80%',
        objectFit: 'contain',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
    featuresWrap: {
        marginTop: '100px',
        padding: '0 20px',
    },
    featuresHeading: {
        fontSize: '42px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '80px',
        lineHeight: '1.3',
        textAlign: 'center',
    },
    featureRow: {
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '100px auto',
        gap: '60px',
    },
    featureRowReverse: {
        flexDirection: 'row-reverse',
    },
    featureImage: {
        flex: 1,
        maxWidth: '500px',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: '12px',
    },
    featureTextBlock: {
        flex: 1,
        maxWidth: '500px',
        textAlign: 'left',
    },
    featureTitle: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '15px',
        lineHeight: '1.2',
    },
    featureSubTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2563eb',
        marginBottom: '20px',
    },
    featurePara: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#555',
        marginBottom: '20px',
    },
    extraContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '20px',
    },
    highlightText: {
        color: '#2563eb',
        fontWeight: '600',
    },
};

function HomePage() {
    const navigate = useNavigate();
    const theme = createTheme({
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
    });
    const [openIds, setOpenIds] = useState([]);
    const brandLogos = [
        tesla,
        pizzahut,
        harvard,
        hyundai,
        neom,
        nhs,
        pepsi,
        jll
    ];



    const ratingData = [
        { src: googleplay, rating: '⭐⭐⭐⭐⭐', score: '4.9 out of 5' },
        { src: appstore, rating: '⭐⭐⭐⭐', score: '4.4 out of 5' },
        { src: capterra, rating: '⭐⭐⭐⭐', score: '4.4 out of 5' },
        { src: forbes, rating: '⭐⭐⭐⭐', score: '4.4 out of 5' },
    ];

    const featureData = [
        {
            title: "Leave Management Made Simple",
            subTitle: "Manage leaves without the headache",
            description: "Easily handle leave requests, approvals, and balances in one central system. Empower employees while keeping HR in control.",
            image: leavemanage
        },
        {
            title: "Smart Employee Management",
            subTitle: "Streamline your HR operations",
            description: "Centralize employee records, automate onboarding, and maintain compliance effortlessly with powerful employee management tools.",
            image: employemanagent
        },
        {
            title: "Real-Time Attendance Tracking",
            subTitle: "Know who's in, out, or late",
            description: "Track clock-ins and outs with precision. Get real-time attendance reports to improve accountability and reduce time theft.",
            image: attendance
        },
        {
            title: "Smarter Task & Time Tracking",
            subTitle: "Track work, not just time",
            description: "Assign tasks, track progress, and see how time is spent. Ideal for remote teams and project-based workflows.",
            image: tasktrack
        },
        {
            title: "Accurate Payroll Calculation",
            subTitle: "Pay your team the right way",
            description: "Generate payroll-ready timesheets automatically. Eliminate manual errors and save hours on salary processing.",
            image: salarycalculate,
            extra: (
                <Button variant="outlined" sx={styles.button}>
                    Start Now – It’s Free!
                </Button>
            )
        }
    ];
    const testimonials = [
        {
            title: 'Employees love the simplicity',
            text: 'I onboard a lot of employees every month, and it’s incredibly easy to get them started with CyberPulse. Just a quick 2-minute walkthrough is all it takes.',
            name: 'Kevin Morrill',
            company: 'Lambda School',
        },
        {
            title: 'Eliminates the hassle of time tracking',
            text: "CyberPulse makes tracking time effortless. Our team can instantly see who's working and easily generate reports and payroll summaries.",
            name: 'Kody Atkinson',
            company: 'YNAB',
        },
        {
            title: 'CyberPulse nailed it',
            text: 'The interface is user-friendly, packed with unique features, and comes with a powerful API. The support team is responsive and helpful. It’s ideal for any modern business using multiple online tools.',
            name: 'Alain Azzam',
            company: 'Tektonik',
        },
        {
            title: 'CyberPulse Rocks!',
            text: "I've tried multiple platforms, but I’ve stuck with CyberPulse because it’s intuitive and reliable. I especially appreciate the daily and weekly team timesheet updates.",
            name: 'Ma. Louren Camballa',
            company: 'AREA - Accurate Real Estate Appraisals',
        },
    ];


    const faqData = [
        {
            id: 1,
            question: "Is there a truly free time tracking tool for teams?",
            answer: `Yes! CyberPulse’s time tracking solution is 100% free forever with no user limits.

Other platforms like MyHours, Clockify, and Paymo offer free plans, but none match CyberPulse in terms of advanced features and usability.`,
        },
        {
            id: 2,
            question: "Are free time tracking tools even worth it?",
            answer: `Absolutely. CyberPulse offers powerful features in its free plan, including advanced reporting and integrations. Try it out—you’ll see the difference.`,
        },
        {
            id: 3,
            question: "What makes CyberPulse better than other time tracking apps?",
            answer: `CyberPulse includes premium features like facial recognition, GPS tracking, and advanced analytics—even in the free version. It’s built for modern teams that need flexibility and power.`,
        },
        {
            id: 4,
            question: "Does CyberPulse support screen recording?",
            answer: `Not yet—but it’s on our roadmap and coming in future updates. Stay tuned!`,
        },
    ];


    const toggle = (id) => {
        setOpenIds(prev =>
            prev.includes(id)
                ? prev.filter(openId => openId !== id)
                : [...prev, id]
        );
    };

    return (
        <>
            <ThemeProvider theme={theme}>
                <Box>
                    {/* Hero Section */}
                    <Box sx={styles.outerBox}>
                        <Box sx={styles.contentBox}>
                            <Box sx={styles.textBox}>
                                <Typography sx={styles.heading}>
                                    Complete Employee<br />
                                    Management Dashboard
                                </Typography>
                                <Typography sx={styles.subText}>
                                    Monitor, track, and manage your entire workforce from one powerful admin dashboard.
                                    Real-time insights into employee productivity and performance.
                                </Typography>
                                <Button variant="contained" sx={styles.button} onClick={() => navigate('/signup')}>
                                    Start Managing Your Team!
                                </Button>
                                <Typography sx={styles.statText}>
                                    Trusted by 15,000+ administrators to manage their workforce efficiently
                                </Typography>
                            </Box>
                            <Box sx={{
                                flex: '1 1 50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Box
                                    component="img"
                                    src={employemanagent}
                                    alt="Time Tracking Dashboard"
                                    sx={styles.mainImage}
                                />
                            </Box>
                        </Box>


                        {/* Brand Logos */}
                        <Box sx={styles.brandLogoWrap}>
                            {brandLogos.map((logo, index) => (
                                <img
                                    key={index}
                                    src={logo}
                                    alt={`Trusted by ${index + 1}`}
                                    style={{
                                        height: '28px',
                                        objectFit: 'contain',
                                        opacity: 0.6,
                                        filter: 'grayscale(100%)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.filter = 'grayscale(0%)';
                                        e.target.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.filter = 'grayscale(100%)';
                                        e.target.style.opacity = '0.6';
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Main Content Section */}
                    <Box sx={styles.sectionWrap}>
                        <Typography sx={styles.sectionTitle}>
                            Streamline your workflow with the #1 employee time tracker
                        </Typography>

                        {/* Ratings Section */}
                        <Box sx={styles.ratingSection}>
                            {ratingData.map((item, index) => (
                                <Box key={index} sx={styles.ratingCard}>
                                    <img
                                        src={item.src}
                                        alt={`Platform ${index + 1}`}
                                        style={{ height: '40px', objectFit: 'contain' }}
                                    />
                                    <Typography sx={styles.ratingText}>{item.rating}</Typography>
                                    <Typography variant="body2" sx={{ color: '#777' }}>
                                        {item.score}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>


                        {/* Features Section */}
                        <Box sx={styles.featuresWrap}>
                            <Typography sx={styles.featuresHeading}>
                                Tracking time for thousands of users can be hard.<br />
                                <span style={{ color: 'blue', fontWeight: 'bold' }}>CyberPulse</span> makes it easy.
                            </Typography>



                            {featureData.map((feature, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        ...styles.featureRow,
                                        ...(index % 2 !== 0 ? styles.featureRowReverse : {}),
                                    }}
                                >
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        style={styles.featureImage}
                                    />
                                    <Box sx={styles.featureTextBlock}>
                                        <Typography sx={styles.featureTitle}>
                                            {feature.title}
                                        </Typography>
                                        <Typography sx={styles.featureSubTitle}>
                                            {feature.subTitle}
                                        </Typography>
                                        <Typography sx={styles.featurePara}>
                                            {feature.description}
                                        </Typography>
                                        {feature.extra && feature.extra}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    {/* Testimonials Section */}
                    <Box sx={{ marginTop: '10px', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '35px', fontWeight: '700', marginBottom: '40px' }}>
                            Join thousands who trust CyberPulse for effortless time management
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '24px',
                            flexWrap: 'wrap',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {testimonials.map((item, i) => (
                                <Box key={i} sx={{
                                    width: '280px',
                                    minHeight: '200px',
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
                                    backgroundColor: 'white',
                                    padding: '24px',
                                    textAlign: 'left'
                                }}>
                                    <Typography sx={{ fontWeight: 'bold', marginBottom: '12px' }}>
                                        {item.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', marginBottom: '12px' }}>
                                        {Array(5).fill(0).map((_, idx) => (
                                            <StarIcon key={idx} sx={{ color: '#2563eb', fontSize: '18px' }} />
                                        ))}
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                                        {item.text}
                                    </Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        {item.name}{' '}
                                        <Typography component="span" sx={{ fontSize: '13px', color: '#777', fontStyle: 'italic' }}>
                                            {item.company}
                                        </Typography>
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* FAQ Section */}
                    <Box sx={{ marginTop: '100px', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '35px', fontWeight: '600', marginBottom: '20px' }}>
                            FAQs
                        </Typography>
                        <Typography sx={{ marginBottom: '40px' }}>
                            Some frequently asked questions...
                        </Typography>
                        <Box sx={{
                            width: '100%',
                            maxWidth: '800px',
                            margin: '0 auto',
                            border: '3px solid #2563eb',
                            borderRadius: '8px',
                            marginBottom: '15px',
                        }}>
                            {faqData.map((item) => (
                                <Box key={item.id} sx={{ marginBottom: '8px' }}>
                                    <Box sx={{
                                        width: '95%',
                                        backgroundColor: '#2563eb',
                                        margin: '8px auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }} onClick={() => toggle(item.id)}>
                                        <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
                                            {item.question}
                                        </Typography>
                                        {openIds.includes(item.id) ? (
                                            <North sx={{ color: 'white', fontSize: 20 }} />
                                        ) : (
                                            <South sx={{ color: 'white', fontSize: 20 }} />
                                        )}
                                    </Box>
                                    {openIds.includes(item.id) && (
                                        <Box sx={{
                                            backgroundColor: '#fff',
                                            width: '90%',
                                            margin: '10px auto',
                                            padding: '15px',
                                            border: '1px solid #2563eb',
                                            borderRadius: '4px',
                                        }}>
                                            <Typography sx={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-line', textAlign: 'left' }}>
                                                {item.answer}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>


                </Box>
            </ThemeProvider>

            <Footer />
        </>
    );
}

export default HomePage;