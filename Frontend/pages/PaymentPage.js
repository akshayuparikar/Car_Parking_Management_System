import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, addPayment } from '../redux/paymentSlice';
import { fetchVehicles } from '../redux/vehicleSlice';
import './PaymentPage.css';

function PaymentPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.payments);
  const vehicles = useSelector((state) => state.vehicles.list);
  const token = useSelector((state) => state.auth.token);
  const [vehicleId, setVehicleId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchPayments(token));
      dispatch(fetchVehicles(token));
    }
  }, [dispatch, token]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (vehicleId && amount) {
      dispatch(addPayment({ vehicleId, amount, token }));
      setVehicleId('');
      setAmount('');
    }
  };

  if (!token) return <div className="payment-container">Please login to manage payments.</div>;

  return (
    <div className="payment-container">
      <h2>Payment History</h2>
      <form className="payment-form" onSubmit={handleAdd}>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>{v.number} ({v.type})</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Add Payment</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="payment-list">
        {list.map((p) => (
          <li key={p._id}>
            Vehicle: {p.vehicle?.number || p.vehicle} | Amount: ₹{p.amount} | Paid At: {new Date(p.paidAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentPage;
