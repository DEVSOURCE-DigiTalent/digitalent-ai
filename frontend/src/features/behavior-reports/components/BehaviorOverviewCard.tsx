import { useId, useState } from 'react';
import { BrainCircuit, ChevronRight, Database, Lightbulb, LoaderCircle, MessagesSquare, PenTool, ShieldAlert, ShieldCheck } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { BehaviorEmployee, BehaviorReportItem } from '@/services/behavior-report.service';
import type { CapabilityProgressEmployee, CapabilityProgressEmployeeDomain } from '@/services/intelligence.service';
import type { PulseRiskLevel } from '@/services/pulse.service';
import { DOMAIN_SHORT, LEVEL_ORDER, LEVEL_TEXT, TIER_TEXT, initials } from '../lib/behavior';
import '../behavior-reports.css';

const LEVELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

/** Người có bài ở một mức, cùng các bài đó (mới nộp trước). */
interface LevelPerson {
  employeeId: string;
  name: string;
  reports: BehaviorReportItem[];
}

function peopleAt(employees: BehaviorEmployee[], level: PulseRiskLevel, names: ReadonlyMap<string, string>): LevelPerson[] {
  return employees
    .map((e) => ({
      employeeId: e.employeeId,
      name: names.get(e.employeeId) ?? e.reports[0]?.employeeName ?? '',
      reports: e.reports.filter((r) => r.level === level),
    }))
    .filter((p) => p.reports.length > 0);
}

/**
 * "Hành vi khi thi" trên Khoảng trống năng lực (OW-21): số bài cuối khóa rủi ro cao / cần xem lại / bình thường của phạm
 * vi đang xem. Bấm một mức để xem những người có bài ở mức đó — mức năng lực hiện tại của họ và đáng ngờ ở phần nào —
 * rồi bấm một người để mở chi tiết với đúng bài đó.
 */
