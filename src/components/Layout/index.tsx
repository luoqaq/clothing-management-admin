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
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const screens = useBreakpoint();
  const isCompact = screens.lg === false;

  // 如果未认证，不显示布局（路由已处理跳转）
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    if (isCompact) {
      setCollapsed(true);
    }
  }, [isCompact]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const closeSidebar = () => {
    if (isCompact) {
      setCollapsed(true);
    }
  };

  return (
    <Layout className="app-shell">
      <div className="app-shell__glow app-shell__glow--left" />
      <div className="app-shell__glow app-shell__glow--right" />
      {isCompact && !collapsed ? <button type="button" className="app-shell__backdrop" aria-label="关闭导航" onClick={closeSidebar} /> : null}
      <Sidebar collapsed={collapsed} compact={isCompact} onNavigate={closeSidebar} />
      <Layout
        className={`app-main ${collapsed ? 'app-main--collapsed' : ''}`}
        style={{ marginLeft: isCompact ? 0 : collapsed ? 92 : 296 }}
      >
        <HeaderComponent
          collapsed={collapsed}
          compact={isCompact}
          headerCollapsed={headerCollapsed}
          onHeaderToggle={() => setHeaderCollapsed((value) => !value)}
          onToggle={toggleSidebar}
          onHeightChange={(height) => setHeaderHeight(Math.ceil(height))}
        />
        <Content
          className="app-content"
          style={{ marginTop: headerHeight + (isCompact ? 24 : 40) }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
