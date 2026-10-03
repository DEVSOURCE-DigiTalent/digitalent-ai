import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/use-platform';
import type { PlatformSettingsDto } from '@/services/platform.service';

export function PlatformSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  const [form, setForm] = useState<PlatformSettingsDto>({
    maintenanceMode: false,
    allowSelfRegistration: true,
    mockPaymentSuccessRate: 100,
    mockEmailDelivery: true,
    aiScoringModel: 'gemini-1.5-pro-preview',
    defaultTrialDays: 14,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải cấu hình hệ thống…</div>;
  }

  if (isError || !settings) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải thông tin cấu hình.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(undefined);
    setSaveSuccess(false);

    try {
      await updateSettings.mutateAsync(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Không thể lưu cấu hình hệ thống.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Cấu hình hệ thống nền tảng"
        subtitle="Quản lý các tham số vận hành, cổng thanh toán giả lập và cấu hình tích hợp mô hình AI"
      />

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          Đã lưu thành công cấu hình hệ thống!
        </div>
      )}

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General parameters */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Settings className="size-5 text-primary-600" />
            Vận hành & Đăng ký
          </h2>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Chế độ bảo trì hệ thống (Maintenance Mode)</p>
              <p className="text-xs text-slate-500">Tạm thời ngừng truy cập công khai của người dùng bên ngoài</p>
            </div>
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
              className="size-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Cho phép người dùng tự đăng ký (Self-registration)</p>
              <p className="text-xs text-slate-500">Mở cổng đăng ký tài khoản doanh nghiệp và cá nhân trên trang chủ</p>
            </div>
            <input
              type="checkbox"
              checked={form.allowSelfRegistration}
              onChange={(e) => setForm({ ...form, allowSelfRegistration: e.target.checked })}
              className="size-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label htmlFor="trial-days" className="block text-sm font-medium text-slate-700 mb-1">
              Số ngày dùng thử mặc định cho doanh nghiệp mới
            </label>
            <input
              id="trial-days"
              type="number"
              min={1}
              max={60}
              value={form.defaultTrialDays}
              onChange={(e) => setForm({ ...form, defaultTrialDays: Number(e.target.value) })}
              className="w-48 rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* AI Engine & Scoring */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Cpu className="size-5 text-purple-600" />
            Mô hình AI chấm điểm & Đề xuất
          </h2>

          <div>
            <label htmlFor="ai-model" className="block text-sm font-medium text-slate-700 mb-1">
              Mô hình ngôn ngữ lớn (LLM Model) áp dụng
            </label>
            <select
              id="ai-model"
              value={form.aiScoringModel}
              onChange={(e) => setForm({ ...form, aiScoringModel: e.target.value })}
              className="w-full sm:w-80 rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
            >
              <option value="gemini-1.5-pro-preview">Google Gemini 1.5 Pro (Khuyên dùng)</option>
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Tốc độ cao)</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Được dùng để phân tích văn bản bài tập thực hành theo barem rubric Thông tư 02.
            </p>
          </div>
        </div>

        {/* Mock Environment Parameters */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldAlert className="size-5 text-amber-600" />
            Tham số môi trường giả lập (Mock Environment)
          </h2>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Giả lập gửi email (Mock email link preview)</p>
              <p className="text-xs text-slate-500">Hiển thị liên kết kích hoạt / xác minh email trực tiếp trên giao diện demo</p>
            </div>
            <input
              type="checkbox"
              checked={form.mockEmailDelivery}
              onChange={(e) => setForm({ ...form, mockEmailDelivery: e.target.checked })}
              className="size-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <label htmlFor="success-rate" className="block text-sm font-medium text-slate-700 mb-1">
              Tỷ lệ thanh toán QR giả lập thành công (%)
            </label>
            <input
              id="success-rate"
              type="number"
              min={10}
              max={100}
              value={form.mockPaymentSuccessRate}
              onChange={(e) => setForm({ ...form, mockPaymentSuccessRate: Number(e.target.value) })}
              className="w-48 rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="size-4" />
            {updateSettings.isPending ? 'Đang lưu…' : 'Lưu cấu hình hệ thống'}
          </button>
        </div>
      </form>
    </div>
  );
}
