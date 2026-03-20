import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { statisticsApi } from '../../api/statistics';
import type { RootState } from '../../store';
import type { StatisticsState, DailySalesData, ProductSalesRanking, CategorySalesData, BrandSalesData, RegionSalesData } from '../../types';
import dayjs from 'dayjs';

// 初始状态
const initialState: StatisticsState = {
  salesData: [],
  productRankings: [],
  categorySales: [],
  brandSales: [],
  regionSales: [],
  summary: null,
  loading: false,
  error: null,
  dateRange: {
    start: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
};

// 获取销售概览
export const fetchSalesOverview = createAsyncThunk(
  'statistics/fetchSalesOverview',
  async (
    params: { start?: string; end?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getSalesOverview(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取销售概览失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取每日销售数据
export const fetchDailySalesData = createAsyncThunk(
  'statistics/fetchDailySalesData',
  async (
    params: { start: string; end: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getDailySales(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取每日销售数据失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取商品销售排名
export const fetchProductRankings = createAsyncThunk(
  'statistics/fetchProductRankings',
  async (
    params: { dateRange?: { start: string; end: string }; limit?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getProductRankings(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取商品销售排名失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取类别销售数据
export const fetchCategorySales = createAsyncThunk(
  'statistics/fetchCategorySales',
  async (
    params: { start?: string; end?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getCategorySales(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取类别销售数据失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取品牌销售数据
export const fetchBrandSales = createAsyncThunk(
  'statistics/fetchBrandSales',
  async (
    params: { start?: string; end?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getBrandSales(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取品牌销售数据失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 获取区域销售数据
export const fetchRegionSales = createAsyncThunk(
  'statistics/fetchRegionSales',
  async (
    params: { start?: string; end?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await statisticsApi.getRegionSales(params);

      if (response.success && response.data) {
        return response.data;
      }

      return rejectWithValue(response.message || '获取区域销售数据失败');
    } catch (error) {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

// 统计状态切片
const statisticsSlice = createSlice({
  name: 'statistics',
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

    // 设置日期范围
    setDateRange: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
    },

    // 清除统计数据
    clearStatistics: (state) => {
      state.salesData = [];
      state.productRankings = [];
      state.categorySales = [];
      state.brandSales = [];
      state.regionSales = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    // 获取销售概览
    builder
      .addCase(fetchSalesOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchSalesOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取每日销售数据
    builder
      .addCase(fetchDailySalesData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailySalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesData = action.payload;
        state.error = null;
      })
      .addCase(fetchDailySalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取商品销售排名
    builder
      .addCase(fetchProductRankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductRankings.fulfilled, (state, action) => {
        state.loading = false;
        state.productRankings = action.payload;
        state.error = null;
      })
      .addCase(fetchProductRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取类别销售数据
    builder
      .addCase(fetchCategorySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorySales.fulfilled, (state, action) => {
        state.loading = false;
        state.categorySales = action.payload;
        state.error = null;
      })
      .addCase(fetchCategorySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取品牌销售数据
    builder
      .addCase(fetchBrandSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandSales.fulfilled, (state, action) => {
        state.loading = false;
        state.brandSales = action.payload;
        state.error = null;
      })
      .addCase(fetchBrandSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取区域销售数据
    builder
      .addCase(fetchRegionSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegionSales.fulfilled, (state, action) => {
        state.loading = false;
        state.regionSales = action.payload;
        state.error = null;
      })
      .addCase(fetchRegionSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 actions
export const { setLoading, setError, setDateRange, clearStatistics } = statisticsSlice.actions;

// 选择器
export const selectSalesData = (state: RootState) => state.statistics.salesData;
export const selectProductRankings = (state: RootState) => state.statistics.productRankings;
export const selectCategorySales = (state: RootState) => state.statistics.categorySales;
export const selectBrandSales = (state: RootState) => state.statistics.brandSales;
export const selectRegionSales = (state: RootState) => state.statistics.regionSales;
export const selectSalesSummary = (state: RootState) => state.statistics.summary;
export const selectStatisticsLoading = (state: RootState) => state.statistics.loading;
export const selectStatisticsError = (state: RootState) => state.statistics.error;
export const selectDateRange = (state: RootState) => state.statistics.dateRange;

export default statisticsSlice.reducer;
