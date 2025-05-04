import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  TextField
} from '@mui/material';
import { format } from 'date-fns';

const DistributionAssignment = () => {
  const { toast } = useToast();
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    volunteerId: '',
    pickupLocation: '',
    estimatedPickupTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch approved aid requests
      const requestsRef = collection(db, 'aid-requests');
      const requestsQuery = query(requestsRef, where('status', '==', 'approved'));
      const requestsSnapshot = await getDocs(requestsQuery);
      
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      setApprovedRequests(requestsData);
      
      // Fetch volunteers
      const usersRef = collection(db, 'users');
      const volunteersQuery = query(usersRef, where('role', '==', 'volunteer'));
      const volunteersSnapshot = await getDocs(volunteersQuery);
      
      const volunteersData = volunteersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setVolunteers(volunteersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setAssignmentData({
      volunteerId: '',
      pickupLocation: '',
      estimatedPickupTime: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignDistribution = async () => {
    if (!assignmentData.volunteerId || !assignmentData.pickupLocation) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create distribution document
      const distributionData = {
        requestId: selectedRequest.id,
        volunteerId: assignmentData.volunteerId,
        pickupLocation: assignmentData.pickupLocation,
        dropoffLocation: selectedRequest.location,
        estimatedPickupTime: assignmentData.estimatedPickupTime,
        notes: assignmentData.notes,
        status: 'assigned',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'distributions'), distributionData);
      
      // Update aid request status to in-progress
      const requestRef = doc(db, 'aid-requests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: 'in-progress',
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setApprovedRequests(prev => 
        prev.filter(request => request.id !== selectedRequest.id)
      );
      
      toast({
        title: "Distribution Assigned",
        description: "The aid request has been assigned to a volunteer for delivery.",
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error assigning distribution:', error);
      toast({
        title: "Error",
        description: "Failed to assign distribution. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getVolunteerName = (volunteerId) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    return volunteer ? volunteer.name || volunteer.email : 'Unknown';
  };

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
        Distribution Assignment
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Assign volunteers to approved aid requests for delivery.
      </Typography>
      
      {approvedRequests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No approved aid requests available for assignment.</Typography>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvedRequests.map((request) => (
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
                      color={
                        request.urgencyLevel === 'critical' ? 'error' : 
                        request.urgencyLevel === 'high' ? 'warning' : 
                        request.urgencyLevel === 'medium' ? 'info' : 'success'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleOpenDialog(request)}
                    >
                      Assign
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
            <DialogTitle>Assign Distribution</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Aid Request Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>Requester:</strong> {selectedRequest.userName || 'Anonymous'}<br />
                    <strong>Aid Type:</strong> {selectedRequest.aidType}<br />
                    <strong>Quantity:</strong> {selectedRequest.quantity}<br />
                    <strong>Delivery Location:</strong> {selectedRequest.location}<br />
                    <strong>Urgency:</strong> {selectedRequest.urgencyLevel}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="volunteer-label">Assign Volunteer</InputLabel>
                    <Select
                      labelId="volunteer-label"
                      id="volunteerId"
                      name="volunteerId"
                      value={assignmentData.volunteerId}
                      onChange={handleInputChange}
                      label="Assign Volunteer"
                    >
                      {volunteers.map(volunteer => (
                        <MenuItem key={volunteer.id} value={volunteer.id}>
                          {volunteer.name || volunteer.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="pickupLocation"
                    name="pickupLocation"
                    label="Pickup Location"
                    value={assignmentData.pickupLocation}
                    onChange={handleInputChange}
                    placeholder="Enter the location where the volunteer should pick up the aid"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="estimatedPickupTime"
                    name="estimatedPickupTime"
                    label="Estimated Pickup Time"
                    value={assignmentData.estimatedPickupTime}
                    onChange={handleInputChange}
                    placeholder="e.g., Tomorrow at 10:00 AM"
                    helperText="Provide an estimated time for the volunteer to pick up the aid"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="Additional Notes"
                    value={assignmentData.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Any special instructions or notes for the volunteer"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                color="primary" 
                variant="contained"
                onClick={handleAssignDistribution}
              >
                Assign Distribution
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DistributionAssignment; 