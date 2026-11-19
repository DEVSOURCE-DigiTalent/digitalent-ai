import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
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
  Flag,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/shared';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { TrialDisclosure } from './TrialDisclosure';
import { DomainLineChart } from './DomainLineChart';
import type { TrialEmployeeDomainDetail, TrialParticipantStatus, TrialReport, TrialReportEmployee } from '@/services/trial-program.service';
import { LEVEL_LABELS, POSITION_STANDARD_PATH, domainTotals, formatWhen, sharePercent } from '../lib/trial-format';

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
    'bg-slate-100 text-slate-700 border-slate-200 font-medium', // 0: Chưa đạt
    'bg-teal-50 text-teal-800 border-teal-200 font-semibold', // 1: Cơ bản
    'bg-teal-100 text-teal-900 border-teal-300 font-semibold', // 2: Trung cấp
    'bg-teal-800 text-white border-teal-800 font-semibold', // 3: Nâng cao
  ];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs min-w-[64px]' : 'px-2.5 py-1 text-[13px] min-w-[76px]';

  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg border ${sizeClasses} ${styles[value]}`}>
      {translateUi(LEVEL_LABELS[value])}
    </span>
  );
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Chưa kích hoạt', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa nộp', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'info' },
  REVIEWED: { label: 'Đã chấm', tone: 'ok' },
};

/** `closed`: the results are out, so anyone who has not submitted did not take part. */
export function ParticipantStatus({ status, closed = false }: { status: TrialParticipantStatus; closed?: boolean }) {
  useUiLanguage();
  const submitted = status === 'SUBMITTED' || status === 'REVIEWED';
  const s = closed && !submitted ? { label: 'Không nộp bài', tone: '' } : PARTICIPANT[status];
  return <span className={`tp-badge ${s.tone}`}>{translateUi(s.label)}</span>;
}

export type ProgressStep = { label: string; detail?: string };

/**
 * Thanh tiến độ: các mốc nối nhau bằng một đường tô màu tới bước hiện tại.
 * `progress` (0–1) tô thêm một phần đoạn nối sau bước hiện tại; `complete` đánh dấu mọi bước đã xong.
 */
export function Steps({ steps, current, progress = 0, complete = false, label = 'Tiến độ khảo sát' }: {
  steps: (string | ProgressStep)[]; current: number; progress?: number; complete?: boolean; label?: string;
}) {
  useUiLanguage();
  const items = steps.map((step) => (typeof step === 'string' ? { label: step } : step));
  const segments = Math.max(1, items.length - 1);
  const filled = complete ? 1 : Math.min(1, (current + Math.max(0, Math.min(1, progress))) / segments);
  return (
    <nav aria-label={translateUi(label)} className="trial-progress">
      <ol style={{ '--steps': items.length } as React.CSSProperties}>
        <li className="trial-progress__track" aria-hidden="true"><span style={{ width: `${filled * 100}%` }} /></li>
        {items.map((step, index) => {
          const state = complete || index < current ? 'done' : index === current ? 'current' : 'upcoming';
          return (
            <li key={step.label} data-state={state} aria-current={index === current ? 'step' : undefined}>
              {/* Số thứ tự luôn giữ nguyên; bước đã xong chỉ đổi sang nền đặc. */}
              <span className="trial-progress__dot" aria-hidden="true">{index + 1}</span>
              <span className="trial-progress__label">{translateUi(step.label)}</span>
              {state === 'done' && <span className="sr-only">{translateUi('(đã xong)')}</span>}
              {step.detail && <span className="trial-progress__detail">{translateUi(step.detail)}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const nextCourseSuffix = ['F', 'I', 'A'];
const courseCode = (domainNumber: number, level: number) => `M${domainNumber}-${nextCourseSuffix[level - 1]}`;

/**
 * Khóa cần học theo thứ tự, từ mức kế tiếp tới mức chuẩn. Khóa của một lĩnh vực nối tiếp nhau
 * (Cơ bản → Trung cấp → Nâng cao), nên người đang ở Cơ bản với chuẩn Nâng cao cần "Trung cấp → Nâng cao".
 */
function CoursePath({ domainNumber, from, to }: { domainNumber: number; from: number; to: number }) {
  useUiLanguage();
  const levels = from > to ? [] : Array.from({ length: to - from + 1 }, (_, index) => from + index);
  if (!levels.length) return null;
  return (
    <ol className="trial-course-path" aria-label={translateUi(levels.length > 1 ? 'Khóa cần học, lần lượt' : 'Khóa cần học')}>
      {levels.map((level, index) => {
        const code = courseCode(domainNumber, level);
        return (
          <li key={code}>
            {index > 0 && <ArrowRight size={13} className="trial-course-path__arrow" aria-hidden="true" />}
            <Link
              to={`/enterprise/courses?focus=${code}&level=${level}`}
              className="trial-course-link"
              aria-label={translateUi(`Khóa ${LEVEL_LABELS[level]} (${code})`)}
              title={code}
            >
              {index === 0 && <BookOpen size={14} aria-hidden="true" />}
              {translateUi(index === 0 ? `Khóa ${LEVEL_LABELS[level]}` : LEVEL_LABELS[level])}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

type DomainPerson = { level: number; target: number };

/** Filter value for employees without a department (never a real department name). */
const NO_DEPARTMENT = '__no_department__';

/**
 * Một lĩnh vực tính lại từ danh sách người đang xem (cả công ty hoặc một phòng ban): số người ở từng mức, mức trung bình
 * (làm tròn như backend: 1 chữ số rồi tới mức gần nhất), chuẩn và khóa cần học.
 * `index`: position of the domain in the report, which is also its position in each employee's `levels`.
 */
function summarizeDomain(domain: TrialReport['summary'][number], index: number, employees: TrialReport['employees']) {
  const people: DomainPerson[] = employees.map((employee) => {
    const detail = employee.domainDetails?.find((d) => d.categoryId === domain.categoryId);
    return { level: detail?.level ?? employee.levels[index] ?? 0, target: detail?.targetLevel ?? 0 };
  });
  const counts = [0, 1, 2, 3].map((level) => people.filter((person) => person.level === level).length);
  const average = people.length ? Math.round((people.reduce((sum, person) => sum + person.level, 0) / people.length) * 10) / 10 : 0;
  const compared = people.filter((person) => person.target > 0);
  const gaps = compared.filter((person) => person.level < person.target);
  const targets = compared.map((person) => person.target);
  const targetRange = targets.length ? [Math.min(...targets), Math.max(...targets)] as const : null;
  // Courses the company needs here, in order (a paid course is bought once for everyone): from the next level of the
  // weakest person below the standard up to the highest standard.
  const courseRange = gaps.length
    ? [Math.min(...gaps.map((person) => person.level + 1)), Math.max(...gaps.map((person) => person.target))] as const
    : null;
  // One standard for everyone → the detail's level scale can colour the levels below it; mixed or missing stay neutral.
  const standard = targetRange && targetRange[0] === targetRange[1] && compared.length === people.length ? targetRange[0] : null;
  // Average required level of the people who have a standard, for the line chart (same rounding as `average`).
  const targetAverage = compared.length ? Math.round((targets.reduce((sum, target) => sum + target, 0) / compared.length) * 10) / 10 : null;
  // One clear required level for the people shown: their average, rounded like the current level.
  const targetLevel = targetAverage == null ? null : Math.max(0, Math.min(3, Math.round(targetAverage)));
  return {
    ...domain, counts, average, level: Math.round(average),
    hasStandard: compared.length > 0, compared: compared.length, gapCount: gaps.length, targetRange, courseRange, standard, targetAverage, targetLevel,
  };
}

type DomainRow = ReturnType<typeof summarizeDomain>;

/**
 * Mức hiện tại của công ty ở lĩnh vực: mức trung bình của những người đã có kết quả. Đặt cạnh "Mức cần đạt":
 * hổ phách khi trung bình thấp hơn chuẩn, xanh chỉ khi mọi người đều đạt chuẩn (trung bình đạt mà còn người dưới
 * chuẩn thì để trung tính; số người ở từng mức nằm trong Chi tiết), trung tính khi chưa có chuẩn.
 */
function CurrentLevelCell({ row }: { row: DomainRow }) {
  useUiLanguage();
  const level = Math.max(0, Math.min(3, Math.round(row.level)));
  const tone = row.targetLevel == null ? 'neutral' : level < row.targetLevel ? 'below' : row.gapCount === 0 ? 'met' : 'neutral';
  return (
    <span className="trial-current" data-tone={tone}>
      {tone === 'met' && <Check size={14} aria-hidden="true" />}
      {translateUi(LEVEL_LABELS[level])}
    </span>
  );
}

/**
 * Mức cần đạt của lĩnh vực: một mức rõ ràng (trung bình mức cần đạt của những người đang xem, làm tròn như mức hiện tại);
 * khi mỗi người cần một mức khác nhau, khoảng đó nằm trong chú thích. Chưa có thì mời đặt mức cho phòng ban.
 */
function TargetCell({ row }: { row: DomainRow }) {
  useUiLanguage();
  if (!row.targetRange || row.targetLevel == null) {
    return (
      <Link to={POSITION_STANDARD_PATH} className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-teal-800">
        {translateUi('Đặt mức cho phòng ban')}<ArrowRight size={13} aria-hidden="true" />
      </Link>
    );
  }
  const [low, high] = row.targetRange;
  const spread = high !== low ? translateUi(`Mỗi người cần từ ${LEVEL_LABELS[low]} tới ${LEVEL_LABELS[high]}`) : undefined;
  return <span className="trial-target" title={spread}>{translateUi(LEVEL_LABELS[row.targetLevel])}</span>;
}

/** Khóa công ty cần cho lĩnh vực, lần lượt; mọi người đã đạt chuẩn thì không cần; chưa có chuẩn thì chưa gợi ý được. */
function CourseCell({ row }: { row: DomainRow }) {
  useUiLanguage();
  if (row.courseRange) return <CoursePath domainNumber={row.number} from={row.courseRange[0]} to={row.courseRange[1]} />;
  if (row.hasStandard) {
    return <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700"><Check size={14} aria-hidden="true" />{translateUi('Không cần thêm khóa')}</span>;
  }
  return <span className="text-slate-400" aria-label={translateUi('Chưa có gợi ý')}>—</span>;
}

/**
 * Chi tiết một lĩnh vực, mở ngay trong dòng của bảng (không phải thẻ nổi), hai phần:
 * - Ô tóm tắt (stat tile): nhãn có biểu tượng trạng thái ("Chưa đạt chuẩn Nâng cao"), số người, thanh tỷ lệ
 *   dưới chuẩn / đạt chuẩn và chú thích số người mỗi phần (màu luôn đi kèm chữ).
 * - Biểu đồ cột: chiều cao = số người ở mỗi mức (số ghi trên đầu cột). Cột dưới chuẩn màu hổ phách, từ chuẩn trở lên
 *   màu xanh, mức chuẩn có cờ; ngoặc "Dưới chuẩn / Đạt chuẩn" dưới trục nói rõ nghĩa của màu. Các vị trí có chuẩn
 *   khác nhau thì cột màu xám, không có ngoặc.
 */
function DomainDetail({ row }: { row: DomainRow }) {
  useUiLanguage();
  const max = Math.max(1, ...row.counts);
  const singleTarget = row.targetRange && row.targetRange[0] === row.targetRange[1] ? row.targetRange[0] : null;
  const status = row.gapCount > 0 ? 'below' : row.hasStandard ? 'met' : 'none';
  const target = singleTarget ? ` ${LEVEL_LABELS[singleTarget]}` : ' vị trí';
  const met = row.compared - row.gapCount;
  return (
    <div className="trial-domain-detail__body">
      <div className="trial-insight" data-status={status}>
        {status === 'none' ? (
          <>
            <span className="trial-insight__label">{translateUi('Chưa có mức để so sánh')}</span>
            <Link to={POSITION_STANDARD_PATH} className="trial-insight__link">{translateUi('Đặt mức cho phòng ban')}<ArrowRight size={14} aria-hidden="true" /></Link>
          </>
        ) : (
          <>
            <span className="trial-insight__label">
              {status === 'below' ? <AlertTriangle size={15} aria-hidden="true" /> : <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
              {translateUi(status === 'below' ? `Chưa đạt chuẩn${target}` : `Đã đạt chuẩn${target}`)}
            </span>
            <strong className="trial-insight__value">
              {status === 'below' ? row.gapCount : row.compared}/{row.compared}<span>{translateUi(' người')}</span>
            </strong>
            <span className="trial-insight__meter" aria-hidden="true">
              {row.gapCount > 0 && <span data-tone="below" style={{ flexGrow: row.gapCount }} />}
              {met > 0 && <span data-tone="met" style={{ flexGrow: met }} />}
            </span>
            <span className="trial-insight__legend">
              {row.gapCount > 0 && <span><i data-tone="below" aria-hidden="true" />{translateUi(`${row.gapCount} dưới chuẩn`)}</span>}
              {met > 0 && <span><i data-tone="met" aria-hidden="true" />{translateUi(`${met} đạt chuẩn`)}</span>}
            </span>
          </>
        )}
      </div>

      <figure className="trial-dist">
        <ol className="trial-dist__plot" aria-label={translateUi('Số người ở từng mức')}>
          {LEVEL_LABELS.map((label, level) => {
            const count = row.counts[level] ?? 0;
            const tone = row.standard == null ? 'neutral' : level < row.standard ? 'below' : 'met';
            const isStandard = level === row.standard;
            return (
              <li key={label} className="trial-dist__item" data-tone={tone} data-standard={isStandard || undefined}
                title={translateUi(`${label}: ${count} người`)} style={{ '--share': count / max, '--i': level } as React.CSSProperties}>
                <span className="trial-dist__col" aria-hidden="true">
                  <span className="trial-dist__value" data-zero={count === 0 || undefined}>{count}</span>
                  {count > 0 && <span className="trial-dist__bar" />}
                </span>
                <span className="trial-dist__label">
                  {isStandard && <Flag size={12} aria-hidden="true" />}{translateUi(label)}
                </span>
                <span className="sr-only">{translateUi(`${count} người`)}{isStandard ? translateUi(', mức chuẩn vị trí') : ''}</span>
              </li>
            );
          })}
        </ol>
        {row.standard != null && (
          <div className="trial-dist__groups" aria-hidden="true">
            {row.standard > 0 && <span data-tone="below" style={{ gridColumn: `1 / ${row.standard + 1}` }}>{translateUi('Dưới chuẩn')}</span>}
            <span data-tone="met" style={{ gridColumn: `${row.standard + 1} / 5` }}>{translateUi('Đạt chuẩn')}</span>
          </div>
        )}
        {row.hasStandard && row.standard == null && <figcaption className="trial-domain-detail__hint">{translateUi('Các vị trí có chuẩn khác nhau nên không tô màu.')}</figcaption>}
      </figure>
    </div>
  );
}

const EMPLOYEE_PAGE_SIZE = 10;

/**
 * Kết quả của doanh nghiệp: bảng theo lĩnh vực (số người ở từng mức so với chuẩn vị trí, khóa nên học) và mức của từng người.
 * `provisional`: đợt khảo sát chưa chốt, số liệu còn thay đổi khi có thêm bài nộp.
 */
type PersonDomain = Pick<TrialEmployeeDomainDetail,
  'categoryId' | 'number' | 'name' | 'level' | 'targetLevel' | 'skillGap'
  | 'basicCorrect' | 'basicTotal' | 'intermediateCorrect' | 'intermediateTotal' | 'advancedCorrect' | 'advancedTotal'>;

const initialsOf = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.at(-1)?.[0] ?? '?').toLocaleUpperCase('vi');
};

/** Vòng phần trăm câu đúng; số ghi bằng mực, màu chỉ ở vòng. */
function ScoreRing({ percent }: { percent: number }) {
  const radius = 22;
  const length = 2 * Math.PI * radius;
  return (
    <span className="trial-score-ring" aria-hidden="true">
      <svg viewBox="0 0 56 56" width="56" height="56">
        <circle cx="28" cy="28" r={radius} className="trial-score-ring__track" />
        <circle cx="28" cy="28" r={radius} className="trial-score-ring__value"
          strokeDasharray={`${(percent / 100) * length} ${length}`} transform="rotate(-90 28 28)" />
      </svg>
      <span>{percent}%</span>
    </span>
  );
}

/** Dải tóm tắt đầu hộp kết quả: người làm bài và ba con số đáng xem nhất. */
function PersonSummary({ employee, details, score, total }: { employee: TrialReportEmployee; details: PersonDomain[]; score?: number | null; total: number }) {
  useUiLanguage();
  const compared = details.filter((d) => (d.targetLevel ?? 0) > 0);
  const met = compared.filter((d) => d.level >= (d.targetLevel ?? 0)).length;
  const courses = compared.reduce((sum, d) => sum + Math.max(0, (d.targetLevel ?? 0) - d.level), 0);
  const meta = [
    employee.departmentName && { Icon: Building2, text: employee.departmentName },
    employee.positionName && { Icon: Briefcase, text: employee.positionName },
    employee.email && { Icon: Mail, text: employee.email },
    employee.submittedAt && { Icon: Calendar, text: `${translateUi('Nộp lúc')} ${formatWhen(employee.submittedAt)}` },
  ].filter(Boolean) as { Icon: typeof Mail; text: string }[];

  return (
    <div className="trial-person-hero">
      <div className="trial-person-hero__who">
        <span className="trial-person-hero__avatar" aria-hidden="true">{initialsOf(employee.fullName)}</span>
        <ul className="trial-person-hero__meta">
          {meta.map(({ Icon, text }) => <li key={text}><Icon size={14} aria-hidden="true" />{text}</li>)}
        </ul>
      </div>
      <div className="trial-person-hero__stats">
        <div className="trial-person-stat" data-status={compared.length === 0 ? 'none' : met === compared.length ? 'met' : 'below'}>
          <span className="trial-person-stat__label">{translateUi('Đạt chuẩn vị trí')}</span>
          {compared.length > 0 ? <>
            <strong className="trial-person-stat__value">{met}/{compared.length}<span>{translateUi(' lĩnh vực')}</span></strong>
            <span className="trial-person-stat__meter" aria-hidden="true">
              {met > 0 && <span data-tone="met" style={{ flexGrow: met }} />}
              {compared.length - met > 0 && <span data-tone="below" style={{ flexGrow: compared.length - met }} />}
            </span>
          </> : <span className="trial-person-stat__empty">{translateUi('Chưa có chuẩn để so sánh')}</span>}
        </div>
        {score != null && total > 0 && (
          <div className="trial-person-stat trial-person-stat--ring">
            <ScoreRing percent={sharePercent(score, total)} />
            <span>
              <span className="trial-person-stat__label">{translateUi('Trắc nghiệm')}</span>
              <strong className="trial-person-stat__value"><span className="trial-person-stat__num">{score}/{total}</span></strong>
              <span className="trial-person-stat__note">{translateUi('câu đúng')}</span>
            </span>
          </div>
        )}
        {compared.length > 0 && (
          <div className="trial-person-stat" data-status={courses > 0 ? 'below' : 'met'}>
            <span className="trial-person-stat__label">{translateUi('Cần học thêm')}</span>
            <strong className="trial-person-stat__value">{courses}<span>{translateUi(' khóa')}</span></strong>
            <span className="trial-person-stat__note">{translateUi(courses > 0 ? 'Để đạt chuẩn ở mọi lĩnh vực' : 'Đã đạt chuẩn ở mọi lĩnh vực')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Thang 3 bậc của một lĩnh vực: bậc đã đạt tô đặc, bậc còn thiếu tới chuẩn tô vàng, bậc chuẩn có cờ. */
function LevelLadder({ level, target }: { level: number; target: number }) {
  useUiLanguage();
  const name = `${translateUi('Mức hiện tại')} ${translateUi(LEVEL_LABELS[level])}${target ? `, ${translateUi('chuẩn')} ${translateUi(LEVEL_LABELS[target])}` : ''}`;
  return (
    <div className="trial-ladder" role="img" aria-label={name}>
      {[1, 2, 3].map((step) => (
        <span key={step} className="trial-ladder__step" data-state={step <= level ? 'done' : step <= target ? 'need' : 'rest'} data-target={step === target || undefined}>
          <span className="trial-ladder__bar" />
          <span className="trial-ladder__label">{step === target && <Flag size={11} />}{translateUi(LEVEL_LABELS[step])}</span>
        </span>
      ))}
    </div>
  );
}

/** Một lĩnh vực trong hộp kết quả của một người: mức, thang bậc so với chuẩn, trắc nghiệm, khóa cần học. */
function PersonDomainCard({ detail }: { detail: PersonDomain }) {
  useUiLanguage();
  const theme = DOMAIN_THEMES[detail.number - 1] || DOMAIN_THEMES[0];
  const Icon = theme.icon;
  const target = detail.targetLevel ?? 0;
  const gap = target ? Math.max(0, target - detail.level) : 0;
  const status = !target ? 'none' : gap > 0 ? 'below' : 'met';
  const totals = domainTotals(detail);
  const tiers = [
    { label: 'Cơ bản', correct: detail.basicCorrect, total: detail.basicTotal },
    { label: 'Trung cấp', correct: detail.intermediateCorrect, total: detail.intermediateTotal },
    { label: 'Nâng cao', correct: detail.advancedCorrect, total: detail.advancedTotal },
  ];

  return (
    <article className="trial-person-domain" data-status={status}>
      <header className="trial-person-domain__head">
        <span className={`trial-person-domain__icon ${theme.bgClass}`}><Icon size={16} aria-hidden="true" /></span>
        <span className="min-w-0">
          <span className="trial-person-domain__number">{translateUi('Lĩnh vực')} {detail.number}</span>
          <h5 className="trial-person-domain__name" title={translateUi(detail.name)}>{translateUi(detail.name)}</h5>
        </span>
        <span className="trial-person-domain__status" data-status={status}>
          {status === 'below' ? <AlertTriangle size={13} aria-hidden="true" /> : status === 'met' ? <Check size={13} aria-hidden="true" /> : null}
          {translateUi(status === 'below' ? `Thiếu ${gap} cấp` : status === 'met' ? 'Đạt chuẩn' : 'Chưa có chuẩn')}
        </span>
      </header>

      {/* The ladder says both levels: filled steps = current level, the flag = the standard. */}
      <LevelLadder level={detail.level} target={target} />

      {totals.total > 0 && (
        <p className="trial-person-domain__quiz">
          {/* The level comes from the share of right answers in the whole domain; per-level counts are for reference. */}
          <span>{translateUi('Trắc nghiệm')} <strong>{totals.correct}/{totals.total}</strong> ({totals.percent}%)</span>
          <span className="trial-person-domain__tiers">
            {tiers.map((tier) => <span key={tier.label}>{translateUi(tier.label)} {tier.correct ?? 0}/{tier.total ?? 0}</span>)}
          </span>
        </p>
      )}

      {/* Every course up to the standard, in order (not only the next one), as in the domain table. */}
      {gap > 0 && <CoursePath domainNumber={detail.number} from={detail.level + 1} to={target} />}
    </article>
  );
}

export function CompetencyReport({ report, participantCount, provisional = false }: { report: TrialReport; participantCount?: number; provisional?: boolean }) {
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
  // Department level where the owner set one, else the position standard: one name for both.
  const targetLabel = 'Mức cần đạt';
  const [employeePage, setEmployeePage] = useState(1);

  const filteredEmployees = report.employees.filter(
    (e) =>
      !employeeFilter.trim() ||
      e.fullName.toLowerCase().includes(employeeFilter.toLowerCase()) ||
      (e.departmentName && e.departmentName.toLowerCase().includes(employeeFilter.toLowerCase())) ||
      (e.positionName && e.positionName.toLowerCase().includes(employeeFilter.toLowerCase())),
  );
  const employeePageCount = Math.max(1, Math.ceil(filteredEmployees.length / EMPLOYEE_PAGE_SIZE));
  const activeEmployeePage = Math.min(employeePage, employeePageCount);
  const visibleEmployees = filteredEmployees.slice((activeEmployeePage - 1) * EMPLOYEE_PAGE_SIZE, activeEmployeePage * EMPLOYEE_PAGE_SIZE);

  // Department filter for the domain table: every column and chart is recomputed from that department's people.
  const [department, setDepartment] = useState('');
  const departmentOf = (employee: TrialReportEmployee) => employee.departmentName?.trim() || NO_DEPARTMENT;
  const departmentCounts = report.employees.reduce((counts, employee) =>
    counts.set(departmentOf(employee), (counts.get(departmentOf(employee)) ?? 0) + 1), new Map<string, number>());
  const departmentNames = [...departmentCounts.keys()].sort((a, b) =>
    Number(a === NO_DEPARTMENT) - Number(b === NO_DEPARTMENT) || a.localeCompare(b, 'vi'));
  const activeDepartment = departmentCounts.has(department) ? department : '';
  const scopedEmployees = activeDepartment ? report.employees.filter((employee) => departmentOf(employee) === activeDepartment) : report.employees;
  const departmentOptions = [
    { value: '', label: translateUi(`Tất cả phòng ban (${report.employees.length} người)`) },
    ...departmentNames.map((name) => ({
      value: name,
      label: `${name === NO_DEPARTMENT ? translateUi('Chưa có phòng ban') : name} (${translateUi(`${departmentCounts.get(name)} người`)})`,
    })),
  ];

  // Domains keep the framework order 1 → 6 (same as the per-person table).
  const domains = report.summary.map((domain, index) => summarizeDomain(domain, index, scopedEmployees)).sort((a, b) => a.number - b.number);
  const [openDomains, setOpenDomains] = useState<ReadonlySet<string>>(() => new Set());
  const toggleDomain = (id: string) => setOpenDomains((current) => {
    const next = new Set(current);
    if (!next.delete(id)) next.add(id);
    return next;
  });

  const total = Math.max(participantCount ?? report.assessed, report.assessed);
  const lowCoverage = report.assessed * 2 < total;

  const employeeScore = selectedEmployee?.choiceScore;
  const employeeQuestionCount = selectedEmployee?.choiceTotal ?? 0;
  const selectedDetails: PersonDomain[] = !selectedEmployee ? []
    : selectedEmployee.domainDetails?.length ? selectedEmployee.domainDetails
    : report.domains.map((domain, index) => ({
        categoryId: domain.categoryId, number: domain.number, name: domain.name, level: selectedEmployee.levels[index] ?? 0,
        basicCorrect: 0, basicTotal: 0, intermediateCorrect: 0, intermediateTotal: 0, advancedCorrect: 0, advancedTotal: 0,
      }));

  return (
    <div className="trial-competency-report space-y-5">
      {/* ── KẾT QUẢ THEO 6 LĨNH VỰC: mức hiện tại · mức cần đạt · khóa nên học; "Chi tiết" mở bậc thang số người ở từng mức ── */}
      <section aria-labelledby="trial-report-title" className="trial-domain-report rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="trial-domain-report__head">
          <div>
            <h2 id="trial-report-title" className="font-bold tracking-tight">{translateUi('Kết quả theo lĩnh vực')}</h2>
            {/* Only when few people have results (the report holds scored papers only): a warning, not a routine count. */}
            {lowCoverage && (
              <p className="is-warn">
                <AlertTriangle size={14} aria-hidden="true" />
                <strong>{report.assessed}/{total} {translateUi('người')}</strong> {translateUi('có kết quả')}
                <span aria-hidden="true"> · </span><span>{translateUi('Chưa đủ để kết luận cho cả đội')}</span>
              </p>
            )}
          </div>
          <div className="trial-domain-report__tools">
            {provisional && <span className="trial-provisional-chip">{translateUi('Tạm thời · tự cập nhật khi có thêm bài nộp')}</span>}
            {departmentNames.length > 1 && (
              <OwnerFilterSelect
                icon="filter"
                label={translateUi('Lọc theo phòng ban')}
                value={activeDepartment}
                onChange={(value) => setDepartment(value)}
                options={departmentOptions}
                className="trial-department-filter"
              />
            )}
          </div>
        </div>

        <DomainLineChart points={domains.map((row) => ({
          number: row.number,
          name: row.name,
          short: DOMAIN_THEMES[row.number - 1]?.tableHeader ?? `${row.number}`,
          current: row.average,
          target: row.targetAverage,
        }))} targetLabel={targetLabel} />

        <div className="relative overflow-x-auto">
          <table className="trial-domain-table w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="trial-domain-table__domain">{translateUi('Lĩnh vực')}</th>
                <th scope="col">{translateUi('Mức hiện tại')}</th>
                <th scope="col">{translateUi(targetLabel)}</th>
                <th scope="col">{translateUi('Khóa nên học')}</th>
                <th scope="col"><span className="sr-only">{translateUi('Chi tiết')}</span></th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {domains.map((row) => {
                const theme = DOMAIN_THEMES[row.number - 1] || DOMAIN_THEMES[0];
                const Icon = theme.icon;
                const open = openDomains.has(row.categoryId);
                const detailId = `trial-domain-detail-${row.categoryId}`;
                return (
                  <Fragment key={row.categoryId}>
                    <tr data-open={open || undefined}>
                      <td className="py-3.5 px-4" data-cell="domain">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-xl ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shrink-0`}>
                            <Icon size={16} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-500">{translateUi('Lĩnh vực')} {row.number}</span>
                            <strong className="block text-sm font-bold leading-snug text-slate-900">{translateUi(row.name)}</strong>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3" data-cell="current" data-label={translateUi('Mức hiện tại')}><CurrentLevelCell row={row} /></td>
                      <td className="py-3.5 px-3" data-cell="target" data-label={translateUi(targetLabel)}><TargetCell row={row} /></td>
                      <td className="py-3.5 px-3" data-cell="course" data-label={translateUi('Khóa nên học')}><CourseCell row={row} /></td>
                      <td className="py-3.5 px-4 text-right" data-cell="toggle">
                        <button type="button" className="trial-detail-toggle" aria-expanded={open} aria-controls={detailId} onClick={() => toggleDomain(row.categoryId)}>
                          {translateUi(open ? 'Thu gọn' : 'Chi tiết')}<span className="sr-only"> {translateUi(row.name)}</span>
                          <ChevronDown size={15} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                    <tr className="trial-domain-detail" id={detailId} hidden={!open}>
                      <td colSpan={5}>{open && <DomainDetail row={row} />}</td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── KẾT QUẢ TỪNG NGƯỜI (THU GỌN MẶC ĐỊNH) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsEmployeeTableOpen((v) => !v)}
          aria-expanded={isEmployeeTableOpen}
          aria-controls="trial-employee-results"
          className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 shrink-0">
              <Users size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{translateUi('Kết quả từng người')}</h3>
              <p className="mt-0.5 text-[13px] text-slate-600">{translateUi(`Mức của ${report.assessed} người ở 6 lĩnh vực`)}</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-700">
            {isEmployeeTableOpen ? <><ChevronUp size={15} aria-hidden="true" />{translateUi('Thu gọn')}</> : <><ChevronDown size={15} aria-hidden="true" />{translateUi('Xem')}</>}
          </span>
        </button>

        <TrialDisclosure open={isEmployeeTableOpen} id="trial-employee-results">
          <div className="p-5 sm:p-6 pt-4 sm:pt-4 border-t border-slate-100 space-y-4">
            {report.employees.length > EMPLOYEE_PAGE_SIZE && (
              <div className="relative w-full sm:w-72">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  aria-label={translateUi('Tìm theo tên, phòng ban')}
                  placeholder={translateUi('Tìm theo tên, phòng ban...')}
                  value={employeeFilter}
                  onChange={(e) => { setEmployeeFilter(e.target.value); setEmployeePage(1); }}
                  className="w-full h-9 pl-8 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-teal-600 transition-colors"
                />
              </div>
            )}

            {/* `relative`: the sr-only header is absolutely positioned and must stay inside the scroll box on phones. */}
            <div className="relative overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600">
                    <th className="py-3 px-4 min-w-[200px]">{translateUi('Nhân viên')}</th>
                    {DOMAIN_THEMES.map((theme) => (
                      <th key={theme.number} className="py-3 px-2 text-center min-w-[95px]" title={translateUi(theme.name)}>
                        {translateUi(theme.tableHeader)}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center min-w-[110px]"><span className="sr-only">{translateUi('Thao tác')}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={DOMAIN_THEMES.length + 2} className="py-8 text-center text-slate-500">{translateUi('Không tìm thấy nhân viên nào phù hợp')}</td>
                    </tr>
                  ) : (
                    visibleEmployees.map((e) => (
                      <tr key={e.employeeId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block text-sm font-bold">{e.fullName}</strong>
                          <span className="text-xs text-slate-600 block mt-0.5">
                            {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || translateUi('Nhân viên')}
                          </span>
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
                            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-[13px] font-bold text-teal-800 transition-colors cursor-pointer"
                          >
                            <Eye size={14} className="text-teal-700" aria-hidden="true" />{translateUi('Xem chi tiết')}</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {employeePageCount > 1 && (
              <div className="tp-participant-pagination" aria-label={translateUi('Phân trang kết quả từng người')}>
                <span>{translateUi(`${(activeEmployeePage - 1) * EMPLOYEE_PAGE_SIZE + 1}–${Math.min(activeEmployeePage * EMPLOYEE_PAGE_SIZE, filteredEmployees.length)} / ${filteredEmployees.length} người`)}</span>
                <div><button type="button" disabled={activeEmployeePage === 1} onClick={() => setEmployeePage(activeEmployeePage - 1)}>{translateUi('Trước')}</button><strong>{translateUi('Trang ')}{activeEmployeePage}/{employeePageCount}</strong><button type="button" disabled={activeEmployeePage === employeePageCount} onClick={() => setEmployeePage(activeEmployeePage + 1)}>{translateUi('Sau')}</button></div>
              </div>
            )}
          </div>
        </TrialDisclosure>
      </section>

      {/* Kết quả của một người */}
      {selectedEmployee && (
        <Modal
          open={Boolean(selectedEmployee)}
          onClose={closeEmployee}
          className={`trial-result-dialog${closingEmployee ? ' is-closing' : ''}`}
          size="xl"
          title={translateUi(`Kết quả của ${selectedEmployee.fullName}`)}
          footer={
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={closeEmployee}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >{translateUi('Đóng')}</button>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            <PersonSummary employee={selectedEmployee} details={selectedDetails} score={employeeScore} total={employeeQuestionCount} />

            {selectedEmployee.reviewNote && (
              <div className="trial-person-note">
                <FileText className="size-4" aria-hidden="true" />
                <div>
                  <strong>{translateUi('Nhận xét của chuyên gia')}</strong>
                  <p>{selectedEmployee.reviewNote}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Award size={15} className="text-teal-600" aria-hidden="true" />{translateUi('Theo lĩnh vực')}</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedDetails.map((detail) => <PersonDomainCard key={detail.categoryId} detail={detail} />)}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
