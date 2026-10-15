import { PanelLeftClose } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useManagedDepartment } from '@/hooks/use-managed-department';

interface SidebarManagerCardProps {
  isRail?: boolean;
  onToggleCollapsed?: () => void;
}

/** Khối cuối menu bên của quản lý (mock `.side-foot`): tài khoản, phòng ban đang quản lý và tổ chức. */
export function SidebarManagerCard({ isRail = false, onToggleCollapsed }: SidebarManagerCardProps) {
  const user = useCurrentUser((s) => s.user);
  const { department, isLoading } = useManagedDepartment();

  const orgName = user?.organization?.name ?? 'Tổ chức';
  const departmentName = department?.name ?? (isLoading ? 'Đang tải…' : 'Chưa được gán phòng ban');

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
        <div className="pm-side-avatar" title={`${user?.fullName ?? ''} · ${departmentName} · ${orgName}`}>
          {(department?.name ?? orgName).trim().charAt(0).toUpperCase() || 'Q'}
        </div>
        {toggle}
      </div>
    );
  }

  return (
    <div className="shrink-0 pt-2">
      <dl className="pm-side-foot" aria-label="Phạm vi quản lý">
        <dt>Tài khoản quản lý</dt>
        <dd>{user?.fullName ?? 'Quản lý'}</dd>
        <dt>Phòng ban đang quản lý</dt>
        <dd>
          {departmentName}
          {department?.headcount != null && <small>{department.headcount} nhân viên trong phòng ban</small>}
        </dd>
        <dt>Tổ chức</dt>
        <dd>{orgName}</dd>
      </dl>
      {toggle}
    </div>
  );
}
