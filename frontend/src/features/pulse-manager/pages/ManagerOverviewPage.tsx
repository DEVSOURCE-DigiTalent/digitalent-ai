import { Layers, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLoading } from '@/components/shared/LoadingState';
import { LoadError } from '@/features/pulse-employee/components/ui';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { translateUi } from '@/lib/i18n';
import { DevelopmentChart } from '../components/DevelopmentChart';
import { ManagerPage, ManagerPageHeader, NoDepartment } from '../components/ManagerUi';
import { ManagerFrameworkDialog } from './ManagerFrameworkPage';
import { MANAGER_PATHS } from '../lib/paths';

export function ManagerOverviewPage() {
  const { can } = usePermission();
  const { department, isLoading, isError, refetch } = useManagedDepartment();
  const [params, setParams] = useSearchParams();
  const canViewFramework = can(PERMISSIONS.COMPETENCY_READ);
  const canViewMembers = can(PERMISSIONS.EMPLOYEE_READ);
  const frameworkOpen = canViewFramework && params.get('framework') === '1';

  function setFramework(open: boolean) {
    const next = new URLSearchParams(params);
    if (open) next.set('framework', '1');
    else next.delete('framework');
    setParams(next, { replace: true, preventScrollReset: true });
  }

  return (
    <ManagerPage testId="manager-overview">
      <ManagerPageHeader scope={department?.name} title="Tổng quan phòng ban" actions={<>
        {canViewFramework && <button type="button" className="manager-heading-back" aria-haspopup="dialog" onClick={() => setFramework(true)}>
          <Layers size={16} aria-hidden="true" />{translateUi('Khung năng lực chung')}
        </button>}
        {canViewMembers && department && <Link to={MANAGER_PATHS.members} className="manager-heading-back">
          <Users size={16} aria-hidden="true" />{translateUi('Xem nhân viên')}
        </Link>}
      </>} />
      {isLoading ? <PageLoading label="Đang tải tổng quan" />
        : isError ? <LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={refetch} />
        : !department ? <NoDepartment />
        : canViewMembers ? <DevelopmentChart key={department.id} scope={{ departmentId: department.id }} />
        : null}
      <ManagerFrameworkDialog open={frameworkOpen} onClose={() => setFramework(false)} />
    </ManagerPage>
  );
}
