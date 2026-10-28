import { useState } from 'react';
import api from '../services/api';
import { AuthResponse, LoginDto, RegisterDto, User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (dto: LoginDto): Promise<void> => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (dto: RegisterDto): Promise<void> => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, register, logout, isAuthenticated: !!user };
};
