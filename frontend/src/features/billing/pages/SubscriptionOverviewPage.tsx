import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ConfirmActionDialog, DataTable, PageHeader, StatusBadge, type Column } from '@/components/shared';
import { useCancelSubscription, useResumeSubscription, useSubscription } from '@/hooks/use-subscription';
import { ENTITLEMENT_LABELS, type Entitlement } from '@/lib/entitlements';
import { BILLING_CYCLE_LABELS, formatVnd } from '@/lib/plans';
import { apiErrorMessage, formatDate } from '@/lib/utils';
import type { Invoice } from '@/services/subscription.service';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import { PlanChangeModal } from '../components/PlanChangeModal';

const STATUS_LABELS = {
  active: 'Đang hoạt động',
  expired: 'Đã hết hạn',
  payment_required: 'Cần thanh toán',
} as const;

/** OW-41: Subscription Overview - Current plan, seats, storage, entitlements, renewal. */
export function SubscriptionOverviewPage() {
  const { data: subscription, isLoading, isError } = useSubscription();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const [changing, setChanging] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải thông tin gói dịch vụ…</p>;
  if (isError || !subscription) return <p role="alert" className="text-sm text-red-600">Không tải được thông tin gói dịch vụ.</p>;

  const toggleCancellation = async () => {
    try {
      if (subscription.cancelAtPeriodEnd) {
        await resume.mutateAsync(undefined);
        toast.success('Đã bật lại tính năng tự động gia hạn.');
      } else {
        await cancel.mutateAsync(undefined);
        toast.success('Gói sẽ ngừng gia hạn vào cuối chu kỳ hiện tại.');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không thực hiện được thao tác.'));
    }
  };

  const seatsFull = subscription.seatLimit !== undefined && subscription.seatsUsed >= subscription.seatLimit;
  const recentInvoices = (subscription.invoices ?? []).slice(0, 3);

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'code', header: 'Mã hóa đơn', cell: (i) => <span className="font-mono text-xs font-bold text-slate-800">{i.code}</span> },
    { key: 'issuedAt', header: 'Ngày phát hành', cell: (i) => formatDate(i.issuedAt) },
    { key: 'description', header: 'Nội dung', cell: (i) => i.description },
    { key: 'amount', header: 'Số tiền', cell: (i) => formatVnd(i.amount), className: 'text-right tabular-nums font-semibold' },
    { key: 'status', header: 'Trạng thái', cell: () => <StatusBadge label="Đã thanh toán" variant="success" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Gói dịch vụ doanh nghiệp"
        subtitle="Quản lý gói dịch vụ, tình trạng gia hạn và phân quyền tính năng của tổ chức"
      />

      {/* Main Plan Card */}
      <section aria-labelledby="plan-title" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Gói hiện tại</span>
              <StatusBadge
                label={STATUS_LABELS[subscription.status]}
                variant={subscription.status === 'active' ? 'success' : 'danger'}
              />
              {subscription.cancelAtPeriodEnd && <StatusBadge label="Sẽ ngừng gia hạn" variant="warning" />}
            </div>
            <h2 id="plan-title" className="mt-2 text-3xl font-bold text-slate-900">
              {subscription.planName}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => setChanging(true)} className={PRIMARY_BUTTON}>
              Nâng cấp / Đổi gói
            </button>
            {subscription.cancelAtPeriodEnd ? (
              <button
                type="button"
                onClick={toggleCancellation}
                disabled={resume.isPending}
                className={SECONDARY_BUTTON}
              >
                Bật lại gia hạn
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className={SECONDARY_BUTTON}
              >
                Ngừng gia hạn
              </button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-slate-100">
          <div>
            <dt className="text-xs uppercase font-semibold text-slate-500">Chi phí định kỳ</dt>
            <dd className="mt-1 font-bold text-slate-900 text-base">
              {subscription.amountPerPeriod === null
                ? 'Miễn phí'
                : `${formatVnd(subscription.amountPerPeriod)} / ${BILLING_CYCLE_LABELS[subscription.cycle]}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-slate-500">Người dùng đã kích hoạt</dt>
            <dd className={`mt-1 font-bold text-base ${seatsFull ? 'text-red-600' : 'text-slate-900'}`}>
              {subscription.seatsUsed} {subscription.seatLimit !== undefined ? `/ ${subscription.seatLimit} người dùng đã kích hoạt` : 'người dùng đã kích hoạt (Không giới hạn)'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-slate-500">
              {subscription.cancelAtPeriodEnd ? 'Hết hạn vào ngày' : 'Tự động gia hạn vào'}
            </dt>
            <dd className="mt-1 text-slate-900 font-semibold text-base">{formatDate(subscription.renewsAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase font-semibold text-slate-500">Chu kỳ thanh toán</dt>
            <dd className="mt-1 text-slate-900 font-semibold text-base">Theo {BILLING_CYCLE_LABELS[subscription.cycle]}</dd>
          </div>
        </dl>

        {/* Feature Entitlements */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="mb-3 text-xs uppercase font-bold tracking-wider text-slate-500">
            Các tính năng được kích hoạt trong gói
          </p>
          <ul className="flex flex-wrap gap-2">
            {subscription.entitlements.map((key) => (
              <li key={key}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                  <ShieldCheck className="size-3.5 text-blue-600" />
                  {ENTITLEMENT_LABELS[key as Entitlement] ?? key}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 Quick Navigation Cards (Usage & Invoices) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users className="size-5" />
              <span className="font-bold text-xs uppercase tracking-wider">Mức sử dụng</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quyền sử dụng & Dung lượng lưu trữ</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dõi chi tiết mức sử dụng tài nguyên của tổ chức, số lượng thành viên đang kích hoạt và hạn mức lưu trữ hồ sơ tài liệu.
            </p>
          </div>
          <Link
            to="/enterprise/subscription/usage"
            className="inline-flex items-center gap-2 font-semibold text-sm text-blue-600 hover:text-blue-700 transition"
          >
            <span>Xem chi tiết mức sử dụng</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Receipt className="size-5" />
              <span className="font-bold text-xs uppercase tracking-wider">Hóa đơn & Thanh toán</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Lịch sử thanh toán & Hóa đơn VAT</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Truy xuất toàn bộ danh sách hóa đơn điện tử, chứng từ khấu trừ và thông tin xuất hóa đơn giá trị gia tăng của doanh nghiệp.
            </p>
          </div>
          <Link
            to="/enterprise/subscription/billing"
            className="inline-flex items-center gap-2 font-semibold text-sm text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Xem toàn bộ lịch sử hóa đơn</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Recent Invoices Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Hóa đơn thanh toán gần đây</h3>
          <Link
            to="/enterprise/subscription/billing"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Xem tất cả hóa đơn</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <DataTable
          columns={invoiceColumns}
          data={recentInvoices}
          keyExtractor={(i) => i.id}
          emptyTitle="Chưa có hóa đơn nào phát sinh"
        />
      </div>

      {changing && <PlanChangeModal open onClose={() => setChanging(false)} subscription={subscription} />}

      <ConfirmActionDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Xác nhận ngừng gia hạn gói dịch vụ?"
        description={`Gói dịch vụ của tổ chức vẫn duy trì hiệu lực sử dụng đầy đủ đến ngày ${formatDate(
          subscription.renewsAt
        )}. Sau ngày đó, tài khoản sẽ chuyển sang chế độ chỉ đọc nhưng toàn bộ dữ liệu tổ chức vẫn được lưu giữ an toàn.`}
        confirmLabel="Ngừng gia hạn"
        onConfirm={toggleCancellation}
      />
    </div>
  );
}
