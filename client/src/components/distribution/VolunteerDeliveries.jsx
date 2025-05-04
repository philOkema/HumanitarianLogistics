import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  CircularProgress,
  TextField,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { format } from 'date-fns';

const VolunteerDeliveries = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      console.log('Volunteer UID in app:', user?.uid);
      const distributionsRef = collection(db, 'distributions');
      const q = query(distributionsRef, where('volunteerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      console.log('Found docs:', querySnapshot.docs.length);
      // Log all distributions for debugging
      const allDistributions = await getDocs(distributionsRef);
      allDistributions.forEach(docSnap => {
        console.log('Distribution:', docSnap.id, docSnap.data());
      });
      
      const deliveriesData = [];
      
      for (const docSnap of querySnapshot.docs) {
        const distributionData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate()
        };
        
        // Fetch the associated aid request
        if (distributionData.requestId) {
          const requestRef = doc(db, 'aidRequests', distributionData.requestId);
          const requestDoc = await getDoc(requestRef);
          
          if (requestDoc.exists()) {
            const requestData = requestDoc.data();
            deliveriesData.push({
              ...distributionData,
              aidType: requestData.aidType,
              quantity: requestData.quantity,
              requesterName: requestData.userName || 'Anonymous',
              requesterEmail: requestData.userEmail
            });
          }
        }
      }
      
      console.log('Setting deliveries:', deliveriesData);
      setDeliveries(deliveriesData);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryNotes('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedDelivery(null);
    setOpenDialog(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const deliveryRef = doc(db, 'distributions', selectedDelivery.id);
      await updateDoc(deliveryRef, {
        status: newStatus,
        deliveryNotes: deliveryNotes,
        updatedAt: serverTimestamp()
      });
      
      // If delivery is completed, update the aid request status
      if (newStatus === 'delivered') {
        const requestRef = doc(db, 'aidRequests', selectedDelivery.requestId);
        await updateDoc(requestRef, {
          status: 'fulfilled',
          updatedAt: serverTimestamp()
        });
      }
      
      // Update local state
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === selectedDelivery.id 
            ? { ...delivery, status: newStatus, deliveryNotes } 
            : delivery
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Delivery status has been updated to ${newStatus}.`,
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'info';
      case 'picked-up': return 'primary';
      case 'in-transit': return 'warning';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'assigned': return 'Mark as Picked Up';
      case 'picked-up': return 'Start Delivery';
      case 'in-transit': return 'Complete Delivery';
      default: return '';
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'assigned': return 'picked-up';
      case 'picked-up': return 'in-transit';
      case 'in-transit': return 'delivered';
      default: return status;
    }
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
      <Typography variant="h5" color='white' component="h2" gutterBottom>
        My Deliveries
      </Typography>
      
      <Typography variant="body1" color='white' paragraph>
        View and manage your assigned aid deliveries.
      </Typography>
      
      {deliveries.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>You don't have any assigned deliveries at the moment.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {deliveries.map((delivery) => (
            <Grid item xs={12} md={6} key={delivery.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      {delivery.aidType}
                    </Typography>
                    <Chip 
                      label={delivery.status} 
                      color={getStatusColor(delivery.status)} 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Quantity:</strong> {delivery.quantity}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Pickup Location:</strong> {delivery.pickupLocation}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Delivery Location:</strong> {delivery.dropoffLocation}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Requester:</strong> {delivery.requesterName}
                  </Typography>
                  
                  {delivery.estimatedPickupTime && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Estimated Pickup:</strong> {delivery.estimatedPickupTime}
                    </Typography>
                  )}
                  
                  {delivery.notes && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Notes:</strong> {delivery.notes}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Assigned on: {delivery.createdAt && format(delivery.createdAt, 'MMM d, yyyy')}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  {delivery.status !== 'delivered' && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleOpenDialog(delivery)}
                    >
                     Action {getNextAction(delivery.status)}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedDelivery && (
          <>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, mb: 5 }}>
                <Stepper activeStep={
                  selectedDelivery.status === 'assigned' ? 0 : 
                  selectedDelivery.status === 'picked-up' ? 1 : 
                  selectedDelivery.status === 'in-transit' ? 2 : 3
                }>
                  <Step>
                    <StepLabel>Assigned</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Picked Up</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>In Transit</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Delivered</StepLabel>
                  </Step>
                </Stepper>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                {selectedDelivery.status === 'assigned' ? 'Confirm Pickup' : 
                 selectedDelivery.status === 'picked-up' ? 'Start Delivery' : 
                 'Complete Delivery'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedDelivery.status === 'assigned' ? 
                  'Please confirm that you have picked up the aid from the specified location.' : 
                 selectedDelivery.status === 'picked-up' ? 
                  'Please confirm that you are now transporting the aid to the delivery location.' : 
                  'Please confirm that you have delivered the aid to the recipient.'}
              </Typography>
              
              <TextField
                fullWidth
                id="deliveryNotes"
                name="deliveryNotes"
                label="Delivery Notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Add any notes about the delivery process"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                color="primary" 
                variant="contained"
                onClick={() => handleStatusUpdate(getNextStatus(selectedDelivery.status))}
              >
                {selectedDelivery.status === 'assigned' ? 'Confirm Pickup' : 
                 selectedDelivery.status === 'picked-up' ? 'Start Delivery' : 
                 'Complete Delivery'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VolunteerDeliveries; 