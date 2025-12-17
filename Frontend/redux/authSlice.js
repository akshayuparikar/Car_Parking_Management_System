import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // called when login request starts
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },

    // called when login succeeds
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },

    // called when login fails
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // logout user
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },

    // restore token from localStorage (optional)
    restoreToken(state, action) {
      state.token = action.payload;
    },
  },
});

// Export actions
export const { loginStart, loginSuccess, loginFailure, logout, restoreToken } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;
