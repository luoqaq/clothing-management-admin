import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Layout, Typography, Avatar, Dropdown, Space, Button, Badge } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { Header } = Layout;
const { Text } = Typography;
const BRAND_NAME = 'chuchu的橱窗';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: '数据总览',
    subtitle: '以更克制的方式查看今天的经营节奏与趋势变化。',
  },
  '/products': {
    title: '商品管理',
    subtitle: '管理上架商品、库存与展示素材。',
  },
  '/orders': {
    title: '订单管理',
    subtitle: '记录门店订单、收款状态与售后处理。',
  },
  '/statistics': {
    title: '经营分析',
    subtitle: '用轻量图表查看销售、品类和区域变化。',
  },
  '/configuration': {
    title: '系统配置',
    subtitle: '统一管理品牌信息、基础配置与展示规则。',
  },
};

interface HeaderProps {
  collapsed: boolean;
  compact?: boolean;
  onToggle: () => void;
  onHeightChange?: (height: number) => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ collapsed, compact = false, onToggle, onHeightChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLElement | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(
    dayjs().format('YYYY年MM月DD日 HH:mm:ss')
  );
  const pageMeta = Object.entries(PAGE_META).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? {
    title: 'chuchu的橱窗',
    subtitle: '保持界面克制，把注意力留给关键决策。',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY年MM月DD日 HH:mm:ss'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const element = headerRef.current;
    if (!element || !onHeightChange) return;

    const updateHeight = () => {
      onHeightChange(element.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [collapsed, location.pathname, onHeightChange]);

  // 用户菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    console.log('User menu click:', key);
  };

  // 通知菜单
  const notificationMenuItems = [
    {
      key: '1',
      label: '您有新的订单需要处理',
    },
    {
      key: '2',
      label: '商品库存不足提醒',
    },
    {
      key: '3',
      label: '系统将于今晚进行维护',
    },
  ];

  return (
    <Header
      ref={headerRef}
      className="app-header"
      style={{ left: compact ? 20 : collapsed ? 92 : 296 }}
    >
      <div className="app-header__primary">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="app-header__toggle"
        />
        <div className="app-header__title-group">
          <Text className="app-header__eyebrow">{BRAND_NAME}</Text>
          <div className="app-header__title-row">
            <Text className="app-header__title">{pageMeta.title}</Text>
            {(!collapsed || compact) && <Text className="app-header__subtitle">{pageMeta.subtitle}</Text>}
          </div>
        </div>
      </div>

      <div className="app-header__actions">
        <div className="app-header__time-pill">
          <Text className="app-header__time-label">Today</Text>
          <Text className="app-header__time-value">{currentTime}</Text>
        </div>
        <Badge count={3} size="small">
          <Dropdown
            menu={{
              items: notificationMenuItems,
              onClick: ({ key }) => console.log('Notification click:', key),
            }}
          >
            <Button type="text" icon={<BellOutlined />} className="app-header__icon-button" />
          </Dropdown>
        </Badge>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
        >
          <Space className="app-header__profile">
            <Avatar
              size={36}
              src={user?.avatar}
              icon={<UserOutlined />}
              className="app-header__avatar"
            />
            <div className="app-header__profile-copy">
              {(!collapsed || compact) && <Text className="app-header__profile-name">{user?.name}</Text>}
              {(!collapsed || compact) && <Text className="app-header__profile-role">{user?.role}</Text>}
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderComponent;
