import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Mail, Users } from 'lucide-react';
import { PageHeader, DataTable, EmptyState } from '@/components/shared';
import { useEmployees } from '@/hooks/use-employees';
import { useJobPositions } from '@/hooks/use-job-positions';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import type { EmployeeDto } from '@/services/employee.service';

/**
 * MG-02: Team Members Page (Manager Scope)
 * Danh sách thành viên trong nhóm thuộc quyền quản lý của Quản lý:
 * - Bộ lọc: tìm kiếm họ tên/mã, vị trí công việc, trạng thái.
 * - Trạng thái trống hướng dẫn liên hệ Owner nếu Manager chưa được phân công phòng ban.
 */
export function TeamMembersPage() {
  const [search, setSearch] = useState('');
  const [positionId, setPositionId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data: empData, isLoading } = useEmployees({
    search: search || undefined,
    positionId: positionId || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 50,
  });

  const { data: positions } = useJobPositions();

  const filteredItems = empData?.items ?? [];
  const rawItems = filteredItems;

  const hasActiveFilters = Boolean(search || positionId || status);

  if (!isLoading && rawItems.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Thành viên nhóm"
          subtitle="Quản lý thông tin và theo dõi lộ trình phát triển kỹ năng số của từng thành viên trong bộ phận."
        />
        <div className="py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <EmptyState
            icon={<Users className="size-12 text-slate-400 mx-auto" />}
            title="Bạn chưa được phân công phụ trách phòng ban nào"
            description="Tài khoản quản lý của bạn hiện chưa được gắn với phòng ban nào trong tổ chức. Vui lòng liên hệ Quản trị viên (Owner) để được phân công quản lý bộ phận."
          />
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'fullName',
      header: 'Thành viên',
      cell: (row: EmployeeDto) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <Link
              to={`/enterprise/team/members/${row.id}`}
              className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition"
            >
              {row.fullName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">
              {row.employeeCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Vị trí công việc',
      cell: (row: EmployeeDto) => (
        <span className="text-sm font-medium text-slate-800">
          {row.positionName || 'Chưa phân vị trí'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email liên hệ',
      cell: (row: EmployeeDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
          <Mail className="size-3.5 text-slate-400" />
          {row.workEmail}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: EmployeeDto) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
            row.status === 'ACTIVE'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}
        >
          <ShieldCheck className="size-3" />
          {row.status === 'ACTIVE' ? 'Đang làm việc' : 'Đã nghỉ / Tạm dừng'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row: EmployeeDto) => (
        <Link
          to={`/enterprise/team/members/${row.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <span>Hồ sơ năng lực</span>
          <ArrowRight className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Thành viên nhóm"
          subtitle="Quản lý thông tin và theo dõi lộ trình phát triển kỹ năng số của từng thành viên trong bộ phận."
        />
        <Link
          to="/enterprise/team/skill-gap"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition shrink-0"
        >
          <span>Xem khoảng trống năng lực (Skill Gap)</span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm theo tên hoặc mã nhân viên…"
            className={`${INPUT_CLASS} pl-9`}
          />
        </div>

        <div className="w-48">
          <select
            value={positionId}
            onChange={(e) => {
              setPositionId(e.target.value);
              setPageIndex(1);
            }}
            aria-label="Lọc theo vị trí công việc"
            className={INPUT_CLASS}
          >
            <option value="">Tất cả vị trí công việc</option>
            {positions?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>


        <div className="w-36">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPageIndex(1);
            }}
            aria-label="Lọc theo trạng thái"
            className={INPUT_CLASS}
          >
            <option value="">Mọi trạng thái</option>
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Đã nghỉ việc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyTitle="Không tìm thấy nhân sự phù hợp"
          emptyDescription="Không có nhân sự nào trong nhóm phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại."
        />
      </div>
    </div>
  );
}
