import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FloorCard from "../components/FloorCard";
import api from "../api";
import "./DashboardPage.css";

function DashboardPage() {
  const token = useSelector((state) => state.auth.token);

  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    freeSlots: 0,
    occupiedSlots: 0,
    vehiclesParked: 0
  });

  useEffect(() => {
    if (token) {
      fetchFloors();
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

          const slots = slotRes.data; // backend returns only slots []

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

      // Calculate overall stats
      const totalSlots = fullFloors.reduce((sum, floor) => sum + floor.stats.total, 0);
      const freeSlots = fullFloors.reduce((sum, floor) => sum + floor.stats.available, 0);
      const occupiedSlots = fullFloors.reduce((sum, floor) => sum + floor.stats.occupied, 0);
      const vehiclesParked = occupiedSlots; // Assuming each occupied slot has one vehicle

      setStats({
        totalSlots,
        freeSlots,
        occupiedSlots,
        vehiclesParked
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading floors:", error);
      setLoading(false);
    }
  };

  if (!token)
    return <div className="dashboard-container">Please login to continue.</div>;

  if (loading)
    return (
      <div className="dashboard-container">
        <div className="loading-skeleton">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-stats"></div>
          <div className="skeleton skeleton-grid"></div>
        </div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Smart Parking Dashboard</h1>
        <p className="dashboard-subtitle">Real-time parking management system</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalSlots}</div>
            <div className="stat-label">Total Slots</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{stats.freeSlots}</div>
            <div className="stat-label">Free Slots</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-number">{stats.occupiedSlots}</div>
            <div className="stat-label">Occupied Slots</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-number">{stats.vehiclesParked}</div>
            <div className="stat-label">Vehicles Parked</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Floor Overview</h2>
        <div className="dashboard-grid">
          {floors.map((floor) => (
            <FloorCard key={floor._id} floor={floor} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
