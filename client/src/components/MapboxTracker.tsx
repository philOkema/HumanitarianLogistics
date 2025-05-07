import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { onValue, ref, getDatabase } from 'firebase/database';
import { firebaseApp } from '../lib/firebase';
import { checkLocationPermission } from '../services/locationService';

// Initialize database
const database = getDatabase(firebaseApp);

// Get Mapbox token from environment variables
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

if (!mapboxToken) {
  console.error('Mapbox token is not set in environment variables');
} else {
  mapboxgl.accessToken = mapboxToken;
}

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
    if (!mapboxToken || !mapContainer.current) return;

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
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40],
        zoom: 9,
        attributionControl: true
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map style error:', e);
        map.current?.setStyle('mapbox://styles/mapbox/light-v11');
      });

      marker.current = new mapboxgl.Marker()
        .setLngLat([-74.5, 40])
        .addTo(map.current);

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
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current) return;

    const locationRef = ref(database, `locations/${userId}`);
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { latitude, longitude } = data;
        setLocation({ lat: latitude, lng: longitude });
        
        marker.current?.setLngLat([longitude, latitude]);
        if (!isAdmin) {
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true
          });
        }
      }
    }, (error) => {
      console.error('Error fetching location:', error);
      setError('Failed to load location data. Please try again.');
    });

    return () => unsubscribe();
  }, [userId, isAdmin]);

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
          <p className="text-sm text-gray-600 mt-2">
            {error.includes('permission') 
              ? 'Please enable location access in your browser settings and refresh the page.'
              : 'Please check your configuration and try again.'}
          </p>
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