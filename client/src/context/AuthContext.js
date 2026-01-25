'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const endpoint = role === 'agent' ? '/auth/agent/login' : '/auth/user/login';
      const { data } = await api.post(endpoint, { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      if (role === 'agent') router.push('/dashboard/agent');
      else router.push('/dashboard/user');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData, role) => {
    try {
      const endpoint = role === 'agent' ? '/auth/agent/register' : '/auth/user/register';
      const { data } = await api.post(endpoint, userData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      if (role === 'agent') router.push('/dashboard/agent');
      else router.push('/dashboard/user');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
