import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useMarkSeen, usePersonalAccess, usePersonalDiagnostic, usePersonalProgress } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PersonalMilestone, PersonalProgress } from '@/services/personal-learning.service';
import { ActivityList } from '../components/ActivityList';
import { InlineTip } from '../components/InlineTip';
import {
  Card, ErrorBlock, LoadingBlock, PT_BUTTON_SECONDARY, PersonalPageHeader, SectionTitle, Stat
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatDate, formatHours } from '../utils/format';

/** IND-11 "/personal/progress": the learner's competency profile, where each level came from, and milestones. */
export function LearnerProgressPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalProgress();
  const diagnostic = usePersonalDiagnostic();

  return (
    <div data-testid="learner-progress-page" className="grid gap-10">
      <PersonalPageHeader
        label="Hồ sơ năng lực"
        title="Hồ sơ năng lực"
        lead="Mức hiện tại, yêu cầu của vị trí và căn cứ đánh giá cho từng năng lực."
        actions={<Link to="/personal/certificates" className={PT_BUTTON_SECONDARY}>Xem chứng nhận</Link>}
      />
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && <ProgressBody data={data} diagnostic={diagnostic.data?.result ?? null} />}
    </div>
  );
}

/** The competency the last course pass raised: its domain and the course, from the "source" the server wrote. */
function lastRaise(profile: PersonalProgress['profile']): { domain: string; course: string } | null {
  const raised = profile.flatMap((domain) => domain.items
    .filter((item) => item.source?.startsWith('Khóa') && item.at)
    .map((item) => ({ domain: domain.name, at: item.at!, source: item.source! })));
  const latest = raised.sort((a, b) => b.at.localeCompare(a.at))[0];
  return latest ? { domain: latest.domain, course: latest.source.replace(/^Khóa\s+\S+\s·\s/, '') } : null;
}

