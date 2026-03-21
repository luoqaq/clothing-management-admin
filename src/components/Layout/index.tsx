import { useEffect, useState } from 'react';
import { Grid, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderComponent from './Header';
import { useAuth } from '../../hooks/useAuth';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const { isAuthenticated } = useAuth();
  const screens = useBreakpoint();

  // 如果未认证，不显示布局（路由已处理跳转）
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    if (screens.md === false) {
      setCollapsed(true);
    }
  }, [screens.md]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="app-shell">
      <div className="app-shell__glow app-shell__glow--left" />
      <div className="app-shell__glow app-shell__glow--right" />
      <Sidebar collapsed={collapsed} />
      <Layout
        className={`app-main ${collapsed ? 'app-main--collapsed' : ''}`}
        style={{ marginLeft: collapsed ? 92 : 296 }}
      >
        <HeaderComponent
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onHeightChange={(height) => setHeaderHeight(Math.ceil(height))}
        />
        <Content
          className="app-content"
          style={{ marginTop: headerHeight + 40 }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
