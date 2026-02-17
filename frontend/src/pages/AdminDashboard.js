import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShieldAlt, FaTrash, FaUserPlus } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import api from '../api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [securities, setSecurities] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [assignedSecurities, setAssignedSecurities] = useState([]);
  const [selectedSecurity, setSelectedSecurity] = useState('');
  const [selectedParking, setSelectedParking] = useState('');
  const [shift, setShift] = useState('');
  const [upiPassword, setUpiPassword] = useState('');
  const [addUserData, setAddUserData] = useState({ name: '', email: '', password: '', role: 'USER', upiPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, parkingsRes, assignedRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/parkings'),
        api.get('/api/users/assigned-securities')
      ]);

      setSecurities(usersRes.data.filter(user => user.role === 'SECURITY'));
      setParkings(parkingsRes.data);
      setAssignedSecurities(assignedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAssignSecurity = async () => {
    if (!selectedSecurity || !selectedParking) return;

    setLoading(true);
    try {
      // First, update UPI password if provided
      if (upiPassword.trim()) {
        await api.put(`/api/users/${selectedSecurity}`, {
          upiPassword: upiPassword
        });
      }

      // Then assign security to parking
      await api.post('/api/parkings/assign-security', {
        securityId: selectedSecurity,
        parkingId: selectedParking,
        shift
      });

      setShowAssignModal(false);
      setSelectedSecurity('');
      setSelectedParking('');
      setShift('');
      setUpiPassword('');
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning security');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (securityId) => {
    if (!confirm('Are you sure you want to remove this security assignment?')) return;

    try {
      await api.delete(`/api/users/${securityId}/assignment`);
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing assignment');
    }
  };

  const handleAddUser = async () => {
    if (!addUserData.name || !addUserData.email || !addUserData.password) return;

    setLoading(true);
    try {
      await api.post('/api/auth/register', addUserData);
      alert('User added successfully!');
      setShowAddUserModal(false);
      setAddUserData({ name: '', email: '', password: '', role: 'USER', upiPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <BackButton />
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <div className="admin-menu">
        <Link to="/users" className="admin-card">
          <FaUsers className="admin-icon" />
          <h3>Manage Users</h3>
        </Link>

        <div className="admin-card" onClick={() => setShowAddUserModal(true)}>
          <FaUserPlus className="admin-icon" />
          <h3>Add User</h3>
        </div>

        <div className="admin-card" onClick={() => setShowAssignModal(true)}>
          <FaShieldAlt className="admin-icon" />
          <h3>Assign Security</h3>
        </div>


      </div>

      {/* Assigned Securities Table */}
      <div className="assigned-securities-section">
        <h3>Assigned Securities</h3>
        <table className="securities-table">
          <thead>
            <tr>
              <th>Security Name</th>
              <th>Assigned Parking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedSecurities.map((assignment) => (
              <tr key={assignment._id}>
                <td>{assignment.name}</td>
                <td>{assignment.assignedParking?.name || 'Not Assigned'}</td>
                <td>
                  <button
                    className="action-btn remove-btn"
                    onClick={() => handleRemoveAssignment(assignment._id)}
                  >
                    <FaTrash /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New User</h3>

            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={addUserData.name}
                onChange={(e) => setAddUserData({ ...addUserData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={addUserData.email}
                onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={addUserData.password}
                onChange={(e) => setAddUserData({ ...addUserData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group">
              <label>Role:</label>
              <select
                value={addUserData.role}
                onChange={(e) => setAddUserData({ ...addUserData, role: e.target.value })}
                required
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SECURITY">SECURITY</option>
              </select>
            </div>

            {addUserData.role === 'SECURITY' && (
              <div className="form-group">
                <label>UPI Password:</label>
                <input
                  type="password"
                  value={addUserData.upiPassword}
                  onChange={(e) => setAddUserData({ ...addUserData, upiPassword: e.target.value })}
                  placeholder="Set UPI password for security user"
                  required
                />
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleAddUser}
                disabled={loading || !addUserData.name || !addUserData.email || !addUserData.password}
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Security Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign Security to Parking</h3>

            <div className="form-group">
              <label>Security User:</label>
              <select
                value={selectedSecurity}
                onChange={(e) => setSelectedSecurity(e.target.value)}
              >
                <option value="">Select Security</option>
                {securities.map((security) => (
                  <option key={security._id} value={security._id}>
                    {security.name} ({security.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Parking Location:</label>
              <select
                value={selectedParking}
                onChange={(e) => setSelectedParking(e.target.value)}
              >
                <option value="">Select Parking</option>
                {parkings.map((parking) => (
                  <option key={parking._id} value={parking._id}>
                    {parking.name} - {parking.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>UPI Password (Optional - Update existing security's UPI password):</label>
              <input
                type="password"
                value={upiPassword}
                onChange={(e) => setUpiPassword(e.target.value)}
                placeholder="Enter new UPI password"
              />
            </div>

            <div className="form-group">
              <label>Shift/Notes (Optional):</label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder="e.g., Morning Shift"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleAssignSecurity}
                disabled={loading || !selectedSecurity || !selectedParking}
              >
                {loading ? 'Assigning...' : 'Assign Security'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
