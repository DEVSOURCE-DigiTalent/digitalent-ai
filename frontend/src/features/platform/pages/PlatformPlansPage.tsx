import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import { PageHeader, DataTable, Modal } from '@/components/shared';
import { usePlatformPlans, useUpdatePlatformPlan } from '@/hooks/use-platform';
import type { PlatformPlanDto } from '@/services/platform.service';

function formatPrice(price: number | null): string {
  if (price === null) return 'Liên hệ';
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function PlatformPlansPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading, isError, refetch } = usePlatformPlans();
  const updatePlan = useUpdatePlatformPlan();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlanDto | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState<string>();

  const openEdit = (plan: PlatformPlanDto) => {
    setSelectedPlan(plan);
    setName(plan.name);
    setTagline(plan.tagline);
    setPriceMonthly(plan.monthlyPrice ?? '');
    setErrorMsg(undefined);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedPlan) return;
    setErrorMsg(undefined);
    try {
      await updatePlan.mutateAsync({
        code: selectedPlan.code,
        data: {
          name: name.trim() || selectedPlan.name,
          tagline: tagline.trim() || selectedPlan.tagline,
          monthlyPrice: priceMonthly === '' ? null : Number(priceMonthly),
        },
      });
      setEditModalOpen(false);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Không thể cập nhật gói dịch vụ.');
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Mã gói & Tên',
      cell: (row: PlatformPlanDto) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/platform/plans/${row.code}`)}
            className="font-semibold text-slate-900 hover:text-primary-600 text-left"
          >
            {row.name}
          </button>
          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">{row.code}</span>
          <p className="text-xs text-slate-500 mt-0.5">{row.tagline}</p>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Đối tượng',
      cell: (row: PlatformPlanDto) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.audience === 'enterprise' ? 'bg-primary-50 text-primary-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {row.audience === 'enterprise' ? 'Doanh nghiệp' : 'Cá nhân'}
        </span>
      ),
    },
    {
      key: 'pricing',
      header: 'Giá niêm yết',
      cell: (row: PlatformPlanDto) => (
        <div className="text-sm">
          <p className="font-medium text-slate-900">{formatPrice(row.monthlyPrice)} / tháng</p>
          <p className="text-xs text-slate-400">{formatPrice(row.yearlyPrice)} / năm</p>
        </div>
      ),
    },
    {
      key: 'seatRange',
      header: 'Hạn mức người dùng',
      cell: (row: PlatformPlanDto) => (
        <span className="text-sm text-slate-700">
          {row.seatRange ? `${row.seatRange.min} – ${row.seatRange.max} người dùng` : '1 người dùng'}
        </span>
      ),
    },
    {
      key: 'entitlements',
      header: 'Quyền tính năng (Entitlements)',
      cell: (row: PlatformPlanDto) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.entitlements.length === 0 && <span className="text-xs text-slate-400">Cơ bản</span>}
          {row.entitlements.map((ent) => (
            <span key={ent} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">
              {ent}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'activeCount',
      header: 'Khách hàng',
      cell: (row: PlatformPlanDto) => (
        <span className="text-sm font-semibold text-slate-800">{row.activeCount}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformPlanDto) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/platform/plans/${row.code}`)}
            className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            Chi tiết
          </button>
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Edit3 className="size-3.5" />
            Sửa nhanh
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gói dịch vụ & Quyền tính năng"
        subtitle="Cấu hình các gói dịch vụ B2B (Doanh nghiệp) và B2C (Cá nhân), chính sách giá và phân quyền tính năng"
      />

      {isLoading && <div className="p-8 text-center text-slate-500">Đang tải danh sách gói dịch vụ…</div>}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải thông tin gói dịch vụ.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {plans && (
        <DataTable
          data={plans}
          columns={columns}
          keyExtractor={(row) => row.code}
          emptyTitle="Không có gói dịch vụ nào."
        />
      )}

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Chỉnh sửa gói: ${selectedPlan?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="plan-name" className="block text-sm font-medium text-slate-700 mb-1">
              Tên hiển thị gói
            </label>
            <input
              id="plan-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="plan-tagline" className="block text-sm font-medium text-slate-700 mb-1">
              Khẩu hiệu / Mô tả ngắn
            </label>
            <input
              id="plan-tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="plan-price" className="block text-sm font-medium text-slate-700 mb-1">
              Giá tháng (VND) · Để trống nếu liên hệ
            </label>
            <input
              id="plan-price"
              type="number"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updatePlan.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updatePlan.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
