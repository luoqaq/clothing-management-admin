import { useState } from 'react';
import { Menu, Layout, Typography } from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  DashboardOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;
const BRAND_NAME = 'chuchu的橱窗';
const BRAND_LOGO = 'https://product-image-1256374350.cos.ap-shanghai.myqcloud.com/assets/logo.png';
const BRAND_NOTE = 'Curated showroom admin';

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
  compact?: boolean;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, compact = false, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([location.pathname]);
  const isCollapsedView = !compact && collapsed;

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = String(key);
    setSelectedKeys([path]);
    navigate(path);
    onNavigate?.();
  };

  // 查找匹配的菜单项
  const matchedItem = menuItems.find((item) =>
    location.pathname.startsWith(String(item.key))
  );

  return (
    <Sider
      width={compact ? 288 : 272}
      theme="light"
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={compact ? 0 : 92}
      className={`app-sider ${collapsed ? 'app-sider--collapsed' : ''} ${compact ? 'app-sider--compact' : ''} ${compact && !collapsed ? 'app-sider--open' : ''}`}
    >
      <div
        className={`brand-panel ${isCollapsedView ? 'brand-panel--collapsed' : ''}`}
      >
        <img
          src={BRAND_LOGO}
          alt={BRAND_NAME}
          className="brand-panel__logo"
        />
        {!isCollapsedView && (
          <div className="brand-panel__copy">
            <Text strong className="brand-panel__title">
              {BRAND_NAME}
            </Text>
            <Text className="brand-panel__note">{BRAND_NOTE}</Text>
          </div>
        )}
      </div>
      <Menu
        className="app-menu"
        mode="inline"
        theme="light"
        selectedKeys={matchedItem ? [String(matchedItem.key)] : selectedKeys}
        onClick={handleMenuClick}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
