import { Link } from 'react-router-dom';
import type { CompetencyCategory } from '@/services/competency.service';
import type { CompetencyListItem } from '@/services/competency.service';

interface FrameworkDomainListProps {
  categories: CompetencyCategory[];
  competencies: CompetencyListItem[];
  isLoading: boolean;
}

const LEVELS = [
  { num: '01', label: 'Cơ bản' },
  { num: '02', label: 'Trung cấp' },
  { num: '03', label: 'Nâng cao' },
];

export function FrameworkDomainList({
  categories,
  competencies,
  isLoading,
}: FrameworkDomainListProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-[13px]"
        style={{
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[17px] border p-[23px]"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              minHeight: 180,
            }}
          />
        ))}
      </div>
    );
  }

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div
      className="grid gap-[13px]"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
      }}
    >
      {sorted.map((cat) => {
        const count = competencies.filter(
          (c) => c.categoryId === cat.id,
        ).length;
        return (
          <article
            key={cat.id}
            className="rounded-[17px] border p-[23px]"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'var(--po-muted)' }}
            >
              MIỀN 0{cat.sortOrder}
            </span>
            <h2
              className="mt-[11px] mb-[7px] text-xl font-semibold"
              style={{
                color: 'var(--po-ink)',
                letterSpacing: '-0.04em',
              }}
            >
              {cat.name}
            </h2>
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: 'var(--po-muted)',
                minHeight: 47,
              }}
            >
              {count} năng lực số cốt lõi theo Thông tư 02/2025. Ba cấp độ hành
              vi từ cơ bản đến nâng cao.
            </p>

            {/* Level pills */}
            <div className="mt-4 flex flex-wrap gap-[5px]">
              {LEVELS.map((l) => (
                <span
                  key={l.num}
                  className="rounded-lg px-2 py-1.5 text-[9px] font-extrabold"
                  style={{ background: 'var(--po-soft)', color: 'var(--po-accent-strong)' }}
                >
                  <b style={{ color: 'var(--po-accent)' }}>{l.num}</b>{' '}
                  {l.label}
                </span>
              ))}
            </div>

            {/* Competency list within domain */}
            <div className="mt-4 space-y-1.5">
              {competencies
                .filter((c) => c.categoryId === cat.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    to={`/enterprise/framework/${c.id}`}
                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-colors hover:bg-[var(--po-soft)]"
                  >
                    <span
                      className="shrink-0 font-mono text-[10px] font-bold"
                      style={{ color: 'var(--po-accent)' }}
                    >
                      {c.frameworkCode || c.code}
                    </span>
                    <span
                      className="truncate font-medium group-hover:underline"
                      style={{ color: 'var(--po-ink)' }}
                    >
                      {c.name}
                    </span>
                  </Link>
                ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
