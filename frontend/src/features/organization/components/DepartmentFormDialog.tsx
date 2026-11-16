import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Building2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDepartment, useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
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
  useUiLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(open, dialogRef, onClose);
  const isEditing = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const { data: current, isLoading: loadingCurrent } = useDepartment(department?.id ?? '');
  const { data: memberData, isLoading: loadingMembers } = useMembers({
    pageIndex: 1, pageSize: 100, status: 'ACTIVE', departmentId: department?.id,
  });
  const managerId = (current ?? department)?.managerEmployeeId;
  const canChooseManager = !isEditing || !managerId;
  const managerOptions = (memberData?.items ?? []).flatMap((member) =>
    member.kind === 'member' && member.employeeId && (!isEditing || member.departmentId === department.id)
      ? [{ employeeId: member.employeeId, label: `${member.fullName} (${member.email})` }]
      : [],
  );
  const loadingOptions = canChooseManager && loadingMembers;

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
          managerEmployeeId: source.managerEmployeeId ?? '',
          status: (source.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          managerEmployeeId: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, department, current, reset, loadingOptions]);


  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    if (!isEditing && !data.managerEmployeeId) {
      toast.error('Chọn trưởng phòng trước khi tạo phòng ban.');
      return;
    }
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: department.id,
          data: {
            code: data.code,
            name: data.name,
            description: data.description,
            managerEmployeeId: managerId || data.managerEmployeeId || undefined,
            status: data.status as 'ACTIVE' | 'INACTIVE',
          },
        });
        toast.success('Đã cập nhật phòng ban');
      } else {
        await createMutation.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description,
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">{translateUi("CẤU TRÚC TỔ CHỨC")}</p>
            <h2 id="department-dialog-title" className="text-xl font-black tracking-tight text-slate-900">
              {isEditing ? translateUi('Sửa phòng ban') : translateUi('Tạo phòng ban')}
            </h2>
            <p className="text-sm text-slate-500">{translateUi("Thiết lập thông tin và người phụ trách cho phòng ban.")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={translateUi("Đóng")} className="position-form-close"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="position-form-body department-dialog-form">
          <div className="position-form-grid">
          <div>
            <label htmlFor="department-code" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Mã phòng ban ")}<span className="text-rose-600">*</span></label>
            <input
              id="department-code"
              {...register('code')}
              className={INPUT_CLASS}
              placeholder={translateUi("Ví dụ: ENG")}
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{translateUi(errors.code.message)}</p>}
          </div>

          <div>
            <label htmlFor="department-name" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Tên phòng ban ")}<span className="text-rose-600">*</span></label>
            <input
              id="department-name"
              {...register('name')}
              className={INPUT_CLASS}
              placeholder={translateUi("Ví dụ: Kỹ thuật")}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{translateUi(errors.name.message)}</p>}
          </div>

          <div className="position-form-full">
            <label htmlFor="department-description" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Mô tả")}</label>
            <textarea
              id="department-description"
              {...register('description')}
              rows={2}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            />
          </div>

          <div className="position-form-full">
            <label htmlFor="department-manager" className="block text-sm font-semibold text-slate-700 mb-1.5">
              {translateUi('Trưởng phòng')}{!isEditing && <span className="ml-1 text-red-600">*</span>}
            </label>
            {canChooseManager && (!isEditing || managerOptions.length > 0) ? (
              <select id="department-manager" {...register('managerEmployeeId')} className={INPUT_CLASS}
                required={!isEditing} disabled={isSubmitting || loadingOptions}>
                <option value="">{translateUi('Chọn trưởng phòng')}</option>
                {managerOptions.map((option) => <option key={option.employeeId} value={option.employeeId}>{option.label}</option>)}
              </select>
            ) : (
              <input id="department-manager" className={INPUT_CLASS}
                value={managerId ? current?.managerName ?? translateUi('Trưởng phòng hiện tại') : translateUi('Chưa có nhân sự để phân công')} readOnly />
            )}
            <p className="mt-1.5 text-xs text-slate-600">
              {translateUi(isEditing
                ? managerId ? 'Mỗi phòng ban có một trưởng phòng.' : 'Chỉ nhân sự đang hoạt động thuộc phòng ban này mới có thể được chọn.'
                : 'Người được chọn sẽ chuyển sang phòng ban mới và được cấp quyền Manager. Vị trí ở phòng ban cũ sẽ được bỏ khỏi hồ sơ.')}
            </p>
          </div>

          {isEditing && (
            <div>
              <label htmlFor="department-status" className="block text-sm font-semibold text-slate-700 mb-1.5">{translateUi("Trạng thái")}</label>
              <select
                id="department-status"
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
              disabled={isSubmitting || loadingCurrent || loadingOptions}
            >
              {isSubmitting ? translateUi('Đang lưu…') : translateUi('Lưu')}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body,
  );
}
