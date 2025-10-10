import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Modal,
    Stack,
    TextField,
    Button,
    Grid,
    Checkbox,
    FormControlLabel,
    IconButton,
    Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SalarySlipTemplate from './SalarySlipTemplate';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEmployees, sendSlipEmail, uploadSlip, clearErrors, clearSuccess } from '../../features/salarySlip/salarySlipSlice';


const SalarySlip = ({ employeeEmail, employeeName, month, fileUrl }) => {
    // Add these after your existing state declarations:
    const dispatch = useDispatch();
    const {
        employees = [],
        employeesWithSlips = [],
        loading = false,
        emailLoading = false,
        uploadLoading = false,
        error = null,
        emailError = null,
        uploadError = null,
        emailSuccess = false,
        uploadSuccess = false
    } = useSelector((state) => state.salarySlip || {});
    const [open, setOpen] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        designation: '',
        month: '',
        location: '',
        basicSalary: 0,
        hraPercentage: 0,
        fileUrl: '',
        leaveTravelPercentage: 0,
        conveyancePercentage: 0,
        medicalPercentage: 0,
        checkboxes: {
            basicSalary: true,
            hra: false,
            leaveTravelAllowance: false,
            conveyanceAllowance: false,
            medicalAllowance: false,
        },
    });
    const [salarySlip, setSalarySlip] = useState(null);
    const [success, setSuccess] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);




    useEffect(() => {
        dispatch(fetchAllEmployees());
    }, [dispatch]);

    const handleFormChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'name' && value) {
                const selectedEmployee = employees.find(emp => emp.name === value);
                if (selectedEmployee) {
                    newData.employeeId = selectedEmployee._id;
                    console.log("fd", newData.employeeId);
                    newData.designation = selectedEmployee.jobRole;
                } else {
                    newData.employeeId = '';
                    newData.designation = '';
                }
            }
            return newData;
        });
    };



    // Modal handlers
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleEmailOpen = (name, month, fileUrl) => {
        setFormData(prev => ({
            ...prev,
            name,
            month,
            fileUrl,
        }));
        setEmailOpen(true);
    };
    const handleEmailClose = () => setEmailOpen(false);



    const handleSendEmail = async () => {
        if (!recipientEmail || !formData.name || !formData.month || !formData.fileUrl) {
            dispatch(clearErrors());
            return;
        }

        const emailData = {
            email: recipientEmail,
            employeeName: formData.name,
            month: formData.month,
            fileUrl: formData.fileUrl
        };

        try {
            await dispatch(sendSlipEmail(emailData)).unwrap();
            setTimeout(() => {
                dispatch(clearSuccess());
                setRecipientEmail('');
                setEmailOpen(false);
            }, 2000);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };



    const handleCheckboxChange = (field) => {
        if (field === 'basicSalary') return;
        setFormData(prev => ({
            ...prev,
            checkboxes: {
                ...prev.checkboxes,
                [field]: !prev.checkboxes[field],
            },
        }));
    };

    // Calculate allowances based on percentages
    const calculateAllowances = () => {
        const allowances = {};
        if (formData.checkboxes.basicSalary) allowances.basicSalary = Number(formData.basicSalary);
        if (formData.checkboxes.hra) allowances.hra = (formData.basicSalary * formData.hraPercentage) / 100;
        if (formData.checkboxes.leaveTravelAllowance) allowances.leaveTravelAllowance = (formData.basicSalary * formData.leaveTravelPercentage) / 100;
        if (formData.checkboxes.conveyanceAllowance) allowances.conveyanceAllowance = (formData.basicSalary * formData.conveyancePercentage) / 100;
        if (formData.checkboxes.medicalAllowance) allowances.medicalAllowance = (formData.basicSalary * formData.medicalPercentage) / 100;
        return allowances;
    };

    // Generate salary slip
    const handleGenerate = () => {
        const selectedAllowances = calculateAllowances();
        const totalSalary = Object.values(selectedAllowances).reduce((sum, val) => sum + Number(val), 0);

        setSalarySlip({
            name: formData.name,
            designation: formData.designation,
            month: formData.month,
            location: formData.location,
            allowances: selectedAllowances,
            totalSalary,
        });
        setOpen(false);
    };


    const handleSave = async () => {
        try {
            setSaveLoading(true);
            if (!formData.employeeId) {
                toast.error('Please select an employee');
                return;
            }
            if (!formData.month) {
                toast.error('Please select a month');
                return;
            }

            const salarySlipElement = document.getElementById('salary-slip-template');
            if (!salarySlipElement) {
                toast.error('Salary slip template not found');
                return;
            }

            const canvas = await html2canvas(salarySlipElement);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');

            const apiFormData = new FormData();
            apiFormData.append('salarySlip', pdfBlob, `${formData.name}_salary_slip.pdf`);
            apiFormData.append('month', formData.month);

            await dispatch(uploadSlip({ employeeId: formData.employeeId, formData: apiFormData })).unwrap();

            toast.success('Salary slip saved successfully!');

            // Reset form
            setFormData({
                employeeId: '',
                name: '',
                designation: '',
                month: '',
                location: '',
                basicSalary: 0,
                hraPercentage: 0,
                leaveTravelPercentage: 0,
                conveyancePercentage: 0,
                medicalPercentage: 0,
                checkboxes: {
                    basicSalary: true,
                    hra: false,
                    leaveTravelAllowance: false,
                    conveyanceAllowance: false,
                    medicalAllowance: false,
                },
            });
            setSalarySlip(null);

            dispatch(fetchAllEmployees());

        } catch (error) {
            console.error('Error saving salary slip:', error);
            toast.error('Error saving salary slip: ' + error.message);
        } finally {
            setSaveLoading(false);
        }
    };



    const handleDownload = async (fileUrl) => {
        try {
            setDownloadLoading(true);

            const response = await fetch(fileUrl);

            if (!response.ok) {
                throw new Error(`Failed to download PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const filename = fileUrl.split('/').pop() || 'salary-slip.pdf';
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadLoading(false);

        } catch (error) {
            setDownloadLoading(false);

            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again later.');
        }
    };


    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto', position: 'relative', minHeight: '100vh' }}>
            {salarySlip ? (
                <>
                    <SalarySlipTemplate salarySlip={salarySlip} />
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            color="primary"
                            disabled={saveLoading}
                            sx={{
                                borderRadius: '12px',
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                bgcolor: saveLoading ? '#ccc' : '#1976d2',
                                '&:hover': {
                                    bgcolor: saveLoading ? '#ccc' : '#115293'
                                },
                            }}
                        >
                            {saveLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    {employeesWithSlips.length > 0 ? (
                        <Box sx={{ mt: 4, maxWidth: 1000, mx: 'auto' }}>
                            <Box
                                sx={{
                                    color: '#333',
                                    py: 2,
                                    px: 3,
                                    borderRadius: '8px 8px 0 0',
                                    display: 'flex',
                                    alignItems: 'left',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        flexGrow: 1,
                                        textAlign: 'left',
                                        fontSize: 25,
                                    }}
                                >
                                    Salary Slips
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderTop: 'none',
                                    borderRadius: '0 0 8px 8px',
                                    overflow: 'hidden',
                                    bgcolor: 'white',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        bgcolor: '#f5f5f5',
                                        py: 1.5,
                                        px: 3,
                                        fontWeight: 'medium',
                                        color: '#34495e',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    <Typography sx={{ width: '10%', fontSize: '0.9rem', fontWeight: 'bold' }}>ID</Typography>
                                    <Typography sx={{ width: '30%', fontSize: '0.9rem', fontWeight: 'bold' }}>Employee</Typography>
                                    <Typography sx={{ width: '30%', fontSize: '0.9rem', fontWeight: 'bold' }}>Month</Typography>
                                    <Typography sx={{ width: '30%', fontSize: '0.9rem', textAlign: 'right', pr: 5, fontWeight: 'bold' }}>Actions</Typography>
                                </Box>


                                {(() => {
                                    let counter = 1;
                                    return employeesWithSlips.flatMap(employee =>
                                        employee.salarySlips.map((slip) => (
                                            <Box
                                                key={slip._id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    py: 1.5,
                                                    px: 3,
                                                    borderBottom: '1px solid #e0e0e0',
                                                    '&:last-child': { borderBottom: 'none' },
                                                    bgcolor: 'white',
                                                    transition: 'background-color 0.2s',
                                                    '&:hover': { bgcolor: '#f9fafb' },
                                                }}
                                            >
                                                <Typography sx={{ width: '10%', color: '#34495e', fontSize: '0.9rem' }}>
                                                    {counter++}
                                                </Typography>
                                                <Typography sx={{ width: '30%', color: '#34495e', fontSize: '0.9rem' }}>
                                                    {employee.name}
                                                </Typography>
                                                <Typography sx={{ width: '30%', color: '#34495e', fontSize: '0.9rem' }}>
                                                    {slip.month}
                                                </Typography>
                                                <Stack direction="row" spacing={0.8} sx={{ width: '30%', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            color: '#34495e',
                                                            borderColor: '#34495e',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            minWidth: '60px',
                                                            py: 0.4,
                                                            px: 1,
                                                            textTransform: 'none',
                                                            whiteSpace: 'nowrap',
                                                            '&:hover': {
                                                                bgcolor: '#34495e',
                                                                color: 'white',
                                                                borderColor: '#34495e',
                                                            },
                                                        }}
                                                        onClick={() => handleDownload(slip.fileUrl)}
                                                        disabled={downloadLoading}
                                                    >
                                                        {downloadLoading ? 'Downloading...' : 'Download'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            color: '#34495e',
                                                            borderColor: '#34495e',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            minWidth: '60px',
                                                            py: 0.4,
                                                            px: 1,
                                                            textTransform: 'none',
                                                            whiteSpace: 'nowrap',
                                                            '&:hover': {
                                                                bgcolor: '#34495e',
                                                                color: 'white',
                                                                borderColor: '#34495e',
                                                            },
                                                        }}
                                                        onClick={() => handleEmailOpen(employee.name, slip.month, slip.fileUrl)}
                                                    // onClick={() => handleSendEmail(employee.email, slip.fileUrl)}
                                                    >
                                                        Email
                                                    </Button>
                                                    {/* <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            color: '#34495e',
                                                            borderColor: '#34495e',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            minWidth: '60px',
                                                            py: 0.4,
                                                            px: 1,
                                                            textTransform: 'none',
                                                            whiteSpace: 'nowrap',
                                                            '&:hover': {
                                                                bgcolor: '#34495e',
                                                                color: 'white',
                                                                borderColor: '#34495e',
                                                            },
                                                        }}
                                                    // onClick={() => handleSendToId(employee._id, slip._id)}
                                                    >
                                                        Send
                                                    </Button> */}
                                                </Stack>
                                            </Box>
                                        ))
                                    );
                                })()}
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No salary slip generated. Click the + icon to create one.
                        </Typography>
                    )}
                </>
            )}
            {!salarySlip && (
                <IconButton
                    onClick={handleOpen}
                    sx={{
                        position: 'fixed',
                        bottom: '40px',
                        right: '40px',
                        bgcolor: '#1976d2',
                        color: 'white',
                        '&:hover': { bgcolor: '#115293' },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        width: 56,
                        height: 56,
                    }}
                >
                    <AddIcon sx={{ fontSize: '32px' }} />
                </IconButton>
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Modal open={open} onClose={handleClose}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '60px',
                            left: '55%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: 1000,
                            bgcolor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            p: 3,
                            maxHeight: '75vh',
                            overflowY: 'auto',
                            outline: 'none',
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                color: '#1a237e',
                                textAlign: 'center',
                            }}
                        >
                            Create Salary Slip
                        </Typography>
                        <Stack spacing={3}>
                            {/* Employee Details */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={employees.map(emp => emp.name)}
                                        value={formData.name}
                                        onChange={(event, newValue) => handleFormChange('name', newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Employee Name"
                                                fullWidth
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#f5f5f5',
                                                    },
                                                    '& .MuiInputLabel-root': { fontWeight: 'medium' },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Designation"
                                        fullWidth
                                        value={formData.designation}
                                        onChange={(e) => handleFormChange('designation', e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: '#f5f5f5',
                                            },
                                            '& .MuiInputLabel-root': { fontWeight: 'medium' },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={4} >
                                    <DatePicker
                                        views={['year', 'month']}
                                        label="Month and Year"
                                        value={formData.month ? new Date(formData.month) : null}
                                        maxDate={new Date()}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                const formattedDate = newValue.toLocaleString('default', { month: 'long', year: 'numeric' });
                                                handleFormChange('month', formattedDate);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#f5f5f5',
                                                    },
                                                    '& .MuiInputLabel-root': { fontWeight: 'medium' },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Allowances Table */}
                            <Box sx={{ bgcolor: '#fafafa', borderRadius: '12px', p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#1a237e' }}>
                                    Allowances (Percentage of Basic Salary)
                                </Typography>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={4}>
                                        <TextField
                                            label="Basic Salary (₹)"
                                            type="text"
                                            fullWidth
                                            value={formData.basicSalary}
                                            onChange={(e) => {
                                                const digitsOnly = e.target.value.replace(/\D/g, '');
                                                handleFormChange('basicSalary', digitsOnly);
                                            }}
                                            inputProps={{
                                                inputMode: 'numeric',
                                                maxLength: 7,
                                            }}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    bgcolor: '#ffffff',
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={4} />
                                    <Grid item xs={4} />
                                    {/* House Rent Allowance */}
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.checkboxes.hra}
                                                    onChange={() => handleCheckboxChange('hra')}
                                                    sx={{ color: '#1976d2' }}
                                                />
                                            }
                                            label=""
                                            sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', fontWeight: 'medium' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            House Rent Allowance
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        {formData.checkboxes.hra && (
                                            <TextField
                                                label="HRA (%)"
                                                type="number"
                                                fullWidth
                                                value={formData.hraPercentage}
                                                onChange={(e) => handleFormChange('hraPercentage', e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#ffffff',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {formData.checkboxes.hra && (
                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a237e' }}>
                                                ₹{(Number(formData.basicSalary) * formData.hraPercentage / 100).toLocaleString('en-IN')}
                                            </Typography>
                                        )}
                                    </Grid>
                                    {/* Leave/Travel Allowance */}
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.checkboxes.leaveTravelAllowance}
                                                    onChange={() => handleCheckboxChange('leaveTravelAllowance')}
                                                    sx={{ color: '#1976d2' }}
                                                />
                                            }
                                            label=""
                                            sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', fontWeight: 'medium' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            Leave/Travel Allowance
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        {formData.checkboxes.leaveTravelAllowance && (
                                            <TextField
                                                label="LTA (%)"
                                                type="number"
                                                fullWidth
                                                value={formData.leaveTravelPercentage}
                                                onChange={(e) => handleFormChange('leaveTravelPercentage', e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#ffffff',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {formData.checkboxes.leaveTravelAllowance && (
                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a237e' }}>
                                                ₹{(Number(formData.basicSalary) * formData.leaveTravelPercentage / 100).toLocaleString('en-IN')}
                                            </Typography>
                                        )}
                                    </Grid>
                                    {/* Conveyance Allowance */}
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.checkboxes.conveyanceAllowance}
                                                    onChange={() => handleCheckboxChange('conveyanceAllowance')}
                                                    sx={{ color: '#1976d2' }}
                                                />
                                            }
                                            label=""
                                            sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', fontWeight: 'medium' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            Conveyance Allowance
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        {formData.checkboxes.conveyanceAllowance && (
                                            <TextField
                                                label="Conveyance (%)"
                                                type="number"
                                                fullWidth
                                                value={formData.conveyancePercentage}
                                                onChange={(e) => handleFormChange('conveyancePercentage', e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#ffffff',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {formData.checkboxes.conveyanceAllowance && (
                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a237e' }}>
                                                ₹{(Number(formData.basicSalary) * formData.conveyancePercentage / 100).toLocaleString('en-IN')}
                                            </Typography>
                                        )}
                                    </Grid>
                                    {/* Medical Allowance */}
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.checkboxes.medicalAllowance}
                                                    onChange={() => handleCheckboxChange('medicalAllowance')}
                                                    sx={{ color: '#1976d2' }}
                                                />
                                            }
                                            label=""
                                            sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', fontWeight: 'medium' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            Medical Allowance
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        {formData.checkboxes.medicalAllowance && (
                                            <TextField
                                                label="Medical (%)"
                                                type="number"
                                                fullWidth
                                                value={formData.medicalPercentage}
                                                onChange={(e) => handleFormChange('medicalPercentage', e.target.value)}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px',
                                                        bgcolor: '#ffffff',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {formData.checkboxes.medicalAllowance && (
                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1a237e' }}>
                                                ₹{(Number(formData.basicSalary) * formData.medicalPercentage / 100).toLocaleString('en-IN')}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Total and Generate Button */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                                    Total Salary: ₹
                                    {Object.entries(formData.checkboxes)
                                        .filter(([key, checked]) => checked)
                                        .reduce((sum, [key]) => {
                                            if (key === 'basicSalary') return sum + Number(formData.basicSalary);
                                            if (key === 'hra') return sum + (Number(formData.basicSalary) * formData.hraPercentage) / 100;
                                            if (key === 'leaveTravelAllowance') return sum + (Number(formData.basicSalary) * formData.leaveTravelPercentage) / 100;
                                            if (key === 'conveyanceAllowance') return sum + (Number(formData.basicSalary) * formData.conveyancePercentage) / 100;
                                            if (key === 'medicalAllowance') return sum + (Number(formData.basicSalary) * formData.medicalPercentage) / 100;
                                            return sum;
                                        }, 0).toLocaleString('en-IN')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleGenerate}
                                    sx={{
                                        borderRadius: '12px',
                                        px: 6,
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        bgcolor: '#1976d2',
                                        '&:hover': { bgcolor: '#115293' },
                                    }}
                                >
                                    Generate Salary Slip
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Modal>
            </LocalizationProvider>

            <Modal open={emailOpen} onClose={handleEmailClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 450,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" color="#34495e">
                        Send Salary Slip
                    </Typography>

                    <TextField
                        fullWidth
                        label="Recipient Email"
                        variant="outlined"
                        size="small"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                    />


                    <div>
                        <Button
                            variant="contained"
                            onClick={handleSendEmail}
                            sx={{
                                mt: 2,
                                bgcolor: '#34495e',
                                '&:hover': {
                                    bgcolor: '#2c3e50',
                                },
                                borderRadius: '20px',
                                textTransform: 'none',
                                px: 4,
                            }}
                            disabled={emailLoading}
                        >
                            {emailLoading ? 'Sending...' : 'Send'}
                        </Button>

                        {emailSuccess && <p style={{ color: 'green' }}>Email sent successfully!</p>}
                        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                    </div>
                </Box>
            </Modal>


        </Box>
    );
};

export default SalarySlip;