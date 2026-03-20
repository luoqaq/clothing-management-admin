import { api } from './index';
import type {
  DailySalesData,
  ProductSalesRanking,
  CategorySalesData,
  BrandSalesData,
  RegionSalesData,
  StatisticsState,
} from '../types';

export const statisticsApi = {
  // 获取销售概览
  getSalesOverview: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<StatisticsState['summary']>('/statistics/overview', { params: dateRange });
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
    return api.get<ProductSalesRanking[]>('/statistics/product-rankings', { params: query });
  },

  // 获取类别销售数据
  getCategorySales: async (dateRange?: { start?: string; end?: string }) => {
    return api.get<CategorySalesData[]>('/statistics/category-sales', { params: dateRange });
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
