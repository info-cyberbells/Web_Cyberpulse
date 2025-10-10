import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as ComplaintIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHelpdeskTickets,
  selectHelpdeskTickets,
  updateTicketStatus,
  selectHelpdeskLoading,
  selectHelpdeskError,
} from '../features/helpDesk/helpSlice';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';


const HeaderCard = styled(Card)(({ theme }) => ({
  background: "#ffffff",
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
}));


// Color utilities
const ticketTypeColors = {
  complaint: {
    background: theme => theme.palette.error.main,
    text: 'white',
  },
  feedback: {
    background: theme => theme.palette.success.main,
    text: 'white',
  },
  suggestion: {
    background: theme => theme.palette.info.main,
    text: 'white',
  },
  query: {
    background: theme => theme.palette.warning.main,
    text: 'white',
  },
  other: {
    background: theme => theme.palette.grey[600],
    text: 'white',
  }
};

// Status chip colors
const statusColors = {
  pending: {
    background: theme => theme.palette.warning.main,
    text: 'white',
  },
  'in-progress': {
    background: theme => theme.palette.info.main,
    text: 'white',
  },
  resolved: {
    background: theme => theme.palette.success.main,
    text: 'white',
  },
};

const getTypeStyle = (type) => {
  const typeColor = ticketTypeColors[type.toLowerCase()] || ticketTypeColors.other;
  return {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: typeColor.background,
    color: typeColor.text,
    px: 2,
    py: 0.5,
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  };
};

const getStatusBoxStyle = (isAnonymous = false) => ({
  p: 1,
  borderRadius: 1,
});

// Status component
const StatusChip = ({ status, onStatusChange, ticketId, dispatch }) => {
  const [updating, setUpdating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState(null);


  console.log("StatusChip received ticketId:", ticketId);


  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) {
      setShowOptions(false);
      return;
    }

    console.log("Updating status for ticket ID:", ticketId);
    setUpdating(true);

    try {
      await dispatch(updateTicketStatus({
        ticketId,
        status: newStatus
      })).unwrap();

      onStatusChange(ticketId, newStatus);
      setShowOptions(false);
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = statusColors[status] || statusColors.pending;

  return (
    <>
      {showOptions ? (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.keys(statusColors).map((statusOption) => (
            <Chip
              key={statusOption}
              label={statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              onClick={() => handleStatusChange(statusOption)}
              sx={{
                backgroundColor: statusColors[statusOption].background,
                color: statusColors[statusOption].text,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
              size="small"
            />
          ))}
          <IconButton size="small" onClick={() => setShowOptions(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Chip
          label={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
          sx={{
            backgroundColor: statusColor.background,
            color: statusColor.text,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            },
          }}
          onClick={() => setShowOptions(true)}
          size="small"
        />
      )}
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </>
  );
};

// Updated component for handling description with modal
const ExpandableDescription = ({ ticket, onStatusChange }) => {
  const [openModal, setOpenModal] = useState(false);
  const maxLength = 90;

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const needsExpansion = ticket.description.length > maxLength;
  const displayText = needsExpansion ?
    `${ticket.description.slice(0, maxLength)}...` :
    ticket.description;

  return (
    <>
      <Typography
        sx={{
          color: 'text.secondary',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {displayText}
      </Typography>

      {needsExpansion && (
        <Button
          onClick={handleOpenModal}
          size="small"
          sx={{
            mt: 1,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            },
            textDecoration: 'underline'
          }}
        >
          View More
        </Button>
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5" component="div">
                {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} Details
              </Typography>
              <Chip
                label={`#${ticket.ticketId}`}
                color="primary"
                size="small"
              />
            </Box>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                {ticket.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <StatusChip
                status={ticket.status}
                onStatusChange={onStatusChange}
                ticketId={ticket.ticketId}
              />
            </Box>

            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Details
              </Typography>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    Created on: {format(new Date(ticket.createdAt), 'MMMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon
                    fontSize="small"
                    color={ticket.anonymous ? "secondary" : "success"}
                  />
                  <Typography variant="body2">
                    Submitted by: {ticket.employeeId?.name || (ticket.anonymous ? 'Anonymous' : 'Unassigned')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Filter component
const TicketFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filter Tickets</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status || ''}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={filters.type || ''}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Complaint">Complaint</MenuItem>
              <MenuItem value="Feedback">Feedback</MenuItem>
              <MenuItem value="Suggestion">Suggestion</MenuItem>
              <MenuItem value="Query">Query</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="From Date"
            type="date"
            name="fromDate"
            value={filters.fromDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="To Date"
            type="date"
            name="toDate"
            value={filters.toDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          startIcon={<ClearAllIcon />}
          onClick={onClearFilters}
          variant="outlined"
          size="small"
        >
          Clear Filters
        </Button>
      </Box>
    </Paper>
  );
};

const HelpDesk = () => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectHelpdeskTickets);
  const loading = useSelector(selectHelpdeskLoading);
  const error = useSelector(selectHelpdeskError);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    fromDate: '',
    toDate: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    dispatch(fetchHelpdeskTickets());
  }, [dispatch]);

  useEffect(() => {
    if (tickets) {
      applyFilters();
    }
  }, [tickets, filters]);

  const applyFilters = () => {
    let filtered = [...tickets];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(ticket => ticket.type === filters.type);
    }

    // Filter by date range
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isAfter(ticketDate, fromDate) || isEqual(ticketDate, fromDate);
      });
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isBefore(ticketDate, toDate) || isEqual(ticketDate, toDate);
      });
    }

    setFilteredTickets(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      fromDate: '',
      toDate: '',
    });
  };

  const handleStatusChange = (ticketId, newStatus) => {


    setNotification({
      open: true,
      message: `Ticket #${ticketId} status updated to ${newStatus}`,
      severity: 'success',
    });


  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An error occurred while fetching tickets';
  };

  return (
    <Container maxWidth="xl">
      <HeaderCard>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                Help Desk Portal
              </Typography>
              <Typography variant="body2" color="#6b7280">
                Oversee tickets, respond to queries, and manage user support efficiently
              </Typography>
            </Box>
            <SupportAgentIcon
              fontSize="large"
              sx={{ color: "#2563eb" }}
            />
          </Box>
        </CardContent>
      </HeaderCard>

      <TicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Box sx={{ px: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        ) : filteredTickets.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No tickets found matching your criteria.
            </Typography>
            {Object.values(filters).some(value => value !== '') && (
              <Button
                onClick={handleClearFilters}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="textSecondary">
                Showing {filteredTickets.length} tickets
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: 3,
              }}
            >
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Box sx={getTypeStyle(ticket.type)}>
                    {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1).toLowerCase()}
                  </Box>

                  <CardContent sx={{ p: 3, pt: 4 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        #{ticket.ticketId}
                      </Typography>
                      <StatusChip
                        status={ticket.status}
                        onStatusChange={handleStatusChange}
                        ticketId={ticket.ticketId}
                        dispatch={dispatch}
                      />
                    </Box>

                    <ExpandableDescription
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" sx={{ p: 1, borderRadius: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', mr: 1, color: 'primary.main' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}
                        >
                          {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" sx={getStatusBoxStyle(ticket.anonymous)}>
                        <PersonIcon sx={{
                          fontSize: '1rem',
                          mr: 1,
                          color: ticket.anonymous ? 'secondary.main' : 'success.main'
                        }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: ticket.anonymous ? 'secondary.main' : 'success.main'
                          }}
                        >
                          {ticket.employeeId?.name || (ticket.anonymous ? 'Anonymous' : 'Unassigned')}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HelpDesk;