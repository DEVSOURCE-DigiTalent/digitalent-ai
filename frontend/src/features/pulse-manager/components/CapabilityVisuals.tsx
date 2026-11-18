import { Check, Clock3, Minus, TrendingDown } from 'lucide-react';
import { translateUi } from '@/lib/i18n';
import type { LevelStatus } from '../lib/capability';
import './capability-visuals.css';

export const CAPABILITY_STATUS: Record<LevelStatus, string> = {
  MET: 'Đạt yêu cầu', GAP: 'Chưa đạt', PENDING: 'Chưa xác nhận mức', OUTSIDE_PATH: 'Ngoài lộ trình',
};

const icons = { MET: Check, GAP: TrendingDown, PENDING: Clock3, OUTSIDE_PATH: Minus };
const names = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export function CapabilityStatusIcon({ status }: { status: LevelStatus }) {
  const Icon = icons[status];
  return <Icon size={15} strokeWidth={2.2} aria-hidden="true" />;
}

export function capabilityLevelLabel(value?: number | null, target = false) {
  return value != null && value > 0 ? translateUi(names[value] ?? String(value)) : translateUi(target ? 'Không yêu cầu' : 'Chưa xác nhận mức');
}

export function CapabilityMarks({ value, target = false, compact = false }: {
  value?: number | null; target?: boolean; compact?: boolean;
}) {
  const valid = value != null && value > 0;
  const label = !valid && !target && !compact ? '—' : capabilityLevelLabel(value, target);
  return <span className="cap-marks" data-target={target} data-missing={!valid}>
    <span className="cap-marks__track" aria-hidden="true">
      {[1, 2, 3].map((step) => <i key={step} data-filled={valid && value >= step} />)}
    </span>
    <span className={compact ? 'sr-only' : 'cap-marks__label'}>{label}</span>
  </span>;
}
