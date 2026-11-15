import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Building2, ChevronDown, GraduationCap } from 'lucide-react';
import { useEmployee } from '@/hooks/use-employees';
import { useSkillGapRun, useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { useAssignments } from '@/hooks/use-assignments';
import { PageLoading } from '@/components/shared/LoadingState';
import { ASSIGNMENT_STATUS_LABELS } from '@/features/assignments/assignment-labels';
import { Initials, ManagerPage } from '@/features/pulse-manager/components/ManagerUi';
import { MANAGER_PATHS } from '@/features/pulse-manager/lib/paths';
import { TT02_DOMAINS } from '@/lib/reference-positions';
import type { SkillGapItem, SkillGapRunDetail } from '@/services/intelligence.service';
import './team-member-detail.css';

function DomainBreakdown({ run }: { run: SkillGapRunDetail }) {
  const locale = useUiLanguage();
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });
  const groups = new Map<string, { name: string; order: number; items: SkillGapItem[] }>();

  for (const item of run.items) {
    const frameworkDomain = item.frameworkCode?.match(/^([1-6])\./)?.[1];
    const domain = TT02_DOMAINS.find(({ number }) => number === (item.categorySortOrder || Number(frameworkDomain)));
    const name = item.categoryName?.trim() || domain?.name || 'Chưa phân loại';
    const key = domain ? String(domain.number) : name;
    const group = groups.get(key) ?? { name: domain?.name || name, order: domain?.number ?? Infinity, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }

  const domains = [...groups.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, locale));
  const max = Math.max(1, ...domains.map(({ items }) => items.length));

  return (
    <>
      <dl className="member-insight-stats">
        <div><dt>{translateUi('Độ bao phủ')}</dt><dd>{percent.format(run.summary.coveragePercent / 100)}</dd></div>
        <div><dt>{translateUi('Năng lực đạt chuẩn')}</dt><dd>{number.format(run.summary.totalMet)} / {number.format(run.summary.totalRequired)}</dd></div>
        <div><dt>{translateUi('Khoảng trống năng lực')}</dt><dd>{number.format(run.summary.totalGap)}</dd></div>
      </dl>
      {domains.length > 0 && (
        <>
          <p className="member-insight-legend">
            <span>{translateUi('Đạt chuẩn')}</span>
            <span>{translateUi('Cần bổ sung')}</span>
          </p>
          <div className="member-insight-domains">
            {domains.map(({ name, items }) => {
              const gaps = items.filter(({ gapSteps }) => gapSteps > 0).length;
              const met = items.length - gaps;
              return (
                <details key={name} name="member-competency-domain">
                  <summary>
                    <strong>{translateUi(name)}</strong>
                    <span className="member-insight-track" aria-hidden="true">
                      <i style={{ width: `${100 * met / max}%` }} />
                      <i style={{ width: `${100 * gaps / max}%` }} />
                    </span>
                    <span className="member-insight-count">{number.format(gaps)} / {number.format(items.length)} <span>{translateUi('cần bổ sung')}</span></span>
                    <ChevronDown size={17} aria-hidden="true" />
                  </summary>
                  <ul role="list" className="member-insight-items">
                    {items.map((item) => (
                      <li key={item.competencyId}>
                        <div>
                          <strong>{item.frameworkCode || item.competencyCode} · {translateUi(item.competencyName)}</strong>
                          <small>{translateUi('Mức hiện tại')} {item.currentLevel ?? '—'} · {translateUi('Mức yêu cầu')} {item.requiredLevel}</small>
                        </div>
                        <span data-gap={item.gapSteps > 0}>{item.gapSteps > 0
                          ? `${translateUi('Thiếu')} ${number.format(item.gapSteps)} ${translateUi('cấp')}`
                          : translateUi('Đạt chuẩn')}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export function TeamMemberDetailPage() {
  const locale = useUiLanguage();
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });
  const { id } = useParams<{ id: string }>();
  const employee = useEmployee(id || '');
  const runs = useSkillGapRuns({ employeeId: id, pageIndex: 1, pageSize: 1, latestOnly: true });
  const latestRun = useSkillGapRun(runs.data?.items[0]?.runId);
  const assignments = useAssignments({ employeeId: id, includeIndependentLearning: true, pageIndex: 1, pageSize: 20 });

  if (employee.isLoading) return <ManagerPage><PageLoading label="Đang tải thông tin thành viên" variant="detail" /></ManagerPage>;
  if (employee.isError || !employee.data) {
    return <ManagerPage><div role="alert">{translateUi('Không tải được thành viên trong phạm vi quản lý.')} <Link to={MANAGER_PATHS.members}>{translateUi('Quay lại danh sách')}</Link></div></ManagerPage>;
  }

  const person = employee.data;
  const courses = assignments.data?.items ?? [];
  const status = person.status === 'ACTIVE' ? 'Đang làm việc'
    : person.status === 'INACTIVE' ? 'Ngừng hoạt động'
    : person.status === 'TRANSFERRED' ? 'Đã chuyển công tác'
    : person.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Chưa xác định';

  return (
    <ManagerPage>
      <div className="member-insight">
        <header className="member-insight-profile">
          <Link to={MANAGER_PATHS.members} className="member-insight-back"><ArrowLeft size={16} aria-hidden="true" />{translateUi('Danh sách nhân viên')}</Link>
          <div className="member-insight-identity">
            <Initials name={person.fullName} />
            <div>
              {person.departmentName && <p><Building2 size={15} aria-hidden="true" />{person.departmentName}</p>}
              <h1>{person.fullName}</h1>
              <p>{person.positionName || person.jobPositionName}</p>
            </div>
          </div>
          <dl className="member-insight-facts">
            <div><dt>{translateUi('Mã nhân viên')}</dt><dd>{person.employeeCode}</dd></div>
            <div><dt>Email</dt><dd>{person.workEmail || '—'}</dd></div>
            <div><dt>{translateUi('Trạng thái')}</dt><dd>{translateUi(status)}</dd></div>
          </dl>
        </header>

        <div className="member-insight-grid">
          <section className="member-insight-panel" aria-labelledby="member-competency-heading">
            <h2 id="member-competency-heading">{translateUi('Năng lực và khoảng trống')}</h2>
            {runs.isLoading || latestRun.isLoading ? <p role="status">{translateUi('Đang tải…')}</p>
              : runs.isError || latestRun.isError ? <p role="alert">{translateUi('Không tải được phân tích năng lực.')}</p>
              : latestRun.data ? <DomainBreakdown key={latestRun.data.runId} run={latestRun.data} />
              : <p>{translateUi('Chưa có kết quả phân tích năng lực.')}</p>}
          </section>

          <section className="member-insight-panel member-insight-learning" aria-labelledby="member-learning-heading">
            <h2 id="member-learning-heading"><GraduationCap size={21} aria-hidden="true" />{translateUi('Tiến độ học tập')}</h2>
            {assignments.isLoading ? <p role="status">{translateUi('Đang tải…')}</p>
              : assignments.isError ? <p role="alert">{translateUi('Không tải được phân công đào tạo.')}</p>
              : courses.length === 0 ? <p>{translateUi('Chưa có phân công đào tạo.')}</p>
              : (
                <details key={id}>
                  <summary>{translateUi('Xem khóa học')} <span>{courses.length}</span><ChevronDown size={17} aria-hidden="true" /></summary>
                  <ul role="list">
                    {courses.map((item) => {
                      const label = item.source === 'SELF_ENROLLED' ? 'Tự học' : ASSIGNMENT_STATUS_LABELS[item.status] ?? item.status;
                      const content = <>
                        <strong>{item.courseCode} · {item.courseTitle}</strong>
                        <small>{translateUi(label)} · {percent.format(item.progressPercent / 100)}</small>
                        <progress max={100} value={item.progressPercent} aria-label={item.courseTitle} />
                      </>;
                      return <li key={item.id}>{item.source === 'SELF_ENROLLED' ? <div>{content}</div>
                        : <Link to={MANAGER_PATHS.trainingDetail(item.id)}>{content}<ArrowUpRight size={15} aria-hidden="true" /></Link>}</li>;
                    })}
                  </ul>
                </details>
              )}
          </section>
        </div>
      </div>
    </ManagerPage>
  );
}
