import React, { useEffect } from 'react';
import LocationTrackingControls from '../components/LocationTrackingControls';
import MapboxTracker from '../components/MapboxTracker';
import { useUser } from '../context/UserContext';
import { useLocationTracking } from '../hooks/useLocationTracking';

const StaffLocationTracking: React.FC = () => {
  const { user } = useUser();
  const { startTracking } = useLocationTracking();

  useEffect(() => {
    if (user) {
      startTracking();
    }
  }, [user, startTracking]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Please log in to access location tracking.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Location Tracking</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tracking Controls</h2>
        <LocationTrackingControls />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Current Location</h2>
        <MapboxTracker userId={user.uid} isAdmin={false} />
      </div>
    </div>
  );
};

export default StaffLocationTracking; 