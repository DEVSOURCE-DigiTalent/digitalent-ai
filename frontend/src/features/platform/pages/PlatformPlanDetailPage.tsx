import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, ShieldCheck, Users, Tag, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformPlan, useUpdatePlatformPlan } from '@/hooks/use-platform';

const AVAILABLE_ENTITLEMENTS = [
  { code: 'ASSESSMENT_CORE', label: 'Khảo sát năng lực số cơ bản' },
  { code: 'ASSESSMENT_ADVANCED', label: 'Khảo sát năng lực thực hành Rubric' },
  { code: 'SKILL_GAP_ANALYTICS', label: 'Phân tích khoảng cách năng lực & Radar chart' },
  { code: 'TRAINING_BATCH_UNLIMITED', label: 'Quản lý đợt đào tạo không giới hạn' },
  { code: 'AI_STUDY_ASSISTANT', label: 'Trợ lý học tập AI cá nhân hóa' },
  { code: 'CUSTOM_FRAMEWORK_EXPORT', label: 'Xuất báo cáo & khung năng lực tùy biến' },
  { code: 'API_SSO_INTEGRATION', label: 'Tích hợp SSO & Enterprise API' },
];

function formatPrice(price: number | null): string {
  if (price === null) return 'Liên hệ';
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function PlatformPlanDetailPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, isError, refetch } = usePlatformPlan(code);
  const updatePlan = useUpdatePlatformPlan();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState<number | ''>('');
  const [yearlyPrice, setYearlyPrice] = useState<number | ''>('');
  const [minSeats, setMinSeats] = useState<number | ''>('');
  const [maxSeats, setMaxSeats] = useState<number | ''>('');
  const [selectedEntitlements, setSelectedEntitlements] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setTagline(plan.tagline);
      setMonthlyPrice(plan.monthlyPrice ?? '');
      setYearlyPrice(plan.yearlyPrice ?? '');
      setMinSeats(plan.seatRange?.min ?? 1);
      setMaxSeats(plan.seatRange?.max ?? 100);
      setSelectedEntitlements(plan.entitlements || []);
    }
  }, [plan]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin gói dịch vụ…</div>;
  }

  if (isError || !plan) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/plans')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách gói
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không tìm thấy thông tin gói dịch vụ này.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const toggleEntitlement = (entCode: string) => {
    setSelectedEntitlements((prev) =>
      prev.includes(entCode) ? prev.filter((e) => e !== entCode) : [...prev, entCode]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(undefined);
    setSaveSuccess(false);

    try {
      await updatePlan.mutateAsync({
        code: plan.code,
        data: {
          name: name.trim() || plan.name,
          tagline: tagline.trim() || plan.tagline,
          monthlyPrice: monthlyPrice === '' ? null : Number(monthlyPrice),
          yearlyPrice: yearlyPrice === '' ? null : Number(yearlyPrice),
          seatRange: {
            min: minSeats === '' ? 1 : Number(minSeats),
            max: maxSeats === '' ? 999 : Number(maxSeats),
          },
          entitlements: selectedEntitlements,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Không thể lưu cấu hình gói dịch vụ.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/plans')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách gói dịch vụ
        </button>
        <span className="font-mono text-xs font-bold text-slate-500">
          Mã gói: {plan.code} · Khách hàng đang dùng: {plan.activeCount}
        </span>
      </div>

      <PageHeader
        title={`Cấu hình gói dịch vụ: ${plan.name}`}
        subtitle={`Thiết lập chính sách giá, hạn mức số lượng ghế và phân quyền tính năng cho gói ${plan.name}`}
      />

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          Đã lưu thành công cấu hình gói dịch vụ {plan.name}!
        </div>
      )}

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {saveError}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2.5 text-primary-700">
            <Tag className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Đối tượng phục vụ</p>
            <p className="text-base font-bold text-slate-900">
              {plan.audience === 'enterprise' ? 'Doanh nghiệp (B2B)' : 'Cá nhân (B2C)'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Giá tháng hiện tại</p>
            <p className="text-base font-bold text-slate-900">{formatPrice(plan.monthlyPrice)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Thuê bao đang kích hoạt</p>
            <p className="text-base font-bold text-slate-900">{plan.activeCount} tổ chức/người</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info & Pricing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Thông tin gói & Chính sách giá</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tên gói dịch vụ
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="tagline" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Khẩu hiệu / Giới thiệu tóm tắt
              </label>
              <input
                id="tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="monthlyPrice" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Giá niêm yết theo tháng (VND) · Để trống nếu Liên hệ
              </label>
              <input
                id="monthlyPrice"
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ví dụ: 1500000"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="yearlyPrice" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Giá niêm yết theo năm (VND) · Để trống nếu Liên hệ
              </label>
              <input
                id="yearlyPrice"
                type="number"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ví dụ: 15000000"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Seat Range Limits */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Hạn mức quy mô người dùng (Số ghế)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minSeats" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Số ghế tối thiểu
              </label>
              <input
                id="minSeats"
                type="number"
                value={minSeats}
                onChange={(e) => setMinSeats(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="maxSeats" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Số ghế tối đa
              </label>
              <input
                id="maxSeats"
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Entitlements / Feature Flags */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Quyền tính năng (Entitlements / Feature Flags)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Tích chọn các quyền năng lực và tính năng được cấp phép sử dụng trong gói này.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {AVAILABLE_ENTITLEMENTS.map((item) => {
              const isChecked = selectedEntitlements.includes(item.code);
              return (
                <label
                  key={item.code}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-primary-300 bg-primary-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleEntitlement(item.code)}
                    className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">{item.label}</span>
                    <span className="font-mono text-xs text-slate-500">{item.code}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/platform/plans')}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={updatePlan.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="size-4" />
            {updatePlan.isPending ? 'Đang lưu…' : 'Lưu cấu hình gói'}
          </button>
        </div>
      </form>
    </div>
  );
}
