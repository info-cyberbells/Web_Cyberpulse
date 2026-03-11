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
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Autorenew as InProgressIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
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

// Type colors
const typeConfig = {
  complaint: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Complaint' },
  feedback: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Feedback' },
  suggestion: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Suggestion' },
  'hr support/request': { bg: '#faf5ff', color: '#9333ea', border: '#e9d5ff', label: 'HR Support' },
  query: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Query' },
};

const getTypeConfig = (type) => {
  return typeConfig[type?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb', label: type || 'Other' };
};

// Status config
const statusConfig = {
  pending: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: <PendingIcon fontSize="small" />, label: 'Pending' },
  'in-progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: <InProgressIcon fontSize="small" />, label: 'In Progress' },
  resolved: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: <CheckCircleIcon fontSize="small" />, label: 'Resolved' },
};

const getStatusConfig = (status) => {
  return statusConfig[status?.toLowerCase()] || statusConfig.pending;
};

// Detail modal
const TicketDetailModal = ({ ticket, open, onClose, onStatusChange, dispatch }) => {
  const [updating, setUpdating] = useState(false);
  const tc = getTypeConfig(ticket?.type);
  const sc = getStatusConfig(ticket?.status);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setUpdating(true);
    try {
      await dispatch(updateTicketStatus({ ticketId: ticket.ticketId, status: newStatus })).unwrap();
      onStatusChange(ticket.ticketId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" fontWeight={700}>Ticket #{ticket.ticketId}</Typography>
            <Chip
              label={tc.label}
              size="small"
              sx={{ bgcolor: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* Description */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}>
                {ticket.description}
              </Typography>
            </Paper>
          </Box>

          {/* Info */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Submitted By</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: ticket.anonymous ? '#9333ea' : '#2563eb' }}>
                  {ticket.anonymous ? '?' : (ticket.employeeId?.name?.charAt(0) || 'U')}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {ticket.anonymous ? 'Anonymous' : (ticket.employeeId?.name || 'Unknown')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Created On</Typography>
              <Typography variant="body2" fontWeight={500}>
                {format(new Date(ticket.createdAt), 'MMM dd, yyyy • hh:mm a')}
              </Typography>
            </Grid>
          </Grid>

          {/* Status Update */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Update Status</Typography>
            <Stack direction="row" spacing={1.5}>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant={ticket.status === key ? 'contained' : 'outlined'}
                  startIcon={cfg.icon}
                  onClick={() => handleStatusUpdate(key)}
                  disabled={updating}
                  size="small"
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: 2,
                    py: 1,
                    ...(ticket.status === key
                      ? { bgcolor: cfg.color, color: 'white', '&:hover': { bgcolor: cfg.color, opacity: 0.9 } }
                      : { borderColor: cfg.border, color: cfg.color, '&:hover': { bgcolor: cfg.bg, borderColor: cfg.color } }
                    ),
                  }}
                >
                  {cfg.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Filter bar
const TicketFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#6b7280' }}>
          <FilterListIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>Filters</Typography>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            displayEmpty
            sx={{ borderRadius: 2, fontSize: '0.85rem' }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            name="type"
            value={filters.type || ''}
            onChange={handleChange}
            displayEmpty
            sx={{ borderRadius: 2, fontSize: '0.85rem' }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Complaint">Complaint</MenuItem>
            <MenuItem value="Feedback">Feedback</MenuItem>
            <MenuItem value="Suggestion">Suggestion</MenuItem>
            <MenuItem value="HR Support/Request">HR Support</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="From"
          type="date"
          name="fromDate"
          value={filters.fromDate || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          label="To"
          type="date"
          name="toDate"
          value={filters.toDate || ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {hasActiveFilters && (
          <Button
            startIcon={<ClearAllIcon />}
            onClick={onClearFilters}
            size="small"
            sx={{ textTransform: 'none', color: '#dc2626', borderRadius: 2, fontWeight: 600 }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

const HelpDesk = ({ hideHeader = false }) => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectHelpdeskTickets);
  const loading = useSelector(selectHelpdeskLoading);
  const error = useSelector(selectHelpdeskError);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', type: '', fromDate: '', toDate: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchHelpdeskTickets());
  }, [dispatch]);

  useEffect(() => {
    if (tickets) {
      let filtered = [...tickets];

      if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
      if (filters.type) filtered = filtered.filter(t => t.type === filters.type);
      if (filters.fromDate) {
        const from = new Date(filters.fromDate);
        filtered = filtered.filter(t => new Date(t.createdAt) >= from);
      }
      if (filters.toDate) {
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => new Date(t.createdAt) <= to);
      }

      // Pending first, then by date
      filtered.sort((a, b) => {
        const aP = a.status === 'pending' ? 0 : a.status === 'in-progress' ? 1 : 2;
        const bP = b.status === 'pending' ? 0 : b.status === 'in-progress' ? 1 : 2;
        if (aP !== bP) return aP - bP;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setFilteredTickets(filtered);
    }
  }, [tickets, filters]);

  const handleFilterChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value }));
  const handleClearFilters = () => setFilters({ status: '', type: '', fromDate: '', toDate: '' });

  const handleStatusChange = (ticketId, newStatus) => {
    setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    setNotification({ open: true, message: `Ticket #${ticketId} updated to ${newStatus}`, severity: 'success' });
  };

  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An error occurred while fetching tickets';
  };

  // Status counts
  const counts = {
    total: filteredTickets.length,
    pending: filteredTickets.filter(t => t.status === 'pending').length,
    inProgress: filteredTickets.filter(t => t.status === 'in-progress').length,
    resolved: filteredTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: hideHeader ? 0 : 2 }}>
      {!hideHeader && (
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
              <SupportAgentIcon fontSize="large" sx={{ color: "#2563eb" }} />
            </Box>
          </CardContent>
        </HeaderCard>
      )}

      {/* Status Summary */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        {[
          { label: 'Total', count: counts.total, color: '#6b7280', bg: '#f3f4f6' },
          { label: 'Pending', count: counts.pending, color: '#d97706', bg: '#fffbeb' },
          { label: 'In Progress', count: counts.inProgress, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Resolved', count: counts.resolved, color: '#16a34a', bg: '#f0fdf4' },
        ].map(item => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              px: 2.5, py: 1.5,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              bgcolor: item.bg,
              minWidth: 120,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
            <Typography variant="caption" fontWeight={600} sx={{ color: item.color }}>{item.label}</Typography>
          </Paper>
        ))}
      </Stack>

      <TicketFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

      {/* Tickets */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>{getErrorMessage(error)}</Alert>
      ) : filteredTickets.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed #e5e7eb' }}>
          <SupportAgentIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>No tickets found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Object.values(filters).some(v => v !== '') ? 'Try adjusting your filters' : 'No support tickets yet'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {filteredTickets.map((ticket) => {
            const tc = getTypeConfig(ticket.type);
            const sc = getStatusConfig(ticket.status);

            return (
              <Paper
                key={ticket._id}
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: ticket.status === 'pending' ? '#fde68a' : '#e5e7eb',
                  bgcolor: ticket.status === 'pending' ? '#fffdf5' : 'white',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#d1d5db' },
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ md: 'center' }}
                  spacing={2}
                  sx={{ p: 2.5 }}
                >
                  {/* Status indicator bar (left) */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    <Box sx={{
                      width: 4, height: 48, borderRadius: 2,
                      bgcolor: sc.color,
                    }} />
                  </Box>

                  {/* Ticket ID + Type */}
                  <Stack spacing={0.5} sx={{ minWidth: 130 }}>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      #{ticket.ticketId}
                    </Typography>
                    <Chip
                      label={tc.label}
                      size="small"
                      sx={{
                        bgcolor: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                        fontWeight: 600, fontSize: '0.7rem', height: 24, width: 'fit-content',
                      }}
                    />
                  </Stack>

                  {/* Description */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        fontWeight: 500,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {ticket.description}
                    </Typography>
                  </Box>

                  {/* Submitted by */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 140 }}>
                    <Avatar sx={{
                      width: 30, height: 30, fontSize: '0.75rem',
                      bgcolor: ticket.anonymous ? '#f3e8ff' : '#dbeafe',
                      color: ticket.anonymous ? '#9333ea' : '#2563eb',
                    }}>
                      {ticket.anonymous ? '?' : (ticket.employeeId?.name?.charAt(0)?.toUpperCase() || 'U')}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
                        {ticket.anonymous ? 'Anonymous' : (ticket.employeeId?.name || 'Unknown')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Status + Actions */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 200, justifyContent: 'flex-end' }}>
                    {/* Status badge */}
                    <Chip
                      icon={sc.icon}
                      label={sc.label}
                      size="small"
                      sx={{
                        bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                        fontWeight: 700, fontSize: '0.75rem',
                        '& .MuiChip-icon': { color: sc.color },
                      }}
                    />

                    {/* Quick status buttons for pending */}
                    {ticket.status === 'pending' && (
                      <Tooltip title="Mark In Progress">
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await dispatch(updateTicketStatus({ ticketId: ticket.ticketId, status: 'in-progress' })).unwrap();
                              handleStatusChange(ticket.ticketId, 'in-progress');
                            } catch (err) { console.error(err); }
                          }}
                          sx={{
                            bgcolor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                            '&:hover': { bgcolor: '#dbeafe' },
                          }}
                        >
                          <InProgressIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {(ticket.status === 'pending' || ticket.status === 'in-progress') && (
                      <Tooltip title="Mark Resolved">
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await dispatch(updateTicketStatus({ ticketId: ticket.ticketId, status: 'resolved' })).unwrap();
                              handleStatusChange(ticket.ticketId, 'resolved');
                            } catch (err) { console.error(err); }
                          }}
                          sx={{
                            bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                            '&:hover': { bgcolor: '#dcfce7' },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* View detail */}
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedTicket(ticket)}
                        sx={{
                          bgcolor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb',
                          '&:hover': { bgcolor: '#e5e7eb' },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        dispatch={dispatch}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HelpDesk;
