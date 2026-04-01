import { api } from './index';
import type {
  CostProductRankingItem,
  CostOverviewResponse,
  CustomerAnalysisResponse,
  DailySalesData,
  ProductSalesRanking,
  CategorySalesData,
  BrandSalesData,
  RegionSalesData,
  SalesOverviewResponse,
} from '../types';

export const statisticsApi = {
  // 获取销售概览
  getSalesOverview: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<SalesOverviewResponse>('/statistics/sales/overview', { params: dateRange });
  },

  // 获取每日销售数据
  getDailySales: async (dateRange: { start: string; end: string }) => {
    return api.get<DailySalesData[]>('/statistics/daily-sales', { params: dateRange });
  },

  // 获取商品销售排名
  getProductRankings: async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => {
    const query = {
      start: params?.dateRange?.start,
      end: params?.dateRange?.end,
      limit: params?.limit,
    };
    return api.get<ProductSalesRanking[]>('/statistics/sales/product-ranking', { params: query });
  },

  // 获取类别销售数据
  getCategorySales: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<CategorySalesData[]>('/statistics/sales/category-analysis', { params: dateRange });
  },

  getCustomerAnalysis: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<CustomerAnalysisResponse>('/statistics/sales/customer-analysis', { params: dateRange });
  },

  getGrossProfitAnalysis: async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => {
    const query = {
      start: params?.dateRange?.start,
      end: params?.dateRange?.end,
      limit: params?.limit,
    };
    return api.get<ProductSalesRanking[]>('/statistics/sales/gross-profit-analysis', { params: query });
  },

  getCostOverview: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<CostOverviewResponse>('/statistics/cost/overview', { params: dateRange });
  },

  getCostCategoryAnalysis: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<CategorySalesData[]>('/statistics/cost/category-analysis', { params: dateRange });
  },

  getCostProductRanking: async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => {
    const query = {
      start: params?.dateRange?.start,
      end: params?.dateRange?.end,
      limit: params?.limit,
    };
    return api.get<CostProductRankingItem[]>('/statistics/cost/product-ranking', { params: query });
  },

  // 获取品牌销售数据
  getBrandSales: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<BrandSalesData[]>('/statistics/brand-sales', { params: dateRange });
  },

  // 获取区域销售数据
  getRegionSales: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<RegionSalesData[]>('/statistics/region-sales', { params: dateRange });
  },

  // 导出统计数据
  exportStatistics: async (dateRange: { start: string; end: string }, type: string) => {
    return api.get('/statistics/export', {
      params: { ...dateRange, type },
      responseType: 'blob',
    });
  },
};
