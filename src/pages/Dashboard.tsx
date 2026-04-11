import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Spin, Empty, message, Progress, Button, Segmented, DatePicker } from 'antd';
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
import dayjs from 'dayjs';
import { ECharts } from '../components/ECharts';
import { useStatistics } from '../hooks/useStatistics';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type TimeTab = 'today' | 'week' | 'month' | 'all' | 'custom';

const timeTabOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' },
  { label: '自定义', value: 'custom' },
];

const tabLabelMap: Record<TimeTab, string> = {
  today: '今日',
  week: '本周',
  month: '本月',
  all: '累计',
  custom: '自定义',
};

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
    setDateRange,
    getSalesOverview,
    getDailySalesData,
  } = useStatistics();

  const [activeTab, setActiveTab] = useState<TimeTab>('today');
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(dateRange.start),
    dayjs(dateRange.end),
  ]);

  useEffect(() => {
    const range = getDateRangeByTab('today');
    setDateRange(range.start, range.end);
    setCustomRange([dayjs(range.start), dayjs(range.end)]);
    void loadData(range.start, range.end);
  }, []);

  const loadData = async (start: string, end: string) => {
    try {
      await Promise.all([
        getSalesOverview({ start, end }),
        getDailySalesData({ start, end }),
      ]);
    } catch (err) {
      message.error('加载数据失败');
    }
  };

  const handleTabChange = (tab: TimeTab) => {
    setActiveTab(tab);
    if (tab === 'custom') {
      const today = dayjs();
      const range = { start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') };
      setDateRange(range.start, range.end);
      setCustomRange([today, today]);
      void loadData(range.start, range.end);
    } else {
      const range = getDateRangeByTab(tab);
      setDateRange(range.start, range.end);
      setCustomRange([dayjs(range.start), dayjs(range.end)]);
      void loadData(range.start, range.end);
    }
  };

  const handleCustomRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    if (!dates) return;
    setActiveTab('custom');
    setCustomRange(dates);
    const start = dates[0].format('YYYY-MM-DD');
    const end = dates[1].format('YYYY-MM-DD');
    setDateRange(start, end);
    void loadData(start, end);
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

  const currentLabel = tabLabelMap[activeTab];

  const summaryCards: SummaryCardItem[] = [
    {
      key: 'revenue',
      label: `${currentLabel}销售额`,
      value: `¥${(salesSummary?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      accent: 'blue',
      growth: revenueGrowth,
    },
    {
      key: 'orders',
      label: `${currentLabel}订单数`,
      value: `${salesSummary?.totalOrders || 0}`,
      icon: <ShoppingCartOutlined />,
      accent: 'sand',
      growth: ordersGrowth,
    },
    {
      key: 'customers',
      label: `${currentLabel}客户数`,
      value: `${salesSummary?.totalCustomers || 0}`,
      icon: <UserOutlined />,
      accent: 'sky',
      helper: '本周期内产生购买行为的客户',
    },
    {
      key: 'avg',
      label: `${currentLabel}平均客单价`,
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
        <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
          <Col xs={24}>
            <Card className="dashboard-panel">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Segmented
                  options={timeTabOptions}
                  value={activeTab}
                  onChange={(v) => handleTabChange(v as TimeTab)}
                  style={{ background: 'transparent' }}
                />
                {activeTab === 'custom' && (
                  <RangePicker
                    value={customRange}
                    onChange={handleCustomRangeChange}
                    allowClear={false}
                    disabledDate={(current, { from }) => {
                      if (from) {
                        return !current.isSame(from, 'year');
                      }
                      return false;
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>

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
