import { useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/shared';
import { usePlatformAuditLog } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';
import type { PlatformAuditLogEntry } from '@/services/platform.service';

export function PlatformAuditLogPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformAuditLog({
    search: search || undefined,
    action: action || undefined,
    pageIndex,
    pageSize: 15,
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(row.timestamp)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Người thực hiện',
      cell: (row: PlatformAuditLogEntry) => (
        <div>
          <span className="font-medium text-slate-900 text-xs">{row.actorName}</span>
          <p className="text-[11px] text-slate-400 font-mono">{row.actorEmail}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Hành động',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-800">
          {row.action}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Đối tượng tác động',
      cell: (row: PlatformAuditLogEntry) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.targetName}</span>
          <span className="ml-1 text-slate-400">({row.targetType})</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Chi tiết thay đổi',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="text-xs text-slate-600 line-clamp-2">{row.details || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký kiểm toán nền tảng"
        subtitle="Ghi nhận toàn bộ thao tác quản trị nhạy cảm của Platform Admin để đảm bảo an ninh và tuân thủ"
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, email hoặc đối tượng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPageIndex(1);
          }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tất cả hành động</option>
          <option value="ORGANIZATION_SUSPENDED">Tạm khóa tổ chức</option>
          <option value="ORGANIZATION_ACTIVATED">Mở khóa tổ chức</option>
          <option value="QUOTA_UPDATED">Điều chỉnh hạn mức người dùng</option>
          <option value="USER_ACCOUNT_LOCKED">Khóa tài khoản người dùng</option>
          <option value="USER_ACCOUNT_UNLOCKED">Mở khóa tài khoản người dùng</option>
          <option value="USER_PASSWORD_RESET_ASSISTED">Cấp lại mật khẩu người dùng</option>
          <option value="PLAN_CONFIG_MODIFIED">Sửa cấu hình gói dịch vụ</option>
          <option value="SUBSCRIPTION_CANCELLED">Hủy / Dừng gói thuê bao</option>
          <option value="SOURCE_OF_TRUTH_UPDATED">Cập nhật chuẩn năng lực</option>
          <option value="COURSE_UPDATED">Biên tập khóa học</option>
          <option value="QUESTION_CREATED">Tạo câu hỏi khảo sát</option>
          <option value="QUESTION_UPDATED">Sửa câu hỏi khảo sát</option>
          <option value="TEMPLATE_CREATED">Tạo mẫu bài khảo sát</option>
          <option value="TEMPLATE_UPDATED">Cập nhật mẫu bài khảo sát</option>
          <option value="SYSTEM_SETTINGS_UPDATED">Đổi cấu hình hệ thống</option>
        </select>
      </div>

      {isLoading && <div className="p-8 text-center text-slate-500">Đang tải nhật ký kiểm toán…</div>}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải nhật ký kiểm toán.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <DataTable
            data={data.items}
            columns={columns}
            keyExtractor={(row) => row.id}
            emptyTitle="Không có nhật ký nào phù hợp."
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pageIndex} / {data.totalPages} (Tổng số {data.totalItems} nhật ký)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={pageIndex >= data.totalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
