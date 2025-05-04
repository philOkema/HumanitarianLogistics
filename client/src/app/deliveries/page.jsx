import React from 'react';
import { Container, Typography } from '@mui/material';
import VolunteerDeliveries from '@/components/distribution/VolunteerDeliveries';
import { useUser } from '@/context/UserContext';
import { Navigate } from 'wouter';

const DeliveriesPage = () => {
  const { user } = useUser();

  // Redirect if user is not a volunteer
  if (!user || user.role !== 'volunteer') {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Deliveries
      </Typography>
      <VolunteerDeliveries />
    </Container>
  );
};

export default DeliveriesPage; 