import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth.js';

const AuthContext = createContext(null);

function readToken() {
  try {
    return window.localStorage.getItem('token');
  } catch {
    return null;
  }
}

function saveToken(token) {
  try {
    window.localStorage.setItem('token', token);
  } catch {
    throw new Error('Browser storage is unavailable. Enable local storage to sign in.');
  }
}

function clearStoredToken() {
  try {
    window.localStorage.removeItem('token');
  } catch {
    // The in-memory session can still be cleared when storage is unavailable.
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    const handleUnauthorized = () => {
      clearStoredToken();
      setToken(null);
      setUser(null);
    };

    window.addEventListener('customer:unauthorized', handleUnauthorized);
    if (!token) {
      setLoading(false);
      return () => {
        isCurrent = false;
        window.removeEventListener('customer:unauthorized', handleUnauthorized);
      };
    }

    authService.getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) setUser(currentUser);
      })
      .catch((error) => {
        if (!isCurrent) return;
        setUser(null);
        if (error.response?.status === 401) {
          clearStoredToken();
          setToken(null);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
      window.removeEventListener('customer:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const session = await authService.login(credentials);
    saveToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  };

  const register = async (details) => {
    const session = await authService.register(details);
    saveToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token && user), loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}