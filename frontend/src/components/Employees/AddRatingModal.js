import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Grid,
    Stack,
    Rating,
    Avatar,
    Chip,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Star as StarIcon,
    Close as CloseIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { addEmployeeRatingAsync } from '../../features/employeeRating/employeeRatingSlice';

const AddRatingModal = ({ open, onClose, employee, editingRating = null }) => {
    const dispatch = useDispatch();
    const { adding } = useSelector(state => state.employeeRatings);
    const isEditMode = Boolean(editingRating);

    const [formData, setFormData] = useState({
        month: '',
        rating: 0,
        behaviour: '',
        leadershipAndResponsibility: '',
        comments: '',
        givenBy: ''
    });
    const [errors, setErrors] = useState({});


    React.useEffect(() => {
        if (editingRating) {
            // Populate form with existing data for editing
            setFormData({
                month: editingRating.month,
                rating: editingRating.rating,
                behaviour: editingRating.behaviour || '',
                leadershipAndResponsibility: editingRating.leadershipAndResponsibility || '',
                comments: editingRating.comments || '',
                givenBy: editingRating.givenBy || 'SuperAdmin'
            });
        } else {
            // Handle new rating creation (existing logic)
            const storedData = localStorage.getItem("user");
            const currentDate = new Date();
            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

            if (storedData) {
                const userData = JSON.parse(storedData);
                setFormData(prev => ({
                    ...prev,
                    month: previousMonthValue,
                    givenBy: userData?.employee?.name || 'Admin'
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    month: previousMonthValue
                }));
            }
        }
    }, [editingRating]);


    const generateMonthOptions = () => {
        const options = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            options.push({ value: monthValue, label: monthLabel });
        }

        return options;
    };

    const monthOptions = generateMonthOptions();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.month) {
            newErrors.month = 'Please select a month';
        }

        if (!formData.rating || formData.rating === 0) {
            newErrors.rating = 'Please provide a rating';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (isEditMode) {
                await dispatch(addEmployeeRatingAsync({
                    employeeId: employee._id,
                    ratingData: { ...formData, _id: editingRating._id }
                })).unwrap();
                toast.success('Rating updated successfully!');
            } else {
                await dispatch(addEmployeeRatingAsync({
                    employeeId: employee._id,
                    ratingData: formData
                })).unwrap();
                toast.success('Rating added successfully!');
            }
            handleClose();
        } catch (error) {
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} rating`);
        }
    };

    const handleClose = () => {
        const currentDate = new Date();
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthValue = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

        if (!isEditMode) {
            setFormData({
                month: previousMonthValue,
                rating: 0,
                behaviour: '',
                leadershipAndResponsibility: '',
                comments: '',
                givenBy: formData.givenBy
            });
        }
        setErrors({});
        onClose();
    };

    const getStarDescription = (rating) => {
        if (rating === 0) return 'No rating';
        if (rating <= 1) return 'Poor';
        if (rating <= 2) return 'Below Average';
        if (rating <= 3) return 'Average';
        if (rating <= 4) return 'Good';
        return 'Excellent';
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    bgcolor: '#2e7d32',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <StarIcon />
                    <Box>
                        <Typography variant="h6" fontWeight="600">
                            {isEditMode ? 'Edit Performance Rating' : 'Add Performance Rating'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                            {isEditMode ? `Update ${employee?.name}'s performance rating` : `Rate ${employee?.name}'s performance`}
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    onClick={handleClose}
                    sx={{
                        color: 'white',
                        minWidth: 'auto',
                        p: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <CloseIcon />
                </Button>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 3 }}>
                {/* Employee Info */}
                <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 2, mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: '#2e7d32',
                                fontSize: '1.25rem',
                                fontWeight: 600
                            }}
                        >
                            {employee?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                {employee?.name}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Chip
                                    label={employee?.department}
                                    size="small"
                                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                />
                                <Chip
                                    label={employee?.position}
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Grid container spacing={3}>
                    {/* Month Selection */}
                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.month}>
                            <InputLabel>Selected Month</InputLabel>
                            <Select
                                value={formData.month}
                                label="Selected Month"
                                onChange={(e) => handleInputChange('month', e.target.value)}
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: '#666',
                                        opacity: 1
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e0e0e0'
                                    }
                                }}
                            >
                                {monthOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Rating */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Overall Rating *
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Rating
                                value={formData.rating}
                                onChange={(event, newValue) => handleInputChange('rating', newValue)}
                                size="large"
                                precision={0.1}
                                sx={{
                                    '& .MuiRating-iconFilled': {
                                        color: '#ffc107',
                                    },
                                    '& .MuiRating-iconHover': {
                                        color: '#ffb300',
                                    },
                                }}
                            />
                            <Box>
                                <Typography variant="h6" fontWeight="600">
                                    {formData.rating}/5
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getStarDescription(formData.rating)}
                                </Typography>
                            </Box>
                        </Stack>
                        {errors.rating && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                {errors.rating}
                            </Typography>
                        )}
                    </Grid>

                    {/* Behaviour */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Behaviour Assessment</InputLabel>
                            <Select
                                value={formData.behaviour}
                                onChange={(e) => handleInputChange('behaviour', e.target.value)}
                                label="Behaviour Assessment"
                            >
                                <MenuItem value="Excellent">Excellent</MenuItem>
                                <MenuItem value="Good">Good</MenuItem>
                                <MenuItem value="Average">Average</MenuItem>
                                <MenuItem value="Below Average">Below Average</MenuItem>
                                <MenuItem value="Poor">Poor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>


                    {/*Leadership & Responsibility*/}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Leadership & Responsiblity</InputLabel>
                            <Select
                                value={formData.leadershipAndResponsibility}
                                onChange={(e) => handleInputChange('leadershipAndResponsibility', e.target.value)}
                                label="Leadership & Responsiblity"
                            >

                                <MenuItem value="Excellent">Excellent</MenuItem>
                                <MenuItem value="Good">Good</MenuItem>
                                <MenuItem value="Average">Average</MenuItem>
                                <MenuItem value="Below Average">Below Average</MenuItem>
                                <MenuItem value="Poor">Poor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Comments */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Additional Comments"
                            multiline
                            rows={3}
                            value={formData.comments}
                            onChange={(e) => handleInputChange('comments', e.target.value)}
                            placeholder="Any additional feedback or observations..."
                            variant="outlined"
                        />
                    </Grid>

                    {/* Given By */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Rated By *"
                            value={formData.givenBy}
                            disabled
                            onChange={(e) => handleInputChange('givenBy', e.target.value)}
                            error={!!errors.givenBy}
                            helperText={errors.givenBy}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>

                {/* Info Alert */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        <strong>Note:</strong> The attendance rating will be automatically calculated based on
                        {" "} {employee?.name}'s attendance data for the selected month.
                    </Typography>
                </Alert>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        minWidth: 100
                    }}
                    disabled={adding}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={adding ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        minWidth: 120,
                        bgcolor: '#2e7d32',
                        '&:hover': { bgcolor: '#1b5e20' }
                    }}
                    disabled={adding}
                >
                    {adding ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Rating' : 'Save Rating')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddRatingModal;