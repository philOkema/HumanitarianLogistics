import React, { useEffect, useState } from 'react';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { checkLocationPermission } from '../services/locationService';

interface LocationTrackingControlsProps {
  className?: string;
}

const LocationTrackingControls: React.FC<LocationTrackingControlsProps> = ({ className = '' }) => {
  const { isTracking, error, startTracking, stopTracking } = useLocationTracking();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) {
          setPermissionError('Location permission is required for tracking. Please enable location access in your browser settings.');
        }
      } catch (err) {
        setPermissionError('Unable to check location permissions. Please ensure your browser supports location services.');
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkPermissions();
  }, []);

  const handleStartTracking = async () => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setPermissionError('Location permission is required for tracking. Please enable location access in your browser settings.');
        return;
      }
      startTracking();
      setPermissionError(null);
    } catch (err) {
      setPermissionError('Failed to start location tracking. Please try again.');
    }
  };

  if (isCheckingPermission) {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Checking location permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={isTracking ? stopTracking : handleStartTracking}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTracking
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          disabled={!!permissionError}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isTracking ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isTracking ? 'Location tracking active' : 'Location tracking inactive'}
          </span>
        </div>
      </div>
      {(error || permissionError) && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error || permissionError}
        </div>
      )}
    </div>
  );
};

export default LocationTrackingControls; 