import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { store } from './store';
import { router } from './routes';
import 'antd/dist/reset.css';
import './index.css';

dayjs.locale('zh-cn');

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#8bb8d9',
            colorInfo: '#8bb8d9',
            colorSuccess: '#7ca986',
            colorWarning: '#d5a86c',
            colorError: '#b86c67',
            colorTextBase: '#2f2a24',
            colorBgBase: '#f6f0e7',
            colorBorder: '#ded1c2',
            borderRadius: 16,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          },
          components: {
            Layout: {
              bodyBg: '#f6f0e7',
              headerBg: 'rgba(252, 248, 241, 0.82)',
              siderBg: '#f4ecdf',
            },
            Card: {
              borderRadiusLG: 24,
            },
            Button: {
              borderRadius: 999,
              controlHeight: 42,
            },
            Input: {
              borderRadius: 16,
              controlHeight: 46,
            },
            Menu: {
              itemBorderRadius: 14,
              itemBg: 'transparent',
              itemColor: '#6d6255',
              itemHoverColor: '#1f4260',
              itemSelectedColor: '#1f4260',
              itemSelectedBg: '#e8f1f8',
            },
            Table: {
              headerBg: '#f7f1e8',
              headerColor: '#5d5347',
              rowHoverBg: '#f7f8fa',
            },
          },
        }}
      >
        <Suspense fallback={<div className="app-loading">Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
