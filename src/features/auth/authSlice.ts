import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import type { RootState } from '../../store';
import type { AuthState, LoginCredentials, User } from '../../types';
import { getErrorMessage } from '../../utils/error';

// 初始状态
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
};

// 登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        // 保存 token 到 localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }

      return rejectWithValue(response.message || '登录失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '网络错误，请稍后重试'));
    }
  }
);

// 登出
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
});

// 获取当前用户信息
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return rejectWithValue(response.message || '获取用户信息失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '网络错误，请稍后重试'));
    }
  }
);

// 修改密码
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    data: { oldPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.changePassword(data);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.message || '密码修改失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '网络错误，请稍后重试'));
    }
  }
);

// 认证状态切片
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 登出
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // 获取用户信息
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      });

    // 修改密码
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 reducer 和 actions
export const { clearError } = authSlice.actions;

// 选择器
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
