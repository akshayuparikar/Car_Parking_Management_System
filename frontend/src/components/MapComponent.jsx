import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for parking locations
const parkingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = () => {
  const [parkings, setParkings] = useState([]);
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]); // Default to Bangalore, India
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const startWatchingLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        setLoading(false);
        fetchNearbyParkings(userLocation[0], userLocation[1]);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      };

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('User location updated:', latitude, longitude, 'Accuracy:', accuracy);

          setUserLocation([latitude, longitude]);
          setLocationError(null);
          setIsWatchingLocation(true);

          // Auto-center map on location update
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
          }

          fetchNearbyParkings(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = '';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings and refresh the page.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Using default location.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default location.';
              break;
            default:
              errorMessage = 'Unable to retrieve your location. Using default location.';
              break;
          }

          setLocationError(errorMessage);
          setIsWatchingLocation(false);

          // Fallback to default location and continue with parking data
          fetchNearbyParkings(userLocation[0], userLocation[1]);
        },
        options
      );
    };

    startWatchingLocation();

    // Timeout to ensure loading doesn't block indefinitely
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      clearTimeout(timeout);
    };
  }, []);

  const fetchNearbyParkings = async (lat, lng) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/parkings/nearby?lat=${lat}&lng=${lng}&radius=50000`);
      setParkings(response.data);
    } catch (error) {
      console.error('Error fetching parkings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '500px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading map...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {isWatchingLocation ? 'Tracking your location...' : 'Getting your location...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {locationError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          ⚠️ {locationError}
        </div>
      )}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* User location marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            You are here
            {isWatchingLocation && <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
              📍 Live tracking active
            </div>}
          </Popup>
        </Marker>
        {/* Parking markers */}
        {parkings.map((parking) => (
          <Marker key={parking._id} position={[parking.location.coordinates[1], parking.location.coordinates[0]]} icon={parkingIcon}>
            <Popup>
              <div>
                <h3>{parking.name}</h3>
                <p>{parking.address}</p>
                <p>Hourly Rate: ${parking.pricing.hourlyRate}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
