import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { useJobPositions } from '@/hooks/use-job-positions';
import type { EmployeeListItem } from '@/services/employee.service';
import { toast } from 'sonner';

const employeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  fullName: z.string().min(1, 'Full name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  jobPositionId: z.string().optional(),
  workEmail: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'ARCHIVED']),
});

type FormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeListItem | null;
}

export function EmployeeFormDialog({ open, onClose, employee }: EmployeeFormDialogProps) {
  const isEditing = !!employee;
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const { data: deptData } = useDepartments({ pageSize: 100 });
  const { data: posData } = useJobPositions({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeCode: '',
      fullName: '',
      departmentId: '',
      jobPositionId: '',
      workEmail: '',
      phone: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open) {
      if (employee) {
        reset({
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          departmentId: employee.departmentId || '',
          jobPositionId: employee.jobPositionId || employee.positionId || '',
          workEmail: employee.workEmail || '',
          phone: employee.phone || '',
          status: (employee.status as any) || 'ACTIVE',
        });
      } else {
        reset({
          employeeCode: '',
          fullName: '',
          departmentId: '',
          jobPositionId: '',
          workEmail: '',
          phone: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, employee, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && employee) {
        await updateMutation.mutateAsync({
          id: employee.id,
          data: {
            employeeCode: data.employeeCode,
            fullName: data.fullName,
            departmentId: data.departmentId,
            jobPositionId: data.jobPositionId || undefined,
            positionId: data.jobPositionId || undefined,
            workEmail: data.workEmail || undefined,
            phone: data.phone || undefined,
            status: data.status,
          },
        });
        toast.success('Employee updated successfully');
      } else {
        await createMutation.mutateAsync({
          employeeCode: data.employeeCode,
          fullName: data.fullName,
          departmentId: data.departmentId,
          jobPositionId: data.jobPositionId || undefined,
          positionId: data.jobPositionId || undefined,
          workEmail: data.workEmail || undefined,
          phone: data.phone || undefined,
          status: data.status,
        });
        toast.success('Employee created successfully');
      }
      onClose();
    } catch {
      toast.error(isEditing ? 'Failed to update employee' : 'Failed to create employee');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditing ? 'Edit Employee' : 'Create Employee'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emp-code" className="block text-sm font-medium text-slate-700 mb-1">
                Employee Code *
              </label>
              <input
                id="emp-code"
                {...register('employeeCode')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. EMP-001"
                disabled={isSubmitting}
              />
              {errors.employeeCode && (
                <p className="mt-1 text-sm text-red-500">{errors.employeeCode.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emp-fullName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                id="emp-fullName"
                {...register('fullName')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Nguyen Van A"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emp-dept" className="block text-sm font-medium text-slate-700 mb-1">
                Department *
              </label>
              <select
                id="emp-dept"
                {...register('departmentId')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="">Select Department</option>
                {deptData?.items?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-sm text-red-500">{errors.departmentId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emp-pos" className="block text-sm font-medium text-slate-700 mb-1">
                Job Position
              </label>
              <select
                id="emp-pos"
                {...register('jobPositionId')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="">None / Unassigned</option>
                {posData?.items?.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name} ({pos.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emp-email" className="block text-sm font-medium text-slate-700 mb-1">
                Work Email
              </label>
              <input
                id="emp-email"
                type="email"
                {...register('workEmail')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. employee@company.com"
                disabled={isSubmitting}
              />
              {errors.workEmail && (
                <p className="mt-1 text-sm text-red-500">{errors.workEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emp-phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="emp-phone"
                {...register('phone')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 0912345678"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label htmlFor="emp-status" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                id="emp-status"
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-200">
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
