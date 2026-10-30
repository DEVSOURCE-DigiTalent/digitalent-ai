import { Link } from 'react-router-dom';
import type { TrainingBatchListItemDto } from '@/services/mock/server/handlers/training-batches';

interface TrainingBatchCardProps {
  batch: TrainingBatchListItemDto;
}

const STATUS_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  RUNNING: { label: 'Đang diễn ra', bg: 'var(--po-soft)', fg: 'var(--po-accent-strong)' },
  SCHEDULED: { label: 'Đã lên lịch', bg: '#fef3c7', fg: '#d97706' },
  COMPLETED: { label: 'Hoàn thành', bg: '#ecfdf5', fg: '#16a34a' },
  CANCELLED: { label: 'Đã hủy', bg: '#fee2e2', fg: '#dc2626' },
  DRAFT: { label: 'Bản nháp', bg: 'var(--po-raised)', fg: 'var(--po-muted)' },
};

export function TrainingBatchCard({ batch }: TrainingBatchCardProps) {
  const status = STATUS_MAP[batch.status] ?? STATUS_MAP.DRAFT;
  const pct = batch.averageProgressPercent;

  return (
    <Link
      to={`/enterprise/training-batches/${batch.id}`}
      className="flex flex-col rounded-[13px] border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <strong
            className="block text-[13px] truncate"
            style={{ color: 'var(--po-ink)' }}
          >
            {batch.name}
          </strong>
          <small
            className="block text-[11px] mt-0.5 truncate"
            style={{ color: 'var(--po-muted)' }}
          >
            {batch.code} · {batch.coursesCount} khóa · {batch.participantsCount}{' '}
            học viên
          </small>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: status.bg, color: status.fg }}
        >
          {status.label}
        </span>
      </div>

      <small
        className="text-[10px] mb-2"
        style={{ color: 'var(--po-muted)' }}
      >
        {batch.startDate} → {batch.endDate}
      </small>

      {/* Progress bar */}
      <div
        className="h-[5px] w-full rounded-full overflow-hidden"
        style={{ background: 'var(--po-line)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              batch.status === 'COMPLETED'
                ? '#16a34a'
                : 'var(--po-accent)',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-bold" style={{ color: 'var(--po-muted)' }}>
          {pct}% tiến độ
        </span>
        <span className="text-[10px] font-bold" style={{ color: 'var(--po-accent)' }}>
          {batch.completedParticipantsCount}/{batch.participantsCount} hoàn thành
        </span>
      </div>
    </Link>
  );
}
