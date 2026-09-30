import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateQuestionBank } from '@/hooks/use-question-banks';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface QuestionBankFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (bankId: string) => void;
}

export function QuestionBankFormDialog({ open, onClose, onCreated }: QuestionBankFormDialogProps) {
  const createMutation = useCreateQuestionBank();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  });

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createMutation.mutateAsync(data);
      toast.success('Question bank created successfully');
      reset();
      onCreated?.(result.id);
      onClose();
    } catch {
      toast.error('Failed to create question bank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" role="dialog">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Question Bank</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              {...register('title')}
              placeholder="e.g. General Aptitude"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && <p className="text-xs text-danger-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
