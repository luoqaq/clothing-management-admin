import { api } from './index';
import type { Order, PaginatedResponse, OrderFilters, OrderStatus } from '../types';

export const ordersApi = {
  // 获取订单列表
  getOrders: async (params?: { page?: number; pageSize?: number; filters?: OrderFilters }) => {
    const query = {
      page: params?.page,
      pageSize: params?.pageSize,
      ...(params?.filters || {}),
    };
    return api.get<PaginatedResponse<Order>>('/orders', { params: query });
  },

  // 获取订单详情
  getOrder: async (id: number) => {
    return api.get<Order>(`/orders/${id}`);
  },

  // 创建订单
  createOrder: async (data: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
    return api.post<Order>('/orders', data);
  },

  // 更新订单状态
  updateOrderStatus: async (id: number, status: OrderStatus) => {
    return api.patch<Order>(`/orders/${id}/status`, { status });
  },

  // 发货
  shipOrder: async (id: number, shippingInfo: { trackingNumber?: string; shippingCompany?: string }) => {
    return api.post<Order>(`/orders/${id}/ship`, shippingInfo);
  },

  // 取消订单
  cancelOrder: async (id: number, reason?: string) => {
    return api.post<Order>(`/orders/${id}/cancel`, { reason });
  },

  // 退款
  refundOrder: async (id: number, data: { amount: number; reason?: string }) => {
    return api.post<Order>(`/orders/${id}/refund`, data);
  },

  // 导出订单
  exportOrders: async (filters?: OrderFilters) => {
    return api.get('/orders/export', { params: filters, responseType: 'blob' });
  },
};
