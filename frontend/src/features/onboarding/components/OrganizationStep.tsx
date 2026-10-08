import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Globe } from 'lucide-react';
import { ORGANIZATION_INDUSTRIES, ORGANIZATION_SIZES } from '@/lib/reference-positions';
import { useSaveOrganization } from '@/hooks/use-onboarding';
import type { OrganizationSetup } from '@/types/commerce';
import { INPUT_CLASS, PRIMARY_BUTTON, errorMessage } from './styles';

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (GMT+7:00 - Hà Nội, TP.HCM)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7:00 - Băng Cốc)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8:00 - Singapore)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9:00 - Tokyo)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0:00 - Luân Đôn)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5:00 - New York)' },
];

const schema = z.object({
  name: z.string().trim().min(2, 'Nhập tên tổ chức (ít nhất 2 ký tự)'),
  industry: z.string().min(1, 'Chọn ngành'),
  size: z.string().min(1, 'Chọn quy mô'),
  logoUrl: z.string().trim().url('Đường dẫn ảnh logo không hợp lệ').or(z.literal('')).optional(),
  timezone: z.string().min(1, 'Chọn múi giờ làm việc'),
});

type FormValues = z.infer<typeof schema>;

interface OrganizationStepProps {
  setup: OrganizationSetup;
  onDone: () => void;
}

/** AUTH-04 / ENT-ONB-04: name, industry, size, logo, timezone of the organization. */
export function OrganizationStep({ setup, onDone }: OrganizationStepProps) {
  const save = useSaveOrganization();
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: setup.organization?.name ?? '',
      industry: setup.organization?.industry ?? '',
      size: setup.organization?.size ?? '',
      logoUrl: setup.organization?.logoUrl ?? '',
      timezone: setup.organization?.timezone ?? 'Asia/Ho_Chi_Minh',
    },
  });

  const logoUrl = watch('logoUrl');
  const orgName = watch('name');

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await save.mutateAsync({
        ...values,
        logoUrl: values.logoUrl ? values.logoUrl.trim() : undefined,
      });
      onDone();
    } catch (error) {
      setSubmitError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-5">
      {submitError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      {/* Header Preview card */}
      <div className="flex items-center gap-4 rounded-xl border border-ent-line bg-ent-card p-4 shadow-md ring-1 ring-amber-400/10">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ent-line bg-ent-raised text-ent-fg-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo xem trước"
              className="size-full object-contain p-1"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Building2 className="size-8 text-[#F5CA65]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ent-fg truncate">
            {orgName || 'Tên doanh nghiệp của bạn'}
          </p>
          <p className="text-xs text-ent-fg-3">
            Logo & thương hiệu doanh nghiệp trên hệ thống DigiTalent AI
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="org-name" className="text-sm font-medium text-ent-fg">
          Tên tổ chức
        </label>
        <input
          id="org-name"
          placeholder="Ví dụ: Công ty Cổ phần Acme Việt Nam"
          aria-invalid={!!errors.name}
          className={INPUT_CLASS}
          {...register('name')}
        />
        {errors.name && <p role="alert" className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="org-industry" className="text-sm font-medium text-ent-fg">
            Ngành hoạt động
          </label>
          <select id="org-industry" aria-invalid={!!errors.industry} className={INPUT_CLASS} {...register('industry')}>
            <option value="" className="bg-[#11151E] text-cream">Chọn ngành…</option>
            {ORGANIZATION_INDUSTRIES.map((industry) => (
              <option key={industry} value={industry} className="bg-[#11151E] text-cream">{industry}</option>
            ))}
          </select>
          {errors.industry && <p role="alert" className="text-xs text-red-400">{errors.industry.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="org-size" className="text-sm font-medium text-ent-fg">
            Quy mô
          </label>
          <select id="org-size" aria-invalid={!!errors.size} className={INPUT_CLASS} {...register('size')}>
            <option value="" className="bg-[#11151E] text-cream">Chọn quy mô…</option>
            {ORGANIZATION_SIZES.map((size) => (
              <option key={size.value} value={size.value} className="bg-[#11151E] text-cream">{size.label}</option>
            ))}
          </select>
          {errors.size && <p role="alert" className="text-xs text-red-400">{errors.size.message}</p>}
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="org-logo" className="text-sm font-medium text-ent-fg">
          Đường dẫn ảnh Logo (tùy chọn)
        </label>
        <input
          id="org-logo"
          type="url"
          placeholder="https://example.com/logo.png"
          aria-invalid={!!errors.logoUrl}
          className={INPUT_CLASS}
          {...register('logoUrl')}
        />
        {errors.logoUrl && <p role="alert" className="text-xs text-red-400">{errors.logoUrl.message}</p>}
        <p className="text-xs text-ent-fg-3">
          Nhập liên kết ảnh PNG/SVG logo tổ chức. Bạn có thể cập nhật lại trong Cài đặt tổ chức.
        </p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="org-timezone" className="text-sm font-medium text-ent-fg flex items-center gap-1.5">
          <Globe className="size-4 text-[#F5CA65]" />
          Múi giờ làm việc <span className="text-amber-400">*</span>
        </label>
        <select id="org-timezone" aria-invalid={!!errors.timezone} className={INPUT_CLASS} {...register('timezone')}>
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value} className="bg-[#11151E] text-cream">{tz.label}</option>
          ))}
        </select>
        {errors.timezone && <p role="alert" className="text-xs text-red-400">{errors.timezone.message}</p>}
        <p className="text-xs text-ent-fg-3">
          Dùng để tính thời hạn nhiệm vụ, lịch thi đánh giá năng lực và các báo cáo đào tạo.
        </p>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={save.isPending} className={PRIMARY_BUTTON}>
          {save.isPending ? 'Đang lưu…' : 'Lưu và tiếp tục'}
        </button>
      </div>
    </form>
  );
}
