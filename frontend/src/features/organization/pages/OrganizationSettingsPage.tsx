import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { PageHeader } from '@/components/shared';
import { useOrganization, useUpdateOrganizationSettings } from '@/hooks/use-organization';
import { ORGANIZATION_INDUSTRIES, ORGANIZATION_SIZES } from '@/lib/reference-positions';
import { apiErrorMessage } from '@/lib/utils';
import { INPUT_CLASS, PRIMARY_BUTTON } from '@/features/onboarding/components/styles';

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (UTC+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
  { value: 'UTC', label: 'UTC' },
];

const schema = z.object({
  name: z.string().trim().min(2, 'Tên tổ chức cần ít nhất 2 ký tự'),
  industry: z.string().min(1, 'Chọn ngành'),
  size: z.string().min(1, 'Chọn quy mô'),
  timezone: z.string().min(1),
  defaultAssignmentDays: z.coerce.number().int('Nhập số nguyên').min(1, 'Ít nhất 1 ngày').max(365, 'Tối đa 365 ngày'),
});

type FormValues = z.input<typeof schema>;

/** ADM-07: name, industry, size, time zone and the default time given to finish a course. */
export function OrganizationSettingsPage() {
  const { data, isLoading, isError } = useOrganization();
  const save = useUpdateOrganizationSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) reset({ name: data.name, industry: data.industry, size: data.size, timezone: data.timezone, defaultAssignmentDays: data.defaultAssignmentDays });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const parsed = schema.parse(values);
      await save.mutateAsync(parsed);
      toast.success('Đã lưu cài đặt tổ chức.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không lưu được cài đặt.'));
    }
  });

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải…</p>;
  if (isError || !data) return <p role="alert" className="text-sm text-red-600">Không tải được cài đặt tổ chức.</p>;

  return (
    <div>
      <PageHeader title="Cài đặt tổ chức" subtitle={data?.ownerName ? `Chủ sở hữu: ${data.ownerName}` : undefined} />

      <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-5 rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid gap-1.5">
          <label htmlFor="org-name" className="text-sm font-medium text-slate-700">Tên tổ chức</label>
          <input id="org-name" readOnly aria-invalid={!!errors.name} aria-describedby={errors.name ? 'org-name-error' : undefined} className={INPUT_CLASS} {...register('name')} />
          <p className="text-xs text-slate-500">Tên tổ chức hiện chỉ có thể xem; API cài đặt không hỗ trợ đổi tên.</p>
          {errors.name && <p id="org-name-error" role="alert" className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="org-industry" className="text-sm font-medium text-slate-700">Ngành hoạt động</label>
          <select id="org-industry" className={INPUT_CLASS} {...register('industry')}>
            {ORGANIZATION_INDUSTRIES.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="org-size" className="text-sm font-medium text-slate-700">Quy mô</label>
          <select id="org-size" className={INPUT_CLASS} {...register('size')}>
            {ORGANIZATION_SIZES.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="org-timezone" className="text-sm font-medium text-slate-700">Múi giờ</label>
          <select id="org-timezone" className={INPUT_CLASS} {...register('timezone')}>
            {TIMEZONES.map((zone) => <option key={zone.value} value={zone.value}>{zone.label}</option>)}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="org-days" className="text-sm font-medium text-slate-700">Thời hạn hoàn thành khóa học mặc định (ngày)</label>
          <input id="org-days" type="number" min={1} max={365} aria-invalid={!!errors.defaultAssignmentDays} aria-describedby="org-days-hint" className={INPUT_CLASS} {...register('defaultAssignmentDays')} />
          <p id="org-days-hint" className="text-xs text-slate-500">Dùng khi giao khóa học mà không chọn hạn.</p>
          {errors.defaultAssignmentDays && <p role="alert" className="text-xs text-red-600">{errors.defaultAssignmentDays.message}</p>}
        </div>

        <div>
          <button type="submit" disabled={!isDirty || save.isPending} className={PRIMARY_BUTTON}>
            {save.isPending ? 'Đang lưu…' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
}
