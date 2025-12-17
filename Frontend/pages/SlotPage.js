import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSlots, addSlot } from '../redux/slotSlice';
import { fetchFloors } from '../redux/floorSlice';
import './SlotPage.css';

function SlotPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.slots);
  const floors = useSelector((state) => state.floors.list);
  const token = useSelector((state) => state.auth.token);

  const [floor, setFloor] = useState('');
  const [slotNumber, setSlotNumber] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchSlots(token));
      dispatch(fetchFloors(token));
    }
  }, [dispatch, token]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (floor && slotNumber) {
      dispatch(addSlot({ floor, slotNumber, token }));
      setSlotNumber('');
    }
  };

  if (!token) return <div className="slot-container">Please login to manage slots.</div>;

  return (
    <div className="slot-container">
      <h2>Slot Management</h2>

      <form className="slot-form" onSubmit={handleAdd}>
        <select value={floor} onChange={(e) => setFloor(e.target.value)} required>
          <option value="">Select Floor</option>
          {floors.map((f) => (
            <option key={f._id} value={f._id}>
              Floor {f.number}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Slot Number"
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value)}
          required
        />

        <button type="submit">Add Slot</button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <ul className="slot-list">
        {list.map((slot) => (
          <li key={slot._id}>
            <strong>Slot {slot.slotNumber}</strong> — Floor {slot.floor?.number}
            {slot.isOccupied && <span className="occupied"> (Occupied)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SlotPage;
