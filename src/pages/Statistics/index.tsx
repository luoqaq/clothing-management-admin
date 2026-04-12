import { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Empty, Row, Segmented, Space, Spin, Table, Tabs, Typography, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { customersApi } from '../../api/customers';
import { ECharts } from '../../components/ECharts';
import { useStatistics } from '../../hooks/useStatistics';
import { getErrorMessage } from '../../utils/error';
import type { CategorySalesData, CostProductRankingItem, Customer, ProductSalesRanking } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type TimeTab = 'today' | 'week' | 'month' | 'all' | 'custom';

const timeTabOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' },
];

function getDateRangeByTab(tab: TimeTab): { start: string; end: string } {
  const now = dayjs();
  const todayStr = now.format('YYYY-MM-DD');
  switch (tab) {
    case 'today':
      return { start: todayStr, end: todayStr };
    case 'week': {
      const day = now.day();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = now.add(diff, 'day');
      return { start: monday.format('YYYY-MM-DD'), end: todayStr };
    }
    case 'month':
      return {
        start: now.startOf('month').format('YYYY-MM-DD'),
        end: todayStr,
      };
    case 'all':
      return {
        start: '2000-01-01',
        end: todayStr,
      };
    default:
      return { start: todayStr, end: todayStr };
  }
}

