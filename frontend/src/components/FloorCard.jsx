import React from "react";
import { useNavigate } from "react-router-dom";

const FloorCard = ({ floor }) => {
  const navigate = useNavigate();

  return (
    <div
      className="floor-card"
      onClick={() => navigate(`/floor/${floor._id}`)}
    >
      <div className="card-header">
        <h3>Floor {floor.number}</h3>
        <span className="view-map-hint">Tap to view Map 🗺️</span>
      </div>

      <div className="floor-stats-grid">
        {/* Car Stats */}
        <div className="stat-group">
          <span className="group-title">🚗 Cars</span>
          <div className="stat-row">
            <span className="stat-val avail">{floor.stats.car?.available ?? 0}</span>
            <span className="stat-label">Free</span>
          </div>
        </div>

        {/* Bike Stats */}
        <div className="stat-group">
          <span className="group-title">🏍️ Bikes</span>
          <div className="stat-row">
            <span className="stat-val avail">{floor.stats.bike?.available ?? 0}</span>
            <span className="stat-label">Free</span>
          </div>
        </div>
      </div>

      <div className="total-bar">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(floor.stats.occupied / floor.stats.total) * 100}%` }}
          ></div>
        </div>
        <span className="occupancy-text">{floor.stats.occupied}/{floor.stats.total} Occupied</span>
      </div>
    </div>
  );
};

export default FloorCard;
