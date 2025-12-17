import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser } from '../redux/userSlice';
import './UserPage.css';

function UserPage() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.users);
  const token = useSelector((state) => state.auth.token);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '' });

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

  if (!token) return <div className="user-container">Please login to manage users.</div>;

  return (
    <div className="user-container">
      <h2>User Management</h2>
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
    </div>
  );
}

export default UserPage;
