import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Spin, Empty, message, Progress, Button } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  BarcodeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ECharts } from '../components/ECharts';
import { useStatistics } from '../hooks/useStatistics';

const { Title, Text } = Typography;

interface SummaryCardItem {
  key: string;
  label: string;
  value: string;
  icon: ReactNode;
  accent: 'blue' | 'sand' | 'sky' | 'stone';
  growth?: number;
  helper?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
      <Card className="dashboard-panel">
        <Empty description={error} />
      </Card>
    );
  }

  const revenueGrowth = salesSummary?.revenueGrowth ?? 0;
  const ordersGrowth = salesSummary?.ordersGrowth ?? 0;
  const conversionHint = salesSummary?.totalOrders && salesSummary?.totalCustomers
    ? Math.min(
        100,
        (salesSummary.totalOrders / Math.max(salesSummary.totalCustomers, 1)) * 100
      )
    : 0;

  const summaryCards: SummaryCardItem[] = [
    {
      key: 'revenue',
      label: '总销售额',
      value: `¥${(salesSummary?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      accent: 'blue',
      growth: revenueGrowth,
    },
    {
      key: 'orders',
      label: '订单总数',
      value: `${salesSummary?.totalOrders || 0}`,
      icon: <ShoppingCartOutlined />,
      accent: 'sand',
      growth: ordersGrowth,
    },
    {
      key: 'customers',
      label: '客户数',
      value: `${salesSummary?.totalCustomers || 0}`,
      icon: <UserOutlined />,
      accent: 'sky',
      helper: '本周期内产生购买行为的客户',
    },
    {
      key: 'avg',
      label: '平均客单价',
      value: `¥${(salesSummary?.avgOrderValue || 0).toFixed(2)}`,
      icon: <ArrowUpOutlined />,
      accent: 'stone',
      helper: '用于判断当前客单结构是否稳定',
    },
  ];

  const salesChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(58, 70, 82, 0.92)',
      borderWidth: 0,
      textStyle: { color: '#fdfaf6' },
    },
    legend: {
      data: ['销售额', '订单数'],
      bottom: 0,
      textStyle: {
        color: '#7d7264',
      },
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
      axisLine: {
        lineStyle: { color: '#d8cab9' },
      },
      axisLabel: {
        color: '#8a7f73',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: { color: '#8a7f73' },
        splitLine: {
          lineStyle: { color: '#ece2d7' },
        },
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
        axisLabel: { color: '#8a7f73' },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: salesData.map((d) => d.revenue),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#86b6d8' },
        itemStyle: { color: '#86b6d8' },
        areaStyle: {
          opacity: 1,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(134, 182, 216, 0.36)' },
              { offset: 1, color: 'rgba(134, 182, 216, 0.02)' },
            ],
          },
        },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: salesData.map((d) => d.orders),
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2, color: '#d0b18f' },
        itemStyle: { color: '#d0b18f' },
      },
    ],
  };

  return (
    <div className="dashboard-page">
      <Spin spinning={loading}>
        <Row gutter={[18, 18]} className="dashboard-summary-grid">
          {summaryCards.map((card) => (
            <Col xs={24} sm={12} xl={6} key={card.key}>
              <Card className={`metric-card metric-card--${card.accent}`}>
                <div className="metric-card__header">
                  <span className="metric-card__icon">{card.icon}</span>
                  <Text className="metric-card__label">{card.label}</Text>
                </div>
                <Text className="metric-card__value">{card.value}</Text>
                {typeof card.growth === 'number' ? (
                  <div className="metric-card__trend">
                    {card.growth > 0 ? (
                      <span className="metric-card__trend-value metric-card__trend-value--up">
                        <RiseOutlined /> {card.growth.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="metric-card__trend-value metric-card__trend-value--down">
                        <FallOutlined /> {Math.abs(card.growth).toFixed(1)}%
                      </span>
                    )}
                    <Text className="metric-card__helper">较上期</Text>
                  </div>
                ) : (
                  <Text className="metric-card__helper">{card.helper}</Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* 快捷操作 */}
        <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
          <Col xs={24}>
            <Card className="dashboard-panel">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button 
                  type="primary" 
                  icon={<BarcodeOutlined />} 
                  size="large"
                  onClick={() => navigate('/orders/scan')}
                >
                  扫码录单
                </Button>
                <Button 
                  icon={<PlusOutlined />} 
                  size="large"
                  onClick={() => navigate('/orders')}
                >
                  新建订单
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={17}>
            <Card className="dashboard-panel dashboard-panel--chart">
              <div className="dashboard-panel__header">
                <div>
                  <Text className="dashboard-panel__eyebrow">Sales trend</Text>
                  <Title level={4} className="dashboard-panel__title">
                    销售趋势
                  </Title>
                </div>
                <Text className="dashboard-panel__meta">Revenue vs orders</Text>
              </div>
              <ECharts
                option={salesChartOption}
                style={{ height: 360 }}
              />
            </Card>
          </Col>
          <Col xs={24} xl={7}>
            <Card className="dashboard-panel dashboard-panel--insight">
              <div className="dashboard-panel__header">
                <div>
                  <Text className="dashboard-panel__eyebrow">Quick insight</Text>
                  <Title level={4} className="dashboard-panel__title">
                    当前状态
                  </Title>
                </div>
              </div>
              <div className="insight-block">
                <Text className="insight-block__label">订单转化感知</Text>
                <Progress
                  percent={Number(conversionHint.toFixed(0))}
                  showInfo={false}
                  strokeColor="#8bb8d9"
                  trailColor="#eadfd2"
                />
                <Text className="insight-block__value">{conversionHint.toFixed(0)}%</Text>
              </div>
              <div className="insight-block insight-block--soft">
                <Text className="insight-block__label">经营备注</Text>
                <Text className="insight-block__copy">
                  {revenueGrowth >= 0
                    ? '销售额保持上扬，当前节奏适合继续放大优质商品曝光。'
                    : '销售额有回落，建议优先检查转化较弱的商品与库存策略。'}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
