import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from "../components/BackButton";
import { fetchFloors, addFloor } from '../redux/floorSlice';
import api from '../api';
import './FloorPage.css';

function FloorPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.floors);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (token) {
      if (user?.role === 'SECURITY') {
        // For security, fetch from security endpoints
        const fetchSecurityFloors = async () => {
          try {
            const floorRes = await api.get('/api/security/floors');
            dispatch({ type: 'floors/fetchFloors/fulfilled', payload: floorRes.data });
          } catch (error) {
            console.error('Error fetching security floors:', error);
          }
        };
        fetchSecurityFloors();
      } else {
        dispatch(fetchFloors(token));
      }
    }
  }, [dispatch, token, user]);

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
      <BackButton />
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
