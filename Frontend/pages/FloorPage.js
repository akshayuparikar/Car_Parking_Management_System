import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFloors, addFloor } from '../redux/floorSlice';
import './FloorPage.css';

function FloorPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.floors);
  const token = useSelector((state) => state.auth.token);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchFloors(token));
  }, [dispatch, token]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (name && number) {
      dispatch(addFloor({ name, number, token }));
      setName('');
      setNumber('');
    }
  };

  if (!token) return <div className="floor-container">Please login to manage floors.</div>;

  return (
    <div className="floor-container">
      <h2>Floor Management</h2>
      <form className="floor-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Floor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Floor Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <button type="submit">Add Floor</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="floor-list">
        {list.map((floor) => (
          <li key={floor._id}>
            <strong>{floor.name}</strong> (#{floor.number})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FloorPage;
