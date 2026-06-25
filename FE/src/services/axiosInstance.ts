import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
axiosInstance.interceptors.request.use(
    async (config) => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('remember_me');

      sessionStorage.removeItem('idToken');
      sessionStorage.removeItem('accessToken');

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
