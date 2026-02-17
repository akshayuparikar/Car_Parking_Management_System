import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, addPayment } from '../redux/paymentSlice';
import { fetchVehicles } from '../redux/vehicleSlice';
import { FaCreditCard, FaCar, FaRupeeSign, FaPlus, FaHistory } from 'react-icons/fa';
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
      <BackButton />
      <div className="payment-header">
        <FaHistory className="header-icon" />
        <h2>Payment History</h2>
      </div>

      <div className="payment-form-section">
        <h3><FaPlus className="section-icon" /> Add New Payment</h3>
        <form className="payment-form" onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">
              <FaCar className="input-icon" />
              Select Vehicle
            </label>
            <select
              className="form-input"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>{v.number} ({v.type})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaRupeeSign className="input-icon" />
              Amount
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <FaCreditCard className="btn-icon" />
            Add Payment
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="payment-history-section">
        <h3>Recent Payments</h3>
        <div className="payment-grid">
          {list.map((p) => (
            <div key={p._id} className="payment-card card">
              <div className="payment-card-header">
                <FaCar className="card-icon" />
                <span className="vehicle-number">{p.vehicle?.number || p.vehicle}</span>
              </div>
              <div className="payment-card-body">
                <div className="payment-amount">
                  <FaRupeeSign className="amount-icon" />
                  <span className="amount-value">{p.amount}</span>
                </div>
                <div className="payment-date">
                  {new Date(p.paidAt).toLocaleDateString()} at {new Date(p.paidAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
