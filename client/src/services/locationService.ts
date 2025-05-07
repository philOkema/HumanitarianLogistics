import { getDatabase, ref, set, onDisconnect } from 'firebase/database';
import { firebaseApp } from '../lib/firebase';

const database = getDatabase(firebaseApp);

type LocationSource = 'gps' | 'wifi' | 'ip' | 'unknown';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  source?: LocationSource;
}

// Global tracking state
const trackingState = new Map<string, {
  watchId: number;
  cleanup: () => void;
  lastUpdate?: number;
}>();

// Minimum accuracy thresholds (in meters)
const ACCURACY_THRESHOLDS: Record<LocationSource, number> = {
  gps: 100,    // GPS should be very accurate
  wifi: 1000,  // WiFi can be accurate to about 1km
  ip: 50000,   // IP can be off by 50km or more
  unknown: 50000 // Default to IP accuracy for unknown sources
};

export const updateLocation = async (userId: string, location: Location) => {
  try {
    const threshold = ACCURACY_THRESHOLDS[location.source || 'unknown'];
    
    // Log accuracy warning but still update
    if (location.accuracy && location.accuracy > threshold * 2) {
      console.log(`Warning: Poor accuracy for ${location.source}:`, location.accuracy);
    }

    // Check if we've updated too recently (within 5 seconds)
    const trackingInfo = trackingState.get(userId);
    const now = Date.now();
    if (trackingInfo?.lastUpdate && now - trackingInfo.lastUpdate < 5000) {
      console.log('Skipping update - too soon since last update');
      return;
    }

    console.log('Updating location in Firebase for user:', userId, location);
    const locationRef = ref(database, `locations/${userId}`);
    await set(locationRef, {
      ...location,
      lastUpdated: now
    });
    console.log('Location updated successfully in Firebase');

    // Update the last update timestamp
    if (trackingInfo) {
      trackingInfo.lastUpdate = now;
      trackingState.set(userId, trackingInfo);
    }

    // Set up disconnect handler to remove location when user goes offline
    onDisconnect(locationRef).remove();
  } catch (error) {
    console.error('Error updating location in Firebase:', error);
    throw error;
  }
};

export const startLocationTracking = (userId: string) => {
  console.log('Starting location tracking for user:', userId);
  
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by browser');
    throw new Error('Geolocation is not supported by your browser');
  }

  // If already tracking, return the existing cleanup function
  if (trackingState.has(userId)) {
    console.log('Location tracking already active for user:', userId);
    return trackingState.get(userId)!.cleanup;
  }

  console.log('Setting up geolocation watch for user:', userId);
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log('Received new position:', position);
      
      // Determine location source based on accuracy
      let source: LocationSource = 'unknown';
      if (position.coords.accuracy <= ACCURACY_THRESHOLDS.gps) {
        source = 'gps';
      } else if (position.coords.accuracy <= ACCURACY_THRESHOLDS.wifi) {
        source = 'wifi';
      } else {
        source = 'ip';
      }

      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
        accuracy: position.coords.accuracy,
        source
      };
      console.log('Processed location data:', location);
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
          // Don't throw error on timeout, just log it
          console.warn(errorMessage);
          return;
        default:
          errorMessage += 'Unknown error occurred.';
      }
      console.error('Geolocation error:', errorMessage, error);
    },
    {
      enableHighAccuracy: false, // Keep false for desktop browsers
      timeout: 10000,
      maximumAge: 30000
    }
  );

  console.log('Geolocation watch set up with ID:', watchId);

  const cleanup = () => {
    console.log('Cleaning up location tracking for user:', userId);
    navigator.geolocation.clearWatch(watchId);
    trackingState.delete(userId);
  };

  // Store the tracking state
  trackingState.set(userId, { watchId, cleanup });
  console.log('Location tracking state stored for user:', userId);

  return cleanup;
};

export const stopLocationTracking = (userId: string) => {
  console.log('Stopping location tracking for user:', userId);
  if (trackingState.has(userId)) {
    trackingState.get(userId)!.cleanup();
  }
};

export const isTracking = (userId: string) => {
  const tracking = trackingState.has(userId);
  console.log('Checking tracking status for user:', userId, 'is tracking:', tracking);
  return tracking;
};

// Helper function to check if location permissions are granted
export const checkLocationPermission = async (): Promise<boolean> => {
  console.log('Checking location permission status');
  if (!navigator.permissions) {
    console.log('Permissions API not supported');
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    console.log('Location permission status:', result.state);
    return result.state === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}; 