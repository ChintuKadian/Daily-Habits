import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error(error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
