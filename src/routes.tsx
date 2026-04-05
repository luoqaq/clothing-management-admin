import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/Layout';
import LoginPage from './pages/Login';
import ProtectedRoute from './components/Common/ProtectedRoute';
import PageNotFound from './pages/PageNotFound';

// 懒加载组件
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProductList = React.lazy(() => import('./pages/Products/List'));
const ProductImportPage = React.lazy(() => import('./pages/Products/Import'));
const OrderList = React.lazy(() => import('./pages/Orders/List'));
const ScanOrderPage = React.lazy(() => import('./pages/Orders/ScanOrder'));
const StatisticsPage = React.lazy(() => import('./pages/Statistics'));
const ConfigurationPage = React.lazy(() => import('./pages/Configuration'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductList />,
          },
          {
            path: 'import',
            element: <ProductImportPage />,
          },
          {
            path: 'detail/:id',
            element: <div>商品详情</div>,
          },
          {
            path: 'create',
            element: <div>新增商品</div>,
          },
          {
            path: 'edit/:id',
            element: <div>编辑商品</div>,
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrderList />,
          },
          {
            path: 'detail/:id',
            element: <div>订单详情</div>,
          },
          {
            path: 'create',
            element: <div>新建订单</div>,
          },
          {
            path: 'scan',
            element: <ScanOrderPage />,
          },
          {
            path: 'edit/:id',
            element: <div>编辑订单</div>,
          },
        ],
      },
      {
        path: 'statistics',
        element: <StatisticsPage />,
      },
      {
        path: 'configuration',
        element: <ConfigurationPage />,
      },
    ],
  },
  {
    path: '/404',
    element: <PageNotFound />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
