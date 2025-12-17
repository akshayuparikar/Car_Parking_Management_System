import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchSlots = createAsyncThunk('slots/fetchSlots', async (token) => {
  const res = await api.get('/api/slots', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const addSlot = createAsyncThunk('slots/addSlot', async ({ floor, number, token }) => {
  const res = await api.post('/api/slots', { floor, number }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

const slotSlice = createSlice({
  name: 'slots',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addSlot.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default slotSlice.reducer;
