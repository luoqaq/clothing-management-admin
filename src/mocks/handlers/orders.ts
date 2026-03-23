import { http, HttpResponse } from 'msw';
import type { Order } from '../../types';
import { mockOrders } from '../data/mockData';

export const ordersHandlers = [
  // 获取订单列表
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') || undefined;

    let filteredOrders = [...mockOrders];

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderNo.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerPhone.includes(search)
      );
    }

    // 状态过滤
    if (status) {
      filteredOrders = filteredOrders.filter((order) => order.status === status);
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedOrders,
        total: filteredOrders.length,
        page,
        pageSize,
      },
    });
  }),

  // 获取订单详情
  http.get('/api/orders/:id', ({ params }) => {
    const order = mockOrders.find((o) => o.id === parseInt(params.id as string));

    if (!order) {
      return HttpResponse.json({
        success: false,
        message: '订单不存在',
      });
    }

    return HttpResponse.json({
      success: true,
      data: order,
    });
  }),

  // 创建订单
  http.post('/api/orders', async ({ request }) => {
    const orderData = await request.json();

    const newOrder: Order = {
      ...(orderData as any),
      id: Date.now(),
      orderNo: '2024' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);

    return HttpResponse.json({
      success: true,
      data: newOrder,
    });
  }),

  // 更新订单状态
  http.patch('/api/orders/:id/status', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const data = await request.json();
    const { status } = data as { status: string };

    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '订单不存在',
      });
    }

    mockOrders[orderIndex].status = status as any;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: mockOrders[orderIndex],
    });
  }),

  // 发货
  http.post('/api/orders/:id/ship', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const shippingInfo = await request.json();
    const info = shippingInfo as { trackingNumber?: string; shippingCompany?: string };

    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '订单不存在',
      });
    }

    mockOrders[orderIndex].status = 'shipped';
    mockOrders[orderIndex].shippedAt = new Date().toISOString();

    if (info.trackingNumber) {
      (mockOrders[orderIndex] as any).trackingNumber = info.trackingNumber;
    }
    if (info.shippingCompany) {
      (mockOrders[orderIndex] as any).shippingCompany = info.shippingCompany;
    }

    return HttpResponse.json({
      success: true,
      data: mockOrders[orderIndex],
    });
  }),

  // 取消订单
  http.post('/api/orders/:id/cancel', async ({ params }) => {
    const id = parseInt(params.id as string);

    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '订单不存在',
      });
    }

    // 只能取消待处理或已确认的订单
    if (mockOrders[orderIndex].status !== 'pending' && mockOrders[orderIndex].status !== 'confirmed') {
      return HttpResponse.json({
        success: false,
        message: '该订单状态无法取消',
      });
    }

    mockOrders[orderIndex].status = 'cancelled';
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: mockOrders[orderIndex],
    });
  }),

  // 退款
  http.post('/api/orders/:id/refund', async ({ params }) => {
    const id = parseInt(params.id as string);

    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '订单不存在',
      });
    }

    mockOrders[orderIndex].status = 'refunded';
    mockOrders[orderIndex].paymentStatus = 'refunded';
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: mockOrders[orderIndex],
    });
  }),

  // 导出订单
  http.get('/api/orders/export', () => {
    const csvContent = [
      ['订单号', '客户姓名', '电话', '金额', '状态'],
      ...mockOrders.map((order) => [
        order.orderNo,
        order.customerName,
        order.customerPhone,
        order.finalAmount,
        order.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });

    return HttpResponse.blob(blob, {
      headers: {
        'Content-Disposition': 'attachment; filename="orders.csv"',
      },
    });
  }),
];
