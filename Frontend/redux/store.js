import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import floorReducer from './floorSlice';
import slotReducer from './slotSlice';
import vehicleReducer from './vehicleSlice';
import paymentReducer from './paymentSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    floors: floorReducer,
    slots: slotReducer,
    vehicles: vehicleReducer,
    payments: paymentReducer,
    users: userReducer,
  },
});

export default store;
