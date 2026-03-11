import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

// Request interceptor - automatically attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData?.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.message === 'Token expired') {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

  export default apiClient;