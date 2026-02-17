import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './backButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      id="back-button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
    >
      <FaArrowLeft className="back-icon" />
      <span className="back-text">Back</span>
    </button>
  );
};

export default BackButton;
