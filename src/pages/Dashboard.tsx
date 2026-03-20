import { useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Empty, message } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useStatistics } from '../hooks/useStatistics';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const {
    salesSummary,
    salesData,
    loading,
    error,
    dateRange,
    getSalesOverview,
    getDailySalesData,
  } = useStatistics();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        getSalesOverview({ start: dateRange.start, end: dateRange.end }),
        getDailySalesData({ start: dateRange.start, end: dateRange.end }),
      ]);
    } catch (err) {
      message.error('加载数据失败');
    }
  };

  if (error) {
    return (
      <Card>
        <Empty description={error} />
      </Card>
    );
  }

  const salesChartOption = {
    title: {
      text: '销售趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['销售额', '订单数'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
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
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: salesData.map((d) => d.orders),
      },
    ],
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        数据概览
      </Title>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总销售额"
                value={salesSummary?.totalRevenue || 0}
                precision={2}
                prefix={<DollarOutlined />}
                styles={{ content: { color: '#1890ff' } }}
              />
              {salesSummary?.revenueGrowth && (
                <div style={{ marginTop: 8 }}>
                  {salesSummary.revenueGrowth > 0 ? (
                    <span style={{ color: '#52c41a' }}>
                      <RiseOutlined /> {salesSummary.revenueGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>
                      <FallOutlined /> {Math.abs(salesSummary.revenueGrowth).toFixed(1)}%
                    </span>
                  )}
                  <span style={{ color: '#999', marginLeft: 4 }}>较上期</span>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={salesSummary?.totalOrders || 0}
                prefix={<ShoppingCartOutlined />}
                styles={{ content: { color: '#52c41a' } }}
              />
              {salesSummary?.ordersGrowth && (
                <div style={{ marginTop: 8 }}>
                  {salesSummary.ordersGrowth > 0 ? (
                    <span style={{ color: '#52c41a' }}>
                      <RiseOutlined /> {salesSummary.ordersGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>
                      <FallOutlined /> {Math.abs(salesSummary.ordersGrowth).toFixed(1)}%
                    </span>
                  )}
                  <span style={{ color: '#999', marginLeft: 4 }}>较上期</span>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="客户数"
                value={salesSummary?.totalCustomers || 0}
                prefix={<UserOutlined />}
                styles={{ content: { color: '#722ed1' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="平均客单价"
                value={salesSummary?.avgOrderValue || 0}
                precision={2}
                prefix={<DollarOutlined />}
                styles={{ content: { color: '#fa8c16' } }}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ height: 400 }}>
          <ReactECharts
            option={salesChartOption}
            style={{ height: 350 }}
            opts={{ renderer: 'canvas' }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard;
