import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./SecurityFloorPage.css";

function SecurityFloorPage() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const [floor, setFloor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exitVehicleNumber, setExitVehicleNumber] = useState("");

  useEffect(() => {
    if (token && floorId) fetchFloorData();
  }, [token, floorId]);

  const fetchFloorData = async () => {
    try {
      const floorRes = await api.get(`/api/floors/${floorId}`);
      const slotRes = await api.get(`/api/slots/floor/${floorId}`);
      setFloor(floorRes.data);
      setSlots(slotRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleVehicleExit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/vehicles/unpark/number", {
        number: exitVehicleNumber,
      });
      alert("Vehicle exited successfully!");
      fetchFloorData();
      setExitVehicleNumber("");
    } catch (error) {
      alert("Failed to exit vehicle");
    }
  };

  if (!token) return <div className="floor-slots-container">Please login.</div>;
  if (loading) return <div className="floor-slots-container">Loading...</div>;

  return (
    <div className="floor-slots-container">
      {/* Header */}
      <div className="floor-header">
        <button onClick={() => navigate("/security/dashboard")} className="back-button">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>
          <i className="fas fa-building"></i> {floor?.name} – Floor Management
        </h2>
      </div>

      {/* Exit Card */}
      <div className="vehicle-exit-card">
        <h3>
          <i className="fas fa-sign-out-alt"></i> Vehicle Exit
        </h3>
        <form onSubmit={handleVehicleExit}>
          <input
            type="text"
            placeholder="Vehicle Number"
            value={exitVehicleNumber}
            onChange={(e) => setExitVehicleNumber(e.target.value)}
            required
          />
          <button type="submit">
            <i className="fas fa-car"></i> Exit Vehicle
          </button>
        </form>
      </div>

      {/* Slots */}
      <h3 className="slots-title">
        <i className="fas fa-th-large"></i> Parking Slots
      </h3>

      <div className="slots-grid">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className={`slot-card ${slot.isOccupied ? "occupied" : "available"}`}
          >
            <i
              className={`fas ${
                slot.isOccupied ? "fa-times-circle" : "fa-check-circle"
              }`}
            ></i>
            <span>Slot {slot.slotNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityFloorPage;
