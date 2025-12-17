import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      <div className="admin-menu">
        <Link to="/users" className="admin-link">Manage Users</Link>
        <Link to="/floors" className="admin-link">Manage Floors</Link>
        <Link to="/slots" className="admin-link">Manage Slots</Link>
        <Link to="/payments" className="admin-link">View Payments/Reports</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
