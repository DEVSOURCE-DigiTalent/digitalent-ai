import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Lock, Unlock, KeyRound, AlertTriangle } from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, Modal } from '@/components/shared';
import {
  usePlatformUsers, useToggleUserStatus, useResetUserPasswordAssistance,
} from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';
import type { PlatformUserDto } from '@/services/platform.service';

function roleLabel(role: string): string {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'Quản trị nền tảng';
    case 'OWNER':
      return 'Chủ doanh nghiệp';
    case 'MANAGER':
      return 'Quản lý';
    case 'EMPLOYEE':
      return 'Nhân viên';
    default:
      return role || 'Người dùng';
  }
}

export function PlatformUsersPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [workspace, setWorkspace] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformUsers({
    search: search || undefined,
    role: role || undefined,
    workspace: workspace || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 15,
  });

  const toggleUserStatus = useToggleUserStatus();
  const resetPassword = useResetUserPasswordAssistance();

  // Modals state
  const [selectedUser, setSelectedUser] = useState<PlatformUserDto | null>(null);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>();

  const openLockModal = (user: PlatformUserDto) => {
    setSelectedUser(user);
    setLockReason('');
    setActionError(undefined);
    setLockModalOpen(true);
  };

  const handleToggleLock = async () => {
    if (!selectedUser) return;
    setActionError(undefined);
    try {
      if (selectedUser.status === 'ACTIVE') {
        if (!lockReason.trim()) {
          setActionError('Vui lòng nhập lý do khóa tài khoản.');
          return;
        }
        await toggleUserStatus.mutateAsync({
          id: selectedUser.id,
          status: 'LOCKED',
          reason: lockReason.trim(),
        });
      } else {
        await toggleUserStatus.mutateAsync({
          id: selectedUser.id,
          status: 'ACTIVE',
          reason: '',
        });
      }
      setLockModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Không thể cập nhật trạng thái tài khoản.');
    }
  };

  const openResetModal = (user: PlatformUserDto) => {
    setSelectedUser(user);
    setTempPasswordResult(null);
    setActionError(undefined);
    setResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionError(undefined);
    try {
      const res = await resetPassword.mutateAsync(selectedUser.id);
      setTempPasswordResult(res.tempPassword || 'Reset@123456');
    } catch (err: any) {
      setActionError(err?.message || 'Không thể tạo mật khẩu tạm thời.');
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'Họ tên & Email',
      cell: (row: PlatformUserDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/users/${row.id}`)}
            className="font-medium text-primary-700 hover:underline text-left block"
          >
            {row.fullName}
          </button>
          <span className="text-xs text-slate-500 font-mono">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò & Không gian',
      cell: (row: PlatformUserDto) => (
        <div>
          <div className="flex flex-wrap gap-1">
            {row.roles.length === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                Người dùng cá nhân
              </span>
            ) : (
              row.roles.map((r) => (
                <span
                  key={r}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    r === 'PLATFORM_ADMIN'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : r === 'OWNER'
                      ? 'bg-primary-50 text-primary-800 border border-primary-200'
                      : r === 'MANAGER'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {roleLabel(r)}
                </span>
              ))
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {row.workspace === 'enterprise' ? 'Doanh nghiệp' : 'Cá nhân'}
          </span>
        </div>
      ),
    },
    {
      key: 'org',
      header: 'Tổ chức',
      cell: (row: PlatformUserDto) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.organizationName || '— (Tự do)'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformUserDto) => (
        <div>
          <StatusBadge
            label={row.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
            variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
          />
          {row.lockReason && (
            <p className="text-[11px] text-red-600 mt-0.5 max-w-[150px] truncate" title={row.lockReason}>
              {row.lockReason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      cell: (row: PlatformUserDto) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác hỗ trợ',
      cell: (row: PlatformUserDto) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/platform/users/${row.id}`)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Xem chi tiết"
          >
            <Eye className="size-3.5" />
            Chi tiết
          </button>
          <button
            type="button"
            onClick={() => openLockModal(row)}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium ${
              row.status === 'ACTIVE'
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={row.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          >
            {row.status === 'ACTIVE' ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
            {row.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
          </button>
          <button
            type="button"
            onClick={() => openResetModal(row)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Hỗ trợ đặt lại mật khẩu"
          >
            <KeyRound className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý tài khoản người dùng"
        subtitle="Giám sát, hỗ trợ mở khóa tài khoản và thiết lập lại mật khẩu cho người dùng toàn hệ thống"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc email người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="PLATFORM_ADMIN">Quản trị nền tảng</option>
          <option value="OWNER">Chủ doanh nghiệp</option>
          <option value="MANAGER">Quản lý</option>
          <option value="EMPLOYEE">Nhân viên</option>
        </select>
        <select
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả không gian</option>
          <option value="enterprise">Doanh nghiệp</option>
          <option value="personal">Cá nhân</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Đang tải danh sách tài khoản người dùng…</div>
      ) : isError || !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách tài khoản người dùng.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      ) : (
        <DataTable
          data={data.items}
          columns={columns}
          keyExtractor={(row) => row.id}
          pageInfo={{
            page: pageIndex,
            pageSize: 15,
            total: data.totalItems,
            onPageChange: setPageIndex,
          }}
          emptyTitle="Không tìm thấy tài khoản người dùng phù hợp."
        />
      )}

      {/* Lock/Unlock Modal */}
      <Modal
        open={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title={selectedUser?.status === 'ACTIVE' ? 'Xác nhận khóa tài khoản người dùng' : 'Xác nhận mở khóa tài khoản'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {selectedUser?.status === 'ACTIVE' ? (
              <>
                Tài khoản <strong className="text-slate-900">{selectedUser?.email}</strong> sẽ không thể đăng nhập vào bất kỳ không gian làm việc nào cho đến khi được mở lại.
              </>
            ) : (
              <>
                Mở lại quyền truy cập cho tài khoản <strong className="text-slate-900">{selectedUser?.email}</strong>.
              </>
            )}
          </p>

          {selectedUser?.status === 'ACTIVE' && (
            <div>
              <label htmlFor="user-lock-reason" className="block text-sm font-medium text-slate-700 mb-1">
                Lý do khóa tài khoản (bắt buộc)
              </label>
              <textarea
                id="user-lock-reason"
                rows={3}
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Ví dụ: Nghi ngờ truy cập trái phép, yêu cầu của chủ doanh nghiệp..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}

          {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLockModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleToggleLock}
              disabled={toggleUserStatus.isPending}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                selectedUser?.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {toggleUserStatus.isPending ? 'Đang xử lý…' : selectedUser?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Assistance Modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Hỗ trợ đặt lại mật khẩu tạm thời"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Cấp mật khẩu tạm thời cho tài khoản <strong className="text-slate-900">{selectedUser?.email}</strong>. Người dùng sẽ được yêu cầu đổi mật khẩu sau khi đăng nhập thành công.
          </p>

          {tempPasswordResult ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-800">Mật khẩu tạm thời đã được tạo:</p>
              <p className="mt-1 text-base font-mono font-bold text-emerald-950 select-all tracking-wider">
                {tempPasswordResult}
              </p>
              <p className="mt-2 text-[11px] text-emerald-700">
                Hãy sao chép và gửi mật khẩu này cho người dùng qua kênh liên lạc an toàn.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>Hành động này sẽ được ghi vào nhật ký can thiệp kỹ thuật (Audit Log).</span>
            </div>
          )}

          {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
            {!tempPasswordResult && (
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {resetPassword.isPending ? 'Đang tạo…' : 'Tạo mật khẩu tạm'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
