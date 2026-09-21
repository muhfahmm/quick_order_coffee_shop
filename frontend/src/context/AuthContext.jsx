import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('coffee_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const { user: userData, token } = response.data.data;

      setUser(userData);
      localStorage.setItem('coffee_admin_user', JSON.stringify(userData));
      localStorage.setItem('coffee_admin_token', token);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Username atau password salah.';
      return { success: false, message: msg };
    }
  };

  const register = async (data) => {
    try {
      const response = await authService.register({
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role || 'admin'
      });
      const { user: userData, token } = response.data.data;

      setUser(userData);
      localStorage.setItem('coffee_admin_user', JSON.stringify(userData));
      localStorage.setItem('coffee_admin_token', token);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendaftarkan akun baru ke database.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('coffee_admin_user');
      localStorage.removeItem('coffee_admin_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
