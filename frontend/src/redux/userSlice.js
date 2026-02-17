import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const addUser = createAsyncThunk('users/addUser', async ({ userData, token }) => {
  const res = await api.post('/api/users', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (token) => {
  const res = await api.get('/api/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, data, token }) => {
  const res = await api.put(`/api/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async ({ id, token }) => {
  await api.delete(`/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

const userSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.list = state.list.map(u => u._id === action.payload._id ? action.payload : u);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u._id !== action.payload);
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
