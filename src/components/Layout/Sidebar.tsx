import { useState } from 'react';
import { Menu, Layout, Typography } from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { MenuProps } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

// 菜单配置
const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据概览',
  },
  {
    key: '/products',
    icon: <ShopOutlined />,
    label: '商品管理',
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: '订单管理',
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '数据统计',
  },
  {
    key: '/configuration',
    icon: <ToolOutlined />,
    label: '系统配置',
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = String(key);
    if (path === '/logout') {
      logout();
      navigate('/login');
      return;
    }

    setSelectedKeys([path]);
    navigate(path);
  };

  // 查找匹配的菜单项
  const matchedItem = menuItems.find((item) =>
    location.pathname.startsWith(String(item.key))
  );

  return (
    <Sider
      width={250}
      theme="dark"
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 0 }}
    >
      <div className="logo-container" style={{ padding: '24px 16px', textAlign: 'center' }}>
        {collapsed ? (
          <Text strong style={{ color: 'white', fontSize: '18px' }}>
            服装管理
          </Text>
        ) : (
          <Text strong style={{ color: 'white', fontSize: '18px' }}>
            服装管理后台系统
          </Text>
        )}
      </div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={matchedItem ? [String(matchedItem.key)] : selectedKeys}
        onClick={handleMenuClick}
        items={[
          ...menuItems,
          {
            type: 'divider',
            key: 'divider',
          },
          {
            key: '/logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            style: { color: '#ff4d4f' },
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
