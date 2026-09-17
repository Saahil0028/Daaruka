import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalyticsPoint } from '../../types/analytics';
import { Badge } from '../ui/Badge';
import { Info, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  analytics: AnalyticsPoint[];
  metricName: string;
  unit: string;
  title: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  analytics,
  metricName,
  unit,
  title
}) => {
  const [range, setRange] = useState<'30d' | '90d' | '1y' | 'all'>('all');

  const filteredData = React.useMemo(() => {
    const points = analytics.filter((a) => a.metric_name === metricName);
    if (range === 'all') return points;

    const now = new Date();
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return points.filter((p) => new Date(p.recorded_at) >= cutoff);
  }, [analytics, metricName, range]);

  const chartData = {
    labels: filteredData.map((d) =>
      new Date(d.recorded_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: `${title} (${unit})`,
        data: filteredData.map((d) => d.metric_value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#34D399',
        pointBorderColor: '#070C0A',
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B1410',
        titleColor: '#F8FAFC',
        bodyColor: '#34D399',
        borderColor: '#1A2E24',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.parsed.y} ${unit}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(26, 46, 36, 0.4)' },
        ticks: { color: '#94A3B8', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(26, 46, 36, 0.4)' },
        ticks: { color: '#94A3B8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="bg-[#0B1410] border border-[#1A2E24] rounded-xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2E24] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <Badge variant="emerald">{unit}</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
            <Info className="w-3 h-3 text-emerald-400 inline" />
            <span>Sample / Simulated Model Data (Landsat / Sentinel-2)</span>
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-1 bg-[#070C0A] border border-[#1A2E24] rounded-lg p-0.5">
          {(['30d', '90d', '1y', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded uppercase transition-colors ${
                range === r ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full pt-1">
        {filteredData.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No analytics records available for the selected range.
          </div>
        )}
      </div>
    </div>
  );
};
