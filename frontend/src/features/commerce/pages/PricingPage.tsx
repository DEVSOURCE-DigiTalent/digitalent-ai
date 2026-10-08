import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PublicShell } from '../../public/components/PublicShell';
import { rememberPortalChoice } from '../../portal/portal-preference';
import { plansFor, suggestPlanForUsers, type BillingCycle, type PlanAudience } from '@/lib/plans';
import { PlanCard } from '../components/PlanCard';
import { PlanComparison } from '../components/PlanComparison';
import { TrialStrip } from '../components/TrialStrip';
import { SALES_EMAIL } from '../sales-contact';
import { resolvePlanChoice } from '../resolve-plan-choice';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { purchaseService } from '@/services/purchase.service';
import type { PlanSelection } from '@/types/commerce';
import { getReferencePosition } from '@/lib/reference-positions';

const COPY: Record<PlanAudience, { title: string; lead: string; registerPath: string; loginPath: string; portal: 'enterprise' | 'individual' }> = {
  enterprise: {
    title: 'Chọn gói cho đội ngũ của bạn.',
    lead: 'Định mức quyền sử dụng rõ ràng. Mua theo năm tiết kiệm 20%. Mở rộng linh hoạt khi đội ngũ phát triển.',
    registerPath: '/business/register',
    loginPath: '/login',
    portal: 'enterprise',
  },
  individual: {
    title: 'Chọn gói phù hợp với mục tiêu của bạn.',
    lead: 'Chọn gói để có lộ trình học theo khoảng trống kỹ năng và hồ sơ năng lực cá nhân. Mua theo năm tiết kiệm 20%.',
    registerPath: '/individual/register',
    loginPath: '/login',
    portal: 'individual',
  },
};

function hasStoredToken(): boolean {
  try {
    return Boolean(localStorage.getItem('accessToken'));
  } catch {
    return false;
  }
}

interface PricingPageProps {
  audience: PlanAudience;
}

