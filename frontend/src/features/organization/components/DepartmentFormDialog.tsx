import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
import { useMembers } from '@/hooks/use-members';
import type { DepartmentDto } from '@/services/department.service';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';

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
  const isEditing = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  // For parent department dropdown
  const { data: parentData } = useDepartments({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  const parents = parentData?.items || [];

  // For manager selection
  const { data: memberData } = useMembers({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  const eligibleManagers = (memberData?.items ?? []).filter((m) => m.kind === 'member');

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
    if (open) {
      if (department) {
        reset({
          code: department.code,
          name: department.name,
          description: department.description ?? '',
          parentDepartmentId: department.parentDepartmentId ?? '',
          managerEmployeeId: department.managerEmployeeId ?? '',
          status: (department.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
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
  }, [open, department, reset]);


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
      toast.error(apiErrorMessage(error, isEditing ? 'Không cập nhật được phòng ban' : 'Không tạo được phòng ban'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" role="dialog">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditing ? 'Sửa phòng ban' : 'Tạo phòng ban'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mã phòng ban *</label>
            <input
              {...register('code')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ví dụ: ENG"
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên phòng ban *</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ví dụ: Kỹ thuật"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Người quản lý (Manager)</label>
            <select
              {...register('managerEmployeeId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isSubmitting}
            >
              <option value="">Chưa phân công Manager</option>
              {eligibleManagers.map((m) => (
                <option key={m.employeeId ?? m.id} value={m.employeeId ?? m.id}>
                  {m.fullName} ({m.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-2xs text-slate-500">
              Người được chọn sẽ quản lý và theo dõi nhân sự thuộc phòng ban này.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban cấp trên</label>
            <select
              {...register('parentDepartmentId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="ACTIVE">Đang dùng</option>
                <option value="INACTIVE">Ngừng dùng</option>
              </select>
            </div>
          )}


          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
