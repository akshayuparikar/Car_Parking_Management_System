
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, vehicleEntry, vehicleExit } from '../redux/vehicleSlice';
import { fetchSlots } from '../redux/slotSlice';
import BackButton from '../components/BackButton';
import './VehiclePage.css';

function VehiclePage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.vehicles);
  const slots = useSelector((state) => state.slots.list.filter(s => !s.isOccupied));
  const token = useSelector((state) => state.auth.token);
  const [number, setNumber] = useState('');
  const [type, setType] = useState('');
  const [slotId, setSlotId] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchVehicles(token));
      dispatch(fetchSlots(token));
    }
  }, [dispatch, token]);

  const handleEntry = (e) => {
    e.preventDefault();
    if (number && type && slotId) {
      dispatch(vehicleEntry({ number, type, slotId, token }));
      setNumber('');
      setType('');
      setSlotId('');
    }
  };

  const handleExit = (vehicleId) => {
    dispatch(vehicleExit({ vehicleId, token }));
  };

  if (!token) return <div className="vehicle-container">Please login to manage vehicles.</div>;

  return (
    <div className="vehicle-container">
      <BackButton />
      <h2>Vehicle Entry/Exit</h2>
      <form className="vehicle-form" onSubmit={handleEntry}>
        <input
          type="text"
          placeholder="Vehicle Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Vehicle Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <select value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
          <option value="">Select Slot</option>
          {slots.map((s) => (
            <option key={s._id} value={s._id}>{s.number}</option>
          ))}
        </select>
        <button type="submit">Entry</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="vehicle-list">
        {list.map((v) => (
          <li key={v._id}>
            <strong>{v.number}</strong> ({v.type}) - Slot: {v.slot?.number || v.slot}
            {v.exitTime ? (
              <span className="exited"> (Exited)</span>
            ) : (
              <button onClick={() => handleExit(v._id)} className="exit-btn">Exit</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VehiclePage;
