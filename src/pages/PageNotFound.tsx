import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。"
      extra={[
        <Button type="primary" key="back" onClick={handleGoBack}>
          返回上一页
        </Button>,
        <Button key="home" onClick={handleGoHome}>
          返回首页
        </Button>,
      ]}
    />
  );
};

export default PageNotFound;
