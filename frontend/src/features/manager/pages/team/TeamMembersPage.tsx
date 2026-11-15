import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Mail, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/shared';
import { PageLoading, SectionLoading } from '@/components/shared/LoadingState';
import { LoadError } from '@/features/pulse-employee/components/ui';
import { Initials, ManagerPage, ManagerPageHeader, NoDepartment } from '@/features/pulse-manager/components/ManagerUi';
import { MANAGER_PATHS } from '@/features/pulse-manager/lib/paths';
import { useEmployees } from '@/hooks/use-employees';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { EmployeeStatus } from '@/services/employee.service';
import './team-members.css';

const PAGE_SIZES = [2, 5, 10, 20, 50];
const STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Đang làm việc',
  INACTIVE: 'Ngừng hoạt động',
  TRANSFERRED: 'Đã chuyển công tác',
  ARCHIVED: 'Đã lưu trữ',
};

export function TeamMembersPage() {
  const { department, isLoading, isError, refetch } = useManagedDepartment();

  return (
    <ManagerPage>
      <ManagerPageHeader title="Nhân viên phòng ban" scope={department?.name} />
      {isLoading ? <PageLoading label="Đang tải danh sách nhân viên..." />
        : isError ? <LoadError message="Không tải được phòng ban bạn phụ trách." onRetry={refetch} />
        : department ? <DepartmentDirectory key={department.id} departmentId={department.id} />
        : <NoDepartment />}
    </ManagerPage>
  );
}

function DepartmentDirectory({ departmentId }: { departmentId: string }) {
  useUiLanguage();
  const [search, setSearch] = useState('');
  const [positionId, setPositionId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previousTotal, setPreviousTotal] = useState(0);
  const employees = useEmployees({
    departmentId, search: search.trim() || undefined, positionId: positionId || undefined,
    status: status || undefined, pageIndex: page, pageSize,
  });
  const positions = useJobPositions({ departmentId, includeAssignedPositions: true, pageIndex: 1, pageSize: 100 });
  const total = employees.data?.totalItems ?? previousTotal;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const outOfRange = employees.data != null && page > lastPage;
  const hasFilters = Boolean(search.trim() || positionId || status);
  const searchLabel = translateUi('Tìm theo tên hoặc mã nhân viên');

  useEffect(() => {
    if (outOfRange) setPage(lastPage);
  }, [lastPage, outOfRange]);
  useEffect(() => {
    if (employees.data) setPreviousTotal(employees.data.totalItems);
  }, [employees.data]);

  const items = employees.data?.items ?? [];

  return (
    <section className="manager-directory" aria-label={translateUi('Danh sách nhân viên')}>
      <div className="manager-directory__toolbar">
        <label className="manager-directory__search">
          <Search size={17} aria-hidden="true" />
          <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
        <DirectoryPicker label={translateUi('Lọc theo vị trí công việc')} value={positionId}
          options={[{ value: '', label: translateUi('Tất cả vị trí') },
            ...(positions.data?.items ?? []).map(({ id, name }) => ({ value: id, label: name }))]}
          onChange={(value) => { setPositionId(value); setPage(1); }} />
        <DirectoryPicker label={translateUi('Lọc theo trạng thái')} value={status}
          options={[{ value: '', label: translateUi('Mọi trạng thái') },
            ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label: translateUi(label) }))]}
          onChange={(value) => { setStatus(value); setPage(1); }} />
      </div>

      {positions.isError && (
        <div className="manager-directory__notice" role="status">
          {translateUi('Không tải được bộ lọc vị trí.')}
          <button type="button" onClick={() => void positions.refetch()}>{translateUi('Thử lại')}</button>
        </div>
      )}
      {employees.isLoading || outOfRange ? <SectionLoading label="Đang tải danh sách nhân viên..." />
        : employees.isError ? <LoadError message="Không tải được danh sách nhân viên trong phòng ban." onRetry={employees.refetch} />
        : items.length === 0 ? <div className="manager-directory__empty">
          <EmptyState
            title={translateUi(hasFilters ? 'Không tìm thấy nhân viên phù hợp' : 'Phòng ban chưa có nhân viên')}
            action={hasFilters && <button className="manager-directory__reset" type="button" onClick={() => {
              setSearch(''); setPositionId(''); setStatus(''); setPage(1);
            }}>{translateUi('Xóa bộ lọc')}</button>}
          />
        </div> : <ul className="manager-directory__grid" data-paired={items.length === 4} role="list">
          {items.map((row) => (
            <li key={row.id}>
              <Link className="manager-directory__person" to={MANAGER_PATHS.member(row.id)}>
                <div className="manager-directory__identity">
                  <Initials name={row.fullName} />
                  <div><h2>{row.fullName}</h2><small>{row.employeeCode}</small></div>
                  <span className="manager-directory__open"><ArrowUpRight size={17} aria-hidden="true" /></span>
                </div>
                <p className="manager-directory__position">{row.positionName || row.jobPositionName || translateUi('Chưa có vị trí')}</p>
                {row.workEmail && <p className="manager-directory__email"><Mail size={14} aria-hidden="true" />{row.workEmail}</p>}
                <span className="manager-directory__status" data-active={row.status === 'ACTIVE'}>
                  {translateUi(STATUS_LABELS[row.status as EmployeeStatus] ?? 'Chưa xác định')}
                </span>
              </Link>
            </li>
          ))}
        </ul>}

      <div className="manager-directory__pagination">
        <span role="status">
          {employees.isSuccess && !outOfRange && (
            total > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} / ${total}` : '0'
          )}
          {employees.isSuccess && !outOfRange && ` ${translateUi('nhân viên')}`}
        </span>
        <DirectoryPicker label={translateUi('Số dòng mỗi trang')} value={String(pageSize)} placement="above"
          options={PAGE_SIZES.map((size) => ({ value: String(size), label: `${size} / ${translateUi('trang')}` }))}
          onChange={(value) => { setPageSize(Number(value)); setPage(1); }} />
        <nav className="manager-directory__page-controls" aria-label={translateUi('Phân trang danh sách nhân viên')}>
          <button type="button" aria-label={translateUi('Trang trước')} disabled={!employees.isSuccess || page <= 1 || outOfRange}
            onClick={() => setPage(page - 1)}><ChevronLeft size={17} aria-hidden="true" /></button>
          <span aria-current="page">{translateUi('Trang ')}{page} / {lastPage}</span>
          <button type="button" aria-label={translateUi('Trang sau')} disabled={!employees.isSuccess || page >= lastPage || outOfRange}
            onClick={() => setPage(page + 1)}><ChevronRight size={17} aria-hidden="true" /></button>
        </nav>
      </div>
    </section>
  );
}

function DirectoryPicker({ label, value, options, onChange, placement = 'below' }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placement?: 'above' | 'below';
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return <div className="manager-directory__picker" ref={root} data-placement={placement}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={(event) => {
      if (open && event.key === 'Escape') { event.preventDefault(); close(); }
    }}>
    <button ref={trigger} type="button" className="manager-directory__trigger" aria-label={label}
      aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>
      <span>{options.find((option) => option.value === value)?.label ?? label}</span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div id={id} role="group" aria-label={label} className="manager-directory__popup">
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => {
          close();
          onChange(option.value);
        }}>
          <span>{option.label}</span>
          {option.value === value && <Check size={16} aria-hidden="true" />}
        </button>
      ))}
    </div>}
  </div>;
}
