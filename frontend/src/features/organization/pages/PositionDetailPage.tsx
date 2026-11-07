import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, ClipboardList, UsersRound, CalendarDays, Layers3 } from 'lucide-react';
import { EmptyState, LevelBadge, StatusBadge, Tabs, getStatusVariant } from '@/components/shared';
import { PageLoading } from '@/components/shared/LoadingState';
import { useAssignments, useCourses } from '@/hooks/use-assignments';
import { usePositionRequirements } from '@/hooks/use-competencies';
import { useJobPosition } from '@/hooks/use-job-positions';
import { useWorkforce } from '@/hooks/use-workforce';
import { formatDate } from '@/lib/utils';
import { groupByDomain, type DomainRow } from '@/features/competency/utils/requirement-domains';
import { LEVEL_SUFFIX_LABELS } from '@/features/assignments/assignment-labels';
import { BLOCKER_LABELS } from '@/services/workforce.service';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import './position-detail.css';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang áp dụng', DRAFT: 'Bản nháp', RETIRED: 'Đã thay thế', NONE: 'Chưa có' };

/** LCA-03: one position in a workspace of tabs: overview, requirements, people and learning coverage. */
export function PositionDetailPage() {
  const { id = '' } = useParams();
  const position = useJobPosition(id);
  const requirements = usePositionRequirements(id);
  const workforce = useWorkforce({ jobPositionId: id, pageSize: 100 });
  const assignments = useAssignments({ jobPositionId: id, pageSize: 100 });
  const courses = useCourses({ status: 'PUBLISHED' });
  const [tab, setTab] = useState('overview');

  const set = requirements.data;
  const hasSet = Boolean(set?.id);
  const domains = useMemo(
    () => groupByDomain((set?.items ?? []).map((item): DomainRow => ({ ...item, categorySortOrder: item.categorySortOrder ?? 0, requiresPracticalEvidence: item.requiresPracticalEvidence }))),
    [set],
  );
  const people = workforce.data?.items ?? [];

  if (position.isLoading) return <PageLoading label="Đang tải thông tin vị trí" variant="detail" />;
  if (position.isError || !position.data) {
    return (
      <div role="alert" className="grid gap-3">
        <p className="text-sm text-red-600">Không tìm thấy vị trí này.</p>
        <Link to="/enterprise/positions" className="text-sm font-medium text-primary-700 underline">Quay lại danh sách</Link>
      </div>
    );
  }
  const p = position.data;

  return (
    <div className="position-detail -m-4 min-h-screen px-5 py-7 md:-m-6 md:px-7 xl:px-10">
      <Link to="/enterprise/positions" className="position-detail-back">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Vị trí công việc
      </Link>
      <header className="position-detail-hero">
        <div className="position-detail-hero__icon"><BriefcaseBusiness size={25} /></div>
        <div className="position-detail-hero__main">
          <span className="position-detail-kicker">HỒ SƠ VỊ TRÍ</span>
          <h1>{p.name}</h1>
          <div className="position-detail-meta"><span>Mã {p.code}</span>{p.departmentName && <span>{p.departmentName}</span>}<StatusBadge label={p.status === 'ACTIVE' ? 'Đang dùng' : 'Ngừng dùng'} variant={getStatusVariant(p.status)} /></div>
        </div>
        <div className="position-detail-actions">
          <Link to={`/enterprise/requirements/builder?positionId=${id}`} className={PRIMARY_BUTTON}>Chỉnh yêu cầu năng lực</Link>
          <Link to={`/enterprise/requirements/history?positionId=${id}`} className={SECONDARY_BUTTON}>Lịch sử phiên bản</Link>
        </div>
      </header>

      <Tabs
        className="position-detail-tabs"
        label="Thông tin vị trí"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'requirements', label: 'Yêu cầu năng lực', badge: set?.items.length },
          { id: 'people', label: 'Nhân sự', badge: workforce.data?.totalItems },
          { id: 'learning', label: 'Phủ khóa học' },
        ]}
      >
        {tab === 'overview' && (
          <div className="grid gap-5">
            <div className="position-detail-stats">
              <div className="position-detail-stat position-detail-stat--blue"><Layers3 size={21} /><span>Phiên bản đang áp dụng</span><strong>{hasSet && set?.status === 'ACTIVE' ? `v${set.versionNo}` : '—'}</strong><small>{set ? STATUS_LABELS[set.status] : 'Chưa thiết lập'}</small></div>
              <div className="position-detail-stat position-detail-stat--teal"><ClipboardList size={21} /><span>Năng lực yêu cầu</span><strong>{set?.items.length ?? 0}</strong><small>{set?.items.filter((i) => i.isMandatory).length ?? 0} bắt buộc</small></div>
              <div className="position-detail-stat position-detail-stat--violet"><UsersRound size={21} /><span>Nhân sự giữ vị trí</span><strong>{people.filter((x) => x.status === 'ACTIVE').length}</strong><small>Đang hoạt động</small></div>
              <div className="position-detail-stat position-detail-stat--amber"><CalendarDays size={21} /><span>Hiệu lực từ</span><strong className="position-detail-stat__date">{formatDate(set?.effectiveFrom)}</strong><small>{set?.reviewDate ? `Rà soát ${formatDate(set.reviewDate)}` : 'Theo chuẩn hiện hành'}</small></div>
            </div>
            {p.description && <section className="position-detail-description"><h2>Mô tả vị trí</h2><p>{p.description}</p></section>}
            {!hasSet && (
              <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Chưa có chuẩn năng lực cho vị trí này. Thiết lập chuẩn để xem khoảng trống năng lực.{' '}
                <Link to={`/enterprise/requirements/builder?positionId=${id}`} className="font-medium underline">Đặt yêu cầu năng lực</Link>
              </p>
            )}
          </div>
        )}

        {tab === 'requirements' &&
          (!hasSet ? (
            <EmptyState title="Chưa có yêu cầu năng lực" description="Chọn từ 9 đến 24 năng lực của Thông tư 02/2025 và đặt trình độ yêu cầu cho từng năng lực." action={<Link to={`/enterprise/requirements/builder?positionId=${id}`} className={PRIMARY_BUTTON}>Đặt yêu cầu năng lực</Link>} />
          ) : (
            <div className="grid gap-5">
              {domains.map((group) => (
                <section key={group.domain.categoryId} aria-label={group.domain.name} className="rounded-lg border border-slate-200 bg-white">
                  <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">{group.domain.name}</h3>
                  <ul className="divide-y divide-slate-100">
                    {group.rows.map((row) => (
                      <li key={row.competencyId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                        <Link to={`/enterprise/framework/${row.competencyId}`} className="text-slate-800 hover:underline">
                          <span className="mr-2 font-mono text-xs text-slate-500">{row.frameworkCode}</span>{row.competencyName}
                        </Link>
                        <span className="flex items-center gap-2">
                          {row.isMandatory && <StatusBadge label="Bắt buộc" variant="warning" />}
                          <LevelBadge level={row.requiredLevel} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ))}

        {tab === 'people' &&
          (people.length === 0 ? (
            <EmptyState title="Chưa có ai giữ vị trí này" description="Xếp vị trí cho nhân viên trong mục Thành viên." />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {people.map((person) => (
                <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <Link to={`/enterprise/members/${person.id}`} className="font-medium text-slate-900 hover:underline">{person.fullName}</Link>
                    <p className="text-xs text-slate-500">{person.employeeCode} · {person.departmentName}</p>
                  </div>
                  <p className="text-right text-xs text-slate-600">
                    {person.coveragePercent === null ? BLOCKER_LABELS[person.blocker ?? ''] ?? '—' : `Đáp ứng ${person.coveragePercent.toFixed(1)}%`}
                    {person.highCount ? <span className="ml-2 font-medium text-red-600">{person.highCount} mức cao</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'learning' && <LearningCoverage domains={domains} assignments={assignments.data?.items ?? []} courses={courses.data?.items ?? []} peopleCount={people.filter((x) => x.status === 'ACTIVE').length} />}
      </Tabs>
    </div>
  );
}

interface CoverageProps {
  domains: ReturnType<typeof groupByDomain<DomainRow>>;
  assignments: { courseId: string; status: string }[];
  courses: { id: string; code: string; title: string; categoryName?: string; level: number }[];
  peopleCount: number;
}

/** For each domain the position needs: the standard courses up to the highest required level, and who has them. */
function LearningCoverage({ domains, assignments, courses, peopleCount }: CoverageProps) {
  if (domains.length === 0) return <EmptyState title="Chưa có yêu cầu năng lực" description="Phủ khóa học được tính từ trình độ yêu cầu cao nhất của từng miền." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <caption className="sr-only">Khóa học chuẩn cần cho từng miền của vị trí</caption>
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Miền</th>
            <th scope="col" className="px-4 py-3 font-semibold">Mức cao nhất yêu cầu</th>
            <th scope="col" className="px-4 py-3 font-semibold">Khóa chuẩn cần học</th>
            <th scope="col" className="px-4 py-3 font-semibold">Đã giao / Hoàn thành</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {domains.map((group) => {
            const maxLevel = Math.max(...group.rows.map((r) => r.requiredLevel));
            const needed = courses.filter((c) => c.categoryName === group.domain.name && c.level <= maxLevel).sort((a, b) => a.level - b.level);
            const assigned = assignments.filter((a) => needed.some((c) => c.id === a.courseId));
            const done = assigned.filter((a) => a.status === 'COMPLETED').length;
            return (
              <tr key={group.domain.categoryId}>
                <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">{group.domain.name}</th>
                <td className="px-4 py-3"><LevelBadge level={maxLevel} /></td>
                <td className="px-4 py-3 text-slate-700">
                  {needed.map((c) => <span key={c.id} className="mr-2 inline-block" title={c.title}><span className="font-mono text-xs">{c.code}</span> <span className="text-xs text-slate-500">({LEVEL_SUFFIX_LABELS[c.level]})</span></span>)}
                </td>
                <td className="px-4 py-3 tabular-nums">{assigned.length} lượt giao · {done} hoàn thành{peopleCount > 0 ? ` · ${peopleCount} người` : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
