import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  shipOrder,
  cancelOrder,
  refundOrder,
  clearCurrentOrder,
  setFilters,
  resetFilters,
  selectOrders,
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError,
  selectOrderPagination,
  selectOrderFilters,
} from '../features/orders/orderSlice';
import type { Order, OrderStatus, OrderFilters } from '../types';

export const useOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const currentOrder = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const pagination = useSelector(selectOrderPagination);
  const filters = useSelector(selectOrderFilters);

  // 获取订单列表
  const getOrders = async (params?: { page?: number; pageSize?: number; filters?: OrderFilters }) => {
    try {
      const result = await dispatch(fetchOrders(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取订单详情
  const getOrderById = async (id: number) => {
    try {
      const result = await dispatch(fetchOrderById(id)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 创建订单
  const addOrder = async (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await dispatch(createOrder(order)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 更新订单状态
  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      const result = await dispatch(updateOrderStatus({ id, status })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 发货
  const handleShipOrder = async (id: number, shippingInfo: { trackingNumber?: string; shippingCompany?: string }) => {
    try {
      const result = await dispatch(shipOrder({ id, shippingInfo })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 取消订单
  const handleCancelOrder = async (id: number, reason?: string) => {
    try {
      const result = await dispatch(cancelOrder({ id, reason })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 退款
  const handleRefundOrder = async (id: number, data: { amount: number; reason?: string }) => {
    try {
      const result = await dispatch(refundOrder({ id, data })).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 清除当前订单
  const handleClearCurrentOrder = () => {
    dispatch(clearCurrentOrder());
  };

  // 设置搜索条件
  const handleSetFilters = (newFilters: OrderFilters) => {
    dispatch(setFilters(newFilters));
  };

  // 重置搜索条件
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    filters,
    getOrders,
    getOrderById,
    addOrder,
    updateOrderStatus: handleUpdateStatus,
    shipOrder: handleShipOrder,
    cancelOrder: handleCancelOrder,
    refundOrder: handleRefundOrder,
    clearCurrentOrder: handleClearCurrentOrder,
    setFilters: handleSetFilters,
    resetFilters: handleResetFilters,
  };
};
