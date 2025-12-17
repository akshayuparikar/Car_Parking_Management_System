import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './redux/store';
import api from './api';
import { restoreToken, loginSuccess, logout } from './redux/authSlice';
import './styles/global.css';

// Restore auth on app start
const token = localStorage.getItem('token');
if (token) {
  store.dispatch(restoreToken(token));
  api.get('/api/auth/me')
    .then(res => {
      store.dispatch(loginSuccess({ token, user: res.data.user }));
    })
    .catch(() => {
      localStorage.removeItem('token');
      store.dispatch(logout());
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
