import type { MemberListItem } from '@/services/member.service';
import { rolesLabel, MEMBER_STATUS_LABELS } from '@/features/members/member-labels';

interface MemberCardProps {
  member: MemberListItem;
  onClick?: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  const initials = member.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusColor =
    member.status === 'ACTIVE'
      ? { bg: '#ecfdf5', fg: '#16a34a' }
      : member.status === 'PENDING'
        ? { bg: '#fef3c7', fg: '#d97706' }
        : { bg: '#fee2e2', fg: '#dc2626' };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-all hover:shadow-sm"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
      }}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold"
        style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
      >
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <strong
          className="block text-[13px] truncate"
          style={{ color: 'var(--po-ink)' }}
        >
          {member.fullName}
        </strong>
        <small
          className="block text-[11px] truncate"
          style={{ color: 'var(--po-muted)' }}
        >
          {[
            member.departmentName,
            member.positionName,
            member.kind === 'invitation'
              ? 'Chờ kích hoạt'
              : member.coveragePercent != null
                ? `${member.coveragePercent.toFixed(0)}% năng lực`
                : 'Chưa đánh giá',
          ]
            .filter(Boolean)
            .join(' · ')}
        </small>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {member.highGapCount != null && member.highGapCount > 0 && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: '#fee2e2', color: '#dc2626' }}
          >
            {member.highGapCount} cao
          </span>
        )}
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: statusColor.bg, color: statusColor.fg }}
        >
          {MEMBER_STATUS_LABELS[member.status]}
        </span>
        <span
          className="hidden sm:inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold"
          style={{
            borderColor: 'var(--po-line)',
            color: 'var(--po-muted)',
            background: 'var(--po-surface)',
          }}
        >
          {rolesLabel(member.roles)}
        </span>
      </div>
    </button>
  );
}
