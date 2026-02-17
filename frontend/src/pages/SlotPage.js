import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from "../components/BackButton";
import { fetchSlots, addSlot } from '../redux/slotSlice';
import { fetchFloors } from '../redux/floorSlice';
import api from '../api';
import './SlotPage.css';

function SlotPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.slots);
  const floors = useSelector((state) => state.floors.list);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [floor, setFloor] = useState('');
  const [numSlots, setNumSlots] = useState('');

  useEffect(() => {
    if (token) {
      if (user?.role === 'SECURITY') {
        // For security, fetch from security endpoints
        const fetchSecurityData = async () => {
          try {
            const slotRes = await api.get('/api/security/slots');
            dispatch({ type: 'slots/fetchSlots/fulfilled', payload: slotRes.data });
            const floorRes = await api.get('/api/security/floors');
            dispatch({ type: 'floors/fetchFloors/fulfilled', payload: floorRes.data });
          } catch (error) {
            console.error('Error fetching security data:', error);
          }
        };
        fetchSecurityData();
      } else {
        dispatch(fetchSlots(token));
        dispatch(fetchFloors(token));
      }
    }
  }, [dispatch, token, user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (floor && numSlots) {
      try {
        if (user?.role === 'SECURITY') {
          await api.post('/api/security/slots', { floor, numSlots });
          // Refresh data
          const slotRes = await api.get('/api/security/slots');
          dispatch({ type: 'slots/fetchSlots/fulfilled', payload: slotRes.data });
        } else {
          dispatch(addSlot({ floor, numSlots, token }));
        }
        setNumSlots('');
      } catch (error) {
        console.error('Error adding slots:', error);
      }
    }
  };

  if (!token) return <div className="slot-container">Please login to manage slots.</div>;

  // Calculate summary stats
  const totalSlots = list.length;
  const occupiedSlots = list.filter(slot => slot.isOccupied).length;
  const availableSlots = totalSlots - occupiedSlots;

  return (
    <div className="slot-container">
      <BackButton />
      <div className="slot-header">
        <h2>Slot Management</h2>
        <div className="slot-summary">
          <div className="summary-item">
            <span className="summary-label">Total Slots:</span>
            <span className="summary-value">{totalSlots}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Occupied:</span>
            <span className="summary-value occupied">{occupiedSlots}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Available:</span>
            <span className="summary-value available">{availableSlots}</span>
          </div>
        </div>
      </div>

      <div className="slot-section">
        <h3>Add New Slots</h3>
        <form className="slot-form" onSubmit={handleAdd}>
          <div className="form-group">
            <label htmlFor="floor-select" className="form-label">Select Floor</label>
            <select
              id="floor-select"
              className="form-input"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
            >
              <option value="">Choose a floor</option>
              {floors.map((f) => (
                <option key={f._id} value={f._id}>
                  Floor {f.number}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="num-slots" className="form-label">Number of Slots</label>
            <input
              id="num-slots"
              type="number"
              className="form-input"
              placeholder="Enter number of slots"
              value={numSlots}
              onChange={(e) => setNumSlots(e.target.value)}
              required
              min="1"
            />
          </div>

          <button type="submit" className="btn btn-primary">Add Slots</button>
        </form>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="skeleton" style={{ height: '20px', width: '200px', marginBottom: '1rem' }}></div>
          <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '1rem' }}></div>
          <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
        </div>
      )}
      {error && <div className="error card">{error}</div>}

      {!loading && (
        <div className="slot-section">
          <h3>Slots by Floor</h3>
          <div className="floor-grid">
            {Object.entries(
              list.reduce((acc, slot) => {
                const floorId = slot.floor?._id;
                if (!acc[floorId]) {
                  acc[floorId] = { floor: slot.floor, totalSlots: 0 };
                }
                acc[floorId].totalSlots += 1;
                return acc;
              }, {})
            ).map(([floorId, floorData]) => (
              <div key={floorId} className="floor-card card">
                <div className="floor-info">
                  <h4>Floor {floorData.floor?.number}</h4>
                  <p>Total Slots: {floorData.totalSlots}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SlotPage;
