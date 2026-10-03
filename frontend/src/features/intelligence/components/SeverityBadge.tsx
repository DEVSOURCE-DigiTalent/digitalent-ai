import { StatusBadge } from '@/components/shared';
import type { SkillGapSeverity } from '@/services/intelligence.service';

const SEVERITY_BADGES: Record<SkillGapSeverity, { label: string; variant: 'danger' | 'warning' | 'default' }> = {
  HIGH: { label: 'Cao', variant: 'danger' },
  MEDIUM: { label: 'Trung bình', variant: 'warning' },
  LOW: { label: 'Thấp', variant: 'default' },
};

/** Gap severity badge; null severity means the requirement is already met. */
export function SeverityBadge({ severity }: { severity: SkillGapSeverity | null }) {
  if (!severity) {
    return <StatusBadge label="Đạt" variant="success" />;
  }
  const badge = SEVERITY_BADGES[severity];
  return <StatusBadge label={badge.label} variant={badge.variant} />;
}
