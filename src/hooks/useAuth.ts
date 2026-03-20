import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { login, logout, getCurrentUser, clearError, selectCurrentUser, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../features/auth/authSlice';
import type { LoginCredentials, User } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // 登录
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 登出
  const handleLogout = () => {
    dispatch(logout());
  };

  // 获取当前用户信息
  const handleGetCurrentUser = async () => {
    try {
      const result = await dispatch(getCurrentUser()).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 清除错误
  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    getCurrentUser: handleGetCurrentUser,
    clearError: handleClearError,
  };
};
