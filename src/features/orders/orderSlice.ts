import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../../api/orders';
import type { RootState } from '../../store';
import type { OrderState, Order, OrderFilters, OrderStatus } from '../../types';
import { getErrorMessage } from '../../utils/error';

// 初始状态
const initialState: OrderState = {
  items: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {},
};

// 获取订单列表
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; pageSize?: number; filters?: OrderFilters } | undefined, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrders(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取订单列表失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '获取订单列表失败'));
    }
  }
);

// 获取订单详情
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrder(id);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取订单详情失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '获取订单详情失败'));
    }
  }
);

// 创建订单
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await ordersApi.createOrder(data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '创建订单失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '创建订单失败'));
    }
  }
);

// 更新订单状态
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: number; status: OrderStatus }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updateOrderStatus(id, status);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '更新订单状态失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '更新订单状态失败'));
    }
  }
);

// 发货
export const shipOrder = createAsyncThunk(
  'orders/shipOrder',
  async (
    { id, shippingInfo }: { id: number; shippingInfo: { trackingNumber: string; shippingCompany: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await ordersApi.shipOrder(id, shippingInfo);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '发货失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '发货失败'));
    }
  }
);

// 取消订单
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.cancelOrder(id, reason);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '取消订单失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '取消订单失败'));
    }
  }
);

// 退款
export const refundOrder = createAsyncThunk(
  'orders/refundOrder',
  async ({ id, data }: { id: number; data: { amount: number; reason?: string } }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.refundOrder(id, data);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '退款失败');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '退款失败'));
    }
  }
);

// 订单状态切片
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除当前订单
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // 设置搜索条件
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
    },

    // 重置搜索条件
    resetFilters: (state) => {
      state.filters = {};
    },

    // 设置分页信息
    setPagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number; total: number }>
    ) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 获取订单列表
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取订单详情
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建订单
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新订单状态
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 发货
    builder
      .addCase(shipOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shipOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(shipOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 取消订单
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 退款
    builder
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const {
  setLoading,
  setError,
  clearCurrentOrder,
  setFilters,
  resetFilters,
  setPagination,
} = orderSlice.actions;

// 选择器
export const selectOrders = (state: RootState) => state.orders.items;
export const selectCurrentOrder = (state: RootState) => state.orders.currentOrder;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectOrderPagination = (state: RootState) => state.orders.pagination;
export const selectOrderFilters = (state: RootState) => state.orders.filters;

export default orderSlice.reducer;
