import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import type { CourseDetailDto } from '@/services/assignment.service';

interface CourseEnrollmentProps {
  course: CourseDetailDto;
  isBasic: boolean;
  assignmentCount: number;
  completedCount: number;
  /** The organization may assign the course: Basic, or a paid course it bought (once, for every employee). */
  hasLicense?: boolean;
  /** Where to buy the course when it is not bought yet. */
  checkoutPath?: string;
}

export function CourseEnrollment({
  course,
  isBasic,
  assignmentCount,
  completedCount,
  hasLicense = true,
  checkoutPath,
}: CourseEnrollmentProps) {
  useUiLanguage();
  const navigate = useNavigate();

  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-accent)' }}
      >{translateUi("Truy cập và phân công")}</span>
      <h2
        className="mt-2 text-xl font-semibold"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
      >
        {isBasic
          ? translateUi('Mở toàn bộ')
          : hasLicense
          ? translateUi('Đã mua cho cả doanh nghiệp')
          : translateUi('Chưa mua khóa học')}
      </h2>
      <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
        {isBasic
          ? translateUi('Không cần phân công. Tất cả nhân viên có thể truy cập nội dung khóa Cơ bản.')
          : hasLicense
          ? translateUi('Mọi nhân viên đều học được, không giới hạn số người. Quản lý có thể giao khóa cho nhân viên.')
          : translateUi('Khóa học có phí, mua một lần cho cả doanh nghiệp rồi giao cho nhân viên học.')}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {hasLicense && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
            style={
              assignmentCount > 0
                ? { background: '#edf7dd', color: '#557327' }
                : { background: '#f0f2f6', color: '#66748d' }
            }
          >
            {assignmentCount > 0
              ? translateUi(`${assignmentCount} nhân viên đã giao`)
              : translateUi('Chưa có phân công')}
          </span>
        )}
        {completedCount > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
            style={{ background: '#edf7dd', color: '#557327' }}
          >
            {completedCount}{translateUi(" đã hoàn thành")}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {hasLicense ? (
          <button
            type="button"
            onClick={() => navigate(`/enterprise/assignments?courseId=${course.id}`)}
            className="inline-flex items-center gap-1.5 rounded-[11px] px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
            style={{
              background: 'var(--po-accent)',
              color: '#fff',
              boxShadow: '0 9px 18px rgba(19,123,132,.17)',
            }}
          >
            <UserCheck className="size-3.5" />{translateUi("Giao khóa học")}</button>
        ) : checkoutPath ? (
          <Link
            to={checkoutPath}
            className="inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-105"
            style={{ background: '#f59e0b' }}
          >
            <span>🔒 {translateUi("Mua khóa học cho doanh nghiệp")}</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