const StatisticsPage: React.FC = () => {
  const {
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
    setDateRange,
    getSalesOverview,
    getCustomerAnalysis,
    getSalesCategoryAnalysis,
    getSalesProductRanking,
    getGrossProfitAnalysis,
    getCostOverview,
    getCostCategoryAnalysis,
    getCostProductRanking,
  } = useStatistics();

  const [activeTab, setActiveTab] = useState<TimeTab>('today');
  const [datePickerValue, setDatePickerValue] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(dateRange.start),
    dayjs(dateRange.end),
  ]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setCustomerLoading(true);
      const result = await customersApi.getCustomers();
      if (result.success && result.data) {
        setCustomers(result.data);
      }
    } catch (err) {
      message.error(getErrorMessage(err, '获取客户档案失败'));
    } finally {
      setCustomerLoading(false);
    }
  };

  const loadAllData = async (start = dateRange.start, end = dateRange.end) => {
    await Promise.all([
      getSalesOverview({ start, end }),
      getCustomerAnalysis({ start, end }),
      getSalesCategoryAnalysis({ start, end }),
      getSalesProductRanking({ dateRange: { start, end }, limit: 10 }),
      getGrossProfitAnalysis({ dateRange: { start, end }, limit: 10 }),
      getCostOverview({ start, end }),
      getCostCategoryAnalysis({ start, end }),
      getCostProductRanking({ dateRange: { start, end }, limit: 10 }),
      loadCustomers(),
    ]);
  };

  useEffect(() => {
    const range = getDateRangeByTab('today');
    setDateRange(range.start, range.end);
    setDatePickerValue([dayjs(range.start), dayjs(range.end)]);
    void loadAllData(range.start, range.end);
  }, []);

  const handleTabChange = (tab: TimeTab) => {
    setActiveTab(tab);
    if (tab === 'custom') {
      const today = dayjs();
      const range = { start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') };
      setDateRange(range.start, range.end);
      setDatePickerValue([today, today]);
      void loadAllData(range.start, range.end);
    } else {
      const range = getDateRangeByTab(tab);
      setDateRange(range.start, range.end);
      setDatePickerValue([dayjs(range.start), dayjs(range.end)]);
      void loadAllData(range.start, range.end);
    }
  };

  const handleDateChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    if (!dates) return;
    setActiveTab('custom');
    const nextStart = dates[0].format('YYYY-MM-DD');
    const nextEnd = dates[1].format('YYYY-MM-DD');
    setDatePickerValue(dates);
    setDateRange(nextStart, nextEnd);
    void loadAllData(nextStart, nextEnd);
  };

  const handleRefresh = () => {
    void loadAllData();
  };

  const handleExport = () => {
    message.info('导出功能正在开发中');
  };

  if (error) {
    return (
      <Card className="content-panel">
        <Empty description={error}>
          <Button type="primary" onClick={handleRefresh}>
            重新加载
          </Button>
        </Empty>
      </Card>
    );
  }

  const renderMetricCards = (items: Array<{ key: string; title: string; value: string; hint?: string }>) => (
    <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
      {items.map((item) => (
        <Col xs={24} sm={12} xl={6} key={item.key}>
          <Card className="content-panel">
            <Text type="secondary">{item.title}</Text>
            <Title level={3} style={{ margin: '8px 0 4px' }}>
              {item.value}
            </Title>
            <Text type="secondary">{item.hint || '-'}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const customerSegmentOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        data: [
          { name: '新客户', value: customerAnalysis?.newCustomers ?? 0 },
          { name: '老客户', value: customerAnalysis?.returningCustomers ?? 0 },
        ],
      },
    ],
  };

  const ageDistributionOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: (customerAnalysis?.ageDistribution ?? []).map((item) => item.ageBucketName),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '客户数',
        type: 'bar',
        data: (customerAnalysis?.ageDistribution ?? []).map((item) => item.customerCount),
        itemStyle: { color: '#5c8d89' },
      },
    ],
  };

  const salesCategoryOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '72%'],
        data: salesCategoryAnalysis.map((item) => ({
          name: item.categoryName,
          value: item.revenue,
        })),
      },
    ],
  };

  const costCategoryOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '72%'],
        data: costCategoryAnalysis.map((item) => ({
          name: item.categoryName,
          value: item.cost,
        })),
      },
    ],
  };

  const productColumns = (mode: 'sales' | 'grossProfit' | 'cost') => {
    const amountField = mode === 'sales' ? 'revenue' : mode === 'grossProfit' ? 'grossProfit' : 'cost';
    const amountTitle = mode === 'sales' ? '销售额' : mode === 'grossProfit' ? '毛利额' : '成本';

    return [
      {
        title: '排名',
        key: 'rank',
        width: 70,
        render: (_: unknown, __: unknown, index: number) => index + 1,
      },
      {
        title: '商品款号',
        dataIndex: 'productCode',
        key: 'productCode',
      },
      {
        title: '商品名称',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: '销量',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: amountTitle,
        dataIndex: amountField,
        key: amountField,
        render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
      },
      ...(mode !== 'cost'
        ? [
            {
              title: '毛利率',
              dataIndex: 'grossMargin',
              key: 'grossMargin',
              render: (value: number) => `${Number(value || 0).toFixed(1)}%`,
            },
          ]
        : []),
    ];
  };

  const costProductColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '商品款号',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '规格编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '规格',
      key: 'specification',
      render: (_: unknown, record: CostProductRankingItem) => `${record.color} / ${record.size}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '累计入库',
      dataIndex: 'cumulativeInboundQuantity',
      key: 'cumulativeInboundQuantity',
    },
    {
      title: '单价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
    },
    {
      title: '累计成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
    },
  ];

  const categoryTableColumns = (mode: 'sales' | 'cost') => [
    {
      title: '类别',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    ...(mode === 'sales'
      ? [
          {
            title: '订单数',
            dataIndex: 'orders',
            key: 'orders',
          },
          {
            title: '销量',
            dataIndex: 'quantity',
            key: 'quantity',
          },
          {
            title: '销售额',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
          },
          {
            title: '毛利',
            dataIndex: 'grossProfit',
            key: 'grossProfit',
            render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
          },
        ]
      : [
          {
            title: '累计入库件数',
            dataIndex: 'quantity',
            key: 'quantity',
          },
          {
            title: '均价',
            key: 'avgCost',
            render: (_: unknown, record: CategorySalesData) =>
              `¥${(record.quantity > 0 ? Number(record.cost || 0) / Number(record.quantity || 0) : 0).toFixed(2)}`,
          },
          {
            title: '成本',
            dataIndex: 'cost',
            key: 'cost',
            render: (value: number) => `¥${Number(value || 0).toFixed(2)}`,
          },
        ]),
    {
      title: '占比',
      dataIndex: mode === 'sales' ? 'revenuePercentage' : 'costPercentage',
      key: mode === 'sales' ? 'revenuePercentage' : 'costPercentage',
      render: (value: number) => `${Number(value || 0).toFixed(1)}%`,
    },
  ];

  const renderSalesTab = () => (
    <>
      {renderMetricCards([
        { key: 'revenue', title: '总销售额', value: `¥${Number(salesSummary?.totalRevenue || 0).toFixed(2)}`, hint: `环比 ${Number(salesSummary?.revenueGrowth || 0).toFixed(1)}%` },
        { key: 'orders', title: '订单数', value: `${salesSummary?.totalOrders || 0}`, hint: `环比 ${Number(salesSummary?.ordersGrowth || 0).toFixed(1)}%` },
        { key: 'avg', title: '客单价', value: `¥${Number(salesSummary?.avgOrderValue || 0).toFixed(2)}`, hint: '总销售额 / 订单数' },
        { key: 'grossMargin', title: '毛利率', value: `${(Number(salesSummary?.totalRevenue || 0) > 0 ? (Number(salesSummary?.totalGrossProfit || 0) / Number(salesSummary?.totalRevenue || 0)) * 100 : 0).toFixed(1)}%`, hint: '总毛利 / 总销售额' },
        { key: 'customers', title: '客户数', value: `${salesSummary?.totalCustomers || 0}`, hint: `新客 ${salesSummary?.newCustomers || 0} / 老客 ${salesSummary?.returningCustomers || 0}` },
        { key: 'newCustomers', title: '新客户', value: `${salesSummary?.newCustomers || 0}`, hint: '统计期内首单客户' },
        { key: 'returningCustomers', title: '老客户', value: `${salesSummary?.returningCustomers || 0}`, hint: '统计期前已有成交' },
        { key: 'grossProfit', title: '总毛利', value: `¥${Number(salesSummary?.totalGrossProfit || 0).toFixed(2)}`, hint: `环比 ${Number(salesSummary?.grossProfitGrowth || 0).toFixed(1)}%` },
      ])}

      <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
        <Col xs={24} lg={12}>
          <Card title="新老客户分布" className="content-panel">
            <ECharts option={customerSegmentOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="客户年龄分层" className="content-panel">
            <ECharts option={ageDistributionOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Card title="商品类别销售情况" className="content-panel">
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <ECharts option={salesCategoryOption} style={{ height: 320 }} />
          </Col>
          <Col xs={24} lg={14}>
            <Table<CategorySalesData>
              className="content-table"
              columns={categoryTableColumns('sales')}
              dataSource={salesCategoryAnalysis}
              rowKey="categoryId"
              pagination={false}
              scroll={{ x: 760 }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="商品销售排行榜" className="content-panel" style={{ marginTop: 18 }}>
        <Table<ProductSalesRanking>
          className="content-table"
          columns={productColumns('sales')}
          dataSource={salesProductRanking}
          rowKey="productId"
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Card>

      <Card title="商品毛利分析" className="content-panel" style={{ marginTop: 18 }}>
        <Table<ProductSalesRanking>
          className="content-table"
          columns={productColumns('grossProfit')}
          dataSource={grossProfitAnalysis}
          rowKey="productId"
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Card>
    </>
  );

  const renderCostTab = () => (
    <>
      {renderMetricCards([
        { key: 'totalCost', title: '总成本', value: `¥${Number(costOverview?.totalCost || 0).toFixed(2)}`, hint: '按累计入库成本统计' },
      ])}

      <Card title="商品分类成本" className="content-panel">
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={10}>
            <ECharts option={costCategoryOption} style={{ height: 320 }} />
          </Col>
          <Col xs={24} lg={14}>
            <Table<CategorySalesData>
              className="content-table"
              columns={categoryTableColumns('cost')}
              dataSource={costCategoryAnalysis}
              rowKey="categoryId"
              pagination={false}
              scroll={{ x: 640 }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="商品成本排行榜" className="content-panel" style={{ marginTop: 18 }}>
        <Table<CostProductRankingItem>
          className="content-table"
          columns={costProductColumns}
          dataSource={costProductRanking}
          rowKey="skuId"
          pagination={false}
          scroll={{ x: 920 }}
        />
      </Card>
    </>
  );

  const renderCustomerArchiveTab = () => (
    <Card className="content-panel">
      <div className="content-panel__header" style={{ marginBottom: 18 }}>
        <div>
          <Text className="content-panel__eyebrow">Customers</Text>
          <Title level={4} className="content-panel__title">
            客户档案
          </Title>
        </div>
        <Text type="secondary">客户档案为只读展示，基于已归并的手机号客户。</Text>
      </div>

      <Table<Customer>
        className="content-table"
        rowKey="id"
        loading={customerLoading}
        dataSource={customers}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1080 }}
        columns={[
          { title: '客户姓名', dataIndex: 'name', key: 'name', render: (value: string) => value || '-' },
          { title: '手机号', dataIndex: 'phone', key: 'phone' },
          { title: '邮箱', dataIndex: 'email', key: 'email', render: (value: string) => value || '-' },
          { title: '年龄段', dataIndex: ['ageBucket', 'name'], key: 'ageBucket', render: (_: unknown, record: Customer) => record.ageBucket?.name || '未知' },
          { title: '有效支付订单数', dataIndex: 'paidOrderCount', key: 'paidOrderCount', width: 140 },
          {
            title: '首单时间',
            dataIndex: 'firstPaidOrderAt',
            key: 'firstPaidOrderAt',
            width: 180,
            render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
          },
          {
            title: '最近支付时间',
            dataIndex: 'lastPaidOrderAt',
            key: 'lastPaidOrderAt',
            width: 180,
            render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
          },
        ]}
      />
    </Card>
  );

  return (
    <div className="content-page">
      <Card className="content-panel">
        <div className="content-panel__header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Text className="content-panel__eyebrow">Analysis</Text>
            <Title level={4} className="content-panel__title">
              数据统计
            </Title>
          </div>
          <Space wrap>
            <Segmented
              options={timeTabOptions}
              value={activeTab}
              onChange={(v) => handleTabChange(v as TimeTab)}
              style={{ background: 'transparent' }}
            />
            <RangePicker value={datePickerValue} onChange={handleDateChange} />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Tabs
          items={[
            { key: 'sales', label: '销售统计', children: renderSalesTab() },
            { key: 'cost', label: '成本统计', children: renderCostTab() },
            { key: 'customers', label: '客户档案', children: renderCustomerArchiveTab() },
          ]}
        />
      </Spin>
    </div>
  );
};

export default StatisticsPage;
