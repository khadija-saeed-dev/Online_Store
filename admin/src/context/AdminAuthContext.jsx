import { createContext, useContext, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../services/api.js';
import * as authService from '../services/auth.js';

const AdminAuthContext = createContext(null);

function readToken() {
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
}

function clearStoredToken() {
  try {
    window.localStorage.removeItem('token');
  } catch {
    // The in-memory session can still be cleared when browser storage is unavailable.
  }
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    if (!token) {
      setLoading(false);
      return () => { isCurrent = false; };
    }

    authService.getCurrentUser()
      .then((currentUser) => {
        if (!isCurrent) return;
        if (currentUser.role !== 'admin') {
          clearStoredToken();
          setToken(null);
          setAuthError('Admin access required.');
          return;
        }
        setUser(currentUser);
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (error.response?.status === 401) {
          clearStoredToken();
          setToken(null);
        }
        setAuthError(getApiErrorMessage(error, 'Unable to restore your admin session.'));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => { isCurrent = false; };
  }, []);

  const login = async (credentials) => {
    setAuthError('');
    const session = await authService.login(credentials);
    if (session.user?.role !== 'admin') {
      clearStoredToken();
      setToken(null);
      setUser(null);
      const error = new Error('Admin access required.');
      error.code = 'ADMIN_REQUIRED';
      throw error;
    }

    try {
      window.localStorage.setItem('token', session.token);
    } catch {
      throw new Error('Browser storage is unavailable. Enable local storage to sign in.');
    }
    setToken(session.token);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setAuthError('');
  };

  return (
    <AdminAuthContext.Provider value={{ token, user, loading, authError, isAuthenticated: Boolean(token && user?.role === 'admin'), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
}