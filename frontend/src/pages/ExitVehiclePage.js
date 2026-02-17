import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import "./ExitVehiclePages.css";

function ExitVehiclePage() {
  const token = useSelector((state) => state.auth.token);

  const [number, setNumber] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const fetchVehicle = async () => {
    if (!number.trim()) {
      setError("Please enter a vehicle number");
      return;
    }

    setSearching(true);
    setError("");
    setVehicle(null);
    setAmount(0);

    try {
      const res = await axios.get(`/api/vehicle/number/${number}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const v = res.data;
      setVehicle(v);

      const entryTime = new Date(v.entryTime);
      const now = new Date();

      const diffHours = Math.ceil((now - entryTime) / (1000 * 60 * 60));

      const rate = v.type === "car" ? 50 : 20;
      setAmount(diffHours * rate);

    } catch (err) {
      setError("Vehicle not found! Please check the number and try again.");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleExit = async () => {
    setLoading(true);
    try {
      // First, calculate the exit amount
      const calcRes = await axios.post(
        "/api/vehicles/unpark",
        { vehicleId: vehicle._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const calculatedAmount = calcRes.data.amount;

      // Then, process the payment and exit
      await axios.post(
        `/api/vehicles/security/exit/${vehicle._id}`,
        { paymentMethod },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Vehicle exited successfully!");
      setVehicle(null);
      setNumber("");
      setAmount(0);
      setError("");
    } catch (err) {
      setError("Failed to exit vehicle. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchVehicle();
    }
  };

  return (
    <div className="exit-container">
      <div className="exit-header">
        <h1>Vehicle Exit</h1>
        <p className="exit-subtitle">Process vehicle departure and calculate parking fees</p>
      </div>

      <div className="exit-section">
        <div className="exit-form">
          <div className="form-group">
            <label className="form-label">Vehicle Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter vehicle number (e.g., ABC-123)"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchVehicle}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search Vehicle"}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>

      {vehicle ? (
        <div className="exit-section">
          <div className="exit-details-card">
            <h3>Parking Details</h3>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Vehicle Number</span>
                <span className="detail-value">{vehicle.number}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Vehicle Type</span>
                <span className="detail-value">{vehicle.type}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Parking Slot</span>
                <span className="detail-value">{vehicle.slot.number}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entry Time</span>
                <span className="detail-value">{new Date(vehicle.entryTime).toLocaleString()}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">
                  {Math.ceil((new Date() - new Date(vehicle.entryTime)) / (1000 * 60 * 60))} hours
                </span>
              </div>

              <div className="detail-item total-amount">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value amount-highlight">₹{amount}</span>
              </div>
            </div>

            <div className="payment-section">
              <h4>Payment Method</h4>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">Cash Payment</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="payment-label">QR Payment</span>
                </label>
              </div>

              {paymentMethod === "qr" && (
                <div className="qr-section">
                  <p>Scan the QR code to complete payment</p>
                  <QRCodeCanvas
                    value={`upi://pay?pa=merchant@upi&pn=Smart Parking&am=${amount}&cu=INR&tn=Parking Fee for ${vehicle.number}`}
                    size={200}
                    level="H"
                  />
                  <p className="qr-instructions">
                    After successful payment, click "Confirm Exit" to complete the process
                  </p>
                </div>
              )}
            </div>

            <button
              className="btn btn-success exit-btn"
              onClick={handleExit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Exit & Payment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="exit-section">
          <div className="exit-details-card">
            <h3>Payment Options Preview</h3>
            <p className="preview-text">Search for a vehicle above to see the complete parking details and payment options.</p>

            <div className="payment-section">
              <h4>Available Payment Methods</h4>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled
                  />
                  <span className="payment-label">Cash Payment</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled
                  />
                  <span className="payment-label">QR Payment</span>
                </label>
              </div>

              {paymentMethod === "qr" && (
                <div className="qr-section">
                  <p>QR payment will be available after vehicle search</p>
                  <div className="qr-placeholder">
                    <div className="qr-placeholder-content">
                      🔍 Search for a vehicle to generate QR code
                    </div>
                  </div>
                  <p className="qr-instructions">
                    QR payment allows instant digital transactions via UPI apps
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExitVehiclePage;
