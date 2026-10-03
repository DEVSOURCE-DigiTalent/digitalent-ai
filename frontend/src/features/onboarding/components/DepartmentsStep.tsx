import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSaveDepartments } from '@/hooks/use-onboarding';
import type { OrganizationSetup } from '@/types/commerce';
import { INPUT_CLASS, LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, errorMessage } from './styles';

const SUGGESTIONS = ['Ban giám đốc', 'Kinh doanh', 'Marketing', 'Nhân sự', 'Kế toán', 'Vận hành', 'Công nghệ'];

interface DepartmentsStepProps {
  setup: OrganizationSetup;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}

/** ENT-ONB-06: the departments or teams employees belong to. Optional: they can be added later. */
export function DepartmentsStep({ setup, onBack, onDone, onSkip }: DepartmentsStepProps) {
  const save = useSaveDepartments();
  const [names, setNames] = useState<string[]>(() => setup.departments.map((d) => d.name));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();

  const add = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (names.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" đã có trong danh sách.`);
      return;
    }
    setError(undefined);
    setNames([...names, trimmed]);
    setDraft('');
  };

  const toggleSuggestion = (name: string) =>
    setNames(names.includes(name) ? names.filter((n) => n !== name) : [...names, name]);

  const submit = async () => {
    setError(undefined);
    try {
      await save.mutateAsync(names);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return (
    <div className="grid max-w-xl gap-6">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Gợi ý phổ biến</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((name) => {
            const selected = names.includes(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSuggestion(name)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          add(draft);
        }}
        className="grid gap-1.5"
      >
        <label htmlFor="department-name" className="text-sm font-medium text-slate-700">
          Thêm phòng ban hoặc nhóm khác
        </label>
        <div className="flex gap-2">
          <input
            id="department-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Ví dụ: Chăm sóc khách hàng"
          />
          <button type="submit" className={SECONDARY_BUTTON}>
            <Plus className="size-4" aria-hidden="true" />
            Thêm
          </button>
        </div>
      </form>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Đã chọn ({names.length})</p>
        {names.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có phòng ban nào.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {names.map((name) => (
              <li key={name} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-sm text-slate-700">
                {name}
                <button
                  type="button"
                  onClick={() => setNames(names.filter((n) => n !== name))}
                  aria-label={`Xóa ${name}`}
                  className="grid size-5 place-items-center rounded-full hover:bg-slate-200"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>Quay lại</button>
        <button type="button" onClick={submit} disabled={save.isPending || names.length === 0} className={PRIMARY_BUTTON}>
          {save.isPending ? 'Đang lưu…' : 'Lưu và tiếp tục'}
        </button>
        <button type="button" onClick={onSkip} className={LINK_BUTTON}>Bỏ qua bước này</button>
      </div>
    </div>
  );
}
