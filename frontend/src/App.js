import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
import MapPage from './pages/MapPage'; // map for nearby parkings
import NearbyParkingPage from './pages/NearbyParkingPage'; // nearby parking selection
import BookingPage from './pages/BookingPage'; // booking page
import OwnerDashboard from './pages/OwnerDashboard'; // owner dashboard
import UserDashboard from './pages/UserDashboard'; // user dashboard

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/security/dashboard" element={<ProtectedRoute allowedRoles={['SECURITY']}><SecurityDashboard /></ProtectedRoute>} />
      <Route path="/security/floors" element={<ProtectedRoute allowedRoles={['SECURITY']}><FloorPage /></ProtectedRoute>} />
      <Route path="/security/slots" element={<ProtectedRoute allowedRoles={['SECURITY']}><SlotPage /></ProtectedRoute>} />
      <Route path="/security/floor/:floorId" element={<ProtectedRoute allowedRoles={['SECURITY']}><SecurityFloorPage /></ProtectedRoute>} />
      <Route path="/floors" element={<ProtectedRoute allowedRoles={['ADMIN']}><FloorPage /></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute allowedRoles={['ADMIN']}><SlotPage /></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['ADMIN', 'USER']}><VehiclePage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute allowedRoles={['SECURITY']}><PaymentPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/car-parking" element={<ProtectedRoute allowedRoles={['SECURITY']}><CarParkingPage /></ProtectedRoute>} /> {/* normal user route */}
      <Route path="/parking" element={<PublicParkingPage />} /> {/* public parking viewer */}
      <Route path="/map" element={<MapPage />} /> {/* map for nearby parkings */}
      <Route path="/nearby-parking" element={<ProtectedRoute allowedRoles={['USER']}><NearbyParkingPage /></ProtectedRoute>} /> {/* nearby parking selection */}
      <Route path="/booking/:parkingId" element={<ProtectedRoute allowedRoles={['USER']}><BookingPage /></ProtectedRoute>} /> {/* booking page */}
      <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><OwnerDashboard /></ProtectedRoute>} /> {/* owner dashboard */}
      <Route path="/owner/floors" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><FloorPage /></ProtectedRoute>} /> {/* owner floors */}
      <Route path="/owner/slots" element={<ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}><SlotPage /></ProtectedRoute>} /> {/* owner slots */}
      <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><UserDashboard /></ProtectedRoute>} /> {/* user dashboard */}
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/floor/:floorId" element={<ProtectedRoute allowedRoles={['USER', 'SECURITY']}><FloorSlotPage /></ProtectedRoute>} />
      <Route path="/park" element={<ProtectedRoute allowedRoles={['SECURITY']}><ParkVehiclePage /></ProtectedRoute>} />
      <Route path="/exit" element={<ProtectedRoute allowedRoles={['SECURITY']}><ExitVehiclePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
