import { http, HttpResponse } from 'msw';
import type { DailySalesData, ProductSalesRanking, CategorySalesData, BrandSalesData, RegionSalesData } from '../../types';
import { mockProducts, mockCategories, mockSuppliers, mockOrders } from '../data/mockData';
import dayjs from 'dayjs';

export const statisticsHandlers = [
  // 获取销售概览
  http.get('/api/statistics/overview', ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    // 如果没有提供日期范围，默认使用最近 30 天
    const startDate = start ? dayjs(start) : dayjs().subtract(30, 'days');
    const endDate = end ? dayjs(end) : dayjs();

    // 过滤日期范围内的订单
    const filteredOrders = mockOrders.filter((order) => {
      const orderDate = dayjs(order.createdAt);
      return orderDate.isAfter(startDate.subtract(1, 'day')) && orderDate.isBefore(endDate.add(1, 'day'));
    });

    // 计算总销售额（只计算已完成的订单）
    const totalRevenue = filteredOrders
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + order.finalAmount, 0);

    // 计算订单总数
    const totalOrders = filteredOrders.length;

    // 计算客户数（去重）
    const uniqueCustomers = new Set(filteredOrders.map((order) => order.customerPhone)).size;

    // 计算平均客单价
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 模拟增长率（随机 5-20%）
    const revenueGrowth = 10 + Math.random() * 15;
    const ordersGrowth = 8 + Math.random() * 12;

    return HttpResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        revenueGrowth,
        ordersGrowth,
      },
    });
  }),

  // 获取每日销售数据
  http.get('/api/statistics/daily-sales', ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    const startDate = start ? dayjs(start) : dayjs().subtract(30, 'days');
    const endDate = end ? dayjs(end) : dayjs();

    const dailyData: DailySalesData[] = [];

    for (let d = startDate; d.isBefore(endDate.add(1, 'day')); d = d.add(1, 'day')) {
      const dateStr = d.format('YYYY-MM-DD');

      // 过滤当天的订单
      const dayOrders = mockOrders.filter((order) =>
        dayjs(order.createdAt).isSame(d, 'day')
      );

      dailyData.push({
        date: dateStr,
        revenue: dayOrders
          .filter((order) => order.status === 'delivered')
          .reduce((sum, order) => sum + order.finalAmount, 0),
        orders: dayOrders.length,
        customers: new Set(dayOrders.map((order) => order.customerPhone)).size,
      });
    }

    return HttpResponse.json({
      success: true,
      data: dailyData,
    });
  }),

  // 获取商品销售排名
  http.get('/api/statistics/product-rankings', () => {
    // 模拟商品销售数据
    const rankings: ProductSalesRanking[] = mockProducts.map((product) => {
      // 随机生成销售数量和金额
      const quantity = Math.floor(Math.random() * 100) + 10;
      const revenue = quantity * product.price;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        image: product.images[0],
        quantity,
        revenue,
      };
    });

    // 按销售额排序
    rankings.sort((a, b) => b.revenue - a.revenue);

    // 取前 10 名
    return HttpResponse.json({
      success: true,
      data: rankings.slice(0, 10),
    });
  }),

  // 获取类别销售数据
  http.get('/api/statistics/category-sales', () => {
    const categorySales: CategorySalesData[] = mockCategories.map((category) => {
      // 找到该类别下的商品
      const categoryProducts = mockProducts.filter((p) => p.categoryId === category.id);

      // 找到包含这些商品的订单
      const relevantOrders = mockOrders.filter((order) => {
        return order.items.some((item) =>
          categoryProducts.some((product) => product.id === item.productId)
        );
      });

      // 计算该类别的销售额和订单数
      let categoryRevenue = 0;
      let categoryOrders = 0;

      relevantOrders.forEach((order) => {
        const orderCategoryRevenue = order.items
          .filter((item) => categoryProducts.some((p) => p.id === item.productId))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        categoryRevenue += orderCategoryRevenue;
        categoryOrders++;
      });

      return {
        categoryId: category.id,
        categoryName: category.name,
        revenue: categoryRevenue,
        orders: categoryOrders,
        percentage: 0,
      };
    });

    // 计算总销售额
    const totalRevenue = categorySales.reduce((sum, item) => sum + item.revenue, 0);

    // 计算每个类别的百分比
    categorySales.forEach((item) => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });

    return HttpResponse.json({
      success: true,
      data: categorySales,
    });
  }),

  // 获取品牌销售数据
  http.get('/api/statistics/brand-sales', () => {
    const brandSales: BrandSalesData[] = mockSuppliers.map((brand) => {
      // mock 统计仍复用原品牌销售结构，但底层数据已改为供应商
      const brandProducts = mockProducts.filter((p) => p.supplierId === brand.id);

      // 找到包含这些商品的订单
      const relevantOrders = mockOrders.filter((order) => {
        return order.items.some((item) =>
          brandProducts.some((product) => product.id === item.productId)
        );
      });

      // 计算该品牌的销售额和订单数
      let brandRevenue = 0;
      let brandOrders = 0;

      relevantOrders.forEach((order) => {
        const orderBrandRevenue = order.items
          .filter((item) => brandProducts.some((p) => p.id === item.productId))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        brandRevenue += orderBrandRevenue;
        brandOrders++;
      });

      return {
        brandId: brand.id,
        brandName: brand.name,
        revenue: brandRevenue,
        orders: brandOrders,
        percentage: 0,
      };
    });

    // 计算总销售额
    const totalRevenue = brandSales.reduce((sum, item) => sum + item.revenue, 0);

    // 计算每个品牌的百分比
    brandSales.forEach((item) => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });

    return HttpResponse.json({
      success: true,
      data: brandSales,
    });
  }),

  // 获取区域销售数据
  http.get('/api/statistics/region-sales', () => {
    // 简单的区域映射
    const regionMapping: Record<string, string> = {
      '广东省': '华南',
      '北京市': '华北',
      '上海市': '华东',
      '浙江省': '华东',
      '四川省': '西南',
      '湖北省': '华中',
      '陕西省': '西北',
      '辽宁省': '东北',
    };

    const regions = Array.from(new Set(Object.values(regionMapping)));

    const regionSales: RegionSalesData[] = regions.map((region) => {
      const relevantOrders = mockOrders.filter((order) => {
        const orderProvince = order.address.province;
        return regionMapping[orderProvince] === region;
      });

      const revenue = relevantOrders
        .filter((order) => order.status === 'delivered')
        .reduce((sum, order) => sum + order.finalAmount, 0);

      const orders = relevantOrders.length;

      return {
        region,
        revenue,
        orders,
        percentage: 0,
      };
    });

    // 计算总销售额
    const totalRevenue = regionSales.reduce((sum, item) => sum + item.revenue, 0);

    // 计算每个区域的百分比
    regionSales.forEach((item) => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });

    return HttpResponse.json({
      success: true,
      data: regionSales,
    });
  }),

  // 导出统计数据
  http.get('/api/statistics/export', () => {
    return HttpResponse.json({
      success: true,
      message: '数据导出功能正在开发中',
    });
  }),
];
