import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, GraduationCap } from 'lucide-react';
import { PageHeader, StatusBadge, getStatusVariant, Tabs, DataTable, type Column } from '@/components/shared';
import { useDepartment } from '@/hooks/use-departments';
import { useMembers } from '@/hooks/use-members';
import { useJobGradeLabel } from '@/hooks/use-job-grades';
import { useJobPositions } from '@/hooks/use-job-positions';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { DepartmentFormDialog } from '../components/DepartmentFormDialog';
import type { MemberListItem } from '@/services/member.service';
import type { JobPositionListItem } from '@/services/job-position.service';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS, rolesLabel } from '@/features/members/member-labels';

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.DEPARTMENT_CREATE_UPDATE);

  const { data: department, isLoading, isError } = useDepartment(id || '');
  const { data: membersData, isLoading: membersLoading } = useMembers({
    departmentId: id,
    pageSize: 50,
  });
  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({
    departmentId: id,
    pageSize: 50,
  });

  // Grade names configured by the organization (OW-12), not hard-coded defaults.
  const gradeLabel = useJobGradeLabel();

  const [tab, setTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải thông tin phòng ban…</p>;
  if (isError || !department) {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-red-600">Không tìm thấy thông tin phòng ban.</p>
        <Link to="/enterprise/departments" className="text-sm font-medium text-primary-700 underline">
          Quay lại danh sách phòng ban
        </Link>
      </div>
    );
  }

  const members = membersData?.items || [];
  const positions = positionsData?.items || [];
  const gd = department.gradeDistribution ?? {};

  const memberColumns: Column<MemberListItem>[] = [
    {
      key: 'name',
      header: 'Thành viên',
      cell: (m) => (
        <div>
          <p className="font-medium text-slate-900">{m.fullName}</p>
          <p className="text-xs text-slate-500">{m.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Vai trò', cell: (m) => rolesLabel(m.roles) },
    {
      key: 'position',
      header: 'Vị trí & Cấp bậc',
      cell: (m) => (
        <div>
          <span>{m.positionName ?? '—'}</span>
          {m.jobGrade && (
            <span className="ml-1.5 inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700">
              {m.jobGrade}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (m) => (
        <StatusBadge
          label={MEMBER_STATUS_LABELS[m.status]}
          variant={MEMBER_STATUS_VARIANTS[m.status]}
        />
      ),
    },
  ];

  const positionColumns: Column<JobPositionListItem>[] = [
    { key: 'code', header: 'Mã', cell: (p) => <span className="font-mono">{p.code}</span> },
    { key: 'name', header: 'Tên vị trí', cell: (p) => p.name },
    {
      key: 'grade',
      header: 'Cấp bậc',
      cell: (p) =>
        p.jobGrade ? (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
            {p.jobGrade}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (p) => <StatusBadge label={p.status === 'ACTIVE' ? 'Đang dùng' : 'Ngừng dùng'} variant={p.status === 'ACTIVE' ? 'success' : 'default'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/enterprise/departments"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh sách phòng ban
      </Link>

      <PageHeader
        title={department.name}
        subtitle={`Mã: ${department.code} · ${department.parentDepartmentName ? `Trực thuộc: ${department.parentDepartmentName}` : 'Phòng ban cấp cao nhất'}`}
      >
        <StatusBadge
          label={department.status === 'ACTIVE' ? 'Đang dùng' : 'Ngừng dùng'}
          variant={getStatusVariant(department.status)}
        />
        {canManage && (
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Edit2 className="size-4" />
            Sửa phòng ban
          </button>
        )}
      </PageHeader>

      <Tabs
        label="Chi tiết phòng ban"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'members', label: 'Thành viên', badge: members.length },
          { id: 'positions', label: 'Vị trí công việc', badge: positions.length },
          { id: 'training', label: 'Tiến độ đào tạo' },
        ]}
      >
        {tab === 'overview' && (
          <div className="space-y-6">
            <dl className="grid gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-white p-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-slate-500">Mã phòng ban</dt>
                <dd className="mt-1 font-mono font-semibold text-slate-900">{department.code}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Tên phòng ban</dt>
                <dd className="mt-1 font-medium text-slate-900">{department.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Quản lý (Manager)</dt>
                <dd className="mt-1 font-semibold text-primary-700">
                  {department.managerName || 'Chưa phân công'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Phòng ban cấp trên</dt>
                <dd className="mt-1 text-slate-900">{department.parentDepartmentName || 'Không có'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Tổng nhân sự</dt>
                <dd className="mt-1 font-semibold text-slate-900">{department.headcount ?? members.length} người</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Mô tả</dt>
                <dd className="mt-1 text-slate-700">{department.description || 'Chưa có mô tả'}</dd>
              </div>
            </dl>

            {/* Phân bố Cấp bậc trong phòng ban */}
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Cơ cấu Cấp bậc (G1 – G3) trong phòng ban
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-teal-50 p-4 border border-teal-100">
                  <span className="text-xs font-medium text-teal-800">{gradeLabel('G1')}</span>
                  <p className="text-2xl font-bold text-teal-900 mt-1">{gd.G1 ?? 0}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <span className="text-xs font-medium text-blue-800">{gradeLabel('G2')}</span>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{gd.G2 ?? 0}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
                  <span className="text-xs font-medium text-purple-800">{gradeLabel('G3')}</span>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{gd.G3 ?? 0}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'members' && (
          <div className="space-y-4">
            <DataTable
              columns={memberColumns}
              data={members}
              keyExtractor={(m) => m.id}
              isLoading={membersLoading}
              emptyTitle="Chưa có thành viên nào"
              emptyDescription="Chưa có nhân viên nào được phân công vào phòng ban này."
            />
          </div>
        )}

        {tab === 'positions' && (
          <div className="space-y-4">
            <DataTable
              columns={positionColumns}
              data={positions}
              keyExtractor={(p) => p.id}
              isLoading={positionsLoading}
              emptyTitle="Chưa có vị trí nào"
              emptyDescription="Chưa có vị trí công việc nào trực thuộc phòng ban này."
            />
          </div>
        )}

        {tab === 'training' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            <GraduationCap className="size-8 mx-auto text-slate-400 mb-2" />
            <p className="font-medium text-slate-700">Theo dõi đào tạo theo phòng ban</p>
            <p className="text-xs text-slate-500 mt-1">
              Các khóa học và đợt đào tạo của nhân viên trong phòng ban này được quản lý tại mục Đợt đào tạo.
            </p>
            <Link
              to="/enterprise/training-batches"
              className="mt-3 inline-block font-medium text-primary-700 hover:underline text-xs"
            >
              Xem các đợt đào tạo &rarr;
            </Link>
          </div>
        )}
      </Tabs>

      {isEditOpen && (
        <DepartmentFormDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          department={department}
        />
      )}
    </div>
  );
}
