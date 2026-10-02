import api from './api.js';

export function getAuthErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to reach the store. Please try again in a moment.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

export async function register({ name, email, password }) {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
}

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data.data.user;
}