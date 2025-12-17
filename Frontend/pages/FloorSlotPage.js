import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams } from "react-router-dom";
import "./FloorSlotsPage.css";

function FloorSlotsPage() {
  const { floorId } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get(`/api/slots/floor/${floorId}`);
      setSlots(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="floor-slots-container">
        <div className="loading-skeleton">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-legend"></div>
          <div className="slots-section">
            <div className="slots-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-slot"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="floor-slots-container">
      <div className="floor-slots-header">
        <h2>Floor Parking Slots</h2>
        <p className="floor-slots-subtitle">Real-time slot availability</p>
      </div>

      <div className="slots-legend">
        <div className="legend-item">
          <div className="legend-color legend-available"></div>
          <span>🟢 Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-occupied"></div>
          <span>🔴 Occupied</span>
        </div>
      </div>

      <div className="slots-section">
        <h3>Parking Slots</h3>
        {slots.length === 0 ? (
          <div className="empty-state">
            <h3>No slots found</h3>
            <p>This floor doesn't have any parking slots configured yet.</p>
          </div>
        ) : (
          <div className="slots-grid">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`slot-card ${slot.isOccupied ? "occupied" : "available"}`}
              >
                <div className="slot-icon">
                  {slot.isOccupied ? "🚗" : "🅿️"}
                </div>
                <h3>Slot {slot.slotNumber}</h3>
                <p className="slot-status">
                  {slot.isOccupied ? (
                    <>
                      <span className="status-text">Occupied</span>
                      {slot.vehicle && (
                        <span className="vehicle-info">{slot.vehicle.number}</span>
                      )}
                    </>
                  ) : (
                    <span className="status-text">Available</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorSlotsPage;
