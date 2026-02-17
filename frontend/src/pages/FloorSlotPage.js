import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./FloorSlotsPage.css";

function FloorSlotsPage() {
  const { floorId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [floor, setFloor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [floorId]);

  const fetchData = async () => {
    try {
      const floorRes = await api.get(`/api/floors/${floorId}`);
      setFloor(floorRes.data);

      const res = await api.get(`/api/slots/floor/${floorId}`);
      setSlots(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Group slots by type
  const carSlots = slots.filter(s => s.type === 'car');
  const bikeSlots = slots.filter(s => s.type === 'bike');

  // Helper to chunk slots into pairs for lane view
  const chunkSlots = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  };

  // 2 rows per lane section generally looks like a standard parking aisle
  // We'll just display them in a "Lane" container

  if (loading) {
    return <div className="floor-slots-container"><div className="loading">Loading Parking Map...</div></div>;
  }

  const renderSlot = (slot) => (
    <div
      key={slot._id}
      className={`parking-spot ${slot.isOccupied ? "occupied" : "available"} ${slot.type}`}
    >
      <div className="spot-markings">
        <span className="spot-number">{slot.slotNumber}</span>
      </div>
      <div className="vehicle-placeholder">
        {slot.isOccupied ? (
          slot.type === 'car' ? '🚗' : '🏍️'
        ) : (
          <span className="free-text">Free</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="floor-slots-container">
      <div className="page-header">
        <BackButton />
        <div className="header-content">
          <h1>{floor?.name || 'Floor'} Overview</h1>
          <p className="subtitle">{floor?.parking?.name}</p>
        </div>
      </div>

      <div className="parking-lot-layout">

        {/* Car Section */}
        {carSlots.length > 0 && (
          <div className="parking-section">
            <h3 className="section-title">🚗 Car Parking Zone</h3>
            <div className="parking-lane">
              <div className="lane-marking">DRIVE WAY</div>
              <div className="spots-row top-row">
                {carSlots.slice(0, Math.ceil(carSlots.length / 2)).map(renderSlot)}
              </div>
              <div className="road-strip">
                <div className="dashed-line"></div>
              </div>
              <div className="spots-row bottom-row">
                {carSlots.slice(Math.ceil(carSlots.length / 2)).map(renderSlot)}
              </div>
            </div>
          </div>
        )}

        {/* Bike Section */}
        {bikeSlots.length > 0 && (
          <div className="parking-section">
            <h3 className="section-title">🏍️ Bike Parking Zone</h3>
            <div className="parking-lane bike-lane">
              <div className="lane-marking">BIKE LANE</div>
              <div className="spots-row">
                {bikeSlots.map(renderSlot)}
              </div>
            </div>
          </div>
        )}

        {slots.length === 0 && (
          <div className="empty-state">
            <h3>No slots found on this floor.</h3>
          </div>
        )}

      </div>

      <div className="map-legend">
        <div className="legend-item"><span className="dot available"></span> Available</div>
        <div className="legend-item"><span className="dot occupied"></span> Occupied</div>
      </div>
    </div>
  );
}

export default FloorSlotsPage;
