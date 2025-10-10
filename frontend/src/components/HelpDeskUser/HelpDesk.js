import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Select,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from "@mui/material/styles";
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { createHelpdesk, clearHelpdeskError, resetHelpdeskState, fetchUserTickets } from '../../features/helpDesk/helpSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


const FEEDBACK_TYPES = [
  { label: 'Select Type', value: '' },
  { label: 'Complaint', value: 'Complaint' },
  { label: 'Suggestion', value: 'Suggestion' },
  { label: 'HR Support/Request', value: 'HR Support/Request' },
];

const HelpDeskUser = () => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, success, userTickets, loadingTickets } = useSelector((state) => state.helpdesk);

  const userData = JSON.parse(localStorage.getItem('user'));
  const employeeId = userData?.employee?.id;

  const handleFetchTickets = () => {
    if (employeeId) {
      dispatch(fetchUserTickets(employeeId));
    }
  };

  useEffect(() => {
    if (success) {
      toast.success("Thank you for your feedback!");
      setType('');
      setDescription('');
      setIsAnonymous(false);
      handleFetchTickets();
      dispatch(clearHelpdeskError());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearHelpdeskError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    handleFetchTickets();
    return () => {
      dispatch(resetHelpdeskState());
    };
  }, [dispatch, employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !description.trim()) {
      return;
    }

    if (!isAnonymous && !employeeId) {
      console.error("Employee ID not found in localStorage!");
      return;
    }

    const ticketData = {
      type,
      description: description.trim(),
      anonymous: isAnonymous,
      employeeId: isAnonymous ? null : employeeId
    };

    try {
      await dispatch(createHelpdesk(ticketData)).unwrap();
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Help Desk
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Find answers to your questions, get support, and reach out for help when you need it
              </Typography>
            </Box>

            <SupportAgentIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>


          <FormControl fullWidth>
            <InputLabel id="feedback-type-label">Type</InputLabel>
            <Select
              labelId="feedback-type-label"
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              error={!type && error}
            >
              {FEEDBACK_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Description"
            multiline
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details..."
            disabled={loading}
            fullWidth
            error={!description.trim() && error}
          />

          <Paper variant="outlined" sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Submit Anonymously"
            />
            {isAnonymous && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                Your identity will remain hidden when submitting anonymously.
              </Typography>
            )}
          </Paper>


          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!type || !description.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Stack>
      </form>

      {employeeId && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Previous Submissions
          </Typography>
          {loadingTickets ? (
            <CircularProgress />
          ) : userTickets.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userTickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell>{ticket.ticketId}</TableCell>
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell>{ticket.description}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            textTransform: 'capitalize',
                            color: ticket.status === 'resolved' ? 'green' :
                              ticket.status === 'in-progress' ? 'orange' : 'gray'
                          }}
                        >
                          {ticket.status || 'Pending'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No previous submissions found.</Typography>
          )}
        </Box>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default HelpDeskUser;