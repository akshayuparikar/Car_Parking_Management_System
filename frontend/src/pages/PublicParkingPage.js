import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './PublicParkingPage.css';

function PublicParkingPage() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const res = await api.get('/api/floors');
      const floorsData = res.data;

      // Get summary for each floor
      const floorsWithStats = await Promise.all(
        floorsData.map(async (floor) => {
          try {
            const slotRes = await api.get(`/api/slots/floor/${floor._id}`);
            const slots = slotRes.data;
            const total = slots.length;
            const occupied = slots.filter(s => s.isOccupied).length;
            const available = total - occupied;

            return {
              ...floor,
              totalSlots: total,
              availableSlots: available,
              occupiedSlots: occupied
            };
          } catch (error) {
            console.error(`Error fetching slots for floor ${floor._id}:`, error);
            return {
              ...floor,
              totalSlots: 0,
              availableSlots: 0,
              occupiedSlots: 0
            };
          }
        })
      );

      setFloors(floorsWithStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching floors:', error);
      setLoading(false);
    }
  };

  const handleFloorClick = async (floor) => {
    setSelectedFloor(floor);
    try {
      const res = await api.get(`/api/slots/floor/${floor._id}`);
      setSlots(res.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBackToFloors = () => {
    setSelectedFloor(null);
    setSlots([]);
  };

  if (loading) {
    return <div className="public-parking-container">Loading parking information...</div>;
  }

  return (
    <div className="public-parking-container">
      <BackButton />
      <header className="parking-header">
        <h1>🅿️ Smart Parking System</h1>
        <p>Real-time parking availability</p>
      </header>

      {!selectedFloor ? (
        <div className="floors-view">
          <h2>Select a Floor</h2>
          <div className="floors-grid">
            {floors.map((floor) => (
              <div
                key={floor._id}
                className="floor-card"
                onClick={() => handleFloorClick(floor)}
              >
                <h3>{floor.name}</h3>
                <div className="floor-stats">
                  <div className="stat">
                    <span className="stat-number">{floor.totalSlots}</span>
                    <span className="stat-label">Total Slots</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number available">{floor.availableSlots}</span>
                    <span className="stat-label">Available</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number occupied">{floor.occupiedSlots}</span>
                    <span className="stat-label">Occupied</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="slots-view">
          <div className="slots-header">
            <button className="back-button" onClick={handleBackToFloors}>
              ← Back to Floors
            </button>
            <h2>{selectedFloor.name} - Slot Availability</h2>
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color occupied"></div>
              <span>Occupied</span>
            </div>
          </div>

          <div className="slots-grid">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`slot ${slot.isOccupied ? 'occupied' : 'available'}`}
                title={slot.isOccupied ? 'Occupied' : 'Available'}
              >
                {slot.slotNumber}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicParkingPage;
