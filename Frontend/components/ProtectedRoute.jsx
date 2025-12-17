import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user?.role === 'USER') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/security/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
