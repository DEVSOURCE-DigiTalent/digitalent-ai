import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Mail } from 'lucide-react';
import type { MemberListItem } from '@/services/member.service';
import { rolesLabel, MEMBER_STATUS_LABELS } from '@/features/members/member-labels';

interface MemberCardProps {
  member: MemberListItem;
  onClick?: () => void;
  onResendInvite?: (member: MemberListItem) => void;
  isResending?: boolean;
}

export function MemberCard({ member, onClick, onResendInvite, isResending }: MemberCardProps) {
  useUiLanguage();
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
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="member-card flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all hover:shadow-sm cursor-pointer"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
      }}
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold"
        style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
      >
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <strong
          className="block text-sm sm:text-base truncate"
          style={{ color: 'var(--po-ink)' }}
        >
          {member.fullName}
        </strong>
        <small
          className="block text-xs sm:text-[13px] truncate"
          style={{ color: 'var(--po-muted)' }}
        >
          {[
            member.departmentName,
            member.positionName,
            member.kind === 'invitation' ? 'Chờ kích hoạt' : null,
          ]
            .filter((value, index, all) => value && all.indexOf(value) === index)
            .join(' · ')}
        </small>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ background: statusColor.bg, color: statusColor.fg }}
        >
          {translateUi(MEMBER_STATUS_LABELS[member.status])}
        </span>
        <span
          className="hidden sm:inline-block rounded-lg border px-2.5 py-1 text-xs font-bold"
          style={{
            borderColor: 'var(--po-line)',
            color: 'var(--po-muted)',
            background: 'var(--po-surface)',
          }}
        >
          {rolesLabel(member.roles)}
        </span>

        {/* Nút gửi lời mời trực tiếp cho nhân viên chưa kích hoạt */}
        {(member.status === 'PENDING' || member.kind === 'invitation') && onResendInvite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResendInvite(member);
            }}
            disabled={isResending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/80 hover:bg-teal-100 hover:border-teal-300 px-2.5 py-1 text-[11px] font-bold text-teal-700 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            title={translateUi("Gửi email mời kích hoạt tài khoản cho nhân viên này")}
          >
            <Mail className="size-3.5 text-teal-600" />
            <span>{isResending ? translateUi('Đang gửi...') : translateUi('Gửi lời mời')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
