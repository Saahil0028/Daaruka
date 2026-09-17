import { api } from './api';
import { User, AuthResponse } from '../types/auth';

export const authService = {
  async register(name: string, email: string, password: string): Promise<User> {
    const res = await api.post<User>('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('darukaa_token', res.data.access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    localStorage.setItem('darukaa_user', JSON.stringify(res.data));
    return res.data;
  },

  async seedDemoData(): Promise<any> {
    const res = await api.post('/seed');
    return res.data;
  },

  logout() {
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
  }
};
