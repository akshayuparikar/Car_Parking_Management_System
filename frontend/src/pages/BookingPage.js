import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import BackButton from '../components/BackButton';
import { FaChargingStation, FaVideo, FaShieldAlt, FaClock, FaCalendarAlt, FaCar } from 'react-icons/fa';
import './BookingPage.css';

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { parkingId } = useParams(); // Get ID from URL param if needed, but we rely on state mostly
  const { parking, userLocation } = location.state || {};

  // Booking State
  const [bookingType, setBookingType] = useState('now'); // 'now' or 'later'
  const [vehicleType, setVehicleType] = useState('car'); // 'car' or 'bike'
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(2); // hours
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parking) {
      // Fallback or redirect if no parking state
    }

    initializeTime();
  }, [parking]);

  const initializeTime = () => {
    const now = new Date();
    // Default start time: Now (rounded to next 15 mins)
    const coeff = 1000 * 60 * 15;
    const rounded = new Date(Math.ceil(now.getTime() / coeff) * coeff);
    setStartTime(rounded.toISOString().slice(0, 16)); // Format for input type="datetime-local"
  };



  const calculateAmount = () => {
    if (!parking) return 0;

    // For "Now", start time is effective "Now"
    // For "Later", start time is user selected

    let baseRate = duration * parking.pricing.hourlyRate;

    if (bookingType === 'later') {
      baseRate += parking.pricing.fixedPreBookingFee;
      baseRate += (duration * parking.pricing.preBookingExtraCharge);
    }

    return baseRate;
  };

  useEffect(() => {
    setTotalAmount(calculateAmount());
  }, [duration, bookingType, parking]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime) {
      alert('Please select start time');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

      const bookingData = {
        parkingId: parking._id,
        vehicleType, // 'car' or 'bike',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isPreBooked: bookingType === 'later',
        userLat: userLocation?.lat,
        userLng: userLocation?.lng,
      };

      await api.post('/api/bookings', bookingData);
      alert('Booking Successful! Slot allocated automatically.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  if (!parking) {
    return <div className="booking-error">Parking information missing. Please return to search.</div>;
  }

  // Amenities Icon Map
  const getIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('cctv')) return <FaVideo />;
    if (lower.includes('security')) return <FaShieldAlt />;
    if (lower.includes('ev') || lower.includes('charging')) return <FaChargingStation />;
    return <FaShieldAlt />;
  };

  return (
    <div className="booking-page-container">
      <BackButton />

      {/* Header Section */}
      <div className="booking-header">
        <h1>{parking.name}</h1>
        <p className="address">{parking.address}</p>
        <div className="amenities-row">
          {parking.amenities?.map((am, idx) => (
            <span key={idx} className="amenity-chip">
              {getIcon(am)} {am}
            </span>
          ))}
        </div>
      </div>

      <div className="booking-card">
        {/* Toggle Switch */}
        <div className="booking-type-toggle">
          <button
            className={`toggle-btn ${bookingType === 'now' ? 'active' : ''}`}
            onClick={() => setBookingType('now')}
          >
            ⚡ Park Now
          </button>
          <button
            className={`toggle-btn ${bookingType === 'later' ? 'active' : ''}`}
            onClick={() => setBookingType('later')}
          >
            📅 Pre-book
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vehicle Type Selection */}
          <div className="form-section">
            <label className="section-label"><FaCar /> Vehicle Type</label>
            <div className="vehicle-type-select-container">
              <button
                type="button"
                className={`type-btn ${vehicleType === 'car' ? 'selected' : ''}`}
                onClick={() => setVehicleType('car')}
              >
                🚗 Car
              </button>
              <button
                type="button"
                className={`type-btn ${vehicleType === 'bike' ? 'selected' : ''}`}
                onClick={() => setVehicleType('bike')}
              >
                🏍️ Bike
              </button>
            </div>
          </div>

          {/* Time Selection */}
          <div className="form-section">
            <label className="section-label"><FaClock /> Time & Duration</label>

            {bookingType === 'later' && (
              <div className="date-input-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            )}

            <div className="duration-slider-container">
              <div className="duration-label">
                <span>Duration</span>
                <span className="duration-value">{duration} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="premium-range"
              />
              <div className="range-marks">
                <span>1h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="price-summary-card">
            <div className="price-row">
              <span>Hourly Rate</span>
              <span>₹{parking.pricing.hourlyRate}/hr</span>
            </div>
            {bookingType === 'later' && (
              <div className="price-row extra">
                <span>Pre-booking Fee</span>
                <span>+₹{parking.pricing.fixedPreBookingFee}</span>
              </div>
            )}
            <div className="total-divider"></div>
            <div className="price-row total">
              <span>Total To Pay</span>
              <span className="total-amount">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>

          <button type="submit" className="pay-btn" disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(0)} & Book`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;
