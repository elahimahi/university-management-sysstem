import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (token) {
      fetchMe(token);
      if (storedRole) setRole(storedRole);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch /auth/me
  const fetchMe = async (token) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setRole(res.data.user.role);
      localStorage.setItem('role', res.data.user.role);
      setLoading(false);
    } catch (err) {
      setUser(null);
      setRole(null);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setRole(res.data.user.role);
    localStorage.setItem('role', res.data.user.role);
    await fetchMe(res.data.token);
  };

  // Register
  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setRole(res.data.user.role);
    localStorage.setItem('role', res.data.user.role);
    await fetchMe(res.data.token);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
