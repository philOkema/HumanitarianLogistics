import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const center = {
  lat: 51.505,
  lng: -0.09
};

const markers = [
  { id: 'A', lat: 51.505, lng: -0.095, color: '#3B82F6' },
  { id: 'B', lat: 51.51, lng: -0.1, color: '#8B5CF6' },
  { id: 'C', lat: 51.515, lng: -0.09, color: '#EC4899' },
  { id: 'D', lat: 51.5, lng: -0.085, color: '#06B6D4' }
];

const DistributionMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBdrw2nFuq5XTt3GELd6XBBwZWyE0PE7_I"
  });

  const [map, setMap] = useState(null);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const customMarkerIcon = (color) => ({
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#FFFFFF',
    scale: 1.5,
    anchor: { x: 12, y: 22 },
  });

  return isLoaded ? (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={customMarkerIcon(marker.color)}
            label={{ text: marker.id, color: "#FFFFFF", fontWeight: "bold", fontSize: "14px" }}
          />
        ))}
      </GoogleMap>
    </div>
  ) : <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading Map...</div>;
};

export default DistributionMap;
