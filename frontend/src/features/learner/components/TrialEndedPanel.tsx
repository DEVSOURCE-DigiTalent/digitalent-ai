import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { useMarkSeen, usePersonalAccess, usePersonalProgress } from '@/hooks/use-personal-learning';
import { trackTrialEventOnce } from '@/features/experience/individual-trial/individual-trial-tracker';
import { IND_FREE_KEEPS, IND_FREE_LOCKED, getPlan } from '@/lib/plans';
import type { PersonalAccess, PersonalProgress } from '@/services/personal-learning.service';
import { formatDate } from '../utils/format';
import { Card, LoadingBlock, PT_BUTTON_SECONDARY } from './ui';
import { UpgradeLink } from './UpgradeLink';

/** "149.000đ/tháng", read from the plan catalog, so a price change shows here by itself. */
function monthlyPriceOf(planCode: string): string {
  const price = getPlan(planCode)?.monthlyPrice;
  return price ? `${new Intl.NumberFormat('vi-VN').format(price)}đ/tháng` : '';
}

/** What the learner did in the trial, from their own data (spec §8.13). Empty when they did nothing. */
function summaryOf(access: PersonalAccess, progress: PersonalProgress | undefined): string[] {
  const lines: string[] = [];
  const assessedAt = progress?.milestones.find((milestone) => milestone.id === 'diagnostic')?.achievedAt;
  if (assessedAt) lines.push(`Đã đánh giá đầu vào ngày ${formatDate(assessedAt)}`);
  const courses = access.trialCourseIds.length;
  const passed = progress?.assessmentsPassed ?? 0;
  if (courses > 0) lines.push(`Đã học ${courses} khóa, qua ${passed} bài đánh giá`);
  const raised = progress?.profile
    .filter((domain) => domain.items.some((item) => item.source?.startsWith('Khóa')))
    .map((domain) => domain.name) ?? [];
  if (raised.length > 0) lines.push(`Mức đã tăng ở: ${raised.join(', ')}`);
  if (access.pendingCertificates > 0) lines.push(`${access.pendingCertificates} chứng nhận chờ cấp`);
  return lines;
}

/**
 * First thing on the dashboard after a trial ended: what the learner did, what stays and what opens with an upgrade.
 * Closed with "Tiếp tục với gói Miễn phí"; the server remembers it, so it appears once (spec §8.13).
 */
export function TrialEndedPanel() {
  const { data: access } = usePersonalAccess();
  if (access?.mode !== 'free' || access.seen['trial-ended']) return null;
  return <EndedBody access={access} />;
}

/** Split from the gate so a paying learner never loads the progress this summary needs. */
function EndedBody({ access }: { access: PersonalAccess }) {
  const { data: progress, isLoading } = usePersonalProgress();
  const markSeen = useMarkSeen();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackTrialEventOnce('trial_expired', 'trial_expired', { checklistDone: access.checklist.filter((item) => item.done).length });
  }, [access]);

  const summary = summaryOf(access, progress);
  const price = monthlyPriceOf('IND_PLUS');

  return (
    <Card as="section" aria-labelledby="trial-ended-title" className="grid gap-6 border-[#E5A93C]/50 p-6 md:p-8">
      <div>
        <h2 id="trial-ended-title" className="text-2xl font-semibold tracking-tight">Kỳ dùng thử đã kết thúc</h2>
        {isLoading ? (
          <LoadingBlock label="Đang tổng hợp kết quả dùng thử…" className="mt-4" />
        ) : summary.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {summary.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-pt-fg-2">
                <Check className="mt-0.5 size-4 shrink-0 text-pt-ok" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[60ch] text-sm text-pt-fg-2">
              Bạn chưa làm bài đánh giá. Gói Miễn phí vẫn cho bạn làm bài này để biết mức của mình.
            </p>
            <Link to="/personal/diagnostic" className={PT_BUTTON_SECONDARY}>Làm bài đánh giá</Link>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="trial-ended-keeps">
          <h3 id="trial-ended-keeps" className="text-sm font-semibold text-pt-fg">Bạn vẫn có</h3>
          <ul className="mt-3 grid gap-2">
            {IND_FREE_KEEPS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-pt-fg-2">
                <Check className="mt-0.5 size-4 shrink-0 text-pt-ok" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="trial-ended-locked">
          <h3 id="trial-ended-locked" className="text-sm font-semibold text-pt-fg">Mở khi nâng cấp</h3>
          <ul className="mt-3 grid gap-2">
            {IND_FREE_LOCKED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-pt-fg-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <UpgradeLink placement="trial-ended">Nâng cấp Plus{price && ` · ${price}`}</UpgradeLink>
        <button type="button" onClick={() => markSeen.mutate('trial-ended')} className={PT_BUTTON_SECONDARY}>
          Tiếp tục với gói Miễn phí
        </button>
      </div>
    </Card>
  );
}
