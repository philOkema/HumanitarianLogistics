import { getDatabase, ref, set, onDisconnect } from 'firebase/database';
import { firebaseApp } from '../lib/firebase';

const database = getDatabase(firebaseApp);

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

// Global tracking state
const trackingState = new Map<string, {
  watchId: number;
  cleanup: () => void;
}>();

export const updateLocation = async (userId: string, location: Location) => {
  try {
    const locationRef = ref(database, `locations/${userId}`);
    await set(locationRef, {
      ...location,
      lastUpdated: Date.now()
    });

    // Set up disconnect handler to remove location when user goes offline
    onDisconnect(locationRef).remove();
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export const startLocationTracking = (userId: string) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  // If already tracking, return the existing cleanup function
  if (trackingState.has(userId)) {
    return trackingState.get(userId)!.cleanup;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
        accuracy: position.coords.accuracy
      };
      updateLocation(userId, location);
    },
    (error) => {
      // Handle different types of geolocation errors
      let errorMessage = 'Error getting location: ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information unavailable. Please check your device settings.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
      }
      console.error(errorMessage);
      // You might want to show this error to the user through your UI
    },
    {
      enableHighAccuracy: true,
      timeout: 10000, // Increased timeout to 10 seconds
      maximumAge: 0
    }
  );

  const cleanup = () => {
    navigator.geolocation.clearWatch(watchId);
    trackingState.delete(userId);
  };

  // Store the tracking state
  trackingState.set(userId, { watchId, cleanup });

  return cleanup;
};

export const stopLocationTracking = (userId: string) => {
  if (trackingState.has(userId)) {
    trackingState.get(userId)!.cleanup();
  }
};

export const isTracking = (userId: string) => {
  return trackingState.has(userId);
};

// Helper function to check if location permissions are granted
export const checkLocationPermission = async (): Promise<boolean> => {
  if (!navigator.permissions) {
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}; 