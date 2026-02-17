// src/pages/CarParkingPage.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import './CarParkingPage.css';

function CarParkingPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get('/api/slots');
      setSlots(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load slots');
      setLoading(false);
    }
  };

  const handleParkCar = async (slotId) => {
    const vehicleNumber = prompt('Enter vehicle number:');
    if (!vehicleNumber) return;

    try {
      await api.put(`/api/slots/${slotId}`, {
        isOccupied: true,
        vehicle: vehicleNumber
      });
      fetchSlots(); // refresh slots
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to park car');
    }
  };

  if (loading) return <div>Loading slots...</div>;
  if (error) return <div className="error">{error}</div>;

  // Group slots by floor
  const floors = {};
  slots.forEach((slot) => {
    const floorName = slot.floor.name;
    if (!floors[floorName]) floors[floorName] = [];
    floors[floorName].push(slot);
  });

  return (
    <div className="parking-container">
      <BackButton />
      <h2>Car Parking Management</h2>
      {Object.keys(floors).map((floorName) => (
        <div key={floorName} className="floor">
          <h3>{floorName} Floor</h3>
          <div className="slots">
            {floors[floorName].map((slot) => (
              <div
                key={slot._id}
                className={`slot ${slot.isOccupied ? 'occupied' : 'free'}`}
                onClick={() => !slot.isOccupied && handleParkCar(slot._id)}
                title={slot.isOccupied ? `Occupied by ${slot.vehicle}` : 'Click to park'}
              >
                {slot.number}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CarParkingPage;
