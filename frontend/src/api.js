import axios from 'axios';

const api = axios.create({
  baseURL:'https://taskflow-dashboard-oboe.onrender.com/api',
});

// Automatically add the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;