/** PUB-04 (enterprise) and PUB-05 (individual): compare plans, pick one, carry the choice into sign-up. */
export function PricingPage({ audience }: PricingPageProps) {
  const copy = COPY[audience];
  const plans = plansFor(audience);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useCurrentUser((s) => s.user);
  const refreshSession = useRefreshSession();
  // Default to annual pricing (annual-first)
  const [cycle, setCycle] = useState<BillingCycle>('year');
  const [projectedUsers, setProjectedUsers] = useState<string>('');
  const [notice, setNotice] = useState<string>();
  const reason = searchParams.get('reason');
  const fromTrial = audience === 'individual' && searchParams.get('source') === 'trial';
  const trialPosition = fromTrial ? getReferencePosition(searchParams.get('position') ?? '') : undefined;
  // A visitor with a stored token is a signed-in learner whose session is still loading: no trial strip for them.
  const showTrialStrip = audience === 'individual' && !user && !hasStoredToken();

  const projectedNum = Number(projectedUsers);
  const suggestedPlan = projectedNum > 0 ? suggestPlanForUsers(projectedNum, audience) : undefined;

  useEffect(() => {
    if (!user && localStorage.getItem('accessToken')) {
      refreshSession().catch(() => {});
    }
  }, [user, refreshSession]);

  const choose = async (selection: PlanSelection) => {
    rememberPortalChoice(copy.portal);
    let currentUser = user;
    if (!currentUser && localStorage.getItem('accessToken')) {
      try {
        currentUser = await refreshSession();
      } catch {
        // ignore
      }
    }
    const result = resolvePlanChoice(currentUser, selection, audience);

    if (result.type === 'contact') {
      window.location.href = `mailto:${result.email}?subject=Tu%20van%20goi%20doanh%20nghiep`;
      return;
    }

    if (result.type === 'register') {
      const trialQuery = fromTrial
        ? `&source=trial${trialPosition ? `&position=${encodeURIComponent(trialPosition.code)}` : ''}`
        : '';
      navigate(`${result.path}${trialQuery}`);
      return;
    }

    if (result.type === 'mismatch') {
      setNotice(result.message);
      return;
    }

    if (result.type === 'subscription') {
      navigate(result.path, { state: { notice: result.message } });
      return;
    }

    if (result.type === 'checkout') {
      try {
        const myDraft = (await purchaseService.getMyDraft()).data?.data;
        if (myDraft) {
          const updated = await purchaseService.updateDraft(myDraft.id, selection);
          navigate(`${result.path}?draft=${updated.data.data?.id}`);
        } else {
          const created = await purchaseService.createDraft(selection, audience, currentUser?.id);
          navigate(`${result.path}?draft=${created.data.data?.id}`);
        }
      } catch {
        navigate(result.path);
      }
    }
  };

  return (
    <PublicShell portal={copy.portal} width="wide">
      {fromTrial && (
        <div role="status" className="mx-auto mb-8 max-w-2xl rounded-2xl bg-emerald-500/10 px-5 py-3.5 text-center text-sm text-emerald-100 ring-1 ring-emerald-400/30">
          Bạn đã hoàn thành phần trải nghiệm{trialPosition ? ` cho vị trí ${trialPosition.name}` : ''}. Chọn gói để mở lộ trình đầy đủ; tiến độ thử không được dùng làm chứng nhận.
        </div>
      )}
      {reason === 'choose-plan' && (
        <div role="alert" className="mx-auto mb-8 max-w-lg rounded-2xl bg-amber-500/10 px-5 py-3.5 text-center text-sm font-medium text-amber-200 ring-1 ring-amber-400/30">
          Chọn một gói để tiếp tục đăng ký.
        </div>
      )}
      {notice && (
        <div role="alert" className="mx-auto mb-8 max-w-lg rounded-2xl bg-blue-500/10 px-5 py-3.5 text-center text-sm font-medium text-blue-200 ring-1 ring-blue-400/30">
          {notice}
        </div>
      )}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-cream-soft sm:text-xs">Bảng giá</p>
        <h1 className="mt-4 text-balance text-[clamp(28px,3.6vw,46px)] font-normal leading-[1.08] tracking-[-0.03em]">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-[52ch] text-pretty text-sm leading-[1.7] text-stone-400 sm:text-base">{copy.lead}</p>

        {/* Billing cycle tabs (Annual first) */}
        <div
          role="group"
          aria-label="Chu kỳ thanh toán"
          className={cn(
            'mt-7 inline-flex rounded-full border p-1 text-sm',
            audience === 'individual' ? 'border-pt-line bg-pt-panel' : 'border-amber-400/20 bg-landing-card'
          )}
        >
          {(['year', 'month'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={cycle === value}
              onClick={() => setCycle(value)}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 transition-all sm:px-5',
                cycle === value
                  ? 'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] font-semibold text-[#0C0E12] shadow-sm shadow-amber-500/20'
                  : audience === 'individual'
                    ? 'text-pt-fg-2 hover:text-pt-fg'
                    : 'text-cream/80 hover:text-cream'
              )}
            >
              {/* The saving sits in a small badge so the tab stays on one line on phones. */}
              {value === 'year' ? (
                <>
                  Theo năm
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-semibold', cycle === 'year' ? 'bg-black/15' : 'bg-amber-400/15 text-amber-300')}>
                    <span className="sr-only">Tiết kiệm </span>−20%
                  </span>
                </>
              ) : (
                'Theo tháng'
              )}
            </button>
          ))}
        </div>

        {/* Optional quick plan estimation without gating */}
        {audience === 'enterprise' && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-landing-card/60 p-3 ring-1 ring-amber-400/20 text-xs text-stone-300 flex items-center justify-between gap-3">
            <label htmlFor="projected-users" className="text-stone-300">
              Dự kiến số người sử dụng (tùy chọn):
            </label>
            <input
              id="projected-users"
              type="number"
              min={1}
              placeholder="VD: 35"
              value={projectedUsers}
              onChange={(e) => setProjectedUsers(e.target.value)}
              className="w-24 rounded-lg bg-landing-panel px-3 py-1 text-center text-sm text-cream ring-1 ring-amber-400/30 focus:outline-none focus:ring-amber-400 font-mono"
            />
          </div>
        )}
      </div>

      <ul className={`mx-auto mt-10 grid max-w-5xl gap-5 ${plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {plans.map((plan) => (
          <li key={plan.code}>
            <PlanCard
              plan={plan}
              cycle={cycle}
              onChoose={choose}
              salesEmail={SALES_EMAIL}
              isSuggested={suggestedPlan?.code === plan.code}
            />
          </li>
        ))}
      </ul>

      {showTrialStrip && <TrialStrip position={trialPosition?.code} />}

      <PlanComparison audience={audience} />
    </PublicShell>
  );
}
