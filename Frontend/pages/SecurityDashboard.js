import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./DashboardPage.css"; // Reuse the same CSS

function SecurityDashboard() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [selectedFloor, setSelectedFloor] = useState("");

  useEffect(() => {
    if (token) {
      fetchFloors();
      fetchSummary();
    }
  }, [token]);

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

          return {
            ...floor,
            stats: { total, available, occupied }
          };
        })
      );

      setFloors(fullFloors);
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
      await api.post("/api/vehicles/park", {
        floorId: selectedFloor,
        number: vehicleNumber,
        type: vehicleType
      });
      alert("Vehicle parked successfully!");
      fetchFloors(); // Refresh floors
      fetchSummary(); // Refresh summary
      setVehicleNumber("");
      setSelectedFloor("");
    } catch (error) {
      console.error("Error parking vehicle:", error);
      alert("Failed to park vehicle");
    }
  };

  const handleFloorClick = (floorId) => {
    navigate(`/security/floor/${floorId}`);
  };

  if (!token)
    return <div className="dashboard-container">Please login to continue.</div>;

  if (loading)
    return <div className="dashboard-container">Loading security dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h2>Security Dashboard</h2>

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
          <div
            key={floor._id}
            className="floor-card"
            onClick={() => handleFloorClick(floor._id)}
            style={{ cursor: "pointer" }}
          >
            <h3>{floor.name}</h3>
            <p>Total Slots: {floor.stats.total}</p>
            <p>Available: {floor.stats.available}</p>
            <p>Occupied: {floor.stats.occupied}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityDashboard;
