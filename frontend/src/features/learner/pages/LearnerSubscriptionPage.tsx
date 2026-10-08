import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePersonalAccess } from '@/hooks/use-personal-learning';
import { usePlanMode } from '@/hooks/use-plan-mode';
import { formatVnd, getPlan, plansFor } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { FreePlanCard, TrialPlanCard } from '../components/PlanOverviewCards';
import { Card, EmptyState, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PersonalPageHeader, Tag } from '../components/ui';
import { formatDate } from '../utils/format';

const STATUS_LABEL: Record<string, { label: string; tone: 'ok' | 'warn' | 'bad' | 'neutral' }> = {
  active: { label: 'Đang hoạt động', tone: 'ok' },
  trialing: { label: 'Dùng thử', tone: 'neutral' },
  payment_required: { label: 'Cần thanh toán', tone: 'bad' },
  expired: { label: 'Đã hết hạn', tone: 'bad' },
};

/** IND-17 "/personal/subscription": the learner's plan and the other individual plans. */
export function LearnerSubscriptionPage() {
  const subscription = useCurrentUser((state) => state.user?.subscription);
  const { data: access } = usePersonalAccess();
  const planMode = usePlanMode();
  const plan = getPlan(subscription?.planCode);
  const status = STATUS_LABEL[subscription?.status ?? ''] ?? { label: subscription?.status ?? '', tone: 'neutral' as const };

  return (
    <div data-testid="learner-subscription-page" className="grid gap-10">
      <PersonalPageHeader label="Gói & thanh toán" title="Gói học và quyền sử dụng" lead="Thông tin gói hiện tại, thời hạn và các quyền đang áp dụng cho tài khoản của bạn." />

      {access?.mode === 'trial' ? (
        <TrialPlanCard access={access} />
      ) : access?.mode === 'free' ? (
        <FreePlanCard />
      ) : planMode && planMode !== 'full' ? (
        // On a trial or the Free plan, but the access data is not here yet: wait rather than show the paid card.
        <LoadingBlock />
      ) : !subscription || !plan ? (
        <EmptyState
          title="Chưa có gói đang dùng"
          body="Chọn một gói cá nhân để mở lộ trình học và toàn bộ giáo trình."
          action={<Link to="/individual/pricing" className={PT_BUTTON}>Xem bảng giá</Link>}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <Card className="flex flex-col justify-between gap-8 p-7 md:p-9">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className={PT_EYEBROW}>Gói hiện tại</p>
                <Tag tone={status.tone}>{status.label}</Tag>
              </div>
              <p className="mt-4 text-[28px] font-semibold leading-tight tracking-tight">{plan.name}</p>
              <p className="mt-3 text-[15px] text-pt-fg-2">{plan.tagline}</p>
            </div>
            <dl className="grid grid-cols-2 gap-5 border-t border-pt-line pt-6 text-sm">
              <div>
                <dt className="text-xs text-pt-fg-3">Giá</dt>
                <dd className="mt-1">{plan.monthlyPrice ? `${formatVnd(plan.monthlyPrice)}/tháng` : 'Liên hệ'}</dd>
              </div>
              {subscription.renewsAt && (
                <div>
                  <dt className="text-xs text-pt-fg-3">{subscription.status === 'active' ? 'Gia hạn ngày' : 'Hết hạn ngày'}</dt>
                  <dd className="mt-1">{formatDate(subscription.renewsAt)}</dd>
                </div>
              )}
            </dl>
            <div className="flex flex-wrap gap-3">
              <Link to="/individual/pricing" className={PT_BUTTON}>Đổi gói</Link>
              <Link to="/personal/billing" className={PT_BUTTON_SECONDARY}>Lịch sử thanh toán</Link>
            </div>
          </Card>

          <Card className="p-7 md:p-9">
            <p className={PT_EYEBROW}>Gói của bạn gồm</p>
            <ul className="mt-5 grid gap-3">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-pt-fg-2"><Check className="mt-0.5 size-4 shrink-0 text-pt-fg" aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <div className="mt-8 grid gap-2 border-t border-pt-line pt-6">
              {plansFor('individual').map((other) => (
                <div key={other.code} className={cn('flex items-center justify-between rounded-xl px-3 py-2 text-sm', other.code === plan.code ? 'bg-pt-fg/8 text-pt-fg' : 'text-pt-fg-2')}>
                  <span>{other.name}{other.code === plan.code && <span className="ml-2 text-xs text-pt-fg-3">đang dùng</span>}</span>
                  <span className="tabular-nums">{other.monthlyPrice ? `${formatVnd(other.monthlyPrice)}/tháng` : 'Liên hệ'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
