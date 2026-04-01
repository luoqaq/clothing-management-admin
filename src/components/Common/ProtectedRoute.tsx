import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { isAdminUser } from '../../utils/role';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, getCurrentUser, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 如果有 token 但用户信息未加载，获取用户信息
    if (localStorage.getItem('auth_token') && !user) {
      void getCurrentUser();
    }
  }, [getCurrentUser, user]);

  // 加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Card style={{ width: 300, textAlign: 'center', border: 'none', boxShadow: 'none' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
          />
          <div style={{ marginTop: 16, fontSize: 16 }}>正在验证身份...</div>
        </Card>
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !isAdminUser(user) && (
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/statistics') ||
    location.pathname.startsWith('/configuration') ||
    location.pathname.startsWith('/products/import') ||
    location.pathname.startsWith('/products/create') ||
    location.pathname.startsWith('/products/edit')
  )) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
