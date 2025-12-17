import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import api from '../api';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await api.post('/api/auth/login', { email, password });
      dispatch(loginSuccess(res.data));

      // Navigate based on role
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (res.data.user.role === 'SECURITY') {
        navigate('/security/dashboard');
      } else if (res.data.user.role === 'USER') {
        navigate('/dashboard');
      } else {
        dispatch(loginFailure('User role not authorized for dashboard access'));
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default LoginPage;
