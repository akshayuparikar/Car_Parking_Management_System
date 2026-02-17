import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import BackButton from '../components/BackButton';
import { QRCodeCanvas } from 'qrcode.react';
import { FaClock, FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import './UserDashboard.css';

function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const res = await api.get('/api/bookings/user');
      const allBookings = res.data;
      setBookings(allBookings);

      // Find active session: Status 'active' OR 'reserved' that is for "Now" (within 1 hour window or already started)
      const now = new Date();
      const active = allBookings.find(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const isCurrent = (b.status === 'active') || (b.status === 'reserved' && start <= new Date(now.getTime() + 60 * 60 * 1000) && end > now);
        return isCurrent;
      });
      setActiveBooking(active);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const showQrCode = (booking) => {
    setQrModal(booking);
  };

  const closeQrModal = () => {
    setQrModal(null);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reserved': return 'Reserved';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'reserved': return 'status-reserved';
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <BackButton />
      <div className="dashboard-header">
        <h1>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
        <p>Here is your parking activity</p>
      </div>

      {/* Active Session Card */}
      {activeBooking && (
        <div className="active-session-card">
          <div className="active-header">
            <span className="live-indicator">🔴 Live Session</span>
            <span className="timer">Ends {new Date(activeBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="active-content">
            <h2 className="parking-name">{activeBooking.parking?.name}</h2>
            <div className="active-details">
              <p><FaMapMarkerAlt /> {activeBooking.parking?.address}</p>
              <p><FaCar /> Slot: <strong>{activeBooking.slot?.slotNumber || 'Assigned on Entry'}</strong></p>
              {activeBooking.ticketId && <p style={{ fontSize: '1.2em', color: '#007bff' }}>🎫 Ticket ID: <strong>{activeBooking.ticketId}</strong></p>}
              <p><FaClock /> {new Date(activeBooking.startTime).toLocaleTimeString()} - {new Date(activeBooking.endTime).toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="active-actions">
            <button className="action-btn primary" onClick={() => showQrCode(activeBooking)}>Show QR for Entry/Exit</button>
            <button className="action-btn secondary" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${activeBooking.parking?.address}`)}>Get Directions</button>
          </div>
        </div>
      )}

      <div className="bookings-section">
        <h3>Previous Bookings</h3>
        {bookings.filter(b => b._id !== activeBooking?._id).length === 0 ? (
          <div className="no-bookings">
            {!activeBooking && (
              <>
                <p>You haven't made any parking bookings yet.</p>
                <button
                  className="book-now-btn"
                  onClick={() => navigate('/nearby-parking')}
                >
                  Find Parking Now
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.filter(b => b._id !== activeBooking?._id).map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-info">
                  <h3>{booking.parking?.name}</h3>
                  <div className="booking-details">
                    <span className="detail-item">
                      <strong>Date:</strong> {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                    <span className="detail-item">
                      <strong>Amount:</strong> ₹{booking.totalAmount}
                    </span>
                  </div>
                  <div className={`status ${getStatusClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </div>
                </div>
                <div className="booking-actions">
                  <button className="view-btn" onClick={() => showQrCode(booking)}>View Ticket</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {qrModal && (
        <div className="qr-modal-overlay" onClick={closeQrModal}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Parking Ticket</h3>
            <div className="qr-code-container">
              <QRCodeCanvas
                value={JSON.stringify({
                  bookingId: qrModal._id,
                  ticketId: qrModal.ticketId,
                  vehicle: qrModal.slot?.vehicle || 'N/A',
                  type: 'ENTRY_EXIT'
                })}
                size={200}
                level="H"
              />
            </div>
            <div className="qr-details">
              {qrModal.ticketId && (
                <div style={{ margin: '10px 0', padding: '10px', background: '#f8f9fa', borderRadius: '5px', border: '1px dashed #ccc' }}>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Ticket ID</p>
                  <p style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold', letterSpacing: '2px' }}>{qrModal.ticketId}</p>
                </div>
              )}
              <p><strong>Parking:</strong> {qrModal.parking?.name}</p>
              <p>Scan this at the gate for entry/exit.</p>
            </div>
            <button className="close-qr-btn" onClick={closeQrModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
