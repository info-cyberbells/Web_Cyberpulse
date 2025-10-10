import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventManagement from './EventAdminManagement/EventManagement';
import Home from './Home';
import Projects from './Projects';
import AnnouncementManagement from './AnnoucementAdminManagement/Annoucement';
import EmployeeManagement from './Employees/EmployeeManagement';
import HelpDesk from './HelpDesk';
import Holidays from './Holidays/Holidays';
import AddTechnologyForm from './AddTechnologyForm';
import ArchivedProjectList from './ArchivedProjectList';
import LeaveRequests from './LeaveRequest/LeaveRequest';
import MonthlyAttendance from './MonthlyEmployeeData/Monthlydata';
import AdvanceSalary from './AdvanceSalary/advancesalary';
import EmployeeSalaryCalculator from './SalaryCalculator/SalaryCalculator';
import EmployeeHandbookUpload from './Handbook/AdminSide';

const pages = [<Home key="home" />, <EventManagement key="events" />, <Projects key="projects" />, <AnnouncementManagement key="announcement" />,
<EmployeeManagement key="employeemanagment" />, <HelpDesk key="helpdesk" />, <Holidays key="Holidays" />, <AddTechnologyForm key="technologyform" />,
<ArchivedProjectList key="archiveprojects" />, <LeaveRequests key="leaverequests" />, <MonthlyAttendance key="monthlyattendence" />, <AdvanceSalary key="advancesalary" />,
<EmployeeSalaryCalculator key="employeeSalary" />, <EmployeeHandbookUpload key="employeehandbook" />,
];


const SlideshowContainer = styled('div')({
    position: 'relative',
    width: '100vw',
    minHeight: '100vh', // Changed to minHeight to allow expansion
    overflow: 'hidden',
    backgroundColor: '#fff', // Ensure a visible background
});

const Slide = styled('div')(({ active }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100vh', // Changed from height to minHeight to allow content to expand
    overflowY: 'auto', // Enable scrolling for content
    opacity: active ? 1 : 0,
    transition: 'opacity 1s ease-in-out',
    display: active ? 'block' : 'none',
    backgroundColor: '#fff', // Add background to prevent black screen
}));

const NavButton = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '6px 12px',
    zIndex: 1000,
    minWidth: '40px',
    fontSize: '1.2rem',
}));

const ExitButton = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: '50px',
    right: '20px',
    zIndex: 1000,
    padding: '6px 12px',
    minWidth: 'auto',
    fontSize: '0.9rem',
}));

const Slideshow = ({ onExit }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideshowRef = useRef(null);


    useEffect(() => {
        const slideshowElement = slideshowRef.current;
        if (slideshowElement && document.fullscreenElement === null) {
            slideshowElement.requestFullscreen().catch((err) => {
                console.error('Failed to enter fullscreen:', err);
                // Fallback: Ensure content is visible even if fullscreen fails
                slideshowElement.style.height = '100vh';
            });
        }

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % pages.length);
        }, 10000);

        return () => {
            clearInterval(timer);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => {
                    console.error('Failed to exit fullscreen:', err);
                });
            }
        };
    }, []);

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % pages.length);
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + pages.length) % pages.length);
    };

    return (
        <SlideshowContainer ref={slideshowRef}>
            {pages.map((Page, index) => (
                <Slide key={index} active={index === currentSlide}>
                    {Page}
                </Slide>
            ))}
            <NavButton
                variant="contained"
                color="secondary"
                style={{ left: '20px' }}
                onClick={goToPrev}
            >
                &lt;
            </NavButton>
            <NavButton
                variant="contained"
                color="secondary"
                style={{ right: '20px' }}
                onClick={goToNext}
            >
                &gt;
            </NavButton>
            <ExitButton
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch((err) => {
                            console.error('Failed to exit fullscreen:', err);
                        });
                    }
                    onExit();
                }}
            >
                Exit Slideshow
            </ExitButton>
        </SlideshowContainer>
    );
};

export default Slideshow;