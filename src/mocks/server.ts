import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { productsHandlers } from './handlers/products';
import { ordersHandlers } from './handlers/orders';
import { statisticsHandlers } from './handlers/statistics';

// 合并所有 handlers
export const handlers = [
  ...authHandlers,
  ...productsHandlers,
  ...ordersHandlers,
  ...statisticsHandlers,
];

// 创建服务 worker
export const worker = setupWorker(...handlers);
