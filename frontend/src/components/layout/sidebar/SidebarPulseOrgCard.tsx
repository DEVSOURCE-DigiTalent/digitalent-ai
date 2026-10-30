import { PanelLeftClose } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

interface SidebarPulseOrgCardProps {
  isRail?: boolean;
  onToggleCollapsed?: () => void;
}

/** Khối cuối menu bên của chủ doanh nghiệp: cùng kiểu với khối của quản lý (SidebarManagerCard, `.pm-side-foot`). */
export function SidebarPulseOrgCard({ isRail = false, onToggleCollapsed }: SidebarPulseOrgCardProps) {
  const user = useCurrentUser((s) => s.user);

  const orgName = user?.organization?.name || 'Tổ chức';
  const planName = user?.subscription?.planName ?? user?.subscription?.planCode ?? '';
  const status = user?.subscription?.status;
  const usedSeats = user?.subscription?.seatsUsed;
  const totalSeats = user?.subscription?.seatLimit;

  const statusLabel =
    status === 'trialing'
      ? 'Dùng thử'
      : status === 'active'
        ? planName || 'Đang hoạt động'
        : status === 'expired'
          ? 'Hết hạn'
          : planName || 'Gói doanh nghiệp';

  const toggle = onToggleCollapsed && (
    <button
      type="button"
      className="pm-side-toggle"
      onClick={onToggleCollapsed}
      title={isRail ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)'}
      aria-label={isRail ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
    >
      <PanelLeftClose className={`size-4 transition-transform duration-200 ${isRail ? 'rotate-180' : ''}`} />
      {!isRail && <span>Thu gọn</span>}
    </button>
  );

  if (isRail) {
    return (
      <div className="shrink-0 pt-2">
        <div className="pm-side-avatar" title={`${user?.fullName ?? ''} · ${orgName}`}>
          {orgName.trim().charAt(0).toUpperCase() || 'D'}
        </div>
        {toggle}
      </div>
    );
  }

  return (
    <div className="shrink-0 pt-2">
      <dl className="pm-side-foot" aria-label="Tổ chức">
        <dt>Chủ doanh nghiệp</dt>
        <dd>{user?.fullName ?? 'Chủ doanh nghiệp'}</dd>
        <dt>Tổ chức</dt>
        <dd>
          {orgName}
          <small>{statusLabel}</small>
        </dd>
        {totalSeats != null && totalSeats > 0 && (
          <>
            <dt>Suất nhân viên</dt>
            <dd>{usedSeats ?? 0}/{totalSeats}</dd>
          </>
        )}
      </dl>
      {toggle}
    </div>
  );
}
