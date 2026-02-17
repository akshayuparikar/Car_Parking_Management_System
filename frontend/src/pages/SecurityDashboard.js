import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUPI } from "../redux/authSlice";
import BackButton from "../components/BackButton";
import api from "../api";
import "./SecurityDashboard.css";
import { FaBuilding, FaParking, FaCreditCard } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import FloorCard from "../components/FloorCard";

function SecurityDashboard() {
  const token = useSelector((state) => state.auth.token);
  const upiId = useSelector((state) => state.auth.upiId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [parkingName, setParkingName] = useState("");
  // Exit Vehicle state
  const [exitVehicleNumber, setExitVehicleNumber] = useState("");
  const [exitVehicle, setExitVehicle] = useState(null);
  const [exitAmount, setExitAmount] = useState(0);
  const [exitLoading, setExitLoading] = useState(false);
  const [exitSearching, setExitSearching] = useState(false);
  const [exitError, setExitError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // UPI Modal state
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [inputUpiId, setInputUpiId] = useState("");
  const [upiPassword, setUpiPassword] = useState("");
  const [upiLoading, setUpiLoading] = useState(false);

  // Ticket Verification State
  const [ticketId, setTicketId] = useState("");
  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkInNumber, setCheckInNumber] = useState("");
  const [checkInType, setCheckInType] = useState("car");

  useEffect(() => {
    if (token) {
      fetchFloors();
      fetchSummary();
    }
  }, [token]);

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setVerifyLoading(true);
    setVerifyError("");
    setVerifiedBooking(null);

    try {
      const res = await api.get(`/api/bookings/ticket/${ticketId}`);
      setVerifiedBooking(res.data);
      // Auto-fill type from booking slot if available, though slot has type 'car'/'bike'
      if (res.data.slot && res.data.slot.type) {
        setCheckInType(res.data.slot.type);
      }
    } catch (err) {
      setVerifyError("Invalid Ticket ID or Ticket not found / Expired.");
      setVerifiedBooking(null);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkInNumber.trim()) {
      alert("Please enter vehicle number");
      return;
    }

    try {
      await api.post("/api/vehicles/park", {
        ticketId: ticketId,
        number: checkInNumber,
        type: checkInType,
        // floorId is not needed for check-in as backend uses booking slot, 
        // but we can pass null or handle it in backend
        floorId: null
      });
      alert("Check-in Successful!");
      setVerifiedBooking(null);
      setTicketId("");
      setCheckInNumber("");
      fetchFloors();
      fetchSummary();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Check-in Failed");
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await api.get("/api/floors");
      const floorsList = res.data;

      // Get slots for each floor
      const fullFloors = await Promise.all(
        floorsList.map(async (floor) => {
          const slotRes = await api.get(`/api/slots/floor/${floor._id}`);
          const slots = slotRes.data;

          // Calculate stats
          const total = slots.length;
          const occupied = slots.filter((s) => s.isOccupied).length;
          const available = total - occupied;

          // Car stats
          const carSlots = slots.filter(s => s.type === 'car');
          const carTotal = carSlots.length;
          const carOccupied = carSlots.filter(s => s.isOccupied).length;

          // Bike stats
          const bikeSlots = slots.filter(s => s.type === 'bike');
          const bikeTotal = bikeSlots.length;
          const bikeOccupied = bikeSlots.filter(s => s.isOccupied).length;

          return {
            ...floor,
            stats: {
              total,
              available,
              occupied,
              car: { total: carTotal, occupied: carOccupied, available: carTotal - carOccupied },
              bike: { total: bikeTotal, occupied: bikeOccupied, available: bikeTotal - bikeOccupied }
            }
          };
        })
      );

      setFloors(fullFloors);
      if (fullFloors.length > 0) {
        setParkingName(fullFloors[0].parking.name);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading floors:", error);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/dashboard/security");
      setSummary(res.data);
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  const handleParkVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/vehicles/park", {
        floorId: selectedFloor,
        number: vehicleNumber,
        type: vehicleType
      });
      const generatedTicket = res.data.ticketId;
      alert(`Vehicle parked successfully! Ticket ID: ${generatedTicket}`);
      fetchFloors(); // Refresh floors
      fetchSummary(); // Refresh summary
      setVehicleNumber("");
      setSelectedFloor("");
    } catch (error) {
      console.error("Error parking vehicle:", error);
      alert("Failed to park vehicle");
    }
  };

  // Exit Vehicle functions
  const fetchExitVehicle = async () => {
    if (!exitVehicleNumber.trim()) {
      setExitError("Please enter a vehicle number");
      return;
    }

    setExitSearching(true);
    setExitError("");
    setExitVehicle(null);
    setExitAmount(0);

    try {
      const res = await api.get(`/api/vehicles/number/${exitVehicleNumber}`);
      const v = res.data;
      setExitVehicle(v);

      const entryTime = new Date(v.entryTime);
      const now = new Date();

      const diffHours = Math.ceil((now - entryTime) / (1000 * 60 * 60));

      const rate = v.type === "car" ? 50 : 20;
      setExitAmount(diffHours * rate);

    } catch (err) {
      setExitError("Vehicle not found! Please check the number and try again.");
      console.error(err);
    } finally {
      setExitSearching(false);
    }
  };

  const handleExit = async () => {
    setExitLoading(true);
    try {
      // First, calculate the exit amount
      const calcRes = await api.post("/api/vehicles/unpark", {
        vehicleId: exitVehicle._id,
      });

      const calculatedAmount = calcRes.data.amount;

      // Then, process the payment and exit
      await api.post(`/api/vehicles/security/exit/${exitVehicle._id}`, {
        paymentMethod,
      });

      alert("Vehicle exited successfully!");
      setExitVehicle(null);
      setExitVehicleNumber("");
      setExitAmount(0);
      setExitError("");
      fetchFloors(); // Refresh floors
      fetchSummary(); // Refresh summary
    } catch (err) {
      setExitError("Failed to exit vehicle. Please try again.");
      console.error(err);
    } finally {
      setExitLoading(false);
    }
  };

  const handleExitKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchExitVehicle();
    }
  };

  const handleUpdateUPI = async () => {
    if (!inputUpiId.trim() || !upiPassword.trim()) {
      alert("Please enter both UPI ID and password");
      return;
    }

    setUpiLoading(true);
    try {
      await api.post("/api/users/upi", {
        upiId: inputUpiId,
        upiPassword
      });
      dispatch(updateUPI(inputUpiId));
      alert("UPI ID updated successfully!");
      setShowUPIModal(false);
      setInputUpiId("");
      setUpiPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update UPI ID");
    } finally {
      setUpiLoading(false);
    }
  };

  if (!token)
    return <div className="dashboard-container">Please login to continue.</div>;

  if (loading)
    return <div className="dashboard-container">Loading security dashboard...</div>;

  return (
    <div className="dashboard-container">
      <BackButton />
      <h2>Security Dashboard</h2>
      {parkingName && <h3>Assigned Parking: {parkingName}</h3>}

      {/* Verify Ticket Section */}
      <div className="vehicle-entry-section" style={{ borderLeft: '5px solid #007bff' }}>
        <h3>Verify Ticket (Pre-booking)</h3>
        <div className="exit-form">
          <div className="form-group">
            <label>Ticket ID (10-digit)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="form-input"
              />
              <button className="btn btn-primary" onClick={handleVerifyTicket} disabled={verifyLoading}>
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
          {verifyError && <p className="error-message">{verifyError}</p>}

          {verifiedBooking && (
            <div className="verification-details" style={{ marginTop: '15px', padding: '10px', background: '#eef', borderRadius: '5px' }}>
              <h4>Booking Verified</h4>
              <p><strong>User:</strong> {verifiedBooking.user?.name}</p>
              <p><strong>Slot:</strong> {verifiedBooking.slot?.slotNumber} (Floor {verifiedBooking.slot?.floor?.name})</p>
              <p><strong>Time:</strong> {new Date(verifiedBooking.startTime).toLocaleString()} - {new Date(verifiedBooking.endTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {verifiedBooking.status}</p>

              <div style={{ marginTop: '10px' }}>
                <label>Confirm Vehicle Number:</label>
                <input
                  type="text"
                  placeholder="Vehicle Number"
                  value={checkInNumber}
                  onChange={(e) => setCheckInNumber(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: '10px' }}
                />
                <select
                  value={checkInType}
                  onChange={(e) => setCheckInType(e.target.value)}
                  style={{ padding: '8px', marginRight: '10px' }}
                  disabled // Pre-booked slot has fixed type
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
                <button className="btn btn-success" onClick={handleCheckIn}>Check-In & Park</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Entry Form */}
      <div className="vehicle-entry-section">
        <h3>Park Vehicle</h3>
        <form onSubmit={handleParkVehicle}>
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
          />
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            required
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor._id} value={floor._id}>
                {floor.name}
              </option>
            ))}
          </select>
          <button type="submit">Park Vehicle</button>
        </form>
      </div>

      {/* Exit Vehicle Section */}
      <div className="vehicle-entry-section">
        <h3>Exit Vehicle</h3>
        <div className="exit-form">
          <div className="form-group">
            <label className="form-label">Vehicle Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter vehicle number (e.g., ABC-123)"
              value={exitVehicleNumber}
              onChange={(e) => setExitVehicleNumber(e.target.value)}
              onKeyPress={handleExitKeyPress}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchExitVehicle}
            disabled={exitSearching}
          >
            {exitSearching ? "Searching..." : "Search Vehicle"}
          </button>

          {exitError && (
            <div className="error-message">
              {exitError}
            </div>
          )}
        </div>
      </div>

      {exitVehicle && (
        <div className="exit-section">
          <div className="exit-details-card">
            <h3>Parking Details</h3>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Vehicle Number</span>
                <span className="detail-value">{exitVehicle.number}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Vehicle Type</span>
                <span className="detail-value">{exitVehicle.type}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Parking Slot</span>
                <span className="detail-value">{exitVehicle.slot.number}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entry Time</span>
                <span className="detail-value">{new Date(exitVehicle.entryTime).toLocaleString()}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">
                  {Math.ceil((new Date() - new Date(exitVehicle.entryTime)) / (1000 * 60 * 60))} hours
                </span>
              </div>

              <div className="detail-item total-amount">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value amount-highlight">₹{exitAmount}</span>
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
                    value={`upi://pay?pa=${upiId || 'carparking@upi'}&pn=Smart Parking&am=${exitAmount}&cu=INR&tn=Parking Fee for ${exitVehicle.number}`}
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
              disabled={exitLoading}
            >
              {exitLoading ? "Processing..." : "Confirm Exit & Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Floor and Slot Management */}
      <div className="management-section">
        <h3>Manage Parking Structure</h3>
        <div className="management-cards">
          <div className="management-card" onClick={() => navigate('/security/floors')}>
            <FaBuilding className="management-icon" />
            <h4>Manage Floors</h4>
            <p>Add, edit, or remove floors in your assigned parking</p>
          </div>
          <div className="management-card" onClick={() => navigate('/security/slots')}>
            <FaParking className="management-icon" />
            <h4>Manage Slots</h4>
            <p>Add, edit, or remove parking slots</p>
          </div>
          <div className="management-card" onClick={() => setShowUPIModal(true)}>
            <FaCreditCard className="management-icon" />
            <h4>Add / Update UPI</h4>
            <p>Manage your UPI ID for online payments</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Parked Vehicles</h4>
          <p>{summary.totalParkedVehicles || 0}</p>
        </div>
        <div className="summary-card">
          <h4>Total Slots</h4>
          <p>{summary.totalSlots || 0}</p>
        </div>
        <div className="summary-card">
          <h4>Available Slots</h4>
          <p>{summary.availableSlots || 0}</p>
        </div>
        <div className="summary-card">
          <h4>Occupied Slots</h4>
          <p>{summary.occupiedSlots || 0}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {floors.map((floor) => (
          <FloorCard key={floor._id} floor={floor} />
        ))}
      </div>

      {/* UPI Modal */}
      {showUPIModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add / Update UPI ID</h3>

            <div className="form-group">
              <label>UPI ID:</label>
              <input
                type="text"
                value={inputUpiId}
                onChange={(e) => setInputUpiId(e.target.value)}
                placeholder="e.g., user@upi"
                required
              />
            </div>

            <div className="form-group">
              <label>UPI Password (set by Admin):</label>
              <input
                type="password"
                value={upiPassword}
                onChange={(e) => setUpiPassword(e.target.value)}
                placeholder="Enter the password set by admin"
                required
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleUpdateUPI}
                disabled={upiLoading || !inputUpiId.trim() || !upiPassword.trim()}
              >
                {upiLoading ? 'Updating...' : 'Update UPI ID'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowUPIModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDashboard;
