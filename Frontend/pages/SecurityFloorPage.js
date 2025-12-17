import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./FloorSlotsPage.css"; // Reuse existing CSS

function SecurityFloorPage() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [floor, setFloor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exitVehicleNumber, setExitVehicleNumber] = useState("");

  useEffect(() => {
    if (token && floorId) {
      fetchFloorData();
    }
  }, [token, floorId]);

  const fetchFloorData = async () => {
    try {
      const floorRes = await api.get(`/api/floors/${floorId}`);
      const slotRes = await api.get(`/api/slots/floor/${floorId}`);
      setFloor(floorRes.data);
      setSlots(slotRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading floor data:", error);
      setLoading(false);
    }
  };

  const handleVehicleExit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/vehicles/unpark/number", { number: exitVehicleNumber });
      alert("Vehicle exited successfully!");
      fetchFloorData(); // Refresh data
      setExitVehicleNumber("");
    } catch (error) {
      console.error("Error exiting vehicle:", error);
      alert("Failed to exit vehicle");
    }
  };

  if (!token) return <div>Please login to continue.</div>;
  if (loading) return <div>Loading floor details...</div>;

  return (
    <div className="floor-slots-container">
      <button onClick={() => navigate("/security/dashboard")} className="back-button">
        Back to Dashboard
      </button>
      <h2>{floor?.name} - Security Management</h2>

      {/* Vehicle Exit Form */}
      <div className="vehicle-exit-section">
        <h3>Vehicle Exit</h3>
        <form onSubmit={handleVehicleExit}>
          <input
            type="text"
            placeholder="Vehicle Number"
            value={exitVehicleNumber}
            onChange={(e) => setExitVehicleNumber(e.target.value)}
            required
          />
          <button type="submit">Exit Vehicle</button>
        </form>
      </div>

      {/* Slots Visualization */}
      <div className="slots-grid">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className={`slot ${slot.isOccupied ? "occupied" : "available"}`}
          >
            {slot.slotNumber}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityFloorPage;
