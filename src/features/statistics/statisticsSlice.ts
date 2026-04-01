import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { statisticsApi } from '../../api/statistics';
import type { RootState } from '../../store';
import type {
  CategorySalesData,
  CostProductRankingItem,
  CostOverviewResponse,
  CustomerAnalysisResponse,
  DailySalesData,
  ProductSalesRanking,
  SalesOverviewResponse,
  StatisticsState,
} from '../../types';

const initialState: StatisticsState = {
  salesData: [],
  salesProductRanking: [],
  grossProfitAnalysis: [],
  salesCategoryAnalysis: [],
  customerAnalysis: null,
  costOverview: null,
  costCategoryAnalysis: [],
  costProductRanking: [],
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

export const fetchSalesOverview = createAsyncThunk<SalesOverviewResponse, { start?: string; end?: string } | undefined, { rejectValue: string }>(
  'statistics/fetchSalesOverview',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getSalesOverview(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取销售概览失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchDailySalesData = createAsyncThunk<DailySalesData[], { start: string; end: string }, { rejectValue: string }>(
  'statistics/fetchDailySalesData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getDailySales(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取销售趋势失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchSalesProductRanking = createAsyncThunk<ProductSalesRanking[], { dateRange?: { start: string; end: string }; limit?: number } | undefined, { rejectValue: string }>(
  'statistics/fetchSalesProductRanking',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getProductRankings(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取商品销售排行失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchSalesCategoryAnalysis = createAsyncThunk<CategorySalesData[], { start?: string; end?: string } | undefined, { rejectValue: string }>(
  'statistics/fetchSalesCategoryAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getCategorySales(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取商品类别销售情况失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchCustomerAnalysis = createAsyncThunk<CustomerAnalysisResponse, { start?: string; end?: string } | undefined, { rejectValue: string }>(
  'statistics/fetchCustomerAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getCustomerAnalysis(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取客户分析失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchGrossProfitAnalysis = createAsyncThunk<ProductSalesRanking[], { dateRange?: { start: string; end: string }; limit?: number } | undefined, { rejectValue: string }>(
  'statistics/fetchGrossProfitAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getGrossProfitAnalysis(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取商品毛利分析失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchCostOverview = createAsyncThunk<CostOverviewResponse, { start?: string; end?: string } | undefined, { rejectValue: string }>(
  'statistics/fetchCostOverview',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getCostOverview(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取成本概览失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchCostCategoryAnalysis = createAsyncThunk<CategorySalesData[], { start?: string; end?: string } | undefined, { rejectValue: string }>(
  'statistics/fetchCostCategoryAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getCostCategoryAnalysis(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取分类成本分析失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

export const fetchCostProductRanking = createAsyncThunk<CostProductRankingItem[], { dateRange?: { start: string; end: string }; limit?: number } | undefined, { rejectValue: string }>(
  'statistics/fetchCostProductRanking',
  async (params, { rejectWithValue }) => {
    try {
      const response = await statisticsApi.getCostProductRanking(params);
      if (response.success && response.data) return response.data;
      return rejectWithValue(response.message || '获取商品成本排行失败');
    } catch {
      return rejectWithValue('网络错误，请稍后重试');
    }
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload;
    },
    clearStatistics: (state) => {
      state.salesData = [];
      state.salesProductRanking = [];
      state.grossProfitAnalysis = [];
      state.salesCategoryAnalysis = [];
      state.customerAnalysis = null;
      state.costOverview = null;
      state.costCategoryAnalysis = [];
      state.costProductRanking = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state: StatisticsState) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state: StatisticsState, action: any) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' ? action.payload : '加载失败';
    };

    builder
      .addCase(fetchSalesOverview.pending, setPending)
      .addCase(fetchSalesOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSalesOverview.rejected, setRejected)
      .addCase(fetchDailySalesData.pending, setPending)
      .addCase(fetchDailySalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesData = action.payload;
      })
      .addCase(fetchDailySalesData.rejected, setRejected)
      .addCase(fetchSalesProductRanking.pending, setPending)
      .addCase(fetchSalesProductRanking.fulfilled, (state, action) => {
        state.loading = false;
        state.salesProductRanking = action.payload;
      })
      .addCase(fetchSalesProductRanking.rejected, setRejected)
      .addCase(fetchSalesCategoryAnalysis.pending, setPending)
      .addCase(fetchSalesCategoryAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.salesCategoryAnalysis = action.payload;
      })
      .addCase(fetchSalesCategoryAnalysis.rejected, setRejected)
      .addCase(fetchCustomerAnalysis.pending, setPending)
      .addCase(fetchCustomerAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.customerAnalysis = action.payload;
      })
      .addCase(fetchCustomerAnalysis.rejected, setRejected)
      .addCase(fetchGrossProfitAnalysis.pending, setPending)
      .addCase(fetchGrossProfitAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.grossProfitAnalysis = action.payload;
      })
      .addCase(fetchGrossProfitAnalysis.rejected, setRejected)
      .addCase(fetchCostOverview.pending, setPending)
      .addCase(fetchCostOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.costOverview = action.payload;
      })
      .addCase(fetchCostOverview.rejected, setRejected)
      .addCase(fetchCostCategoryAnalysis.pending, setPending)
      .addCase(fetchCostCategoryAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.costCategoryAnalysis = action.payload;
      })
      .addCase(fetchCostCategoryAnalysis.rejected, setRejected)
      .addCase(fetchCostProductRanking.pending, setPending)
      .addCase(fetchCostProductRanking.fulfilled, (state, action) => {
        state.loading = false;
        state.costProductRanking = action.payload;
      })
      .addCase(fetchCostProductRanking.rejected, setRejected);
  },
});

export const { setDateRange, clearStatistics } = statisticsSlice.actions;

export const selectSalesData = (state: RootState) => state.statistics.salesData;
export const selectSalesSummary = (state: RootState) => state.statistics.summary;
export const selectCustomerAnalysis = (state: RootState) => state.statistics.customerAnalysis;
export const selectSalesCategoryAnalysis = (state: RootState) => state.statistics.salesCategoryAnalysis;
export const selectSalesProductRanking = (state: RootState) => state.statistics.salesProductRanking;
export const selectGrossProfitAnalysis = (state: RootState) => state.statistics.grossProfitAnalysis;
export const selectCostOverview = (state: RootState) => state.statistics.costOverview;
export const selectCostCategoryAnalysis = (state: RootState) => state.statistics.costCategoryAnalysis;
export const selectCostProductRanking = (state: RootState) => state.statistics.costProductRanking;
export const selectStatisticsLoading = (state: RootState) => state.statistics.loading;
export const selectStatisticsError = (state: RootState) => state.statistics.error;
export const selectDateRange = (state: RootState) => state.statistics.dateRange;

export default statisticsSlice.reducer;
