import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Users, ShieldAlert, CheckCircle2, Sliders, AlertTriangle,
  CreditCard, Activity, Phone, History,
} from 'lucide-react';
import { PageHeader, StatusBadge, Modal, DataTable } from '@/components/shared';
import {
  usePlatformOrganization, useToggleOrgStatus, useUpdateOrgQuota, usePlatformAuditLog,
} from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';
import type { PlatformAuditLogEntry } from '@/services/platform.service';

type TabKey = 'overview' | 'subscription' | 'usage' | 'contacts' | 'history';

export function PlatformOrgDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { data: org, isLoading, isError } = usePlatformOrganization(id);
  const { data: auditData } = usePlatformAuditLog({ search: org?.name });
  const toggleStatus = useToggleOrgStatus();
  const updateQuota = useUpdateOrgQuota();

  // Modals state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [newSeatLimit, setNewSeatLimit] = useState(10);
  const [actionError, setActionError] = useState<string>();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin chi tiết tổ chức…</div>;
  }

  if (isError || !org) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/organizations')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Không tìm thấy thông tin tổ chức khách hàng.
        </div>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    setActionError(undefined);
    try {
      if (org.status === 'ACTIVE') {
        if (!suspendReason.trim()) {
          setActionError('Vui lòng nhập lý do tạm khóa tổ chức.');
          return;
        }
        await toggleStatus.mutateAsync({ id: org.id, status: 'SUSPENDED', reason: suspendReason.trim() });
        setSuspendModalOpen(false);
        setSuspendReason('');
      } else {
        await toggleStatus.mutateAsync({ id: org.id, status: 'ACTIVE', reason: '' });
      }
    } catch (e: any) {
      setActionError(e?.message || 'Không thể cập nhật trạng thái tổ chức.');
    }
  };

  const handleUpdateQuota = async () => {
    setActionError(undefined);
    try {
      await updateQuota.mutateAsync({ id: org.id, seatLimit: Number(newSeatLimit) });
      setQuotaModalOpen(false);
    } catch (e: any) {
      setActionError(e?.message || 'Không thể cập nhật hạn mức người dùng.');
    }
  };

  const auditLogs = auditData?.items ?? [];

  const auditColumns = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="text-xs text-slate-500">{formatDate(row.timestamp)}</span>
      ),
    },
    {
      key: 'actor',
      header: 'Người thực hiện',
      cell: (row: PlatformAuditLogEntry) => (
        <div>
          <span className="font-medium text-slate-800 text-xs block">{row.actorName}</span>
          <span className="text-[11px] text-slate-400">{row.actorEmail}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Hành động',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
          {row.action}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Chi tiết ghi nhận',
      cell: (row: PlatformAuditLogEntry) => (
        <span className="text-xs text-slate-700">{row.details || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/platform/organizations')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách tổ chức
        </button>
      </div>

      <PageHeader
        title={org.name}
        subtitle={`Mã tổ chức: ${org.id} · Đăng ký ngày ${formatDate(org.createdAt)}`}
      />

      {/* Status banner if suspended */}
      {org.status === 'SUSPENDED' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tổ chức này đang bị tạm khóa truy cập</p>
            <p className="mt-0.5 text-red-700">Lý do ghi nhận: {org.suspensionReason || 'Vi phạm điều khoản dịch vụ hoặc chưa thanh toán'}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="size-4" />
          Tổng quan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'subscription'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="size-4" />
          Gói dịch vụ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'usage'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="size-4" />
          Sử dụng tài nguyên
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'contacts'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="size-4" />
          Thông tin liên hệ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="size-4" />
          Lịch sử hỗ trợ
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="size-5 text-primary-600" />
                Thông tin doanh nghiệp
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Tên pháp nhân / Tổ chức</dt>
                  <dd className="mt-1 text-slate-900 font-semibold">{org.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Ngành nghề hoạt động</dt>
                  <dd className="mt-1 text-slate-900">{org.industry || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Quy mô nhân sự</dt>
                  <dd className="mt-1 text-slate-900">{org.size} người</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Trạng thái tài khoản</dt>
                  <dd className="mt-1">
                    <StatusBadge
                      label={org.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã tạm khóa'}
                      variant={org.status === 'ACTIVE' ? 'success' : 'danger'}
                    />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Cơ cấu tổ chức nền tảng</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{org.departmentsCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Phòng ban</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{org.positionsCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Vị trí công việc</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{org.membersCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Nhân sự kích hoạt</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Tóm tắt dịch vụ</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500">Gói đang áp dụng:</span>
                  <p className="font-semibold text-primary-700 text-base mt-0.5">{org.planName}</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500">Quyền sử dụng:</span>
                    <span className="font-bold text-slate-900">{org.seatsUsed} / {org.seatLimit} quyền sử dụng</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((org.seatsUsed / org.seatLimit) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Hành động quản trị nhanh</h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewSeatLimit(org.seatLimit);
                    setQuotaModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Sliders className="size-4" />
                  Điều chỉnh hạn mức người dùng
                </button>
                {org.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => setSuspendModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <ShieldAlert className="size-4" />
                    Tạm khóa tổ chức
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="size-4" />
                    Mở khóa tổ chức
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-primary-600" />
              Chi tiết gói dịch vụ và thanh toán
            </h2>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-sm">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-slate-500 font-medium">Gói dịch vụ kích hoạt</dt>
                <dd className="mt-1 text-lg font-bold text-primary-700">{org.planName}</dd>
                <dd className="text-xs text-slate-400 mt-0.5">Mã gói: {org.planCode}</dd>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-slate-500 font-medium">Hạn mức người dùng</dt>
                <dd className="mt-1 text-lg font-bold text-slate-900">{org.seatLimit} người dùng</dd>
                <dd className="text-xs text-slate-400 mt-0.5">Đã cấp: {org.seatsUsed} quyền sử dụng</dd>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-slate-500 font-medium">Trạng thái thanh toán</dt>
                <dd className="mt-1">
                  <StatusBadge
                    label={org.status === 'ACTIVE' ? 'Đã thanh toán (ACTIVE)' : 'Tạm dừng dịch vụ'}
                    variant={org.status === 'ACTIVE' ? 'success' : 'danger'}
                  />
                </dd>
                <dd className="text-xs text-slate-400 mt-1">Chu kỳ gia hạn: Hằng tháng</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setNewSeatLimit(org.seatLimit);
                  setQuotaModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Sliders className="size-4" />
                Cập nhật hạn mức người dùng
              </button>
              <button
                type="button"
                onClick={() => navigate(`/platform/subscriptions`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Xem chi tiết tại Quản lý Subscription →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Usage */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="size-5 text-primary-600" />
              Sử dụng tài nguyên và phân bổ quyền sử dụng
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-700">Tỷ lệ sử dụng quyền sử dụng:</span>
                  <span className="text-primary-700 font-bold">
                    {org.seatsUsed} / {org.seatLimit} ({Math.round((org.seatsUsed / org.seatLimit) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((org.seatsUsed / org.seatLimit) * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Còn lại {Math.max(0, org.seatLimit - org.seatsUsed)} quyền sử dụng sẵn sàng mời thêm nhân sự.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div className="rounded-lg border border-slate-100 p-4 bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 uppercase">Cơ cấu phòng ban</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{org.departmentsCount} phòng ban</p>
                  <p className="text-xs text-slate-500 mt-1">Đã thiết lập phân cấp quản trị nội bộ</p>
                </div>
                <div className="rounded-lg border border-slate-100 p-4 bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 uppercase">Vị trí công việc</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{org.positionsCount} vị trí</p>
                  <p className="text-xs text-slate-500 mt-1">Gắn khung năng lực số TT02</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="size-5 text-primary-600" />
              Đại diện chủ sở hữu & Đầu mối liên hệ
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500 font-medium">Họ và tên chủ sở hữu</dt>
                <dd className="mt-1 text-slate-900 font-semibold">{org.ownerName}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Email quản trị viên</dt>
                <dd className="mt-1 text-slate-900">{org.ownerEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Loại tài khoản</dt>
                <dd className="mt-1 text-slate-900">Chủ doanh nghiệp (OWNER)</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Kênh liên hệ hỗ trợ</dt>
                <dd className="mt-1 text-slate-900">Email & Cổng hỗ trợ kỹ thuật</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Tab 5: History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <History className="size-5 text-primary-600" />
              Lịch sử hỗ trợ kỹ thuật & Nhật ký can thiệp (Audit)
            </h2>
            <DataTable
              data={auditLogs}
              columns={auditColumns}
              keyExtractor={(row) => row.id}
              emptyTitle="Chưa có lịch sử can thiệp nào cho tổ chức này."
            />
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        open={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Xác nhận tạm khóa tổ chức"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Tài khoản thuộc tổ chức <strong className="text-slate-900">{org.name}</strong> sẽ không thể đăng nhập hoặc thao tác cho đến khi được mở khóa.
          </p>

          <div>
            <label htmlFor="suspend-reason" className="block text-sm font-medium text-slate-700 mb-1">
              Lý do tạm khóa (bắt buộc)
            </label>
            <textarea
              id="suspend-reason"
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Ví dụ: Chậm thanh toán quá hạn, vi phạm điều khoản dịch vụ..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSuspendModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={toggleStatus.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {toggleStatus.isPending ? 'Đang xử lý…' : 'Xác nhận khóa'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Quota Modal */}
      <Modal
        open={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        title="Điều chỉnh hạn mức người dùng (Quota)"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Điều chỉnh tổng số người dùng tối đa được phép cấp phát cho nhân sự của tổ chức <strong className="text-slate-900">{org.name}</strong>.
          </p>

          <div>
            <label htmlFor="quota-input" className="block text-sm font-medium text-slate-700 mb-1">
              Số người dùng tối đa mới
            </label>
            <input
              id="quota-input"
              type="number"
              min={org.seatsUsed}
              max={1000}
              value={newSeatLimit}
              onChange={(e) => setNewSeatLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-slate-500">Hiện tại tổ chức đã cấp {org.seatsUsed} quyền sử dụng.</p>
          </div>

          {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuotaModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleUpdateQuota}
              disabled={updateQuota.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updateQuota.isPending ? 'Đang lưu…' : 'Lưu hạn mức'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
