import { useEffect, useRef } from 'react';
import { init, use, type EChartsCoreOption, type EChartsType } from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 按需注册需要的模块 - 只包含项目实际使用的图表类型
use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

interface EChartsProps {
  option: EChartsCoreOption;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (params: any) => void;
}

/**
 * 按需加载的 ECharts 组件
 * 只包含项目需要的图表类型（折线图、柱状图、饼图），避免全量引入
 */
export const ECharts: React.FC<EChartsProps> = ({
  option,
  style = { height: 300 },
  className,
  onClick,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    // 如果已存在实例，先销毁
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // 创建新实例
    const instance = init(chartRef.current, undefined, {
      renderer: 'canvas',
    });

    chartInstance.current = instance;

    // 绑定点击事件
    if (onClick) {
      instance.on('click', onClick);
    }

    // 响应式
    const handleResize = () => {
      instance.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      instance.dispose();
      chartInstance.current = null;
    };
  }, [onClick]);

  // 更新配置
  useEffect(() => {
    if (!chartInstance.current) return;
    chartInstance.current.setOption(option, true);
  }, [option]);

  return <div ref={chartRef} style={{ width: '100%', ...style }} className={className} />;
};

export default ECharts;
