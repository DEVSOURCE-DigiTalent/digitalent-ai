import { Link } from 'react-router-dom';
import type { CourseListItem } from '@/services/assignment.service';
import { courseCodeMetadata } from '@/features/courses/course-catalog';

const DOMAIN_SHORT = ['DỮ LIỆU', 'GIAO TIẾP', 'NỘI DUNG', 'AN TOÀN', 'GIẢI QUYẾT', 'AI'];
const TIER_LABELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

interface CourseCardProps {
  course: CourseListItem;
  domainName?: string;
}

export function CourseCard({ course, domainName }: CourseCardProps) {
  const meta = courseCodeMetadata(course.code);
  const domain = meta?.domain ?? 1;
  const level = meta?.level ?? course.level;
  const isBasic = level === 1;
  const shortName = DOMAIN_SHORT[(domain - 1) % 6] ?? `D${domain}`;
  const domainNum = String(domain).padStart(2, '0');
  const tierLabel = TIER_LABELS[level - 1] ?? `Mức ${level}`;

  const artBg = domain % 2 === 0
    ? 'linear-gradient(120deg, rgba(248,241,234,.97), rgba(248,241,234,.05))'
    : 'linear-gradient(120deg, #e9edff, #fff5ed)';

  return (
    <article
      className="group flex flex-col rounded-[20px] border p-5"
      style={{
        borderColor: 'rgba(209,221,245,.55)',
        background: 'var(--po-surface)',
        boxShadow: '0 6px 20px rgba(20,38,100,.03)',
        minHeight: 260,
        transition: 'transform .22s cubic-bezier(.2,.7,.35,1), box-shadow .22s, border-color .22s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(20,38,100,.07)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,38,100,.03)';
      }}
    >
      <div
        className="flex items-center justify-between rounded-[14px] border overflow-hidden px-3 mb-4"
        style={{ height: 95, background: artBg, borderColor: 'rgba(200,213,244,.65)' }}
      >
        <span className="text-[11px] font-black" style={{ color: 'var(--po-accent)' }}>
          {shortName}
        </span>
        <b className="text-[29px] leading-none" style={{ color: '#8a98e0' }}>
          {domainNum}
        </b>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-accent)' }}
        >
          {tierLabel}
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
          style={
            isBasic
              ? { background: '#edf7dd', color: '#557327' }
              : { background: '#f0f2f6', color: '#66748d' }
          }
        >
          {isBasic ? 'Mở toàn bộ' : 'Phân công'}
        </span>
      </div>

      <h3
        className="text-[17px] font-semibold leading-tight mb-1.5 line-clamp-2"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}
      >
        {course.title}
      </h3>

      {domainName && (
        <p className="text-[11px] mb-3 line-clamp-1" style={{ color: 'var(--po-muted)' }}>
          {domainName}
        </p>
      )}

      <p className="text-[11px] leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--po-muted)' }}>
        {isBasic
          ? 'Xây dựng nền tảng thực hành và nộp bài cuối khóa.'
          : 'Xem cấu trúc và bài mẫu; mở toàn bộ khi được phân công.'}
      </p>

      <div className="mt-auto pt-1">
        <Link
          to={`/enterprise/courses/${course.id}`}
          className="flex items-center justify-center gap-2 rounded-[11px] border px-3 py-2 text-xs font-bold transition-colors hover:border-[var(--po-accent)]"
          style={{
            background: 'var(--po-surface)',
            color: 'var(--po-accent)',
            borderColor: '#cdd7f5',
          }}
        >
          Xem khóa học →
        </Link>
      </div>
    </article>
  );
}
