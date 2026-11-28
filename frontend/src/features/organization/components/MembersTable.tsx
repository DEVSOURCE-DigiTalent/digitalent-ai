import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Mail } from 'lucide-react';
import type { MemberListItem } from '@/services/member.service';
import { MEMBER_STATUS_LABELS } from '@/features/members/member-labels';
import { ROLE_HIERARCHY, ROLE_LABELS, type Role } from '@/lib/roles';
import { formatRelativeTime, personInitials } from '@/lib/utils';

interface MembersTableProps {
  items: MemberListItem[];
  /** First load: no rows yet. */
  loading: boolean;
  /** A new page or filter is loading: the rows stay, dimmed. */
  refreshing: boolean;
  onResend?: (member: MemberListItem) => void;
  resendingId?: string | null;
  /** Shown instead of the table when there is nobody to list. */
  empty: ReactNode;
  /** Router state for the member links, so the member page leads back to this list with its filters. */
  backState?: unknown;
}

/**
 * OW-02 member list: a table on wide screens, one card per person below 680 px of container width (owner-members.css).
 * The name is the link to the member page; a click anywhere else on the row opens it too, for the mouse.
 */
export function MembersTable({ items, loading, refreshing, onResend, resendingId, empty, backState }: MembersTableProps) {
  useUiLanguage();
  if (loading) {
    return (
      <div className="mb-skeleton" aria-busy="true" aria-label={translateUi('Đang tải danh sách nhân sự')}>
        {Array.from({ length: 5 }, (_, index) => <span key={index} />)}
      </div>
    );
  }
  if (items.length === 0) return <>{empty}</>;

  return (
    <div className="mb-table-wrap" aria-busy={refreshing || undefined}>
      <table className="mb-table">
        <thead>
          <tr>
            <th scope="col">{translateUi('Họ tên')}</th>
            <th scope="col">{translateUi('Phòng ban · Vị trí')}</th>
            <th scope="col">{translateUi('Vai trò')}</th>
            <th scope="col">{translateUi('Lần vào gần nhất')}</th>
            <th scope="col"><span className="sr-only">{translateUi('Thao tác')}</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onResend={onResend}
              resending={resendingId === member.id}
              backState={backState}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberRow({ member, onResend, resending, backState }: { member: MemberListItem; onResend?: (member: MemberListItem) => void; resending: boolean; backState?: unknown }) {
  const navigate = useNavigate();
  const href = `/enterprise/members/${member.id}`;
  const pending = member.status === 'PENDING' || member.kind === 'invitation';
  // A profile without an account is listed with its employee id (accounts with their user id).
  const hasAccount = member.kind === 'member' && !(member.employeeId && member.id === member.employeeId);
  const noPosition = member.kind === 'member' && member.status === 'ACTIVE' && Boolean(member.employeeId) && !member.jobPositionId;

  return (
    <tr
      className="mb-row"
      data-status={member.status}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a, button')) return;
        navigate(href, { state: backState });
      }}
    >
      <td className="mb-cell mb-cell--person">
        <div className="mb-who">
          <span className="mb-avatar" aria-hidden="true">{personInitials(member.fullName)}</span>
          <span className="mb-person">
            <Link to={href} state={backState} className="mb-name">{member.fullName}</Link>
            {member.email && <span className="mb-email">{member.email}</span>}
          </span>
        </div>
      </td>
      <td className="mb-cell mb-cell--place">
        <span className="mb-dept">{member.departmentName ?? '—'}</span>
        {member.positionName
          ? <span className="mb-sub">{member.positionName}</span>
          : noPosition && <span className="mb-sub mb-sub--warn">{translateUi('Chưa có vị trí')}</span>}
      </td>
      <td className="mb-cell mb-cell--role">{topRoleLabel(member.roles)}</td>
      <td className="mb-cell mb-cell--activity">
        <Activity member={member} pending={pending} hasAccount={hasAccount} />
      </td>
      <td className="mb-cell mb-cell--action">
        {pending && onResend ? (
          <button
            type="button"
            className="mb-resend"
            onClick={() => onResend(member)}
            disabled={resending}
            aria-label={translateUi(`Gửi lại lời mời cho ${member.fullName}`)}
          >
            <Mail size={14} aria-hidden="true" />
            <span>{resending ? translateUi('Đang gửi…') : translateUi('Nhắc lại')}</span>
          </button>
        ) : (
          <Link to={href} state={backState} className="mb-detail" aria-label={translateUi(`Xem chi tiết ${member.fullName}`)}>
            <span>{translateUi('Xem chi tiết')}</span>
            <ChevronRight size={15} aria-hidden="true" />
          </Link>
        )}
      </td>
    </tr>
  );
}

function Activity({ member, pending, hasAccount }: { member: MemberListItem; pending: boolean; hasAccount: boolean }) {
  if (pending) {
    return (
      <>
        <span className="mb-state" data-tone="warn">{translateUi(MEMBER_STATUS_LABELS.PENDING)}</span>
        {member.invitedAt && <span className="mb-sub">{translateUi(`Mời ${formatRelativeTime(member.invitedAt)}`)}</span>}
      </>
    );
  }
  if (member.status === 'INACTIVE') return <span className="mb-state" data-tone="bad">{translateUi(MEMBER_STATUS_LABELS.INACTIVE)}</span>;
  if (!hasAccount) return <span className="mb-muted">{translateUi('Chưa có tài khoản')}</span>;
  if (!member.lastActiveAt) return <span className="mb-muted">{translateUi('Chưa đăng nhập')}</span>;
  return <span>{formatRelativeTime(member.lastActiveAt)}</span>;
}

/** The highest role only: a manager also holds EMPLOYEE, which says nothing more. */
function topRoleLabel(roles: string[]): string {
  const top = ROLE_HIERARCHY.find((role) => roles.includes(role));
  return top ? ROLE_LABELS[top as Role] : roles[0] ?? '—';
}
