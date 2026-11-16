import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Eye,
  Award,
  BookOpen,
  ArrowRight,
  FileText,
  Search,
  Database,
  MessageSquare,
  Palette,
  Shield,
  Cpu,
  Sparkles,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/shared';
import { TrialDisclosure } from './TrialDisclosure';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import type { TrialParticipantStatus, TrialReport, TrialReportEmployee, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE, domainTotals, levelFromShare, sharePercent } from '../lib/trial-format';

export const DOMAIN_THEMES = [
  {
    number: 1,
    name: 'Khai thác dữ liệu và thông tin',
    tableHeader: '1. Dữ liệu',
    icon: Database,
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    lightBg: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
  },
  {
    number: 2,
    name: 'Giao tiếp và hợp tác trong môi trường số',
    tableHeader: '2. Giao tiếp',
    icon: MessageSquare,
    bgClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
    lightBg: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
  },
  {
    number: 3,
    name: 'Sáng tạo nội dung số',
    tableHeader: '3. Sáng tạo',
    icon: Palette,
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    lightBg: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
  {
    number: 4,
    name: 'An toàn',
    tableHeader: '4. An toàn',
    icon: Shield,
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    lightBg: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  {
    number: 5,
    name: 'Giải quyết vấn đề',
    tableHeader: '5. Giải quyết VĐ',
    icon: Cpu,
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    lightBg: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  {
    number: 6,
    name: 'Ứng dụng trí tuệ nhân tạo',
    tableHeader: '6. Trí tuệ AI',
    icon: Sparkles,
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    lightBg: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
  },
];

export function LevelBadge({ level, size = 'default' }: { level: number; size?: 'default' | 'sm' }) {
  useUiLanguage();
  const value = Math.max(0, Math.min(3, Math.round(level)));
  const styles = [
    'bg-slate-100/90 text-slate-600 border-slate-200/90 font-medium', // 0: Chưa đạt
    'bg-sky-50 text-sky-700 border-sky-200/90 font-bold', // 1: Cơ bản
    'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-bold', // 2: Trung cấp
    'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-bold', // 3: Nâng cao
  ];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] min-w-[64px]' : 'px-2.5 py-1 text-xs min-w-[76px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border shadow-2xs transition-all ${sizeClasses} ${styles[value]}`}
    >
      {translateUi(LEVEL_LABELS[value])}
    </span>
  );
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Đã mời', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa làm bài', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'info' },
  REVIEWED: { label: 'Đã chấm', tone: 'ok' },
};

export function ParticipantStatus({ status }: { status: TrialParticipantStatus }) {
  useUiLanguage();
  const s = PARTICIPANT[status];
  return <span className={`tp-badge ${s.tone}`}>{translateUi(s.label)}</span>;
}

export function StageBadge({ stage }: { stage: TrialStage }) {
  useUiLanguage();
  return <span className={`tp-badge ${STAGE[stage].tone}`}>{translateUi(STAGE[stage].label)}</span>;
}

/** Thanh bước: index = bước hiện tại (0-based); các bước trước đã xong. */
export function Steps({ steps, current, label = 'Các bước dùng thử' }: { steps: string[]; current: number; label?: string }) {
  useUiLanguage();
  return (
    <nav aria-label={translateUi(label)} className="w-full">
      <ol className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              data-state={isCurrent ? 'current' : isDone ? 'done' : 'upcoming'}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/80 text-emerald-800 font-semibold border border-emerald-200/60'
                  : isCurrent
                  ? 'bg-[#137b84]/10 text-[#0e5968] font-bold border border-[#137b84]/30 shadow-2xs'
                  : 'bg-transparent text-slate-400 font-medium'
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#137b84] text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              <span className="hidden sm:inline truncate">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const nextCourseSuffix = ['F', 'I', 'A'];

function summarizeDomain(domain: TrialReport['summary'][number], employees: TrialReport['employees']) {
  const comparisons = employees.flatMap((employee) => (employee.domainDetails ?? []).flatMap((detail) =>
    detail.categoryId === domain.categoryId && detail.targetLevel
      ? [{ level: detail.level, target: detail.targetLevel }]
      : []));
  const targets = [...new Set(comparisons.map(({ target }) => target))].sort((a, b) => a - b);
  const gaps = comparisons.filter(({ level, target }) => level < target);
  const level = gaps.reduce((lowest, detail) => Math.min(lowest, detail.level + 1), 3);
  const course = gaps.length ? { level, code: `M${domain.number}-${nextCourseSuffix[level - 1]}` } : null;
  return { ...domain, targets, comparedCount: comparisons.length, gapCount: gaps.length, course };
}

/** Bảng năng lực của doanh nghiệp: phân bố mức theo lĩnh vực và mức của từng nhân viên. */
export function CompetencyReport({ report, participantCount, nextSteps }: { report: TrialReport; participantCount?: number; nextSteps?: ReactNode }) {
  useUiLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState<TrialReportEmployee | null>(null);
  const [closingEmployee, setClosingEmployee] = useState(false);
  const closeEmployeeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { if (closeEmployeeTimer.current) clearTimeout(closeEmployeeTimer.current); }, []);
  const closeEmployee = () => {
    if (closingEmployee) return;
    setClosingEmployee(true);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    closeEmployeeTimer.current = setTimeout(() => { setSelectedEmployee(null); setClosingEmployee(false); }, reduced ? 0 : 220);
  };
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isEmployeeTableOpen, setIsEmployeeTableOpen] = useState(false);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePageSize, setEmployeePageSize] = useState(5);

  const filteredEmployees = report.employees.filter(
    (e) =>
      !employeeFilter.trim() ||
      e.fullName.toLowerCase().includes(employeeFilter.toLowerCase()) ||
      (e.departmentName && e.departmentName.toLowerCase().includes(employeeFilter.toLowerCase())) ||
      (e.positionName && e.positionName.toLowerCase().includes(employeeFilter.toLowerCase())),
  );
  const employeePageCount = Math.max(1, Math.ceil(filteredEmployees.length / employeePageSize));
  const activeEmployeePage = Math.min(employeePage, employeePageCount);
  const visibleEmployees = filteredEmployees.slice((activeEmployeePage - 1) * employeePageSize, activeEmployeePage * employeePageSize);
  const sortedByPriority = report.summary.map((domain) => summarizeDomain(domain, report.employees)).sort((a, b) =>
    b.gapCount - a.gapCount || (b.averageGap ?? 0) - (a.averageGap ?? 0) || a.average - b.average || a.number - b.number);
  const topFocusDomain = sortedByPriority.find((domain) => domain.course);
  const focusCourse = topFocusDomain?.course;
  const scores = report.employees.reduce(({ correct, total }, employee) =>
    employee.choiceScore != null && employee.choiceTotal != null && employee.choiceTotal > 0
      ? { correct: correct + employee.choiceScore, total: total + employee.choiceTotal }
      : { correct, total }, { correct: 0, total: 0 });
  const totalQuestions = scores.total;
  const overallLevel = levelFromShare(scores.correct, totalQuestions);
  const overallPercent = sharePercent(scores.correct, totalQuestions);
  const employeeScore = selectedEmployee?.choiceScore;
  const employeeQuestionCount = selectedEmployee?.choiceTotal ?? 0;

  return (
    <div className="trial-competency-report space-y-6">
      {nextSteps}

      <section aria-labelledby="trial-report-title" className="trial-report-overview rounded-2xl border p-5 sm:p-6">
        <h2 id="trial-report-title" className="text-xl font-bold tracking-tight">{translateUi('Bức tranh năng lực')}</h2>
        <p className="mt-1 text-sm text-teal-50">
          {translateUi('Kết quả từ')} <strong>{report.assessed}</strong> {translateUi('nhân sự hoàn thành khảo sát.')}
          {participantCount != null && report.assessed < participantCount && (
            <> {translateUi('Tổng số tham gia:')} <strong>{participantCount}</strong>.</>
          )}
        </p>

        <div className={`mt-4 grid gap-3 ${topFocusDomain && focusCourse ? 'lg:grid-cols-[1fr_1.15fr]' : ''}`}>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-teal-100">
              <Award size={17} aria-hidden="true" />
              {translateUi('Mức năng lực trung bình')}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {totalQuestions > 0 ? <>{overallLevel > 0 && <>{translateUi('Đạt mức')} </>}{translateUi(LEVEL_LABELS[overallLevel])}</> : translateUi('Chưa có điểm trắc nghiệm')}
            </p>
            {totalQuestions > 0 && (
              <p className="mt-1 text-sm tabular-nums text-teal-50">{overallPercent}% {translateUi('câu đúng trên tổng số bài đã chấm')}</p>
            )}
            {totalQuestions > 0 && overallLevel === 0 && (
              <p className="mt-1 text-sm text-teal-50">{translateUi('Nên bắt đầu từ khóa Cơ bản.')}</p>
            )}
          </div>
          {topFocusDomain && focusCourse && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-[#f7fcfb] p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-teal-800">{translateUi('Cần ưu tiên')}</p>
                <p className="mt-2 text-base font-bold leading-snug text-slate-900">{translateUi(topFocusDomain.name)}</p>
                <p className="mt-1 text-sm text-slate-700">{topFocusDomain.gapCount} {translateUi('người cần bổ sung theo chuẩn vị trí')}</p>
              </div>
              <Link to={`/enterprise/courses?focus=${focusCourse.code}&level=${focusCourse.level}`} className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#125c61] px-3 py-2 text-sm font-semibold text-white hover:bg-[#164957] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 motion-safe:transition-colors">
                <BookOpen size={15} aria-hidden="true" />{translateUi('Xem khóa')} {focusCourse.code}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── BẢNG NĂNG LỰC 6 LĨNH VỰC ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3.5 mb-4">
          <h3 className="text-base font-bold text-slate-900">{translateUi("Năng lực theo lĩnh vực")}</h3>
          <span className="text-xs font-semibold text-slate-500">{translateUi("Tổng nhân sự: ")}<strong className="text-slate-900 font-bold tabular-nums">{report.assessed}</strong>{translateUi(" người")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">{translateUi("Lĩnh vực")}</th>
                <th className="py-3 px-3 text-center">{translateUi('Mức đạt trung bình')}</th>
                <th className="py-3 px-3 text-center">{translateUi('Chuẩn vị trí')}</th>
                <th className="py-3 px-4 min-w-[220px]">{translateUi("Phân bổ (")}{report.assessed} người)</th>
                <th className="py-3 px-4 min-w-[180px]">{translateUi("Khóa học đề xuất")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedByPriority.map((row) => {
                const theme = DOMAIN_THEMES[row.number - 1] || DOMAIN_THEMES[0];
                const Icon = theme.icon;

                const course = row.course;

                return (
                  <tr key={row.categoryId} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-xl ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{translateUi("Miền 0")}{row.number}
                          </span>
                          <strong className="text-slate-900 font-bold text-xs sm:text-sm block leading-snug">
                            {row.name}
                          </strong>
                        </div>
                      </div>
                    </td>


                    <td className="py-3.5 px-3 text-center">
                      <LevelBadge level={row.level} />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {row.targets.length ? (
                        <>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {row.targets.map((target) => <LevelBadge key={target} level={target} size="sm" />)}
                          </div>
                          <p className="mt-1.5 text-slate-600">
                            {row.comparedCount - row.gapCount}/{row.comparedCount} {translateUi('đạt chuẩn')}
                          </p>
                        </>
                      ) : <span className="text-slate-600">{translateUi('Chưa có chuẩn')}</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div
                          className="h-2 w-full rounded-full overflow-hidden bg-slate-100 flex border border-slate-200/60 shadow-inner"
                          title={translateUi(row.counts.map((n, i) => `${LEVEL_LABELS[i]}: ${n}`).join(' · '))}
                        >
                          {row.counts.map((count, levelIdx) =>
                            count > 0 ? (
                              <div
                                key={levelIdx}
                                style={{
                                  width: `${(count / Math.max(1, report.assessed)) * 100}%`,
                                }}
                                className={`h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 ${
                                  levelIdx === 0
                                    ? 'bg-slate-400'
                                    : levelIdx === 1
                                    ? 'bg-sky-500'
                                    : levelIdx === 2
                                    ? 'bg-indigo-600'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            ) : null,
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                          {row.counts.map((count, levelIdx) =>
                            count > 0 ? (
                              <span
                                key={levelIdx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                                  levelIdx === 0
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : levelIdx === 1
                                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                    : levelIdx === 2
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    levelIdx === 0
                                      ? 'bg-slate-400'
                                      : levelIdx === 1
                                      ? 'bg-sky-500'
                                      : levelIdx === 2
                                      ? 'bg-indigo-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                {translateUi(LEVEL_LABELS[levelIdx])}: <strong>{count}</strong>
                              </span>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {course ? (
                        <Link to={`/enterprise/courses?focus=${course.code}&level=${course.level}`} className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100">
                          <BookOpen size={13} aria-hidden="true" />
                          {translateUi('Xem khóa')} {course.code} · {translateUi(LEVEL_LABELS[course.level])}
                        </Link>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BẢNG THEO TỪNG NHÂN VIÊN (COLLAPSIBLE / XỔ RA ĐÓNG LẠI) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsEmployeeTableOpen((v) => !v)}
          aria-expanded={isEmployeeTableOpen}
          aria-controls="trial-employee-results"
          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 shadow-2xs shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Chi tiết từng nhân viên")}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">{translateUi("6 Lĩnh vực")}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Đánh giá chuẩn hóa 6 lĩnh vực năng lực số của từng nhân sự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              {isEmployeeTableOpen ? (
                <>
                  <ChevronUp size={15} />{translateUi(" Thu gọn")}</>
              ) : (
                <>
                  <ChevronDown size={15} />{translateUi(" Xem chi tiết")}</>
              )}
            </span>
          </div>
        </button>

        <TrialDisclosure open={isEmployeeTableOpen} id="trial-employee-results">
          <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <OwnerFilterSelect label={translateUi("Số kết quả mỗi trang")} value={String(employeePageSize)} onChange={(value) => { setEmployeePageSize(Number(value)); setEmployeePage(1); }} options={[5, 10, 15, 25].map((size) => ({ value: String(size), label: `${size} / trang` }))} />
              <div className="relative w-full sm:w-72">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={translateUi("Tìm theo tên, phòng ban...")}
                  value={employeeFilter}
                  onChange={(e) => { setEmployeeFilter(e.target.value); setEmployeePage(1); }}
                  className="w-full h-9 pl-8 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-teal-600 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 min-w-[200px]">{translateUi("Nhân viên")}</th>
                    {DOMAIN_THEMES.map((theme) => (
                      <th key={theme.number} className="py-3 px-2 text-center min-w-[95px]" title={translateUi(theme.name)}>
                        {translateUi(theme.tableHeader)}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center min-w-[110px]">{translateUi("Thao tác")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={DOMAIN_THEMES.length + 2} className="py-8 text-center text-slate-400">{translateUi("Không tìm thấy nhân viên nào phù hợp")}</td>
                    </tr>
                  ) : (
                    visibleEmployees.map((e) => {
                      const initials = e.fullName
                        .trim()
                        .split(/\s+/)
                        .slice(-2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={e.employeeId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-black text-xs shadow-2xs shrink-0">
                                {initials}
                              </div>
                              <div>
                                <strong className="text-slate-900 block text-xs sm:text-sm font-bold">{e.fullName}</strong>
                                <span className="text-xs text-slate-600 block mt-0.5 font-medium">
                                  {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || translateUi('Nhân viên')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {e.levels.map((level, i) => (
                            <td key={i} className="py-3.5 px-2 text-center">
                              <LevelBadge level={level} size="sm" />
                            </td>
                          ))}

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => { setClosingEmployee(false); setSelectedEmployee(e); }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                            >
                              <Eye size={13} className="text-teal-700" />{translateUi("Xem chi tiết")}</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="tp-participant-pagination" aria-label={translateUi("Phân trang kết quả đánh giá")}>
              <span>{filteredEmployees.length ? translateUi(`${(activeEmployeePage - 1) * employeePageSize + 1}–${Math.min(activeEmployeePage * employeePageSize, filteredEmployees.length)} / ${filteredEmployees.length} người`) : '0 người'}</span>
              {employeePageCount > 1 && <div><button type="button" disabled={activeEmployeePage === 1} onClick={() => setEmployeePage(activeEmployeePage - 1)}>{translateUi("Trước")}</button><strong>{translateUi("Trang ")}{activeEmployeePage}/{employeePageCount}</strong><button type="button" disabled={activeEmployeePage === employeePageCount} onClick={() => setEmployeePage(activeEmployeePage + 1)}>{translateUi("Sau")}</button></div>}
            </div>
          </div>
        </TrialDisclosure>
      </section>

      {/* Modal xem chi tiết bài đánh giá của từng nhân viên */}
      {selectedEmployee && (
        <Modal
          open={Boolean(selectedEmployee)}
          onClose={closeEmployee}
          className={`trial-result-dialog${closingEmployee ? ' is-closing' : ''}`}
          size="xl"
          title={translateUi(`Chi tiết đánh giá năng lực: ${selectedEmployee.fullName}`)}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedEmployee.submittedAt
                  ? translateUi(`Nộp bài lúc ${new Date(selectedEmployee.submittedAt).toLocaleString('vi-VN')}`)
                  : ''}
              </span>
              <button
                type="button"
                onClick={closeEmployee}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >{translateUi("Đóng")}</button>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            {/* Profile banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-teal-50/30 to-sky-50/40 border border-slate-200/80">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0">
                  {selectedEmployee.fullName
                    .trim()
                    .split(/\s+/)
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {selectedEmployee.fullName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedEmployee.departmentName && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        <Building2 size={13} className="text-slate-500" />
                        {selectedEmployee.departmentName}
                      </span>
                    )}
                    {selectedEmployee.positionName && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                        <Briefcase size={13} className="text-sky-600" />
                        {selectedEmployee.positionName}
                      </span>
                    )}
                    {selectedEmployee.email && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        <Mail size={13} className="text-slate-400" />
                        {selectedEmployee.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedEmployee.submittedAt && (
                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{translateUi("Thời gian nộp")}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs mt-0.5">
                    <Calendar size={13} className="text-teal-600" />
                    {new Date(selectedEmployee.submittedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>

            {employeeScore != null && employeeQuestionCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
                <h4 className="font-semibold">{translateUi('Tổng kết trắc nghiệm')}</h4>
                <p><strong className="tabular-nums">{employeeScore}/{employeeQuestionCount}</strong> {translateUi('câu đúng')} ({sharePercent(employeeScore, employeeQuestionCount)}%)</p>
              </div>
            )}

            {/* Nhận xét từ Mentor nếu có */}
            {selectedEmployee.reviewNote && (
              <div className="rounded-2xl border border-purple-200/90 bg-purple-50/60 p-3.5 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <FileText className="size-3.5 text-purple-700" />{translateUi("Ghi chú đánh giá:")}</div>
                <p className="text-xs text-purple-950 italic leading-relaxed">
                  "{selectedEmployee.reviewNote}"
                </p>
              </div>
            )}

            {/* Danh sách 6 lĩnh vực */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-teal-600" />{translateUi("Kết quả chi tiết 6 lĩnh vực năng lực số")}</h4>
                <span className="text-xs text-slate-500 font-medium">{translateUi("Mức khảo sát")}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(selectedEmployee.domainDetails && selectedEmployee.domainDetails.length > 0
                  ? selectedEmployee.domainDetails
                  : report.domains.map((dom, idx) => ({
                      categoryId: dom.categoryId,
                      number: dom.number,
                      name: dom.name,
                      level: selectedEmployee.levels[idx] ?? 0,
                      basicCorrect: 0,
                      basicTotal: 0,
                      intermediateCorrect: 0,
                      intermediateTotal: 0,
                      advancedCorrect: 0,
                      advancedTotal: 0,
                      mentorLevel: null,
                      recommendedCourse: '',
                      targetLevel: 0,
                      usesSystemReference: false,
                      skillGap: 0,
                    }))
                ).map((detail) => {
                  const theme = DOMAIN_THEMES[detail.number - 1] || DOMAIN_THEMES[0];
                  const Icon = theme.icon;
                  const totals = domainTotals(detail);

                  return (
                    <div
                      key={detail.categoryId}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      {/* Top: Icon + Tên lĩnh vực + LevelBadge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`size-8 rounded-xl ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{translateUi("Miền 0")}{detail.number}
                            </span>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate" title={translateUi(detail.name)}>
                              {detail.name}
                            </h5>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <LevelBadge level={detail.level} />
                          {detail.mentorLevel != null && <p className="mt-1 text-right text-[11px] text-slate-600">{translateUi('Mentor xác nhận')}</p>}
                        </div>
                      </div>

                      {detail.targetLevel ? (
                        <p className="text-xs text-slate-700">
                          {translateUi(detail.usesSystemReference ? 'Chuẩn hệ thống' : 'Chuẩn doanh nghiệp')} · {translateUi(LEVEL_LABELS[detail.targetLevel])}
                          {' · '}{detail.skillGap ? translateUi(`Thiếu ${detail.skillGap} cấp`) : translateUi('Đạt chuẩn')}
                        </p>
                      ) : null}

                      {/* Middle: Thông tin Trắc nghiệm lý thuyết */}
                      {totals.total > 0 && <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 space-y-1.5">
                        {/* The level comes from the share of right answers in the whole domain; per-level counts are for reference. */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">{translateUi("Trắc nghiệm lý thuyết:")}</span>
                          <span className="font-bold text-slate-800">
                            {totals.correct}/{totals.total} {translateUi('câu đúng')} ({totals.percent}%)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          {[
                            { label: 'Cơ bản: ', correct: detail.basicCorrect, total: detail.basicTotal },
                            { label: 'Trung cấp: ', correct: detail.intermediateCorrect, total: detail.intermediateTotal },
                            { label: 'Nâng cao: ', correct: detail.advancedCorrect, total: detail.advancedTotal },
                          ].map((tier) => (
                            <span
                              key={tier.label}
                              className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold border bg-slate-100 text-slate-600 border-slate-200"
                            >
                              {translateUi(tier.label)}{tier.correct ?? 0}/{tier.total ?? 0}
                            </span>
                          ))}
                        </div>
                      </div>}

                      {/* Bottom: Khóa học đề xuất */}
                      {detail.recommendedCourse && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-900 bg-teal-50/70 border border-teal-200/80 px-3 py-2 rounded-xl">
                          <BookOpen size={14} className="text-teal-700 shrink-0" />
                          <span className="truncate" title={translateUi(detail.recommendedCourse)}>
                            {detail.level === 0 && <>{translateUi('Nên bắt đầu từ khóa Cơ bản')} · </>}{detail.recommendedCourse}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
