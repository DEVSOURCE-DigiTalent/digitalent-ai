import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Building2 } from 'lucide-react';
import { DataTable, PageHeader, StatusBadge, Tabs, type Column } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMembers, useRoles } from '@/hooks/use-members';
import { useDepartments } from '@/hooks/use-departments';
import { PERMISSIONS } from '@/hooks/use-permission';
import { assignableRoles, canManageMember } from '@/lib/role-policy';
import { ROLES } from '@/lib/roles';
import type { MemberListItem } from '@/services/member.service';
import { SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { ChangeRoleModal } from '../components/MemberDialogs';
import { AssignManagerDepartmentsModal } from '../components/AssignManagerDepartmentsModal';
import { rolesLabel } from '../member-labels';

const PAGE_SIZE = 15;

/**
 * OW-13: Role & Access (UI/UX spec v2.1 §3.2, §9, §10).
 * - 3 Enterprise Roles: Chủ doanh nghiệp (OWNER), Quản lý (MANAGER), Nhân viên (EMPLOYEE).
 * - Assign/Revoke OWNER with strong confirmation warning.
 * - Assign/Revoke MANAGER and assign departments to Managers (updates department.managerEmployeeId).
 * - Protect last owner invariant: prevents downgrading/locking the only owner.
 */
export function RolesAccessPage() {
  const user = useCurrentUser((s) => s.user)!;
  const can = useCurrentUser((s) => s.hasPermission);
  const canAssign = can(PERMISSIONS.ROLE_ASSIGN_BUSINESS) && assignableRoles(user.roles).length > 0;
  const canAssignDepartments = can(PERMISSIONS.DEPARTMENT_CREATE_UPDATE);

  const { data: roles } = useRoles();
  const [activeTab, setActiveTab] = useState('members');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [editingRoleMember, setEditingRoleMember] = useState<MemberListItem | null>(null);
  const [managingDeptMember, setManagingDeptMember] = useState<MemberListItem | null>(null);

  const { data: membersData, isLoading: membersLoading } = useMembers({
    status: 'ACTIVE',
    role: roleFilter || undefined,
    pageIndex: page,
    pageSize: PAGE_SIZE,
  });

  // Managers get their own query: the member table above is paged and may be filtered to another role.
  const { data: managersData, isLoading: managersLoading } = useMembers({ status: 'ACTIVE', role: ROLES.MANAGER, pageSize: 100 });

  const { data: deptData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const allDepartments = deptData?.items || [];

  const members = membersData?.items ?? [];
  // Counted over the whole organization, not the current page (the backend still refuses removing the last Owner).
  const ownerCount = roles?.find((role) => role.role === ROLES.OWNER)?.memberCount;
  const isOnlyOneOwner = ownerCount !== undefined && ownerCount <= 1;

  const memberColumns: Column<MemberListItem>[] = [
    {
      key: 'name',
      header: 'Thành viên',
      cell: (m) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-xs text-slate-700">
            {m.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              to={`/enterprise/members/${m.id}`}
              className="font-medium text-slate-900 hover:underline"
            >
              {m.fullName}
            </Link>
            <p className="text-xs text-slate-500">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban / Vị trí',
      cell: (m) => (
        <div className="text-xs text-slate-700">
          <p className="font-medium">{m.departmentName ?? '—'}</p>
          <p className="text-slate-500">{m.positionName ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò hiện tại',
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
            {rolesLabel(m.roles)}
          </span>
          {m.roles.includes(ROLES.OWNER) && isOnlyOneOwner && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-2xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset">
              Chủ sở hữu duy nhất
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (m) => {
        const isProtectedOwner = m.roles.includes(ROLES.OWNER) && isOnlyOneOwner;

        if (isProtectedOwner) {
          return (
            <span className="text-xs text-slate-400 italic">
              Không thể hạ quyền Chủ sở hữu duy nhất
            </span>
          );
        }

        return canAssign && canManageMember(user.roles, m.roles) ? (
          <button
            type="button"
            onClick={() => setEditingRoleMember(m)}
            className={SECONDARY_BUTTON}
            aria-label={`Đổi vai trò của ${m.fullName}`}
          >
            Đổi vai trò
          </button>
        ) : (
          <span className="text-xs text-slate-400">Không có quyền đổi</span>
        );
      },
    },
  ];

  const managers = managersData?.items ?? [];

  const managerColumns: Column<MemberListItem>[] = [
    {
      key: 'name',
      header: 'Quản lý (Manager)',
      cell: (m) => (
        <div>
          <p className="font-medium text-slate-900">{m.fullName}</p>
          <p className="text-xs text-slate-500">{m.email}</p>
        </div>
      ),
    },
    {
      key: 'managedDepartments',
      header: 'Phòng ban được phân công quản lý',
      cell: (m) => {
        const managed = allDepartments.filter((d) => m.employeeId && d.managerEmployeeId === m.employeeId);
        if (managed.length === 0) {
          return (
            <span className="text-xs text-amber-700 italic bg-amber-50 px-2 py-0.5 rounded-sm">
              Chưa phân công phòng ban nào (chưa có phạm vi nhóm)
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1.5">
            {managed.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200"
              >
                <Building2 className="size-3" />
                {d.name} ({d.code})
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (m) =>
        canAssignDepartments ? (
          <button
            type="button"
            onClick={() => setManagingDeptMember(m)}
            className={SECONDARY_BUTTON}
          >
            Phân công phòng ban
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vai trò và phân quyền"
        subtitle="Mô hình 3 vai trò chuẩn hóa của DigiTalent AI: Chủ doanh nghiệp, Quản lý và Nhân viên"
      />

      {/* Role Cards Summary */}
      <ul className="grid gap-4 md:grid-cols-3" aria-label="3 vai trò Enterprise">
        {(roles ?? []).map((role) => (
          <li key={role.role} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{role.name}</h2>
                <span className="text-xs font-mono text-slate-400">{role.role}</span>
              </div>
              <StatusBadge label={`${role.memberCount} người`} />
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{role.summary}</p>
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
              {role.can.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Tabs for Member Roles & Manager Department Scopes */}
      <Tabs
        label="Quản lý phân quyền"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'members', label: 'Thành viên & Vai trò' },
          { id: 'managers', label: 'Phân công Quản lý phòng ban', badge: managers.length },
        ]}
      >
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Danh sách tài khoản & vai trò</h3>
              <select
                aria-label="Lọc vai trò"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-primary-500"
              >
                <option value="">Tất cả vai trò</option>
                <option value={ROLES.OWNER}>Chủ doanh nghiệp</option>
                <option value={ROLES.MANAGER}>Quản lý</option>
                <option value={ROLES.EMPLOYEE}>Nhân viên</option>
              </select>
            </div>

            <DataTable
              columns={memberColumns}
              data={members}
              keyExtractor={(m) => m.id}
              isLoading={membersLoading}
              emptyTitle="Chưa có thành viên nào"
              pageInfo={{
                page,
                pageSize: PAGE_SIZE,
                total: membersData?.totalItems ?? 0,
                onPageChange: setPage,
              }}
            />
          </div>
        )}

        {activeTab === 'managers' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
              <p className="font-semibold text-blue-950 mb-1">Quy tắc phạm vi quản lý của Manager:</p>
              <p>
                Phạm vi nhóm của Manager được xác định duy nhất qua các phòng ban được phân công dưới đây.
                Manager chỉ được theo dõi dữ liệu nhân sự, giao nhiệm vụ thực tế và chấm điểm minh chứng
                cho nhân viên thuộc phòng ban mình phụ trách.
              </p>
            </div>

            <DataTable
              columns={managerColumns}
              data={managers}
              keyExtractor={(m) => m.id}
              isLoading={managersLoading}
              emptyTitle="Chưa có Quản lý (Manager) nào"
              emptyDescription="Hãy gán vai trò Quản lý cho thành viên ở tab 'Thành viên & Vai trò' trước."
            />
          </div>
        )}
      </Tabs>

      {editingRoleMember && (
        <ChangeRoleModal
          member={editingRoleMember}
          open={Boolean(editingRoleMember)}
          onClose={() => setEditingRoleMember(null)}
        />
      )}

      {managingDeptMember && (
        <AssignManagerDepartmentsModal
          manager={managingDeptMember}
          open={Boolean(managingDeptMember)}
          onClose={() => setManagingDeptMember(null)}
        />
      )}
    </div>
  );
}
