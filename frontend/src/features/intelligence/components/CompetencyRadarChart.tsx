import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { levelLabel } from '@/lib/competency-levels';
import { toChartData, type CompetencyChartItem } from '../utils/chart-data';

const REQUIRED_COLOR = 'var(--ent-level-3, #9DB6F0)'; // Dark: #9DB6F0 (8.3:1), Light: #2D5BD0 (5.9:1)
const CONFIRMED_COLOR = 'var(--ent-ok, #7FC48C)'; // Dark: #7FC48C (7.8:1), Light: #2D7A3C (5.2:1)
const MIN_RADAR_AXES = 3; // radar with 1–2 axes is meaningless → bar chart
const LEVEL_TICKS = [0, 1, 2, 3];

interface CompetencyRadarChartProps {
  items: CompetencyChartItem[];
  requiredLabel?: string;
  confirmedLabel?: string;
  height?: number;
}

/**
 * Required vs confirmed competency levels (0–3). Radar from 3 competencies, horizontal bars below that.
 */
export function CompetencyRadarChart({
  items,
  requiredLabel = 'Trình độ yêu cầu',
  confirmedLabel = 'Trình độ đã xác nhận',
  height = 320,
}: CompetencyRadarChartProps) {
  const data = toChartData(items);
  // Domain axes carry averages such as 1.25 — show the number instead of a level name.
  const tooltipFormatter = (value: unknown) => {
    const level = Number(value);
    return Number.isInteger(level) ? levelLabel(level) : level.toFixed(2);
  };

  const renderLegendItem = (value: string) => (
    <span className="text-xs font-medium text-ent-fg-2">
      {value}
    </span>
  );

  if (data.length < MIN_RADAR_AXES) {
    return (
      <div data-testid="competency-bar-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--ent-line, #2A2924)" />
            <XAxis type="number" domain={[0, 3]} ticks={LEVEL_TICKS} tick={{ fontSize: 11, fill: 'var(--ent-fg-3, #8E8C80)' }} stroke="var(--ent-line, #2A2924)" />
            <YAxis type="category" dataKey="competency" width={140} tick={{ fontSize: 11, fill: 'var(--ent-fg-2, #B4B2A6)' }} stroke="var(--ent-line, #2A2924)" />
            <Tooltip formatter={tooltipFormatter} />
            <Legend formatter={renderLegendItem} wrapperStyle={{ paddingTop: 8 }} />
            <Bar dataKey="required" name={requiredLabel} fill={REQUIRED_COLOR} fillOpacity={0.4} />
            <Bar dataKey="confirmed" name={confirmedLabel} fill={CONFIRMED_COLOR} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div data-testid="competency-radar-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* No entry animation: it never completes when the tab is in the background, leaving the chart empty */}
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--ent-line, #2A2924)" />
          <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11, fill: 'var(--ent-fg-2, #B4B2A6)' }} />
          <PolarRadiusAxis domain={[0, 3]} tickCount={4} tick={{ fontSize: 10, fill: 'var(--ent-fg-3, #8E8C80)' }} stroke="var(--ent-line, #2A2924)" />
          <Radar
            name={requiredLabel}
            dataKey="required"
            stroke={REQUIRED_COLOR}
            strokeDasharray="5 4"
            fill={REQUIRED_COLOR}
            fillOpacity={0.12}
            isAnimationActive={false}
          />
          <Radar name={confirmedLabel} dataKey="confirmed" stroke={CONFIRMED_COLOR} fill={CONFIRMED_COLOR} fillOpacity={0.35} isAnimationActive={false} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend formatter={renderLegendItem} wrapperStyle={{ paddingTop: 8 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
