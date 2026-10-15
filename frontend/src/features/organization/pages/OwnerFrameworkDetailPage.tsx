import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCompetency } from '@/hooks/use-competencies';
import { CompetencyDetailPanel } from '../components/CompetencyDetailPanel';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

const TYPE_LABELS: Record<string, string> = {
  CORE_DIGITAL: 'Năng lực số cốt lõi',
  PROFESSIONAL: 'Chuyên môn',
  INTERNAL: 'Nội bộ',
  BEHAVIOURAL: 'Hành vi',
};

export function OwnerFrameworkDetailPage() {
  const { id = '' } = useParams();
  const { data: competency, isLoading, isError } = useCompetency(id);

  if (isLoading) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải năng lực…
        </p>
      </div>
    );
  }

  if (isError || !competency) {
    return (
      <div
        className="-m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: '#e9edff', color: 'var(--po-accent)' }}
          >
            ✕
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--po-ink)' }}
          >
            Không tìm thấy năng lực
          </h2>
          <Link
            to="/enterprise/framework"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" /> Quay lại khung năng lực
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Hero ── */}
      <section
        className="px-4 md:px-6 pt-6 pb-4 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <Link
          to="/enterprise/framework"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Khung năng lực
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-2xl text-sm font-bold"
            style={{
              background: 'var(--po-soft)',
              color: 'var(--po-accent)',
            }}
          >
            {competency.code}
          </span>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold"
              style={{
                color: 'var(--po-ink)',
                letterSpacing: '-0.04em',
              }}
            >
              {competency.name}
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--po-muted)' }}
            >
              {competency.categoryName} ·{' '}
              {TYPE_LABELS[competency.competencyType] ??
                competency.competencyType}{' '}
              · {competency.criteria.length} tiêu chí
            </p>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-bold shrink-0"
            style={
              competency.status === 'ACTIVE'
                ? {
                    background: '#ecfdf5',
                    color: '#16a34a',
                    borderColor: '#bbf7d0',
                  }
                : competency.status === 'DRAFT'
                  ? {
                      background: '#fef3c7',
                      color: '#d97706',
                      borderColor: '#fdddb6',
                    }
                  : {
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderColor: '#fecaca',
                    }
            }
          >
            {competency.status === 'ACTIVE'
              ? 'Đang dùng'
              : competency.status === 'DRAFT'
                ? 'Bản nháp'
                : 'Đã lưu trữ'}
          </span>
        </div>
      </section>

      {/* ── Detail content ── */}
      <div
        className="px-4 md:px-6 pb-8 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <CompetencyDetailPanel competency={competency} />
      </div>
    </div>
  );
}
