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

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

console.log("API BASE URL =", apiBaseUrl);

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
    const message = String(
      error?.response?.data?.message
      || error?.response?.data?.Message
      || error?.message
      || ''
    );

    if (error.response?.status === 401) {
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('remember_me');

      sessionStorage.removeItem('idToken');
      sessionStorage.removeItem('accessToken');

      redirectToLogin();
    }

    if (error.response?.status === 403 && /blocked|block/i.test(message)) {
      sessionStorage.setItem('blocked_account_message', 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('remember_me');
      sessionStorage.removeItem('idToken');
      sessionStorage.removeItem('accessToken');
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
