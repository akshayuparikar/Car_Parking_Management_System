import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import FloorCard from "../components/FloorCard";
import MapComponent from "../components/MapComponent";
import BackButton from "../components/BackButton";
import api from "../api";
import "./DashboardPage.css";

function DashboardPage() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [floors, setFloors] = useState([]);
  const [groupedFloors, setGroupedFloors] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    freeSlots: 0,
    occupiedSlots: 0,
    vehiclesParked: 0
  });

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const res = await api.get("/api/dashboard/public");

      const data = res.data;
      console.log('Dashboard data:', data);
      setDashboardData(data);

      // Set floors data
      const floorData = data.floors.map(floor => ({
        ...floor,
        _id: floor.floorId,
        name: floor.floorName,
        number: floor.floorNumber,
        parkingName: floor.parkingName,
        stats: {
          total: floor.totalSlots,
          available: floor.availableSlots,
          occupied: floor.occupiedSlots,
          car: floor.stats?.car,
          bike: floor.stats?.bike
        }
      }));

      setFloors(floorData);

      // Group floors by parking name
      const grouped = floorData.reduce((acc, floor) => {
        const parkingName = floor.parkingName || 'Unknown Parking';
        if (!acc[parkingName]) {
          acc[parkingName] = [];
        }
        acc[parkingName].push(floor);
        return acc;
      }, {});
      setGroupedFloors(grouped);

      // Set overall stats
      setStats({
        totalSlots: data.totals.totalSlots,
        freeSlots: data.totals.availableSlots,
        occupiedSlots: data.totals.occupiedSlots,
        vehiclesParked: data.totals.occupiedSlots
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };



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
      <BackButton />
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Smart Parking Dashboard</h1>
          <p className="dashboard-subtitle">Real-time parking management system</p>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
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

      <div className="dashboard-actions-section" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/nearby-parking')}
          className="action-card-btn"
          style={{ padding: '15px 30px', fontSize: '1.2rem', margin: '0 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)' }}
        >
          🔍 Find & Book Parking
        </button>
        <button
          onClick={() => navigate('/user/dashboard')}
          className="action-card-btn"
          style={{ padding: '15px 30px', fontSize: '1.2rem', margin: '0 10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)' }}
        >
          👤 My Bookings & Activity
        </button>
      </div>

      <div className="dashboard-section">
        <h3>Parking Map</h3>
        <MapComponent />
      </div>

      <div className="dashboard-section">
        <h3>Floor Overview</h3>
        <div className="dashboard-grid">
          {floors.map((floor) => (
            <div key={floor._id} className="floor-with-parking">
              <div className="parking-name">{floor.parkingName}</div>
              <FloorCard floor={floor} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
