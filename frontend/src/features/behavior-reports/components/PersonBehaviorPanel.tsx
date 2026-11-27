import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, X } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { formatDuration } from '@/features/pulse-employee/lib/labels';
import { useDialogFocus } from '@/hooks/use-dialog-focus';
import type { BehaviorEmployee, BehaviorReportItem } from '@/services/behavior-report.service';
import type { CapabilityProgressEmployee, CapabilityProgressEmployeeDomain } from '@/services/intelligence.service';
import { BehaviorReplay } from './BehaviorReplay';
import { DOMAIN_SHORT, LEVEL_TEXT, TIER_TEXT, initials, primaryReport, reportsByDomain, worstLevel } from '../lib/behavior';
import '../behavior-reports.css';

const LEVELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const DECISION_TEXT: Record<string, string> = { PASSED: 'Đạt', NOT_YET: 'Chưa đạt' };
const shortDate = (iso: string) => {
  const date = new Date(iso);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Một nhân viên trên Khoảng trống năng lực (OW-21): mức từng lĩnh vực (lúc khảo sát → hiện tại so với mức cần đạt) đặt
 * cạnh bài cuối khóa của lĩnh vực đó, danh sách bài thi, và phần xem lại bài đang chọn (video, dòng thời gian, bằng chứng).
 * Lĩnh vực có mức hiện tại đạt qua bài thi rủi ro cao được đánh dấu.
 */
export function PersonBehaviorPanel({
  person,
  behavior,
  name,
  initialReportId,
  onClose,
}: {
  person: CapabilityProgressEmployee | undefined;
  behavior: BehaviorEmployee | undefined;
  name: string;
  /** Bài mở sẵn (bấm từ danh sách theo mức); không có thì bài nặng nhất, mới nhất. */
  initialReportId?: string;
  onClose: () => void;
}) {
  useUiLanguage();
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  useDialogFocus(true, ref, onClose);
  const reports = behavior?.reports ?? [];
  const [selected, setSelected] = useState<string | undefined>(
    () => reports.find((r) => r.reportId === initialReportId)?.reportId ?? primaryReport(reports)?.reportId);
  const flagged = reports.filter((r) => r.level !== 'LOW');
  const byDomain = reportsByDomain(reports);
  const domains = [...(person?.domains ?? [])].sort((a, b) => a.number - b.number);
  // Position · department, said once when both carry the same name ("Marketing · Marketing").
  const meta = [...new Set([person?.positionName ?? reports[0]?.positionName, person?.departmentName ?? reports[0]?.departmentName].filter(Boolean))].join(' · ');

  return createPortal(
    <div className="br-panel-wrap">
      <div className="br-panel-backdrop" aria-hidden onClick={onClose} />
      <aside ref={ref} className="br-panel br-scope" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="br-panel__head">
          <span className="br-avatar" aria-hidden>{initials(name)}</span>
          <div className="br-panel__who">
            <h2 id={titleId}>{name}</h2>
            {meta && <p>{meta}</p>}
          </div>
          {person && (
            <Link to={`/enterprise/skill-gap/${person.employeeId}`} className="br-panel__link">
              {translateUi('Chi tiết khoảng trống')}<ArrowRight size={14} aria-hidden />
            </Link>
          )}
          <button type="button" className="br-panel__close" onClick={onClose} aria-label={translateUi('Đóng')}>
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="br-panel__body">
          {flagged.length > 0 && (
            <div className="br-suspects" role="group" aria-label={translateUi('Đáng ngờ ở')}>
              <span className="br-suspects__label"><ShieldAlert size={15} aria-hidden />{translateUi('Đáng ngờ ở')}</span>
              {flagged.map((report) => {
                const where = [report.domainNumber ? DOMAIN_SHORT[report.domainNumber - 1] : report.domainName, report.tier ? TIER_TEXT[report.tier] : null]
                  .filter(Boolean).join(' · ');
                return (
                  <button
                    key={report.reportId}
                    type="button"
                    className={`br-suspect ${report.level.toLowerCase()}`}
                    aria-pressed={selected === report.reportId}
                    onClick={() => setSelected(report.reportId)}
                  >
                    <b>{translateUi(where || report.courseTitle || '')}</b>
                    <span>{report.findingTitles?.[0] ?? translateUi(LEVEL_TEXT[report.level])}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="br-panel__overview">
            <section className="br-card" aria-labelledby={`${titleId}-levels`}>
              <div className="br-card__head">
                <h3 id={`${titleId}-levels`}>{translateUi('Năng lực theo lĩnh vực')}</h3>
                <span className="br-ladder-key" aria-hidden>
                  <i className="before" />{translateUi('Lúc khảo sát')}<i className="now" />{translateUi('Hiện tại')}<i className="req" />{translateUi('Cần đạt')}
                </span>
              </div>
              {domains.length === 0 ? (
                <p className="br-muted">{translateUi('Chưa có kết quả khảo sát của người này.')}</p>
              ) : (
                <ol className="br-ladder">
                  {domains.map((domain) => (
                    <DomainRow
                      key={domain.categoryId}
                      domain={domain}
                      exams={byDomain.get(domain.number) ?? []}
                      selected={selected}
                      onPick={setSelected}
                    />
                  ))}
                </ol>
              )}
            </section>

            <section className="br-card" aria-labelledby={`${titleId}-exams`}>
              <div className="br-card__head">
                <h3 id={`${titleId}-exams`}>{translateUi('Bài thi cuối khóa')}</h3>
                <small>{reports.length}</small>
              </div>
              {reports.length === 0 ? (
                <p className="br-muted">{translateUi('Người này chưa nộp bài cuối khóa nào.')}</p>
              ) : (
                <ul className="br-exams">
                  {reports.map((report) => (
                    <ExamRow key={report.reportId} report={report} active={selected === report.reportId} onPick={setSelected} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          {selected && <BehaviorReplay reportId={selected} />}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/** Một lĩnh vực: thang 0–3 với mức lúc khảo sát, hiện tại và cần đạt; bên phải là bài thi nặng nhất của lĩnh vực. */
function DomainRow({ domain, exams, selected, onPick }: {
  domain: CapabilityProgressEmployeeDomain;
  exams: BehaviorReportItem[];
  selected: string | undefined;
  onPick: (reportId: string) => void;
}) {
  const at = (level: number) => `${(level / 3) * 100}%`;
  const worst = exams.length ? worstLevel(exams) : null;
  const exam = primaryReport(exams);
  const earnedByFlagged = exams.some((r) => r.level === 'HIGH' && r.decision === 'PASSED');
  const below = domain.now != null && domain.now < domain.required;
  const name = DOMAIN_SHORT[domain.number - 1] ?? domain.name;
  return (
    <li className="br-ladder__row" data-domain={domain.number}>
      <span className="br-ladder__name">{translateUi(name)}</span>
      <span
        className="br-ladder__track"
        role="img"
        aria-label={translateUi(`${name}: lúc khảo sát ${LEVELS[domain.atSurvey ?? 0]}, hiện tại ${LEVELS[domain.now ?? 0]}, cần ${LEVELS[domain.required]}`)}
      >
        {[1, 2, 3].map((level) => <i key={level} className="br-ladder__tick" style={{ left: at(level) }} />)}
        {domain.now != null && <span className="br-ladder__fill" data-below={below || undefined} style={{ width: at(domain.now) }} />}
        <span className="br-ladder__req" style={{ left: at(domain.required) }} />
        {domain.atSurvey != null && <span className="br-ladder__before" style={{ left: at(domain.atSurvey) }} />}
        {domain.now != null && <span className="br-ladder__now" style={{ left: at(domain.now) }} />}
      </span>
      <span className="br-ladder__text">
        {domain.now == null ? translateUi('Chưa có') : translateUi(LEVELS[domain.now])}
        {below && <small>{translateUi(`cần ${LEVELS[domain.required]}`)}</small>}
      </span>
      {worst && exam ? (
        <button
          type="button"
          className={`br-ladder__exam ${worst.toLowerCase()}`}
          aria-pressed={selected === exam.reportId}
          onClick={() => onPick(exam.reportId)}
          title={earnedByFlagged ? translateUi('Mức hiện tại đạt qua bài thi rủi ro cao') : undefined}
        >
          {earnedByFlagged && <ShieldAlert size={13} aria-hidden />}
          {translateUi(`Thi: ${LEVEL_TEXT[worst].toLocaleLowerCase('vi')}`)}
        </button>
      ) : <span className="br-ladder__exam is-none">{translateUi('Chưa thi')}</span>}
    </li>
  );
}

/** What the exam row says instead of a strip of marks: the AI's main finding, else how many moments the log flagged. */
function examWhy(report: BehaviorReportItem) {
  if (report.status === 'PENDING') return translateUi(`${formatDuration(report.durationMs)} làm bài · AI đang phân tích`);
  const what = report.findingTitles?.[0]
    ?? (report.marks.length ? `${report.marks.length} đoạn cần xem trong nhật ký` : 'Không có dấu hiệu đáng ngờ');
  return `${translateUi(what)} · ${translateUi(`${formatDuration(report.durationMs)} làm bài`)}`;
}

function ExamRow({ report, active, onPick }: { report: BehaviorReportItem; active: boolean; onPick: (reportId: string) => void }) {
  const domain = report.domainNumber ? DOMAIN_SHORT[report.domainNumber - 1] : null;
  const tag = [domain, report.tier ? TIER_TEXT[report.tier] : null].filter(Boolean).join(' · ');
  return (
    <li>
      <button type="button" className="br-exam" aria-pressed={active} onClick={() => onPick(report.reportId)} data-level={report.level.toLowerCase()}>
        <span className="br-exam__what">
          {tag && <small data-domain={report.domainNumber ?? undefined}>{translateUi(tag)}</small>}
          <strong>{report.courseTitle}</strong>
          <span>
            {translateUi('Lần')} {report.attemptNo} · {shortDate(report.submittedAt)}
            {' · '}{report.decision ? translateUi(DECISION_TEXT[report.decision] ?? report.decision) : translateUi('Chờ chấm')}
          </span>
        </span>
        <span className="br-exam__why">{examWhy(report)}</span>
        <span className={`br-pill ${report.level.toLowerCase()}`}>
          {report.status === 'PENDING' ? translateUi('Đang phân tích') : translateUi(LEVEL_TEXT[report.level])}
        </span>
      </button>
    </li>
  );
}
