import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  User,
  AlertTriangle,
  History,
  FileText,
  Calendar,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader, StatusBadge, Modal } from '@/components/shared';
import { usePlatformSubscriptionDetail, useCancelPlatformSubscription } from '@/hooks/use-platform';
import { formatDate } from '@/lib/utils';

function formatCurrency(amount: number): string {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PlatformSubscriptionDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: sub, isLoading, isError, refetch } = usePlatformSubscriptionDetail(id);
  const cancelSub = useCancelPlatformSubscription();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState<string>();
  const [actionSuccess, setActionSuccess] = useState<string>();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin gói thuê bao…</div>;
  }

  if (isError || !sub) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/subscriptions')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách đăng ký
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không tìm thấy thông tin gói thuê bao này.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleCancelSubscription = async () => {
    if (!cancelReason.trim()) {
      setActionError('Vui lòng nhập lý do hủy hoặc tạm ngừng gói thuê bao.');
      return;
    }
    setActionError(undefined);
    try {
      await cancelSub.mutateAsync({ id: sub.id, reason: cancelReason.trim() });
      setCancelModalOpen(false);
      setCancelReason('');
      setActionSuccess('Đã hủy / ngừng kích hoạt gói thuê bao thành công.');
      setTimeout(() => setActionSuccess(undefined), 4000);
    } catch (err: any) {
      setActionError(err?.message || 'Không thể hủy gói thuê bao.');
    }
  };

  const statusVariant = sub.status === 'active' ? 'success' : sub.status === 'cancelled' ? 'danger' : 'warning';
  const statusLabel = sub.status === 'active' ? 'Đang hiệu lực' : sub.status === 'cancelled' ? 'Đã hủy' : 'Hết hạn';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/subscriptions')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách gói đăng ký
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-500">Mã HĐ: {sub.id}</span>
          <StatusBadge label={statusLabel} variant={statusVariant} />
        </div>
      </div>

      <PageHeader
        title={`Chi tiết thuê bao: ${sub.customerName}`}
        subtitle={`Theo dõi thông tin thanh toán, chu kỳ hạn mức và lịch sử giao dịch của ${sub.customerName}`}
      >
        {sub.status === 'active' && (
          <button
            type="button"
            onClick={() => {
              setActionError(undefined);
              setCancelModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <AlertTriangle className="size-4" />
            Hủy / Dừng gói
          </button>
        )}
      </PageHeader>

      {actionSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2.5 text-primary-700">
            {sub.audience === 'enterprise' ? <Building2 className="size-5" /> : <User className="size-5" />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Khách hàng</p>
            <p className="text-sm font-bold text-slate-900 line-clamp-1">{sub.customerName}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{sub.customerEmail}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Gói đang áp dụng</p>
            <p className="text-sm font-bold text-slate-900">{sub.planName}</p>
            <p className="text-xs text-slate-500">{sub.seats} người dùng</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
            <Calendar className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Chu kỳ & Giá trị</p>
            <p className="text-sm font-bold text-slate-900">{formatCurrency(sub.amount)}</p>
            <p className="text-xs text-slate-500">
              {sub.cycle === 'year' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2.5 text-purple-700">
            <History className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Kỳ gia hạn tiếp theo</p>
            <p className="text-sm font-bold text-slate-900">
              {sub.renewsAt === '—' ? 'Không gia hạn' : formatDate(sub.renewsAt)}
            </p>
            <p className="text-xs text-slate-400">Bắt đầu: {formatDate(sub.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="size-4 text-slate-600" />
                Lịch sử thanh toán & Hóa đơn ({sub.paymentHistory?.length || 0})
              </h3>
            </div>
            {sub.paymentHistory && sub.paymentHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sub.paymentHistory.map((pmt) => (
                  <div key={pmt.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{pmt.id}</span>
                        <span className="text-xs text-slate-500">{formatDate(pmt.date)}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          pmt.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {pmt.status === 'PAID' ? 'Đã thanh toán' : 'Thất bại'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{pmt.note || 'Thanh toán định kỳ tự động'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(pmt.amount)}</span>
                      {pmt.invoiceUrl && (
                        <div className="mt-0.5">
                          <span className="text-xs text-primary-600 font-medium">Hóa đơn điện tử</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">Chưa có giao dịch thanh toán nào phát sinh.</div>
            )}
          </div>

          {/* Plan Change History */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="size-4 text-slate-600" />
                Lịch sử điều chỉnh gói dịch vụ ({sub.planChanges?.length || 0})
              </h3>
            </div>
            {sub.planChanges && sub.planChanges.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sub.planChanges.map((change, idx) => (
                  <div key={idx} className="p-4 space-y-1 hover:bg-slate-50 text-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(change.date)}</span>
                      <span>Thực hiện bởi: {change.changedBy}</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      Chuyển từ <span className="font-semibold text-slate-900">{change.fromPlan}</span> sang{' '}
                      <span className="font-semibold text-primary-700">{change.toPlan}</span>
                    </p>
                    {change.reason && <p className="text-xs text-slate-500 italic">Lý do: {change.reason}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">Chưa ghi nhận lịch sử thay đổi gói dịch vụ.</div>
            )}
          </div>
        </div>

        {/* Right Column: Support Log & Administrative Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="size-4 text-slate-600" />
                Nhật ký hỗ trợ & Can thiệp nền tảng
              </h3>
            </div>
            {sub.supportActions && sub.supportActions.length > 0 ? (
              <div className="divide-y divide-slate-100 p-2">
                {sub.supportActions.map((action) => (
                  <div key={action.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-medium text-slate-700">{action.actor}</span>
                      <span>{formatDate(action.timestamp)}</span>
                    </div>
                    <p className="font-semibold text-slate-900">{action.action}</p>
                    <p className="text-slate-600">{action.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">Không có nhật ký hỗ trợ đặc biệt.</div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Hủy / Tạm dừng gói thuê bao"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn đang yêu cầu hủy hoặc ngừng kích hoạt gói thuê bao cho khách hàng{' '}
            <strong className="text-slate-900">{sub.customerName}</strong>. Thao tác này sẽ làm gián đoạn quyền truy cập
            các tính năng theo gói.
          </p>

          <div>
            <label htmlFor="cancel-reason" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Lý do hủy / hỗ trợ (Bắt buộc)
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Khách hàng yêu cầu hủy qua email hỗ trợ; hoặc quá hạn thanh toán..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          {actionError && <p className="text-xs text-red-600 font-medium">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={cancelSub.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancelSub.isPending ? 'Đang xử lý…' : 'Xác nhận hủy thuê bao'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
