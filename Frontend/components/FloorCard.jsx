import React from "react";
import { useNavigate } from "react-router-dom";

const FloorCard = ({ floor }) => {
  const navigate = useNavigate();

  return (
    <div
      className="floor-card"
      onClick={() => navigate(`/floor/${floor._id}`)}
    >
      <h3>Floor {floor.number}</h3>

      <div className="floor-stats">
        <div className="stat-item">
          <span className="stat-value total">{floor.stats.total}</span>
          <span className="stat-name">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value available">{floor.stats.available}</span>
          <span className="stat-name">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-value occupied">{floor.stats.occupied}</span>
          <span className="stat-name">Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default FloorCard;
