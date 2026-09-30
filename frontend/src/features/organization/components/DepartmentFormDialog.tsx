import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
import type { DepartmentDto } from '@/services/department.service';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';

const formSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DepartmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  department?: Pick<DepartmentDto, 'id' | 'code' | 'name' | 'status'> | null;
}

export function DepartmentFormDialog({ open, onClose, department }: DepartmentFormDialogProps) {
  const isEditing = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  // For parent department dropdown
  const { data: parentData } = useDepartments({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  const parents = parentData?.items || [];

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
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (department) {
        // Need to get description from full detail if it was fetched, but typically list doesn't have it.
        // We'll fill what we have.
        reset({
          code: department.code,
          name: department.name,
          description: '', // might need to fetch by ID to edit properly, but for now just empty if not available
          parentDepartmentId: '',
          status: department.status as any,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          parentDepartmentId: '',
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
            status: data.status as 'ACTIVE' | 'INACTIVE',
          },
        });
        toast.success('Department updated successfully');
      } else {
        await createMutation.mutateAsync({
          code: data.code,
          name: data.name,
          description: data.description,
          parentDepartmentId: data.parentDepartmentId || undefined,
        });
        toast.success('Department created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, isEditing ? 'Failed to update department' : 'Failed to create department'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" role="dialog">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditing ? 'Edit Department' : 'Create Department'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
            <input
              {...register('code')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. ENG"
              disabled={isSubmitting}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Engineering"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parent Department</label>
            <select
              {...register('parentDepartmentId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isSubmitting}
            >
              <option value="">None</option>
              {parents
                .filter(p => p.id !== department?.id) // Can't be parent of itself
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
