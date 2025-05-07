import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { onValue, ref, getDatabase } from 'firebase/database';
import { firebaseApp } from '../lib/firebase';
import { checkLocationPermission } from '../services/locationService';

// Initialize database
const database = getDatabase(firebaseApp);

interface MapboxTrackerProps {
  userId: string;
  isAdmin?: boolean;
}

const MapboxTracker: React.FC<MapboxTrackerProps> = ({ userId, isAdmin = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Force a re-render on mount
  useEffect(() => {
    setIsMapInitialized(false);
    const timer = setTimeout(() => {
      setIsMapInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) {
          setError('Location permission is required for tracking. Please enable location access in your browser settings.');
        }
      } catch (err) {
        setError('Unable to check location permissions. Please ensure your browser supports location services.');
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (!isMapInitialized) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      setError('Mapbox token is not configured. Please check your environment variables.');
      return;
    }

    if (!mapContainer.current) return;

    // Set the access token
    mapboxgl.accessToken = mapboxToken;

    // Cleanup previous map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }

    try {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40], // Default center
        zoom: 9,
        attributionControl: true
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setError(null);
      });

      map.current.on('error', (e) => {
        console.error('Map style error:', e);
        map.current?.setStyle('mapbox://styles/mapbox/light-v11');
      });

      marker.current = new mapboxgl.Marker({
        color: '#FF0000',
        scale: 1.2
      })
        .setLngLat([-74.5, 40])
        .addTo(map.current);

      console.log('Map and marker initialized');
      setIsReady(true);

    } catch (err) {
      console.error('Map initialization error:', err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMapInitialized]);

  useEffect(() => {
    if (!isReady || !map.current || !marker.current) {
      console.log('Map or marker not initialized, skipping location setup');
      return;
    }

    console.log('Setting up location tracking for user:', userId);
    const locationRef = ref(database, `locations/${userId}`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Received location data from Firebase:', data);
      
      if (data) {
        const { latitude, longitude, timestamp, source, accuracy } = data;
        console.log('Processing location update:', { latitude, longitude, timestamp, source, accuracy });
        
        // Always update marker and map
        console.log('Updating location to:', { latitude, longitude });
        setLocation({ lat: latitude, lng: longitude });
        // Update marker position with animation
        if (marker.current) {
          console.log('Setting marker to:', longitude, latitude);
          marker.current.setLngLat([longitude, latitude]);
        }
        // Always update map center for all users
        if (map.current) {
          console.log('Updating map center');
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true,
            duration: 2000
          });
        }
      } else {
        console.log('No location data available in Firebase');
      }
    }, (error) => {
      console.error('Error fetching location from Firebase:', error);
      setError('Failed to load location data. Please try again.');
    });

    return () => {
      console.log('Cleaning up location tracking');
      unsubscribe();
    };
  }, [userId, isAdmin, isReady]);

  if (isCheckingPermission) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking location permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 font-medium">{error}</p>
          {error.includes('Mapbox token') && (
            <div className="mt-2 text-sm text-gray-600">
              <p>To fix this:</p>
              <ol className="list-decimal list-inside mt-1">
                <li>Create a .env file in the client directory</li>
                <li>Add VITE_MAPBOX_TOKEN=your_token_here</li>
                <li>Get your token from https://account.mapbox.com/</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
          {error.includes('permission') && (
            <p className="text-sm text-gray-600 mt-2">
              Please enable location access in your browser settings and refresh the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gray-100" 
        style={{ minHeight: '400px' }}
      />
      {location && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <p className="text-sm font-medium">Current Location:</p>
          <p className="text-xs text-gray-600">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapboxTracker; 