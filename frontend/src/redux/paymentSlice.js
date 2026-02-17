import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchPayments = createAsyncThunk('payments/fetchPayments', async (token) => {
  const res = await api.get('/api/payments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const addPayment = createAsyncThunk('payments/addPayment', async ({ vehicleId, amount, token }) => {
  const res = await api.post('/api/payments', { vehicleId, amount }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default paymentSlice.reducer;
