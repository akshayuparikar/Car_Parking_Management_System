import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchVehicles = createAsyncThunk('vehicles/fetchVehicles', async (token) => {
  const res = await api.get('/api/vehicles', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const vehicleEntry = createAsyncThunk('vehicles/vehicleEntry', async ({ number, type, slotId, token }) => {
  const res = await api.post('/api/vehicles/entry', { number, type, slotId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const vehicleExit = createAsyncThunk('vehicles/vehicleExit', async ({ vehicleId, token }) => {
  const res = await api.post('/api/vehicles/exit', { vehicleId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(vehicleEntry.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(vehicleExit.fulfilled, (state, action) => {
        state.list = state.list.map(v => v._id === action.payload._id ? action.payload : v);
      });
  },
});

export default vehicleSlice.reducer;
