import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Shield, Lock, Unlock, KeyRound, CheckCircle2,
  AlertTriangle, Mail, Phone, Briefcase, Calendar,
} from 'lucide-react';
import { PageHeader, StatusBadge, Modal } from '@/components/shared';
import {
  usePlatformUser, useToggleUserStatus, useResetUserPasswordAssistance,
} from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';

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

export function PlatformUserDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = usePlatformUser(id);
  const toggleUserStatus = useToggleUserStatus();
  const resetPassword = useResetUserPasswordAssistance();

  // Modals state
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin tài khoản người dùng…</div>;
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/users')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Không tìm thấy tài khoản người dùng.
        </div>
      </div>
    );
  }

  const handleToggleLock = async () => {
    setActionError(undefined);
    try {
      if (user.status === 'ACTIVE') {
        if (!lockReason.trim()) {
          setActionError('Vui lòng nhập lý do khóa tài khoản.');
          return;
        }
        await toggleUserStatus.mutateAsync({
          id: user.id,
          status: 'LOCKED',
          reason: lockReason.trim(),
        });
      } else {
        await toggleUserStatus.mutateAsync({
          id: user.id,
          status: 'ACTIVE',
          reason: '',
        });
      }
      setLockModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Không thể cập nhật trạng thái tài khoản.');
    }
  };

  const handleResetPassword = async () => {
    setActionError(undefined);
    try {
      const res = await resetPassword.mutateAsync(user.id);
      setTempPasswordResult(res.tempPassword || 'Reset@123456');
    } catch (err: any) {
      setActionError(err?.message || 'Không thể tạo mật khẩu tạm thời.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/platform/users')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách người dùng
        </button>
      </div>

      <PageHeader
        title={user.fullName}
        subtitle={`Mã tài khoản: ${user.id} · Email đăng nhập: ${user.email}`}
      />

      {/* Warning banner if locked */}
      {user.status === 'LOCKED' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tài khoản này đang bị khóa quyền truy cập</p>
            <p className="mt-0.5 text-red-700">Lý do: {user.lockReason || 'Khóa bởi quản trị viên hệ thống'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Identity & Contact info */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="size-5 text-primary-600" />
              Thông tin định danh & Liên hệ
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500 font-medium">Họ và tên</dt>
                <dd className="mt-1 text-slate-900 font-semibold">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Địa chỉ Email</dt>
                <dd className="mt-1 text-slate-900 flex items-center gap-2">
                  <Mail className="size-4 text-slate-400" />
                  <span>{user.email}</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Số điện thoại</dt>
                <dd className="mt-1 text-slate-900 flex items-center gap-2">
                  <Phone className="size-4 text-slate-400" />
                  <span>{user.phone || 'Chưa cập nhật'}</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Chức danh / Nghề nghiệp</dt>
                <dd className="mt-1 text-slate-900 flex items-center gap-2">
                  <Briefcase className="size-4 text-slate-400" />
                  <span>{user.jobTitle || 'Chuyên viên'}</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Trạng thái xác thực Email</dt>
                <dd className="mt-1 flex items-center gap-1.5">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                      <CheckCircle2 className="size-3.5" /> Đã xác thực
                    </span>
                  ) : (
                    <span className="text-amber-700 text-xs font-medium">Chưa xác thực</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Trạng thái tài khoản</dt>
                <dd className="mt-1">
                  <StatusBadge
                    label={user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã bị khóa'}
                    variant={user.status === 'ACTIVE' ? 'success' : 'danger'}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Ngày khởi tạo tài khoản</dt>
                <dd className="mt-1 text-slate-900 flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span>{formatDate(user.createdAt)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Lần đăng nhập gần nhất</dt>
                <dd className="mt-1 text-slate-900">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Chưa ghi nhận'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="size-5 text-primary-600" />
              Tổ chức & Vai trò trong hệ thống
            </h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase">Tổ chức doanh nghiệp</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {user.organizationName || 'Không trực thuộc doanh nghiệp (Người dùng cá nhân)'}
                  </p>
                  {user.organizationId && (
                    <p className="text-xs text-slate-400">Mã tổ chức: {user.organizationId}</p>
                  )}
                </div>
                {user.organizationId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/platform/organizations/${user.organizationId}`)}
                    className="text-xs font-semibold text-primary-600 hover:underline"
                  >
                    Xem tổ chức →
                  </button>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block mb-2">Vai trò được cấp phát (Roles):</span>
                <div className="flex flex-wrap gap-2">
                  {user.roles.length === 0 ? (
                    <span className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      Người dùng cá nhân (Personal Workspace)
                    </span>
                  ) : (
                    user.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-lg bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-800"
                      >
                        {roleLabel(r)} ({r})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support & Security Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="size-5 text-primary-600" />
              Hành động hỗ trợ tài khoản
            </h2>
            <div className="space-y-3">
              {user.status === 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={() => {
                    setLockReason('');
                    setLockModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Lock className="size-4" />
                  Khóa quyền truy cập
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Unlock className="size-4" />
                  Mở khóa tài khoản
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setTempPasswordResult(null);
                  setResetModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <KeyRound className="size-4" />
                Hỗ trợ đặt lại mật khẩu tạm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lock/Unlock Modal */}
      <Modal
        open={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title={user.status === 'ACTIVE' ? 'Xác nhận khóa tài khoản người dùng' : 'Xác nhận mở khóa tài khoản'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {user.status === 'ACTIVE' ? (
              <>
                Tài khoản <strong className="text-slate-900">{user.email}</strong> sẽ không thể đăng nhập vào bất kỳ không gian làm việc nào cho đến khi được mở lại.
              </>
            ) : (
              <>
                Mở lại quyền truy cập cho tài khoản <strong className="text-slate-900">{user.email}</strong>.
              </>
            )}
          </p>

          {user.status === 'ACTIVE' && (
            <div>
              <label htmlFor="user-detail-lock-reason" className="block text-sm font-medium text-slate-700 mb-1">
                Lý do khóa tài khoản (bắt buộc)
              </label>
              <textarea
                id="user-detail-lock-reason"
                rows={3}
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Ví dụ: Nghi ngờ rò rỉ tài khoản, vi phạm quy định..."
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
                user.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {toggleUserStatus.isPending ? 'Đang xử lý…' : user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
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
            Cấp mật khẩu tạm thời cho tài khoản <strong className="text-slate-900">{user.email}</strong>.
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
