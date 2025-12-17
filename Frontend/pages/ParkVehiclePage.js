import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./ParkVehiclePage.css";

function ParkVehiclePage() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user); // ⬅ GET LOGGED-IN USER

  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [number, setNumber] = useState("");
  const [type, setType] = useState("car");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchFloors();
  }, [token]);

  // Fetch floors
  const fetchFloors = async () => {
    try {
      const res = await axios.get("/api/floors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFloors(res.data);
    } catch (err) {
      console.error("Error fetching floors", err);
    }
  };

  // Submit parking request - automatic slot assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "/api/vehicles/park",
        {
          userId: user?._id, // ⬅ REAL LOGGED-IN USER ID
          floorId: selectedFloor,
          number,
          type,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Vehicle Parked Successfully! Slot assigned automatically.");

      // reset
      setSelectedFloor("");
      setNumber("");
      setType("car");
    } catch (err) {
      console.error("Error parking vehicle", err);
      alert("Failed to park vehicle: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="park-container">Please login first.</div>;

  return (
    <div className="park-container">
      <h2>🚗 Vehicle Entry</h2>
      <p>Enter vehicle details. System will automatically assign an available slot.</p>

      <form className="park-form" onSubmit={handleSubmit}>
        {/* FLOOR SELECT */}
        <select
          value={selectedFloor}
          required
          onChange={(e) => setSelectedFloor(e.target.value)}
        >
          <option value="">Select Floor</option>
          {floors.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name}
            </option>
          ))}
        </select>

        {/* VEHICLE NUMBER */}
        <input
          type="text"
          placeholder="Vehicle Number (e.g., ABC-123)"
          value={number}
          required
          onChange={(e) => setNumber(e.target.value)}
        />

        {/* TYPE */}
        <select
          value={type}
          required
          onChange={(e) => setType(e.target.value)}
        >
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Park Vehicle"}
        </button>
      </form>
    </div>
  );
}

export default ParkVehiclePage;
