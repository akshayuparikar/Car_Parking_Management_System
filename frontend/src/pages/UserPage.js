import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser, addUser } from '../redux/userSlice';
import BackButton from '../components/BackButton';
import './UserPage.css';

function UserPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.users);
  const token = useSelector((state) => state.auth.token);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', password: '', role: 'USER' });

  useEffect(() => {
    if (token) dispatch(fetchUsers(token));
  }, [dispatch, token]);

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateUser({ id: editId, data: editData, token }));
    setEditId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteUser({ id, token }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addUser({ userData: addData, token }));
    setShowAddModal(false);
    setAddData({ name: '', email: '', password: '', role: 'USER' });
  };

  if (!token) return <div className="user-container">Please login to manage users.</div>;

  return (
    <div className="user-container">
      <BackButton />
      <h2>User Management</h2>
      <button onClick={() => setShowAddModal(true)} className="add-btn">Add User</button>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <ul className="user-list">
        {list.map((user) => (
          <li key={user._id}>
            {editId === user._id ? (
              <form className="edit-form" onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                />
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <strong>{user.name}</strong> ({user.email}) - {user.role}
                <button onClick={() => handleEdit(user)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(user._id)} className="delete-btn">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New User</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={addData.name}
                  onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={addData.email}
                  onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={addData.password}
                  onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={addData.role}
                  onChange={(e) => setAddData({ ...addData, role: e.target.value })}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SECURITY">SECURITY</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add User</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
