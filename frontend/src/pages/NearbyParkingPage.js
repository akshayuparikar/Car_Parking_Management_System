import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './NearbyParkingPage.css';

function NearbyParkingPage() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyParkings(latitude, longitude);
        },
        (error) => {
          setLocationError('Unable to retrieve your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const fetchNearbyParkings = async (lat, lng) => {
    try {
      const res = await api.get(`/api/parkings/nearby?lat=${lat}&lng=${lng}&radius=10000`);
      setParkings(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby parkings:', error);
      setLoading(false);
    }
  };

  const handleBookParking = (parking) => {
    if (parking.distance > 3) {
      alert('You must be within 3 km to book this parking');
      return;
    }
    // Navigate to booking page with parking details
    navigate(`/booking/${parking._id}`, { state: { parking, userLocation } });
  };

  const getStatusText = (parking) => {
    if (parking.operationalStatus === 'closed' || parking.temporarilyClosed) return 'Closed';
    if (parking.operationalStatus === 'full') return 'Full';
    return 'Open';
  };

  const getStatusClass = (parking) => {
    if (parking.operationalStatus === 'closed' || parking.temporarilyClosed) return 'status-closed';
    if (parking.operationalStatus === 'full') return 'status-full';
    return 'status-open';
  };

  if (loading) {
    return <div className="nearby-parking-container">Loading nearby parkings...</div>;
  }

  if (locationError) {
    return (
      <div className="nearby-parking-container">
        <div className="location-error">{locationError}</div>
        <button onClick={getUserLocation} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="nearby-parking-container">
      <header className="parking-header">
        <h1>🅿️ Nearby Parking</h1>
        <p>Find and book parking spots near you</p>
      </header>

      <div className="parkings-list">
        {parkings.length === 0 ? (
          <div className="no-parkings">No nearby parkings found</div>
        ) : (
          parkings.map((parking) => (
            <div key={parking._id} className="parking-card">
              <div className="parking-info">
                <h3>{parking.name}</h3>
                <p className="address">{parking.address}</p>
                <div className="parking-details">
                  <span className="distance">{parking.distance} km away</span>
                  <span className="slots">{parking.availableSlots} slots left</span>
                  <span className="price">₹{parking.pricing.hourlyRate}/hr</span>
                  {parking.pricing.preBookingExtraCharge > 0 && (
                    <span className="pre-book-charge">
                      +₹{parking.pricing.preBookingExtraCharge}/hr pre-book
                    </span>
                  )}
                </div>
                <div className={`status ${getStatusClass(parking)}`}>
                  {getStatusText(parking)}
                </div>
              </div>
              <div className="parking-actions">
                {parking.distance > 3 ? (
                  <div className="distance-warning">
                    You must be within 3 km to book this parking
                  </div>
                ) : (
                  <button
                    className="book-button"
                    onClick={() => handleBookParking(parking)}
                    disabled={parking.operationalStatus !== 'open' || !parking.temporarilyClosed === false}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NearbyParkingPage;
