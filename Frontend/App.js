import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import SecurityFloorPage from './pages/SecurityFloorPage';
import FloorSlotPage from './pages/FloorSlotPage';

import FloorPage from './pages/FloorPage';
import SlotPage from './pages/SlotPage';
import VehiclePage from './pages/VehiclePage';
import PaymentPage from './pages/PaymentPage';
import UserPage from './pages/UserPage';
import ExitVehiclePage from './pages/ExitVehiclePage';
import ParkVehiclePage from './pages/ParkVehiclePage';
import ProtectedRoute from './components/ProtectedRoute';

import CarParkingPage from './pages/CarParkingPage'; // new page for normal users
import PublicParkingPage from './pages/PublicParkingPage'; // public parking viewer

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/security/dashboard" element={<ProtectedRoute allowedRoles={['SECURITY']}><SecurityDashboard /></ProtectedRoute>} />
      <Route path="/security/floor/:floorId" element={<ProtectedRoute allowedRoles={['SECURITY']}><SecurityFloorPage /></ProtectedRoute>} />
      <Route path="/floors" element={<ProtectedRoute allowedRoles={['ADMIN']}><FloorPage /></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute allowedRoles={['ADMIN']}><SlotPage /></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['ADMIN']}><VehiclePage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><PaymentPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/car-parking" element={<ProtectedRoute allowedRoles={['SECURITY']}><CarParkingPage /></ProtectedRoute>} /> {/* normal user route */}
      <Route path="/parking" element={<PublicParkingPage />} /> {/* public parking viewer */}
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/floor/:floorId" element={<ProtectedRoute allowedRoles={['USER', 'SECURITY']}><FloorSlotPage /></ProtectedRoute>} />
      <Route path="/park" element={<ProtectedRoute allowedRoles={['SECURITY']}><ParkVehiclePage /></ProtectedRoute>} />
      <Route path="/exit" element={<ProtectedRoute allowedRoles={['SECURITY']}><ExitVehiclePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
