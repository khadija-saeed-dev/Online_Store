import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim()
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

if (!apiBaseUrl) {
  throw new Error('VITE_API_URL must be set for production deployments.');
}

const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isPublicAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      window.localStorage.removeItem('token');
      window.dispatchEvent(new Event('customer:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;