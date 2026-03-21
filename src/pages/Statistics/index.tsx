import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Typography, Spin, DatePicker, Button, message, Space } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useStatistics } from '../../hooks/useStatistics';
import type { ProductSalesRanking } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StatisticsPage: React.FC = () => {
  const {
    salesData,
    productRankings,
    categorySales,
    regionSales,
    loading,
    error,
    dateRange,
    setDateRange,
    getSalesOverview,
    getDailySalesData,
    getProductRankings,
    getCategorySales,
    getRegionSales,
  } = useStatistics();

  const [datePickerValue, setDatePickerValue] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(dateRange.start),
    dayjs(dateRange.end),
  ]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        getSalesOverview({ start: dateRange.start, end: dateRange.end }),
        getDailySalesData({ start: dateRange.start, end: dateRange.end }),
        getProductRankings({
          dateRange: { start: dateRange.start, end: dateRange.end },
          limit: 10,
        }),
        getCategorySales({ start: dateRange.start, end: dateRange.end }),
        getRegionSales({ start: dateRange.start, end: dateRange.end }),
      ]);
    } catch (err) {
      message.error('加载数据失败');
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const newStart = dates[0].format('YYYY-MM-DD');
      const newEnd = dates[1].format('YYYY-MM-DD');
      setDatePickerValue(dates);
      setDateRange(newStart, newEnd);
    }
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const handleExport = () => {
    message.info('导出功能正在开发中');
  };

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={4} type="secondary">
            {error}
          </Title>
          <Button type="primary" onClick={handleRefresh} style={{ marginTop: 16 }}>
            重新加载
          </Button>
        </div>
      </Card>
    );
  }

  const salesChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['销售额', '订单数'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: salesData.map((d) => d.date.slice(5)),
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: { formatter: '¥{value}' },
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: salesData.map((d) => d.revenue),
        areaStyle: { opacity: 0.3, color: '#1890ff' },
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: salesData.map((d) => d.orders),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  const categoryChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: '类别销售',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: categorySales.map((c) => ({
          value: c.revenue,
          name: c.categoryName,
        })),
      },
    ],
  };

  const regionChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: regionSales.map((r) => r.region),
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: regionSales.map((r) => r.revenue),
        itemStyle: {
          color: '#722ed1',
        },
      },
    ],
  };

  const productColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => {
        const rank = index + 1;
        return (
          <span
            style={{
              fontWeight: 600,
              color: rank === 1 ? '#ff4d4f' : rank === 2 ? '#fa8c16' : rank === 3 ? '#fadb14' : '#666',
            }}
          >
            {rank}
          </span>
        );
      },
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '规格编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
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
      render: (value: number) => `¥${value.toFixed(2)}`,
      sorter: (a: ProductSalesRanking, b: ProductSalesRanking) => a.revenue - b.revenue,
    },
  ];

  const categoryColumns = [
    {
      title: '类别',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
    },
    {
      title: '销售额',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          数据统计
        </Title>
        <Space>
          <RangePicker
            value={datePickerValue}
            onChange={handleDateChange}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* 销售趋势 */}
        <Card title="销售趋势" style={{ marginBottom: 16 }}>
          <ReactECharts option={salesChartOption} style={{ height: 350 }} />
        </Card>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* 类别销售 */}
          <Col xs={24} lg={12}>
            <Card title="类别销售分析">
              <Row gutter={16}>
                <Col span={12}>
                  <ReactECharts option={categoryChartOption} style={{ height: 300 }} />
                </Col>
                <Col span={12}>
                  <Table
                    columns={categoryColumns}
                    dataSource={categorySales}
                    rowKey="categoryId"
                    pagination={false}
                    size="small"
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 区域销售 */}
          <Col xs={24} lg={12}>
            <Card title="区域销售分析">
              <ReactECharts option={regionChartOption} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>

        {/* 商品销售排名 */}
        <Card title="商品销售排行 TOP 10">
          <Table
            columns={productColumns}
            dataSource={productRankings}
            rowKey="productId"
            pagination={false}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default StatisticsPage;
