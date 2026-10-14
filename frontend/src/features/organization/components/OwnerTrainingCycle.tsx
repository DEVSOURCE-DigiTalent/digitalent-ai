import { Link } from 'react-router-dom';
import type { MemberHistoryEntry } from '@/services/member.service';
import { formatDate } from '@/lib/utils';
import { auditActionLabel } from '@/features/members/member-labels';

interface OwnerTrainingCycleProps {
  events: MemberHistoryEntry[];
}

export function OwnerTrainingCycle({ events }: OwnerTrainingCycleProps) {
  const recent = events.slice(0, 3);

  return (
    <section
      className="rounded-[22px] border p-6"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-muted)' }}
      >
        Chu kỳ đào tạo
        <span
          className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
          style={{ background: 'var(--po-coral)' }}
        />
      </p>
      <h2
        className="mt-[11px] text-xl font-semibold tracking-[-0.045em]"
        style={{ color: 'var(--po-ink)' }}
      >
        Biết điều gì xảy ra sau học tập.
      </h2>
      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--po-muted)' }}>
        Báo cáo chu kỳ mở sau khi Quản lý duyệt đánh giá cuối khóa học.
      </p>

      {recent.length > 0 ? (
        <div className="mt-5">
          {recent.map((event) => (
            <div
              key={event.id}
              className="grid gap-x-[15px] py-4 border-b last:border-b-0"
              style={{
                gridTemplateColumns: '20px 90px 1fr',
                borderColor: 'var(--po-line)',
              }}
            >
              <span
                className="mt-1.5 size-[10px] rounded-full shrink-0"
                style={{ background: 'var(--po-accent)' }}
                aria-hidden="true"
              />
              <time className="text-[10px] mt-0.5" style={{ color: '#8996ad' }}>
                {formatDate(event.at)}
              </time>
              <span>
                <strong className="text-sm block" style={{ color: 'var(--po-ink)' }}>
                  {auditActionLabel(event.action)}
                </strong>
                <p className="text-xs mt-0.5" style={{ color: 'var(--po-muted)' }}>
                  {event.targetLabel}
                </p>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-center py-4" style={{ color: 'var(--po-muted)' }}>
          Chưa có hoạt động nào được ghi lại.
        </p>
      )}

      <div className="mt-5">
        <Link
          to="/enterprise/reports"
          className="rounded-xl border px-3 py-2 text-xs font-extrabold transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
        >
          Mở báo cáo chu kỳ
        </Link>
      </div>
    </section>
  );
}
