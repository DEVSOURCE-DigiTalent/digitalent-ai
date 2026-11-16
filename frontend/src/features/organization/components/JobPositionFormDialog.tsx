import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BriefcaseBusiness, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateJobPosition, useJobPositions, useUpdateJobPosition } from '@/hooks/use-job-positions';
import { useDepartments } from '@/hooks/use-departments';
import type { JobPositionListItem } from '@/services/job-position.service';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import './job-position-form.css';

const standardPositions = {
  CEO: 'CEO / Giám đốc',
  HR: 'Nhân sự (HR)',
  MARKETING: 'Marketing',
  SALES_CRM: 'Sales / CRM',
  ACCOUNTANT: 'Kế toán',
} as const;

const formSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobPositionFormDialogProps {
  open: boolean;
  onClose: () => void;
  position?: JobPositionListItem | null;
}

export function JobPositionFormDialog({ open, onClose, position }: JobPositionFormDialogProps) {
  useUiLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);
  const isEditing = Boolean(position);
  const createMutation = useCreateJobPosition();
  const updateMutation = useUpdateJobPosition();

  const { data: deptData, isError: departmentError } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const { data: positionData, isError: positionError } = useJobPositions({ pageSize: 100 });
  const occupied = new Map(positionData?.items
    .filter((item) => item.id !== position?.id && item.status !== 'ARCHIVED' && item.departmentId)
    .map((item) => [item.departmentId, item]));
  const departments = (deptData?.items ?? []).filter((item) => item.id === position?.departmentId || !occupied.has(item.id));
  const placementUnavailable = !position?.departmentId && departments.length === 0;
  const placementLoading = !deptData || !positionData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      description: '',
      departmentId: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (position) {
        reset({
          code: position.code,
          description: position.description ?? '',
          departmentId: position.departmentId || '',
          status: position.status === 'ARCHIVED' ? 'ACTIVE' : position.status,
        });
      } else {
        reset({
          code: '',
          description: '',
          departmentId: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, position, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    const fields = {
      code: data.code.trim().toUpperCase(),
      name: standardPositions[data.code as keyof typeof standardPositions] ?? position?.name ?? data.code,
      description: data.description?.trim(),
      departmentId: data.departmentId,
    };
    try {
      if (isEditing && position) {
        await updateMutation.mutateAsync({
          id: position.id,
          // PUT replaces every field: the job family is not on this form, so it is sent back as it was.
          data: { ...fields, jobFamilyId: position.jobFamilyId, jobGrade: position.jobGrade, status: data.status as 'ACTIVE' | 'INACTIVE' },
        });
        toast.success('Đã cập nhật vị trí công việc');
      } else {
        await createMutation.mutateAsync(fields);
        toast.success('Đã tạo vị trí công việc');
      }
      onClose();
    } catch (error) {
      toast.error(
        organizationErrorMessage(
          error,
          isEditing ? 'Không cập nhật được vị trí công việc' : 'Không tạo được vị trí công việc'
        )
      );
    }
  };

  return createPortal(
    <div className="position-dialog-layer fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="position-dialog-backdrop absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div ref={dialogRef} tabIndex={-1} className="position-form-dialog relative flex max-h-[min(90dvh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="position-dialog-title">
        <div className="position-form-head">
          <div className="position-form-icon"><BriefcaseBusiness className="size-5" /></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{translateUi("CẤU TRÚC TỔ CHỨC")}</p>
            <h2 id="position-dialog-title" className="text-xl font-black tracking-tight text-slate-900">
              {isEditing ? translateUi('Sửa vị trí công việc') : translateUi('Tạo vị trí công việc')}
            </h2>
            <p className="text-sm text-slate-500">{translateUi("Thông tin vị trí dùng để gắn nhân sự và thiết lập chuẩn năng lực.")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={translateUi("Đóng")} className="position-form-close"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="position-form-body position-dialog-form">
          <div className="position-form-grid">
          <div>
            <label htmlFor="position-code" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Mã vị trí ")}<span className="text-rose-600">*</span></label>
            {position ? <input id="position-code" {...register('code')} className={INPUT_CLASS} readOnly /> : (
              <select id="position-code" {...register('code')} className={INPUT_CLASS} disabled={isSubmitting}>
                <option value="">{translateUi('Chọn vị trí chuẩn')}</option>
                {Object.entries(standardPositions)
                  .filter(([code]) => !positionData?.items.some((item) => item.code === code && item.departmentId))
                  .map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
              </select>
            )}
            {errors.code && <p className="mt-1 text-sm text-red-500">{translateUi(errors.code.message)}</p>}
          </div>

          <div className="position-form-full">
            <label htmlFor="position-department" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Phòng ban")} <span className="text-rose-600">*</span></label>
            <select
              id="position-department"
              {...register('departmentId')}
              className={INPUT_CLASS}
              disabled={isSubmitting || placementUnavailable}
              aria-describedby="position-department-help"
            >
              <option value="">{translateUi("Chọn phòng ban")}</option>
              {position?.departmentId && !departments.some((d) => d.id === position.departmentId) && (
                <option value={position.departmentId}>{position.departmentName ?? translateUi('Phòng ban hiện tại')}</option>
              )}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div id="position-department-help" className="mt-1.5 text-xs text-slate-600">
              {placementUnavailable ? (
                departmentError || positionError ? <p>{translateUi('Không tải được danh sách phòng ban hoặc vị trí.')}</p>
                  : placementLoading ? <p>{translateUi('Đang tải phòng ban…')}</p>
                  : deptData.items.length === 0 ? <p>{translateUi('Chưa có phòng ban đang hoạt động. Tạo phòng ban trước khi gắn vị trí.')}</p>
                  : <>
                    <p>{translateUi('Các phòng ban đang hoạt động đều đã có vị trí. Hãy mở dòng vị trí đang dùng của phòng để sửa.')}</p>
                    <ul className="mt-2 space-y-1">
                      {deptData.items.map((department) => {
                        const assigned = occupied.get(department.id);
                        return assigned && <li key={department.id}>{department.name} · {assigned.name} ({assigned.code})</li>;
                      })}
                    </ul>
                  </>
              ) : <p>{translateUi('Mỗi phòng ban có một vị trí công việc.')}</p>}
            </div>
            {errors.departmentId && <p className="mt-1 text-sm text-red-600">{translateUi(errors.departmentId.message)}</p>}
          </div>

          <div className="position-form-full">
            <label htmlFor="position-description" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Mô tả")}</label>
            <textarea
              id="position-description"
              {...register('description')}
              rows={2}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            />
          </div>

          {isEditing && (
            <div>
              <label htmlFor="position-status" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Trạng thái")}</label>
              <select
                id="position-status"
                {...register('status')}
                className={INPUT_CLASS}
                disabled={isSubmitting}
              >
                <option value="ACTIVE">{translateUi("Đang dùng")}</option>
                <option value="INACTIVE">{translateUi("Ngừng dùng")}</option>
              </select>
            </div>
          )}

          </div>
          <div className="position-form-actions flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >{translateUi("Hủy")}</button>
            <button
              type="submit"
              className="position-form-save rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              disabled={isSubmitting || placementUnavailable}
            >
              {isSubmitting ? translateUi('Đang lưu…') : translateUi('Lưu')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
