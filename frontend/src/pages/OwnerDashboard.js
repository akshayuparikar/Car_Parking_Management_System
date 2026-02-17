import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './OwnerDashboard.css'; // Assuming we create this

function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      // Assuming user has owned parkings
      const res = await api.get('/api/parkings'); // Or specific endpoint for owned parkings
      setParkings(res.data);
      if (res.data.length > 0) {
        setSelectedParking(res.data[0]._id);
        fetchDashboard(res.data[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parkings:', error);
      setLoading(false);
    }
  };

  const fetchDashboard = async (parkingId) => {
    try {
      const res = await api.get(`/api/dashboard/owner/${parkingId}`);
      setDashboardData(res.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const handleParkingChange = (e) => {
    const parkingId = e.target.value;
    setSelectedParking(parkingId);
    fetchDashboard(parkingId);
  };

  const updatePricing = async () => {
    const newPricing = {
      hourlyRate: prompt('Enter new hourly rate:'),
      preBookingExtraCharge: prompt('Enter pre-booking extra charge per hour:'),
      fixedPreBookingFee: prompt('Enter fixed pre-booking fee:'),
    };
    try {
      await api.put(`/api/dashboard/pricing/${selectedParking}`, { pricing: newPricing });
      alert('Pricing updated');
      fetchDashboard(selectedParking);
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  const toggleClosed = async () => {
    const temporarilyClosed = !dashboardData.temporarilyClosed;
    try {
      await api.put(`/api/dashboard/toggle-closed/${selectedParking}`, { temporarilyClosed });
      alert('Status updated');
      fetchDashboard(selectedParking);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const updateUpiId = async () => {
    const newUpiId = prompt('Enter new UPI ID:', dashboardData.upiId || 'parking@upi');
    if (newUpiId && newUpiId !== dashboardData.upiId) {
      try {
        await api.put(`/api/dashboard/upi/${selectedParking}`, { upiId: newUpiId });
        alert('UPI ID updated');
        fetchDashboard(selectedParking);
      } catch (error) {
        console.error('Error updating UPI ID:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="owner-dashboard">
      <h1>Owner Dashboard</h1>

      <div className="parking-selector">
        <label>Select Parking:</label>
        <select value={selectedParking} onChange={handleParkingChange}>
          {parkings.map(parking => (
            <option key={parking._id} value={parking._id}>{parking.name}</option>
          ))}
        </select>
      </div>

      {dashboardData && (
        <div className="dashboard-content">
          <div className="earnings-section">
            <h2>Today's Earnings: ₹{dashboardData.todaysEarnings}</h2>
          </div>

          <div className="bookings-section">
            <h3>Today's Bookings</h3>
            <ul>
              {dashboardData.todaysBookings.map(booking => (
                <li key={booking._id}>
                  {booking.user.name} - {booking.slot.slotNumber} - ₹{booking.totalAmount}
                </li>
              ))}
            </ul>
          </div>

          <div className="pricing-section">
            <h3>Current Pricing</h3>
            <p>Hourly Rate: ₹{dashboardData.pricing.hourlyRate}</p>
            <p>Pre-booking Extra: ₹{dashboardData.pricing.preBookingExtraCharge}/hr</p>
            <p>Fixed Pre-booking Fee: ₹{dashboardData.pricing.fixedPreBookingFee}</p>
            <button onClick={updatePricing}>Update Pricing</button>
          </div>

          <div className="status-section">
            <h3>Parking Status</h3>
            <p>Operational: {dashboardData.operationalStatus}</p>
            <p>Temporarily Closed: {dashboardData.temporarilyClosed ? 'Yes' : 'No'}</p>
            <button onClick={toggleClosed}>
              {dashboardData.temporarilyClosed ? 'Open Parking' : 'Close Parking'}
            </button>
          </div>

          <div className="management-section">
            <h3>Manage Parking Structure</h3>
            <div className="management-buttons">
              <button onClick={() => navigate('/owner/floors', { state: { parkingId: selectedParking } })}>
                Manage Floors
              </button>
              <button onClick={() => navigate('/owner/slots', { state: { parkingId: selectedParking } })}>
                Manage Slots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