export function BehaviorOverviewCard({
  employees,
  people,
  onOpen,
}: {
  employees: BehaviorEmployee[];
  people: ReadonlyMap<string, CapabilityProgressEmployee>;
  onOpen: (employeeId: string, reportId?: string) => void;
}) {
  useUiLanguage();
  const titleId = useId();
  const [level, setLevel] = useState<PulseRiskLevel | null>(null);
  const reports = employees.flatMap((e) => e.reports);
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  reports.forEach((r) => { counts[r.level] += 1; });
  const analyzing = reports.filter((r) => r.status === 'PENDING').length;
  const names = new Map([...people.values()].map((p) => [p.employeeId, p.name]));
  const shown = level ? peopleAt(employees, level, names) : [];

  return (
    <section className="cp-card br-scope br-ov" aria-labelledby={titleId}>
      <div className="br-ov__top">
        <div className="br-ov__head">
          <h2 id={titleId}>{translateUi('Hành vi khi thi')}</h2>
          <p>
            {reports.length} {translateUi('bài cuối khóa')}
            {analyzing > 0 && (
              <span className="br-ov__busy"><LoaderCircle size={12} aria-hidden className="br-spin" /> {translateUi(`AI đang phân tích ${analyzing}`)}</span>
            )}
          </p>
        </div>

        {/* Three equal tiles, always labelled; a level with no exam stays visible (0 rủi ro cao is news too) but disabled. */}
        <div className="br-ov__bar" role="group" aria-label={translateUi('Xem người theo mức')}>
          {LEVEL_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`br-ov__seg ${key.toLowerCase()}`}
              aria-pressed={level === key}
              aria-label={translateUi(`${counts[key]} bài ${LEVEL_TEXT[key].toLocaleLowerCase('vi')}`)}
              disabled={counts[key] === 0}
              data-dim={level != null && level !== key ? 'true' : undefined}
              onClick={() => setLevel(level === key ? null : key)}
            >
              <b>{counts[key]}</b><span>{translateUi(LEVEL_TEXT[key])}</span>
              {counts[key] > 0 && <ChevronRight size={15} className="br-ov__chev" aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      {level && (
        <div className="br-ov__list">
          <div className="br-ov__caption">
            <span className={`br-pill ${level.toLowerCase()}`}>{translateUi(LEVEL_TEXT[level])}</span>
            <span>{translateUi(`${shown.length} người · ${counts[level]} bài`)}</span>
            <span className="br-ov__legend" aria-hidden>
              {translateUi('Mức hiện tại 6 lĩnh vực:')}
              <i className="br-dom br-dom--key" data-state="met" />{translateUi('đạt mức cần')}
              <i className="br-dom br-dom--key" data-state="short" />{translateUi('chưa đạt')}
              <i className="br-dom br-dom--key" data-state="none" />{translateUi('chưa có kết quả')}
              <i className="br-dom br-dom--key" data-state="none" data-flagged="true" />{translateUi('có bài thi đáng ngờ')}
            </span>
          </div>
          <ul aria-label={translateUi(`Người có bài ${LEVEL_TEXT[level].toLocaleLowerCase('vi')}`)}>
            {shown.map((person) => (
              <PersonRow key={person.employeeId} person={person} progress={people.get(person.employeeId)} onOpen={onOpen} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Biểu tượng của 6 lĩnh vực, như trên Khoảng trống năng lực. */
const DOMAIN_ICONS = [Database, MessagesSquare, PenTool, ShieldCheck, Lightbulb, BrainCircuit];

type DomainState = 'met' | 'short' | 'none';
const stateOf = (d: CapabilityProgressEmployeeDomain): DomainState => (d.now == null ? 'none' : d.now >= d.required ? 'met' : 'short');
const levelLine = (d: CapabilityProgressEmployeeDomain) =>
  d.now == null ? `chưa có kết quả, cần ${LEVELS[d.required]}` : d.now >= d.required ? `${LEVELS[d.now]}, đã đạt mức cần` : `${LEVELS[d.now]}, cần ${LEVELS[d.required]}`;

/** Một người: mức hiện tại từng lĩnh vực (6 ô có biểu tượng), các bài ở mức đang xem và đáng ngờ ở đâu. */
function PersonRow({ person, progress, onOpen }: {
  person: LevelPerson;
  progress: CapabilityProgressEmployee | undefined;
  onOpen: (employeeId: string, reportId?: string) => void;
}) {
  const flaggedDomains = new Set(person.reports.filter((r) => r.level !== 'LOW').map((r) => r.domainNumber));
  const domains = [...(progress?.domains ?? [])].sort((a, b) => a.number - b.number);
  const byNumber = new Map(domains.map((d) => [d.number, d]));
  const compared = domains.filter((d) => d.now != null);
  const met = compared.filter((d) => d.now! >= d.required).length;
  const first = person.reports[0];
  const name = (number: number, fallback = '') => DOMAIN_SHORT[number - 1] ?? fallback;
  return (
    <li>
      <button type="button" className="br-person" onClick={() => onOpen(person.employeeId, first?.reportId)}>
        <span className="br-person__who">
          <span className="br-avatar" aria-hidden>{initials(person.name)}</span>
          <span>
            <strong>{person.name}</strong>
            <small>{progress?.positionName ?? first?.positionName ?? ''}</small>
          </span>
        </span>

        <span className="br-person__levels">
          {domains.length > 0 ? (
            <>
              <span
                className="br-doms"
                role="img"
                aria-label={translateUi(`Mức hiện tại: ${domains.map((d) => `${name(d.number, d.name)} ${levelLine(d)}${flaggedDomains.has(d.number) ? ', có bài thi đáng ngờ' : ''}`).join('; ')}`)}
              >
                {domains.map((d) => {
                  const Icon = DOMAIN_ICONS[d.number - 1] ?? Database;
                  return (
                    <span key={d.number} className="br-dom" data-state={stateOf(d)} data-flagged={flaggedDomains.has(d.number) || undefined}
                      title={translateUi(`${name(d.number, d.name)}: ${levelLine(d)}${flaggedDomains.has(d.number) ? ' · có bài thi đáng ngờ' : ''}`)}>
                      <Icon size={13} aria-hidden />
                    </span>
                  );
                })}
              </span>
              <small>{translateUi(compared.length ? `Đạt ${met}/${compared.length} lĩnh vực` : 'Chưa có kết quả khảo sát')}</small>
            </>
          ) : <small>{translateUi('Chưa có kết quả khảo sát')}</small>}
        </span>

        <span className="br-person__exams">
          {person.reports.map((report) => {
            const domainName = report.domainNumber ? name(report.domainNumber, report.domainName ?? '') : report.domainName;
            const where = [domainName, report.tier ? `bài ${TIER_TEXT[report.tier]}` : null].filter(Boolean).join(' · ');
            const domain = report.domainNumber ? byNumber.get(report.domainNumber) : undefined;
            const why = report.findingTitles?.length ? report.findingTitles.join(' · ') : null;
            return (
              <span key={report.reportId} className={`br-person__exam ${report.level.toLowerCase()}`}>
                <span className="br-person__exam-head">
                  {report.level !== 'LOW' && <ShieldAlert size={13} aria-hidden />}
                  <b>{translateUi(where || report.courseTitle || '')}</b>
                  {domain && <em data-state={stateOf(domain)}>{translateUi(`hiện tại ${levelLine(domain)}`)}</em>}
                </span>
                {why && <span className="br-person__why">{why}</span>}
              </span>
            );
          })}
        </span>
        <ChevronRight size={16} className="br-person__go" aria-hidden />
      </button>
    </li>
  );
}

/** Dấu hiệu hành vi khi thi cạnh tên một người (chỉ khi có bài cần xem). */
export function BehaviorBadge({ employee }: { employee: BehaviorEmployee | undefined }) {
  useUiLanguage();
  if (!employee || employee.level === 'LOW') return null;
  const count = employee.level === 'HIGH' ? employee.high : employee.medium;
  return (
    <span className={`br-badge ${employee.level.toLowerCase()}`} title={translateUi(`${count} bài thi ${LEVEL_TEXT[employee.level].toLocaleLowerCase('vi')}`)}>
      <i aria-hidden />{translateUi(`Thi: ${LEVEL_TEXT[employee.level].toLocaleLowerCase('vi')}`)}
    </span>
  );
}
