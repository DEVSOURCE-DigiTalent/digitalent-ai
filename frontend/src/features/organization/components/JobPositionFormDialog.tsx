import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateJobPosition, useUpdateJobPosition } from '@/hooks/use-job-positions';
import { useDepartments } from '@/hooks/use-departments';
import type { JobPositionListItem } from '@/services/job-position.service';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';
import { INPUT_CLASS } from '@/features/onboarding/components/styles';

const formSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã'),
  name: z.string().min(1, 'Vui lòng nhập tên'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobPositionFormDialogProps {
  open: boolean;
  onClose: () => void;
  position?: JobPositionListItem | null;
}

export function JobPositionFormDialog({ open, onClose, position }: JobPositionFormDialogProps) {
  const isEditing = Boolean(position);
  const createMutation = useCreateJobPosition();
  const updateMutation = useUpdateJobPosition();

  const { data: deptData } = useDepartments({ pageSize: 100, status: 'ACTIVE' });
  const departments = deptData?.items || [];

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
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (position) {
        reset({
          code: position.code,
          name: position.name,
          description: '',
          departmentId: position.departmentId || '',
          status: position.status === 'ARCHIVED' ? 'ACTIVE' : position.status,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          departmentId: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, position, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && position) {
        await updateMutation.mutateAsync({
          id: position.id,
          data: {
            code: data.code.trim().toUpperCase(),
            name: data.name.trim(),
            description: data.description?.trim(),
            departmentId: data.departmentId || undefined,
            status: data.status as 'ACTIVE' | 'INACTIVE',
          },
        });
        toast.success('Đã cập nhật vị trí công việc');
      } else {
        await createMutation.mutateAsync({
          code: data.code.trim().toUpperCase(),
          name: data.name.trim(),
          description: data.description?.trim(),
          departmentId: data.departmentId || undefined,
        });
        toast.success('Đã tạo vị trí công việc');
      }
      onClose();
    } catch (error) {
      toast.error(
        apiErrorMessage(
          error,
          isEditing ? 'Không cập nhật được vị trí công việc' : 'Không tạo được vị trí công việc'
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" role="dialog">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditing ? 'Sửa vị trí công việc' : 'Tạo vị trí công việc'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mã vị trí *</label>
            <input
              {...register('code')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: KT-01"
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên vị trí *</label>
            <input
              {...register('name')}
              className={INPUT_CLASS}
              placeholder="Ví dụ: Kế toán viên"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban</label>
            <select
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea
              {...register('description')}
              rows={2}
              className={INPUT_CLASS}
              disabled={isSubmitting}
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                {...register('status')}
                className={INPUT_CLASS}
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
