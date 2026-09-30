import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionListItem, QuestionTag } from '@/services/question-bank.service';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/use-questions';
import { useCreateQuestionTag } from '@/hooks/use-question-banks';

const QUESTION_TYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY'] as const;
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;

const optionSchema = z.object({
  content: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const formSchema = z
  .object({
    questionType: z.enum(QUESTION_TYPES),
    difficulty: z.string().optional(),
    content: z.string().min(1, 'Question content is required'),
    explanation: z.string().optional(),
    tagIds: z.array(z.string()),
    options: z.array(optionSchema),
  })
  .superRefine((val, ctx) => {
    if (val.questionType === 'ESSAY') return;
    if (val.options.length < 1) {
      ctx.addIssue({ code: 'custom', message: 'At least one option is required', path: ['options'] });
    }
    if (!val.options.some((o) => o.isCorrect)) {
      ctx.addIssue({ code: 'custom', message: 'Mark at least one option as correct', path: ['options'] });
    }
  });

type FormData = z.infer<typeof formSchema>;

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  bankId: string;
  tags: QuestionTag[];
  question?: QuestionListItem | null;
}

export function QuestionFormDialog({ open, onClose, bankId, tags, question }: QuestionFormDialogProps) {
  const isEditing = !!question;
  const createMutation = useCreateQuestion(bankId);
  const updateMutation = useUpdateQuestion(bankId);
  const createTagMutation = useCreateQuestionTag();
  const [newTagName, setNewTagName] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionType: 'SINGLE_CHOICE',
      difficulty: 'MEDIUM',
      content: '',
      explanation: '',
      tagIds: [],
      options: [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const questionType = watch('questionType');

  useEffect(() => {
    if (!open) return;
    reset({
      questionType: (question?.questionType as FormData['questionType']) ?? 'SINGLE_CHOICE',
      difficulty: question?.difficulty ?? 'MEDIUM',
      content: question?.content ?? '',
      explanation: question?.explanation ?? '',
      tagIds: question?.tags.map((t) => t.id) ?? [],
      options: question?.options.length
        ? question.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect }))
        : [
            { content: '', isCorrect: true },
            { content: '', isCorrect: false },
          ],
    });
  }, [open, question, reset]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    const payload = {
      questionType: data.questionType,
      difficulty: data.difficulty,
      content: data.content,
      explanation: data.explanation,
      tagIds: data.tagIds,
      options: data.questionType === 'ESSAY' ? [] : data.options.map((o, i) => ({ ...o, sortOrder: i + 1 })),
    };

    try {
      if (isEditing && question) {
        await updateMutation.mutateAsync({ id: question.id, data: payload });
        toast.success('Question updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Question created successfully');
      }
      onClose();
    } catch {
      toast.error(isEditing ? 'Failed to update question' : 'Failed to create question');
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      await createTagMutation.mutateAsync({ name, category: 'TOPIC' });
      setNewTagName('');
      toast.success(`Tag "${name}" created`);
    } catch {
      toast.error('Failed to create tag');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" role="dialog">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Question' : 'Create Question'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
              <select
                {...register('questionType')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              {...register('content')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter the question text..."
            />
            {errors.content && <p className="text-xs text-danger-600 mt-1">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
            <textarea
              {...register('explanation')}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Shown to learners after grading..."
            />
          </div>

          {questionType !== 'ESSAY' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Options</label>
                <button
                  type="button"
                  onClick={() => append({ content: '', isCorrect: false })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add option
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`options.${index}.isCorrect`}
                      render={({ field: cf }) => (
                        <input
                          type="checkbox"
                          checked={cf.value}
                          onChange={(e) => cf.onChange(e.target.checked)}
                          title="Mark as correct"
                          className="w-4 h-4 accent-primary-600"
                        />
                      )}
                    />
                    <input
                      {...register(`options.${index}.content`)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="text-slate-400 hover:text-danger-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.options && !Array.isArray(errors.options) && (
                <p className="text-xs text-danger-600 mt-1">{errors.options.message as string}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taxonomy Tags</label>
            <Controller
              control={control}
              name="tagIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const checked = field.value.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            checked ? field.value.filter((id) => id !== tag.id) : [...field.value, tag.id],
                          )
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                          checked
                            ? 'bg-primary-50 text-primary-700 border-primary-300'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {tags.length === 0 && <p className="text-xs text-slate-400">No tags yet — create one below.</p>}
                </div>
              )}
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name..."
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40"
              >
                + Add tag
              </button>
            </div>
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
