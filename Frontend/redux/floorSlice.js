import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchFloors = createAsyncThunk('floors/fetchFloors', async (token) => {
  const res = await api.get('/api/floors', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const addFloor = createAsyncThunk('floors/addFloor', async ({ name, number, token }) => {
  const res = await api.post('/api/floors', { name, number }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

const floorSlice = createSlice({
  name: 'floors',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFloors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addFloor.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default floorSlice.reducer;
