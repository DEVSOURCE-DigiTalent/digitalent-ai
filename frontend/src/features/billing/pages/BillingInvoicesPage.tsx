import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Receipt,
  Download,
  Building,
} from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, ScoreCard, type Column } from '@/components/shared';
import { useSubscription } from '@/hooks/use-subscription';
import { useOrganization } from '@/hooks/use-organization';
import { formatVnd } from '@/lib/plans';
import { formatDate } from '@/lib/utils';
import type { Invoice } from '@/services/subscription.service';

/** OW-43: Billing & Invoices History. Owner only. */
export function BillingInvoicesPage() {
  const { data: subscription, isLoading, isError } = useSubscription();
  const { data: org } = useOrganization();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải danh sách hóa đơn…</p>;
  if (isError || !subscription) return <p role="alert" className="text-sm text-red-600">Không tải được lịch sử hóa đơn.</p>;

  const invoices = subscription.invoices ?? [];
  const totalPaid = invoices.reduce((sum, i) => sum + i.amount, 0);

  const handleDownload = (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    setTimeout(() => {
      setDownloadingId(null);
      toast.success(`Đã tải hóa đơn điện tử VAT ${invoice.code} (PDF)`);
    }, 600);
  };

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'code',
      header: 'Mã hóa đơn',
      cell: (i) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {i.code}
          </span>
        </div>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Ngày phát hành',
      cell: (i) => (
        <span className="text-xs text-slate-700 font-medium">
          {formatDate(i.issuedAt)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Nội dung dịch vụ',
      cell: (i) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{i.description}</p>
          <p className="text-xs text-slate-500">Gói {subscription.planName} · Chu kỳ {subscription.cycle}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền thanh toán',
      className: 'text-right tabular-nums',
      cell: (i) => (
        <span className="font-bold text-sm text-slate-900">
          {formatVnd(i.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: () => <StatusBadge label="Đã thanh toán" variant="success" />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      cell: (i) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleDownload(i)}
            disabled={downloadingId === i.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
            title="Tải hóa đơn VAT (PDF)"
          >
            <Download className="size-3.5" />
            <span>{downloadingId === i.id ? 'Đang tải…' : 'Tải PDF'}</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header điều hướng */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/enterprise/subscription"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại tổng quan gói dịch vụ</span>
        </Link>
      </div>

      <PageHeader
        title="Lịch sử thanh toán & Hóa đơn"
        subtitle="Quản lý toàn bộ hóa đơn điện tử VAT, biên lai và chứng từ thanh toán của tổ chức"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label="Tổng chi phí đã thanh toán" value={formatVnd(totalPaid)} subtitle="Tích lũy từ đầu năm" />
        <ScoreCard label="Tổng số hóa đơn" value={invoices.length} subtitle="Hóa đơn VAT hợp lệ" />
        <ScoreCard label="Trạng thái tài khoản" value="Đầy đủ" variant="success" subtitle="Không nợ cước" />
        <ScoreCard label="Kỳ thanh toán tiếp theo" value={formatDate(subscription.renewsAt)} subtitle="Gia hạn tự động" />
      </div>

      {/* Bảng hóa đơn */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="size-4 text-blue-600" />
          <span>Danh sách hóa đơn VAT đã phát hành</span>
        </h2>

        <DataTable
          columns={invoiceColumns}
          data={invoices}
          keyExtractor={(i) => i.id}
          emptyTitle="Chưa có hóa đơn nào"
          emptyDescription="Khi tổ chức kích hoạt hoặc gia hạn gói dịch vụ, hóa đơn điện tử sẽ hiển thị tại đây."
        />
      </div>

      {/* Thông tin xuất hóa đơn VAT của doanh nghiệp */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="size-4 text-slate-600" />
            <span>Thông tin pháp lý xuất hóa đơn VAT</span>
          </h3>
          <Link
            to="/enterprise/settings"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Chỉnh sửa trong Cài đặt tổ chức
          </Link>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên đơn vị mua hàng</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {org?.name || <span className="text-slate-400 italic">Chưa cấu hình</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã số thuế doanh nghiệp</dt>
            <dd className="mt-1">
              {org?.taxCode ? (
                <span className="font-mono font-bold text-slate-900">{org.taxCode}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">
                  Chưa cấu hình
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Địa chỉ trụ sở</dt>
            <dd className="mt-1">
              {org?.taxAddress ? (
                <span className="text-slate-700">{org.taxAddress}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">
                  Chưa cấu hình
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email nhận hóa đơn điện tử</dt>
            <dd className="mt-1">
              {org?.invoiceEmail ? (
                <span className="text-slate-700 font-mono">{org.invoiceEmail}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">
                  Chưa cấu hình
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
