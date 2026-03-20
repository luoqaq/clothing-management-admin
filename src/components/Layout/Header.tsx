import { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Dropdown, Space, Button, Badge } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, BellOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>(
    dayjs().format('YYYY年MM月DD日 HH:mm:ss')
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY年MM月DD日 HH:mm:ss'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 用户菜单
  const userMenuItems = [
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
  ];

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
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
        position: 'fixed',
        top: 0,
        right: 0,
        left: collapsed ? 80 : 250,
        zIndex: 1000,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          {collapsed ? '控制面板' : '数据概览'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Text type="secondary">{currentTime}</Text>
        <Badge count={3} size="small">
          <Dropdown
            menu={{
              items: notificationMenuItems,
              onClick: ({ key }) => console.log('Notification click:', key),
            }}
          >
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: '18px' }} />
          </Dropdown>
        </Badge>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => console.log('User menu click:', key),
          }}
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size={36}
              src={user?.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            {!collapsed && (
              <Text strong style={{ fontSize: '14px' }}>
                {user?.name}
              </Text>
            )}
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderComponent;
