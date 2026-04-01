import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;
const BRAND_NAME = 'chuchu的橱窗';
const BRAND_LOGO = 'https://product-image-1256374350.cos.ap-shanghai.myqcloud.com/assets/logo.png';
const BRAND_POINTS = [
  '登录后即可查看商品、订单和每日经营概览。',
  '管理员可以维护销售账号、系统配置和商品主数据。',
  '销售账号只会看到自己需要使用的工作区内容。',
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const [form] = Form.useForm();

  // 检查是否已登录
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // 清除之前的错误
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    const result = await login(values);

    if (result) {
      message.success('登录成功');
    } else {
      // 错误会在 auth slice 中处理，这里不需要额外处理
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__glow login-page__glow--left" />
      <div className="login-page__glow login-page__glow--right" />
      <div className="login-page__shell">
        <section className="login-page__intro">
          <Text className="login-page__eyebrow">Account Access</Text>
          <Title className="login-page__title">
            欢迎回来
            <br />
            登录 {BRAND_NAME} 工作台
          </Title>
          <Text className="login-page__description">
            输入你的账号和密码后，就可以继续处理商品、订单和日常经营事务。
          </Text>
          <div className="login-page__point-list">
            {BRAND_POINTS.map((point) => (
              <div key={point} className="login-page__point">
                <CheckCircleFilled className="login-page__point-icon" />
                <Text className="login-page__point-text">{point}</Text>
              </div>
            ))}
          </div>
        </section>

        <Card className="login-card">
          <div className="login-card__brand">
            <img
              src={BRAND_LOGO}
              alt={BRAND_NAME}
              className="login-card__logo"
            />
            <div>
              <Text className="login-card__label">Welcome back</Text>
              <Title level={3} className="login-card__title">
                {BRAND_NAME}
              </Title>
            </div>
          </div>
          <Text className="login-card__subtitle">请输入账号信息，进入你的工作台。</Text>

          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              className="login-card__alert"
              closable
              onClose={clearError}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
            className="login-card__form"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                className="login-card__submit"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-card__footer">
            <Text className="login-card__footer-text">
              © 2024 {BRAND_NAME}. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
