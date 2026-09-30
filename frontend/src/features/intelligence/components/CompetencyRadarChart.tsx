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

const REQUIRED_COLOR = '#6366f1'; // indigo — position standard
const CONFIRMED_COLOR = '#14b8a6'; // teal — confirmed level
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
  requiredLabel = 'Required level',
  confirmedLabel = 'Confirmed level',
  height = 320,
}: CompetencyRadarChartProps) {
  const data = toChartData(items);
  // Domain axes carry averages such as 1.25 — show the number instead of a level name.
  const tooltipFormatter = (value: unknown) => {
    const level = Number(value);
    return Number.isInteger(level) ? levelLabel(level) : level.toFixed(2);
  };

  if (data.length < MIN_RADAR_AXES) {
    return (
      <div data-testid="competency-bar-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 3]} ticks={LEVEL_TICKS} />
            <YAxis type="category" dataKey="competency" width={140} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Bar dataKey="required" name={requiredLabel} fill={REQUIRED_COLOR} fillOpacity={0.35} />
            <Bar dataKey="confirmed" name={confirmedLabel} fill={CONFIRMED_COLOR} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div data-testid="competency-radar-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 3]} tickCount={4} />
          <Radar
            name={requiredLabel}
            dataKey="required"
            stroke={REQUIRED_COLOR}
            strokeDasharray="5 4"
            fill={REQUIRED_COLOR}
            fillOpacity={0.05}
          />
          <Radar name={confirmedLabel} dataKey="confirmed" stroke={CONFIRMED_COLOR} fill={CONFIRMED_COLOR} fillOpacity={0.35} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
