import { translateUi, useUiLanguage } from '@/lib/i18n';
import { PanelLeftClose } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useManagedDepartment } from '@/hooks/use-managed-department';

interface SidebarManagerCardProps {
  isRail?: boolean;
  onToggleCollapsed?: () => void;
}

/** Khối cuối menu bên của quản lý (mock `.side-foot`): tài khoản, phòng ban đang quản lý và tổ chức. */
export function SidebarManagerCard({ isRail = false, onToggleCollapsed }: SidebarManagerCardProps) {
  useUiLanguage();
  const user = useCurrentUser((s) => s.user);
  const { department, departments, selectDepartment, isLoading } = useManagedDepartment();

  const orgName = user?.organization?.name ?? 'Tổ chức';
  const departmentName = department?.name ?? (isLoading ? 'Đang tải…' : 'Chưa được gán phòng ban');

  const toggle = onToggleCollapsed && (
    <button
      type="button"
      className="pm-side-toggle"
      onClick={onToggleCollapsed}
      title={translateUi(isRail ? translateUi('Mở rộng thanh bên (Ctrl+B)') : translateUi('Thu gọn thanh bên (Ctrl+B)'))}
      aria-label={translateUi(isRail ? translateUi('Mở rộng thanh bên') : translateUi('Thu gọn thanh bên'))}
    >
      <PanelLeftClose className={`size-4 transition-transform duration-200 ${isRail ? 'rotate-180' : ''}`} />
      {!isRail && <span>{translateUi("Thu gọn")}</span>}
    </button>
  );

  if (isRail) {
    return (
      <div className="shrink-0 pt-2">
        <div className="pm-side-avatar" title={translateUi(`${user?.fullName ?? ''} · ${departmentName} · ${orgName}`)}>
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
        <dd>{user?.fullName ?? translateUi('Quản lý')}</dd>
        <dt>Phòng ban đang quản lý</dt>
        <dd>
          {departments.length > 1 ? (
            <select
              aria-label={translateUi('Phòng ban đang quản lý')}
              className="w-full rounded bg-transparent text-inherit"
              value={department?.id ?? ''}
              onChange={(event) => selectDepartment(event.target.value)}
            >
              {departments.map((item) => <option className="text-slate-900" key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          ) : departmentName}
          {department?.headcount != null && <small>{department.headcount} nhân viên trong phòng ban</small>}
        </dd>
        <dt>{translateUi("Tổ chức")}</dt>
        <dd>{orgName}</dd>
      </dl>
      {toggle}
    </div>
  );
}
