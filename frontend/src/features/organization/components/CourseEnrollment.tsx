import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';

interface CourseEnrollmentProps {
  isBasic: boolean;
  completedCount: number;
  /** Basic, or a paid course the organization bought (once, for every employee). */
  hasLicense?: boolean;
  /** Where to buy the course when it is not bought yet. */
  checkoutPath?: string;
}

export function CourseEnrollment({
  isBasic,
  completedCount,
  hasLicense = true,
  checkoutPath,
}: CourseEnrollmentProps) {
  useUiLanguage();

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
      >{translateUi("Ai học được")}</span>
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
          ? translateUi('Miễn phí, mọi nhân viên học được ngay.')
          : hasLicense
          ? translateUi('Mọi nhân viên đều học được, không giới hạn số người.')
          : translateUi('Mua một lần cho cả doanh nghiệp, sau đó mọi nhân viên đều học được.')}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {completedCount > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
            style={{ background: '#edf7dd', color: '#557327' }}
          >
            {completedCount}{translateUi(" đã hoàn thành")}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {!hasLicense && checkoutPath ? (
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
