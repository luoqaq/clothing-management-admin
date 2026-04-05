import { useEffect, useState } from 'react';
import { Grid, Layout, Button, Tooltip } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarcodeOutlined } from '@ant-design/icons';
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
  const location = useLocation();
  const navigate = useNavigate();
  
  // 判断是否在扫码录单页面
  const isScanOrderPage = location.pathname === '/orders/scan';

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
      
      {/* 悬浮扫码录单入口 */}
      {!isScanOrderPage && (
        <Tooltip title="扫码录单" placement="right">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<BarcodeOutlined style={{ fontSize: 24 }} />}
            onClick={() => navigate('/orders/scan')}
            style={{
              position: 'fixed',
              left: isCompact ? 24 : collapsed ? 116 : 320,
              bottom: 24,
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              transition: 'left 0.2s ease',
            }}
          />
        </Tooltip>
      )}
    </Layout>
  );
};

export default MainLayout;
