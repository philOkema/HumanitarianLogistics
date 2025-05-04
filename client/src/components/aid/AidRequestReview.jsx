import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';

const AidRequestReview = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    urgencyLevel: 'all',
    aidType: 'all'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requestsRef = collection(db, 'aid-requests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching aid requests:', err);
      setError('Failed to load aid requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setOpenDialog(false);
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const requestRef = doc(db, 'aid-requests', requestId);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus } 
            : request
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Request status has been updated to ${newStatus}.`,
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'rejected': return 'error';
      case 'in-progress': return 'primary';
      case 'fulfilled': return 'success';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.urgencyLevel !== 'all' && request.urgencyLevel !== filters.urgencyLevel) return false;
    if (filters.aidType !== 'all' && request.aidType !== filters.aidType) return false;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Aid Request Review
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="fulfilled">Fulfilled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="urgency-filter-label">Urgency</InputLabel>
              <Select
                labelId="urgency-filter-label"
                id="urgencyLevel"
                name="urgencyLevel"
                value={filters.urgencyLevel}
                onChange={handleFilterChange}
                label="Urgency"
              >
                <MenuItem value="all">All Urgency Levels</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="type-filter-label">Aid Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="aidType"
                name="aidType"
                value={filters.aidType}
                onChange={handleFilterChange}
                label="Aid Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="medicine">Medicine</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="shelter">Shelter Materials</MenuItem>
                <MenuItem value="hygiene">Hygiene Supplies</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredRequests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No aid requests match the selected filters.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Aid Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.createdAt && format(request.createdAt, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{request.userName || 'Anonymous'}</TableCell>
                  <TableCell>{request.aidType}</TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.urgencyLevel} 
                      color={getUrgencyColor(request.urgencyLevel)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenDialog(request)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>Review Aid Request</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requester</Typography>
                  <Typography variant="body1">{selectedRequest.userName || 'Anonymous'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedRequest.userEmail || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Aid Type</Typography>
                  <Typography variant="body1">{selectedRequest.aidType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{selectedRequest.quantity}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{selectedRequest.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Urgency Level</Typography>
                  <Chip 
                    label={selectedRequest.urgencyLevel} 
                    color={getUrgencyColor(selectedRequest.urgencyLevel)} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedRequest.status} 
                    color={getStatusColor(selectedRequest.status)} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
                  <Typography variant="body1">
                    {selectedRequest.additionalNotes || 'No additional notes provided.'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                  <Typography variant="body1">
                    {selectedRequest.createdAt && format(selectedRequest.createdAt, 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button 
                    color="error" 
                    onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    color="primary" 
                    onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                  >
                    Approve
                  </Button>
                </>
              )}
              {selectedRequest.status === 'approved' && (
                <Button 
                  color="primary" 
                  onClick={() => handleStatusChange(selectedRequest.id, 'in-progress')}
                >
                  Mark In Progress
                </Button>
              )}
              {selectedRequest.status === 'in-progress' && (
                <Button 
                  color="success" 
                  onClick={() => handleStatusChange(selectedRequest.id, 'fulfilled')}
                >
                  Mark Fulfilled
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AidRequestReview; 