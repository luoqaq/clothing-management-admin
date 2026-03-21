import { api } from './index';
import type { Order, PaginatedResponse, OrderFilters, OrderStatus } from '../types';
import { normalizeOrder } from '../utils/normalize';

export const ordersApi = {
  // 获取订单列表
  getOrders: async (params?: { page?: number; pageSize?: number; filters?: OrderFilters }) => {
    const query = {
      page: params?.page,
      pageSize: params?.pageSize,
      ...(params?.filters || {}),
    };
    const response = await api.get<PaginatedResponse<Order>>('/orders', { params: query });

    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(normalizeOrder),
        },
      };
    }

    return response;
  },

  // 获取订单详情
  getOrder: async (id: number) => {
    const response = await api.get<Order>(`/orders/${id}`);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 创建订单
  createOrder: async (data: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Order>('/orders', data);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 更新订单状态
  updateOrderStatus: async (id: number, status: OrderStatus) => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 发货
  shipOrder: async (id: number, shippingInfo: { trackingNumber: string; shippingCompany: string }) => {
    const response = await api.post<Order>(`/orders/${id}/ship`, shippingInfo);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 取消订单
  cancelOrder: async (id: number, reason?: string) => {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 退款
  refundOrder: async (id: number, data: { amount: number; reason?: string }) => {
    const response = await api.post<Order>(`/orders/${id}/refund`, data);

    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeOrder(response.data),
      };
    }

    return response;
  },

  // 导出订单
  exportOrders: async (filters?: OrderFilters) => {
    return api.get('/orders/export', { params: filters, responseType: 'blob' });
  },
};
