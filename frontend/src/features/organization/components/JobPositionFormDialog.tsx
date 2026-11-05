import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BriefcaseBusiness, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateJobPosition, useUpdateJobPosition } from '@/hooks/use-job-positions';
import { useDepartments } from '@/hooks/use-departments';
import { useJobGradeLabel } from '@/hooks/use-job-grades';
import type { JobPositionListItem } from '@/services/job-position.service';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { JOB_GRADES } from '@/lib/terms';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import './job-position-form.css';

const formSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  /** '' = not graded yet. */
  jobGrade: z.enum(['', ...JOB_GRADES]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobPositionFormDialogProps {
  open: boolean;
  onClose: () => void;
  position?: JobPositionListItem | null;
}

export function JobPositionFormDialog({ open, onClose, position }: JobPositionFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);
  const isEditing = Boolean(position);
  const createMutation = useCreateJobPosition();
  const updateMutation = useUpdateJobPosition();

  const { data: deptData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const departments = deptData?.items || [];
  const gradeLabel = useJobGradeLabel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      departmentId: '',
      jobGrade: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (position) {
        reset({
          code: position.code,
          name: position.name,
          description: position.description ?? '',
          departmentId: position.departmentId || '',
          jobGrade: position.jobGrade ?? '',
          status: position.status === 'ARCHIVED' ? 'ACTIVE' : position.status,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          departmentId: '',
          jobGrade: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, position, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    const fields = {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description?.trim(),
      departmentId: data.departmentId || undefined,
      jobGrade: data.jobGrade || undefined,
    };
    try {
      if (isEditing && position) {
        await updateMutation.mutateAsync({
          id: position.id,
          // PUT replaces every field: the job family is not on this form, so it is sent back as it was.
          data: { ...fields, jobFamilyId: position.jobFamilyId, status: data.status as 'ACTIVE' | 'INACTIVE' },
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">CẤU TRÚC TỔ CHỨC</p>
            <h2 id="position-dialog-title" className="text-xl font-black tracking-tight text-slate-900">
              {isEditing ? 'Sửa vị trí công việc' : 'Tạo vị trí công việc'}
            </h2>
            <p className="text-sm text-slate-500">Thông tin vị trí dùng để gắn nhân sự và thiết lập chuẩn năng lực.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="position-form-close"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="position-form-body position-dialog-form">
          <div className="position-form-grid">
          <div>
            <label htmlFor="position-code" className="block text-sm font-semibold text-slate-700 mb-1.5">Mã vị trí <span className="text-rose-600">*</span></label>
            <input
              id="position-code"
              {...register('code')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: KT-01"
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div>
            <label htmlFor="position-name" className="block text-sm font-semibold text-slate-700 mb-1.5">Tên vị trí <span className="text-rose-600">*</span></label>
            <input
              id="position-name"
              {...register('name')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: Kế toán viên"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="position-department" className="block text-sm font-semibold text-slate-700 mb-1.5">Phòng ban</label>
            <select
              id="position-department"
              {...register('departmentId')}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            >
              <option value="">Chưa gắn phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="position-grade" className="block text-sm font-semibold text-slate-700 mb-1.5">Cấp bậc</label>
            <select
              id="position-grade"
              {...register('jobGrade')}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            >
              <option value="">Chưa xếp cấp bậc</option>
              {JOB_GRADES.map((code) => (
                <option key={code} value={code}>
                  {gradeLabel(code)}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Nhân sự giữ vị trí này được tính theo cấp bậc đã chọn.
            </p>
          </div>

          <div className="position-form-full">
            <label htmlFor="position-description" className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
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
              <label htmlFor="position-status" className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
              <select
                id="position-status"
                {...register('status')}
                className={INPUT_CLASS}
                disabled={isSubmitting}
              >
                <option value="ACTIVE">Đang dùng</option>
                <option value="INACTIVE">Ngừng dùng</option>
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
            >
              Hủy
            </button>
            <button
              type="submit"
              className="position-form-save rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