function ProgressBody({ data, diagnostic }: { data: PersonalProgress; diagnostic: { completedAt: string; domains: { number: number; level: number }[] } | null }) {
  const { data: access } = usePersonalAccess();
  const { mutate: markSeen } = useMarkSeen();
  const raise = lastRaise(data.profile);
  const firstPassDone = access?.checklist.find((item) => item.key === 'first-course')?.done ?? false;
  const seenAfterPass = access?.seen['profile-after-pass'];
  const markedAfterPass = useRef(false);
  const limited = access !== undefined && access.mode !== 'full';
  // Opening the profile after the first pass is step 4 of the trial checklist.
  useEffect(() => {
    if (!limited || !firstPassDone || seenAfterPass || markedAfterPass.current) return;
    markedAfterPass.current = true;
    markSeen('profile-after-pass');
  }, [limited, firstPassDone, seenAfterPass, markSeen]);

  const assessed = Boolean(diagnostic) || data.profile.some((domain) => domain.items.some((item) => item.source || item.at || item.level > 0));
  return (
    <>
      <InlineTip tipKey="tip-profile" when={Boolean(raise)}>
        Mức ở miền {raise?.domain} vừa tăng nhờ khóa {raise?.course}.
      </InlineTip>
      <Card className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-4 md:p-8">
        <Stat label="Đáp ứng vị trí" value={assessed ? `${data.coveragePercent}%` : 'Chưa đánh giá'} hint={assessed ? 'yêu cầu năng lực' : 'cần bài đánh giá đầu vào'} />
        <Stat label="Thời gian học" value={formatHours(data.learnedMinutes)} />
        <Stat label="Bài học" value={data.lessonsCompleted} hint="đã hoàn thành" />
        <Stat label="Kết quả đã xác nhận" value={data.assessmentsPassed + data.tasksApproved} hint="khóa học và bài thực hành" />
      </Card>

      <section aria-labelledby="profile-title" className="grid gap-4">
        <SectionTitle id="profile-title" title="Bằng chứng năng lực" aside="Nhóm theo 6 miền năng lực" />
        <div className="grid gap-4">
          {data.profile.map((domain) => (
            <details key={domain.number} open className="group overflow-hidden rounded-2xl border border-pt-line bg-pt-card">
              <summary className="cursor-pointer px-5 py-4 text-base font-semibold text-pt-fg">{domain.number}. {domain.name}</summary>
              <div className="overflow-x-auto border-t border-pt-line" role="region" aria-label={`Bảng ${domain.name}`} tabIndex={0}>
                <table aria-label={domain.name} className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-pt-raised/60 text-xs text-pt-fg-3"><tr>
                    <th className="px-5 py-3 font-medium">Năng lực</th><th className="px-4 py-3 font-medium">Mức hiện tại</th><th className="px-4 py-3 font-medium">Mức mục tiêu</th><th className="px-4 py-3 font-medium">Căn cứ</th><th className="px-5 py-3 font-medium">Ngày đánh giá</th>
                  </tr></thead>
                  <tbody>{domain.items.map((item) => {
                    const domainResult = diagnostic?.domains.find((result) => result.number === domain.number);
                    const hasDiagnosticEvidence = Boolean(diagnostic && domainResult);
                    const hasEvidence = Boolean(item.source || item.at || item.level > 0 || hasDiagnosticEvidence);
                    const current = hasEvidence ? (item.level > 0 ? levelLabelVi(item.level) : 'Chưa đạt mức Cơ bản') : 'Chưa đánh giá';
                    return <tr key={item.code} className="border-t border-pt-line">
                      <th scope="row" className="px-5 py-3 font-medium text-pt-fg"><span className="mr-2 text-xs font-normal text-pt-fg-3">{item.code}</span>{item.name}</th>
                      <td className="px-4 py-3 text-pt-fg-2">{current}</td>
                      <td className="px-4 py-3 text-pt-fg-2">{item.requiredLevel > 0 ? levelLabelVi(item.requiredLevel) : 'Không yêu cầu'}</td>
                      <td className="px-4 py-3 text-pt-fg-2">{item.source || (hasDiagnosticEvidence ? 'Đánh giá đầu vào' : 'Chưa có')}</td>
                      <td className="px-5 py-3 text-pt-fg-2">{item.at ? formatDate(item.at) : hasDiagnosticEvidence ? formatDate(diagnostic!.completedAt) : '—'}</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="p-6 md:p-8 lg:col-span-7">
          <SectionTitle title="Lịch sử hoàn thành" aside={`${data.milestones.filter((m) => m.achievedAt).length}/${data.milestones.length} mục`} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.milestones.map((milestone) => <Milestone key={milestone.id} milestone={milestone} />)}
          </ul>
        </Card>
        <Card className="p-6 md:p-8 lg:col-span-5">
          <SectionTitle title="Nhật ký học tập" />
          <div className="mt-6"><ActivityList items={data.activity} /></div>
        </Card>
      </div>
    </>
  );
}

function Milestone({ milestone }: { milestone: PersonalMilestone }) {
  const achieved = Boolean(milestone.achievedAt);
  return (
    <li className={cn('flex gap-4 rounded-2xl border p-4', achieved ? 'border-pt-fg/30 bg-pt-raised/60' : 'border-dashed border-pt-line')}>
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', achieved ? 'bg-pt-accent text-pt-on-accent' : 'border border-pt-line text-pt-fg-3')}>
        {achieved ? <Check className="size-4" aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      </span>
      <div>
        <p className={cn('text-sm', achieved ? 'text-pt-fg' : 'text-pt-fg-2')}>{milestone.title}</p>
        <p className="mt-0.5 text-xs leading-snug text-pt-fg-3">
          {milestone.description}
          {milestone.achievedAt && <> · {formatDate(milestone.achievedAt)}</>}
        </p>
        <span className="sr-only">{achieved ? 'Đã đạt' : 'Chưa đạt'}</span>
      </div>
    </li>
  );
}
