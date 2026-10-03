import { useState } from 'react';
import { DataTable, PageHeader, type Column } from '@/components/shared';
import { useAuditLog } from '@/hooks/use-organization';
import { formatDateTime } from '@/lib/utils';
import type { AuditEntry } from '@/services/organization.service';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { AUDIT_ACTION_LABELS, auditActionLabel } from '@/features/members/member-labels';

const PAGE_SIZE = 20;

/** ADM-11: who changed what in the organization: roles, members, plan and other sensitive settings. */
export function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLog({ pageIndex: page, pageSize: PAGE_SIZE, search: search || undefined, action: action || undefined });

  const columns: Column<AuditEntry>[] = [
    { key: 'at', header: 'Thời gian', cell: (e) => formatDateTime(e.at), className: 'whitespace-nowrap' },
    { key: 'actor', header: 'Người thực hiện', cell: (e) => e.actorName },
    { key: 'action', header: 'Hành động', cell: (e) => auditActionLabel(e.action) },
    { key: 'target', header: 'Đối tượng', cell: (e) => <span>{e.targetLabel}<span className="block text-xs text-slate-500">{e.targetType}</span></span> },
    { key: 'detail', header: 'Chi tiết', cell: (e) => e.detail ?? '—', hideOnMobile: true },
  ];

  return (
    <div>
      <PageHeader title="Nhật ký tổ chức" subtitle="Các thay đổi nhạy cảm: vai trò, thành viên, gói dịch vụ, cấu hình" />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(e) => e.id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Tìm theo người, đối tượng hoặc chi tiết"
        emptyTitle="Chưa có mục nào trong nhật ký"
        filters={
          <select aria-label="Lọc theo hành động" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={INPUT_CLASS}>
            <option value="">Mọi hành động</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        }
        pageInfo={{ page, pageSize: PAGE_SIZE, total: data?.totalItems ?? 0, onPageChange: setPage }}
      />
    </div>
  );
}
