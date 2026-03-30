import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 提升 chunk 大小警告阈值为 1000kB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手动控制代码分割策略
        manualChunks: (id) => {
          // React 核心库打包在一起
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')) {
            return 'vendor-react';
          }
          
          // Redux 相关
          if (id.includes('node_modules/@reduxjs') || 
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/redux')) {
            return 'vendor-redux';
          }
          
          // Ant Design 及其图标
          if (id.includes('node_modules/antd') || 
              id.includes('node_modules/@ant-design') ||
              id.includes('node_modules/rc-')) {
            return 'vendor-antd';
          }
          
          // ECharts 单独打包（核心 + 图表组件）
          if (id.includes('node_modules/echarts')) {
            return 'vendor-echarts';
          }
          
          // 其他第三方库
          if (id.includes('node_modules/dayjs') ||
              id.includes('node_modules/axios') ||
              id.includes('node_modules/zod') ||
              id.includes('node_modules/@hookform')) {
            return 'vendor-utils';
          }
          
          // 业务代码中的统计相关模块单独打包
          if (id.includes('/features/statistics/') || 
              id.includes('/hooks/useStatistics') ||
              id.includes('/api/statistics')) {
            return 'statistics';
          }
          
          // 商品相关模块
          if (id.includes('/features/products/') || 
              id.includes('/hooks/useProducts') ||
              id.includes('/api/products')) {
            return 'products';
          }
          
          // 订单相关模块
          if (id.includes('/features/orders/') || 
              id.includes('/hooks/useOrders') ||
              id.includes('/api/orders')) {
            return 'orders';
          }
        },
        // 优化 chunk 文件命名
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          // vendor 包使用固定的前缀便于识别
          if (name?.startsWith('vendor-')) {
            return `assets/${name}-[hash].js`;
          }
          // 业务模块
          if (['statistics', 'products', 'orders'].includes(name || '')) {
            return `assets/module-${name}-[hash].js`;
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          if (info.endsWith('.css')) {
            return 'assets/styles/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
  },
});
