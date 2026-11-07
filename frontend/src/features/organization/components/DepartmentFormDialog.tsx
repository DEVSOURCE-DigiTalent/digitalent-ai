import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Building2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDepartment, useDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
import { useMembers } from '@/hooks/use-members';
import type { DepartmentDto } from '@/services/department.service';
import { toast } from 'sonner';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import './job-position-form.css';
import './department-form.css';

const formSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  managerEmployeeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DepartmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  department?: (Pick<DepartmentDto, 'id' | 'code' | 'name' | 'status'> & { description?: string; parentDepartmentId?: string; managerEmployeeId?: string }) | null;
}

export function DepartmentFormDialog({ open, onClose, department }: DepartmentFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);
  const isEditing = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  // For parent department dropdown
  const { data: parentData, isLoading: loadingParents } = useDepartments({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  const parents = parentData?.items || [];

  // A manager must be an active employee: accounts without an employee profile cannot be chosen.
  const { data: memberData, isLoading: loadingMembers } = useMembers({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  const eligibleManagers = (memberData?.items ?? []).flatMap((m) =>
    m.kind === 'member' && m.employeeId ? [{ employeeId: m.employeeId, label: `${m.fullName} (${m.email})` }] : [],
  );

  // A list row has no description and PUT replaces every field, so editing starts from the full department.
  const { data: current, isLoading: loadingCurrent } = useDepartment(department?.id ?? '');

  // The current manager stays selectable even when outside the first page of members, so saving keeps them.
  const managerOptions =
    current?.managerEmployeeId && !eligibleManagers.some((m) => m.employeeId === current.managerEmployeeId)
      ? [...eligibleManagers, { employeeId: current.managerEmployeeId, label: current.managerName ?? 'Quản lý hiện tại' }]
      : eligibleManagers;

  // A native <select> drops a value it has no option for yet: an edited department fills the form once its
  // manager and parent options are listed.
  const loadingOptions = isEditing && (loadingMembers || loadingParents);

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
      parentDepartmentId: '',
      managerEmployeeId: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open && !loadingOptions) {
      const source = current ?? department;
      if (source) {
        reset({
          code: source.code,
          name: source.name,
          description: source.description ?? '',
          parentDepartmentId: source.parentDepartmentId ?? '',
          managerEmployeeId: source.managerEmployeeId ?? '',
          status: (source.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          parentDepartmentId: '',
          managerEmployeeId: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, department, current, reset, loadingOptions]);


  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: department.id,
          data: {
            code: data.code,
            name: data.name,
            description: data.description,
            parentDepartmentId: data.parentDepartmentId || undefined,
            managerEmployeeId: data.managerEmployeeId || undefined,
            status: data.status as 'ACTIVE' | 'INACTIVE',
          },
        });
        toast.success('Đã cập nhật phòng ban');
      } else {
        await createMutation.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description,
          parentDepartmentId: data.parentDepartmentId || undefined,
          managerEmployeeId: data.managerEmployeeId || undefined,
        });
        toast.success('Đã tạo phòng ban');
      }
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, isEditing ? 'Không cập nhật được phòng ban' : 'Không tạo được phòng ban'));
    }
  };

  return createPortal(
    <div className="department-dialog-layer fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="department-dialog-backdrop absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div ref={dialogRef} tabIndex={-1} className="department-dialog position-form-dialog relative flex max-h-[min(90dvh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="department-dialog-title">
        <div className="position-form-head">
          <div className="position-form-icon"><Building2 className="size-5" /></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">CẤU TRÚC TỔ CHỨC</p>
            <h2 id="department-dialog-title" className="text-xl font-black tracking-tight text-slate-900">
              {isEditing ? 'Sửa phòng ban' : 'Tạo phòng ban'}
            </h2>
            <p className="text-sm text-slate-500">Thiết lập thông tin và người phụ trách cho phòng ban.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="position-form-close"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="position-form-body department-dialog-form">
          <div className="position-form-grid">
          <div>
            <label htmlFor="department-code" className="block text-sm font-semibold text-slate-700 mb-1.5">Mã phòng ban <span className="text-rose-600">*</span></label>
            <input
              id="department-code"
              {...register('code')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: ENG"
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div>
            <label htmlFor="department-name" className="block text-sm font-semibold text-slate-700 mb-1.5">Tên phòng ban <span className="text-rose-600">*</span></label>
            <input
              id="department-name"
              {...register('name')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: Kỹ thuật"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="position-form-full">
            <label htmlFor="department-description" className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
            <textarea
              id="department-description"
              {...register('description')}
              rows={2}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="department-manager" className="block text-sm font-semibold text-slate-700 mb-1.5">Người quản lý</label>
            <select
              id="department-manager"
              {...register('managerEmployeeId')}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            >
              <option value="">Chưa phân công quản lý</option>
              {managerOptions.map((m) => (
                <option key={m.employeeId} value={m.employeeId}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Người được chọn sẽ quản lý và theo dõi nhân sự thuộc phòng ban này.
            </p>
          </div>

          <div>
            <label htmlFor="department-parent" className="block text-sm font-semibold text-slate-700 mb-1.5">Phòng ban cấp trên</label>
            <select
              id="department-parent"
              {...register('parentDepartmentId')}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            >
              <option value="">Không có (phòng ban gốc)</option>
              {parents
                .filter((p) => p.id !== department?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
          </div>

          {isEditing && (
            <div>
              <label htmlFor="department-status" className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
              <select
                id="department-status"
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
              disabled={isSubmitting || loadingCurrent || loadingOptions}
            >
              {isSubmitting ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body,
  );
}
