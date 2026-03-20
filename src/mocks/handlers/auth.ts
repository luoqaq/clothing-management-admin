import { http, HttpResponse } from 'msw';
import type { LoginCredentials, User } from '../../types';
import { mockUser } from '../data/mockData';

export const authHandlers = [
  // 登录
  http.post('/api/auth/login', async ({ request }) => {
    const credentials: LoginCredentials = await request.json();

    // 简单的验证：用户名 admin，密码 password
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          token: 'fake-jwt-token-' + Date.now(),
        },
      });
    }

    return HttpResponse.json({
      success: false,
      message: '用户名或密码错误',
    });
  }),

  // 登出
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      data: null,
    });
  }),

  // 获取当前用户信息
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // 修改密码
  http.post('/api/auth/change-password', async () => {
    return HttpResponse.json({
      success: true,
      message: '密码修改成功',
    });
  }),
];
