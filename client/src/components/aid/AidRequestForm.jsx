import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Paper,
  Grid
} from '@mui/material';

const AidRequestForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    aidType: '',
    quantity: 1,
    location: '',
    urgencyLevel: 'medium',
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      quantity: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.aidType || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create aid request document in Firestore
      const aidRequestData = {
        userId: user?.uid || null,
        userName: user?.displayName || 'Anonymous',
        userEmail: user?.email || null,
        aidType: formData.aidType,
        quantity: formData.quantity,
        location: formData.location,
        urgencyLevel: formData.urgencyLevel,
        additionalNotes: formData.additionalNotes,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'aid-requests'), aidRequestData);
      
      // Reset form
      setFormData({
        aidType: '',
        quantity: 1,
        location: '',
        urgencyLevel: 'medium',
        additionalNotes: ''
      });
      
      // Show success message
      toast({
        title: "Request Submitted",
        description: "Your aid request has been submitted successfully. We will review it shortly.",
      });
    } catch (error) {
      console.error("Error submitting aid request:", error);
      toast({
        title: "Error",
        description: "Failed to submit aid request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Request Aid
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Please fill out this form to request humanitarian aid. Our team will review your request and get back to you as soon as possible.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="aid-type-label">Type of Aid</InputLabel>
              <Select
                labelId="aid-type-label"
                id="aidType"
                name="aidType"
                value={formData.aidType}
                onChange={handleChange}
                label="Type of Aid"
              >
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="medicine">Medicine</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="shelter">Shelter Materials</MenuItem>
                <MenuItem value="hygiene">Hygiene Supplies</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="urgency-level-label">Urgency Level</InputLabel>
              <Select
                labelId="urgency-level-label"
                id="urgencyLevel"
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleChange}
                label="Urgency Level"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography id="quantity-slider" gutterBottom>
              Quantity Needed
            </Typography>
            <Slider
              value={formData.quantity}
              onChange={handleQuantityChange}
              aria-labelledby="quantity-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={10}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="location"
              name="location"
              label="Delivery Location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Please provide your full address or detailed location description"
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="additionalNotes"
              name="additionalNotes"
              label="Additional Notes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any additional information that might help us process your request"
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AidRequestForm; 