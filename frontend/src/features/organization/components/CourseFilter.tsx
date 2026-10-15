import type { CompetencyCategory } from '@/services/competency.service';

const TIER_OPTIONS = [
  { value: '', label: 'Tất cả trình độ' },
  { value: '1', label: 'Cơ bản' },
  { value: '2', label: 'Trung cấp' },
  { value: '3', label: 'Nâng cao' },
];

interface CourseFilterProps {
  selectedLevel: string;
  selectedDomain: string;
  onLevelChange: (v: string) => void;
  onDomainChange: (v: string) => void;
  categories: CompetencyCategory[];
}

export function CourseFilter({
  selectedLevel,
  selectedDomain,
  onLevelChange,
  onDomainChange,
  categories,
}: CourseFilterProps) {
  const selectStyle = {
    borderColor: 'var(--po-line)',
    background: 'var(--po-surface)',
    color: 'var(--po-ink)',
  };

  return (
    <div
      className="rounded-[18px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="grid gap-1.5">
          <span
            className="text-xs font-bold"
            style={{ color: '#3c4a66' }}
          >
            Trình độ
          </span>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full rounded-[10px] border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2"
            style={{ ...selectStyle, '--tw-ring-color': 'var(--po-accent)' } as React.CSSProperties}
          >
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span
            className="text-xs font-bold"
            style={{ color: '#3c4a66' }}
          >
            Miền năng lực
          </span>
          <select
            value={selectedDomain}
            onChange={(e) => onDomainChange(e.target.value)}
            className="w-full rounded-[10px] border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2"
            style={{ ...selectStyle, '--tw-ring-color': 'var(--po-accent)' } as React.CSSProperties}
          >
            <option value="">Tất cả 6 miền</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
