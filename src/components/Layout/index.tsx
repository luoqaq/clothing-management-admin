import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderComponent from './Header';
import { useAuth } from '../../hooks/useAuth';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  // 如果未认证，不显示布局（路由已处理跳转）
  if (!isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <HeaderComponent collapsed={collapsed} onToggle={toggleSidebar} />
        <Content
          style={{
            margin: '84px 16px 24px',
            padding: '24px',
            minHeight: 280,
            background: '#f0f2f5',
            borderRadius: '8px',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
