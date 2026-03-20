import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  fetchSalesOverview,
  fetchDailySalesData,
  fetchProductRankings,
  fetchCategorySales,
  fetchRegionSales,
  setDateRange,
  clearStatistics,
  selectSalesData,
  selectProductRankings,
  selectCategorySales,
  selectRegionSales,
  selectSalesSummary,
  selectStatisticsLoading,
  selectStatisticsError,
  selectDateRange,
} from '../features/statistics/statisticsSlice';
import type { DailySalesData, ProductSalesRanking, CategorySalesData, RegionSalesData } from '../types';

export const useStatistics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const salesData = useSelector(selectSalesData);
  const productRankings = useSelector(selectProductRankings);
  const categorySales = useSelector(selectCategorySales);
  const regionSales = useSelector(selectRegionSales);
  const salesSummary = useSelector(selectSalesSummary);
  const loading = useSelector(selectStatisticsLoading);
  const error = useSelector(selectStatisticsError);
  const dateRange = useSelector(selectDateRange);

  // 获取销售概览
  const getSalesOverview = async (params?: { start?: string; end?: string }) => {
    try {
      const result = await dispatch(fetchSalesOverview(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取每日销售数据
  const getDailySalesData = async (params: { start: string; end: string }) => {
    try {
      const result = await dispatch(fetchDailySalesData(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取商品销售排名
  const getProductRankings = async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => {
    try {
      const result = await dispatch(fetchProductRankings(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取类别销售数据
  const getCategorySales = async (params?: { start?: string; end?: string }) => {
    try {
      const result = await dispatch(fetchCategorySales(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 获取区域销售数据
  const getRegionSales = async (params?: { start?: string; end?: string }) => {
    try {
      const result = await dispatch(fetchRegionSales(params)).unwrap();
      return result;
    } catch (err) {
      return null;
    }
  };

  // 设置日期范围
  const handleSetDateRange = (start: string, end: string) => {
    dispatch(setDateRange({ start, end }));
  };

  // 清除统计数据
  const handleClearStatistics = () => {
    dispatch(clearStatistics());
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    try {
      await Promise.all([
        dispatch(fetchSalesOverview({ start: dateRange.start, end: dateRange.end })),
        dispatch(fetchDailySalesData({ start: dateRange.start, end: dateRange.end })),
        dispatch(fetchProductRankings({
          dateRange: { start: dateRange.start, end: dateRange.end },
          limit: 10,
        })),
        dispatch(fetchCategorySales({ start: dateRange.start, end: dateRange.end })),
        dispatch(fetchRegionSales({ start: dateRange.start, end: dateRange.end })),
      ]);
    } catch (err) {
      console.error('Failed to refresh statistics:', err);
    }
  };

  return {
    salesData,
    productRankings,
    categorySales,
    regionSales,
    salesSummary,
    loading,
    error,
    dateRange,
    getSalesOverview,
    getDailySalesData,
    getProductRankings,
    getCategorySales,
    getRegionSales,
    setDateRange: handleSetDateRange,
    clearStatistics: handleClearStatistics,
    refreshAllData,
  };
};
