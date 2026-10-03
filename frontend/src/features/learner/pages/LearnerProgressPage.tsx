import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePersonalProgress } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PersonalMilestone, PersonalProgress } from '@/services/personal-learning.service';
import { ActivityList } from '../components/ActivityList';
import {
  Card, ErrorBlock, LevelPips, LoadingBlock, PT_BUTTON_SECONDARY, PageIntro, SectionTitle, Stat
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatDate, formatHours } from '../utils/format';

/** IND-11 "/personal/progress": the learner's competency profile, where each level came from, and milestones. */
export function LearnerProgressPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalProgress();

  return (
    <div data-testid="learner-progress-page" className="grid gap-10">
      <PageIntro
        label="Hồ sơ năng lực"
        title="Tiến độ tích lũy kỹ năng"
        accent="theo từng năng lực."
        lead="Mức của mỗi năng lực đến từ bài đánh giá đầu vào hoặc từ bài đánh giá cuối khóa bạn đã đạt. Thang 3 mức: Cơ bản (bậc 1–2), Trung cấp (bậc 3–4), Nâng cao (bậc 5–6) theo Thông tư 02/2025."
        actions={<Link to="/personal/certificates" className={PT_BUTTON_SECONDARY}>Xem chứng nhận</Link>}
      />
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && <ProgressBody data={data} />}
    </div>
  );
}

function ProgressBody({ data }: { data: PersonalProgress }) {
  return (
    <>
      <Card className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-5 md:p-8">
        <Stat label="Đáp ứng vị trí" value={`${data.coveragePercent}%`} hint="yêu cầu năng lực" />
        <Stat label="Thời gian học" value={formatHours(data.learnedMinutes)} />
        <Stat label="Bài học" value={data.lessonsCompleted} hint="đã hoàn thành" />
        <Stat label="Khóa học đạt" value={data.assessmentsPassed} hint="qua bài đánh giá" />
        <Stat label="Thực hành" value={data.tasksApproved} hint="bài được duyệt" />
      </Card>

      <section aria-labelledby="profile-title" className="grid gap-4">
        <SectionTitle id="profile-title" title="24 năng lực theo 6 miền" aside="Ô nét đứt: mức vị trí yêu cầu mà bạn chưa đạt" />
        <div className="grid gap-3 md:grid-cols-2">
          {data.profile.map((domain) => (
            <Card key={domain.number} className="p-6">
              <h3 className="flex items-baseline gap-3 text-[17px] tracking-[-0.01em]">
                <span className="font-landing-serif text-xl italic text-pt-fg-3">{domain.number}</span>
                {domain.name}
              </h3>
              <ul className="mt-4">
                {domain.items.map((item) => (
                  <li key={item.code} className="grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 border-t border-pt-line py-3">
                    <span className="pt-0.5 text-xs tabular-nums text-pt-fg-3">{item.code}</span>
                    <span className="min-w-0">
                      <span className={cn('block text-sm leading-snug', item.requiredLevel > 0 ? 'text-pt-fg' : 'text-pt-fg-2')}>{item.name}</span>
                      <span className="mt-0.5 block text-[11px] text-pt-fg-3">
                        {item.level > 0 ? `${levelLabelVi(item.level)} · ${item.source}${item.at ? ` · ${formatDate(item.at)}` : ''}` : 'Chưa có mức'}
                        {item.requiredLevel > 0 ? ` · cần ${levelLabelVi(item.requiredLevel)}` : ' · vị trí không yêu cầu'}
                      </span>
                    </span>
                    <LevelPips level={item.level} required={item.requiredLevel} className="pt-1" />
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="p-6 md:p-8 lg:col-span-7">
          <SectionTitle title="Cột mốc" aside={`${data.milestones.filter((m) => m.achievedAt).length}/${data.milestones.length} đã đạt`} />
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
