import { useEffect, useState } from 'react';
import { startLocationTracking, stopLocationTracking, isTracking } from '../services/locationService';
import { useUser } from '../context/UserContext';

export const useLocationTracking = () => {
  const { user } = useUser();
  const [isTrackingState, setIsTrackingState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tracking state from global state
  useEffect(() => {
    if (user) {
      setIsTrackingState(isTracking(user.uid));
    }
  }, [user]);

  const startTracking = () => {
    if (!user) {
      setError('User must be logged in to track location');
      return;
    }

    try {
      const cleanup = startLocationTracking(user.uid);
      setIsTrackingState(true);
      setError(null);

      return () => {
        cleanup();
        setIsTrackingState(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start location tracking');
      setIsTrackingState(false);
    }
  };

  const stopTracking = () => {
    if (user) {
      stopLocationTracking(user.uid);
      setIsTrackingState(false);
    }
  };

  return {
    isTracking: isTrackingState,
    error,
    startTracking,
    stopTracking
  };
}; 