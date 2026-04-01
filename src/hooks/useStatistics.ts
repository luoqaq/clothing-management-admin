import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  clearStatistics,
  fetchCostCategoryAnalysis,
  fetchCostOverview,
  fetchCostProductRanking,
  fetchCustomerAnalysis,
  fetchDailySalesData,
  fetchGrossProfitAnalysis,
  fetchSalesCategoryAnalysis,
  fetchSalesOverview,
  fetchSalesProductRanking,
  selectCostCategoryAnalysis,
  selectCostOverview,
  selectCostProductRanking,
  selectCustomerAnalysis,
  selectDateRange,
  selectGrossProfitAnalysis,
  selectSalesCategoryAnalysis,
  selectSalesData,
  selectSalesProductRanking,
  selectSalesSummary,
  selectStatisticsError,
  selectStatisticsLoading,
  setDateRange,
} from '../features/statistics/statisticsSlice';

export const useStatistics = () => {
  const dispatch = useDispatch<AppDispatch>();

  const salesData = useSelector(selectSalesData);
  const salesSummary = useSelector(selectSalesSummary);
  const customerAnalysis = useSelector(selectCustomerAnalysis);
  const salesCategoryAnalysis = useSelector(selectSalesCategoryAnalysis);
  const salesProductRanking = useSelector(selectSalesProductRanking);
  const grossProfitAnalysis = useSelector(selectGrossProfitAnalysis);
  const costOverview = useSelector(selectCostOverview);
  const costCategoryAnalysis = useSelector(selectCostCategoryAnalysis);
  const costProductRanking = useSelector(selectCostProductRanking);
  const loading = useSelector(selectStatisticsLoading);
  const error = useSelector(selectStatisticsError);
  const dateRange = useSelector(selectDateRange);

  const getSalesOverview = async (params?: { start?: string; end?: string }) => dispatch(fetchSalesOverview(params)).unwrap().catch(() => null);
  const getDailySalesData = async (params: { start: string; end: string }) => dispatch(fetchDailySalesData(params)).unwrap().catch(() => null);
  const getCustomerAnalysis = async (params?: { start?: string; end?: string }) => dispatch(fetchCustomerAnalysis(params)).unwrap().catch(() => null);
  const getSalesCategoryAnalysis = async (params?: { start?: string; end?: string }) => dispatch(fetchSalesCategoryAnalysis(params)).unwrap().catch(() => null);
  const getSalesProductRanking = async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => dispatch(fetchSalesProductRanking(params)).unwrap().catch(() => null);
  const getGrossProfitAnalysis = async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => dispatch(fetchGrossProfitAnalysis(params)).unwrap().catch(() => null);
  const getCostOverview = async (params?: { start?: string; end?: string }) => dispatch(fetchCostOverview(params)).unwrap().catch(() => null);
  const getCostCategoryAnalysis = async (params?: { start?: string; end?: string }) => dispatch(fetchCostCategoryAnalysis(params)).unwrap().catch(() => null);
  const getCostProductRanking = async (params?: { dateRange?: { start: string; end: string }; limit?: number }) => dispatch(fetchCostProductRanking(params)).unwrap().catch(() => null);

  return {
    salesData,
    salesSummary,
    customerAnalysis,
    salesCategoryAnalysis,
    salesProductRanking,
    grossProfitAnalysis,
    costOverview,
    costCategoryAnalysis,
    costProductRanking,
    loading,
    error,
    dateRange,
    getSalesOverview,
    getDailySalesData,
    getCustomerAnalysis,
    getSalesCategoryAnalysis,
    getSalesProductRanking,
    getGrossProfitAnalysis,
    getCostOverview,
    getCostCategoryAnalysis,
    getCostProductRanking,
    setDateRange: (start: string, end: string) => dispatch(setDateRange({ start, end })),
    clearStatistics: () => dispatch(clearStatistics()),
  };
};
