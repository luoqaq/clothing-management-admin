import { api } from './index';
import type { User, LoginCredentials } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  // 登录
  login: async (credentials: LoginCredentials) => {
    return api.post<LoginResponse>('/auth/login', credentials);
  },

  // 登出
  logout: async () => {
    return api.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return api.get<User>('/auth/me');
  },

  // 修改密码
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', data);
  },
};
