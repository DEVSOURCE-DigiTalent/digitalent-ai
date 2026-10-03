import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicShell } from '../../public/components/PublicShell';
import { rememberPortalChoice } from '../../portal/portal-preference';
import { plansFor, type BillingCycle, type PlanAudience } from '@/lib/plans';
import { PlanCard } from '../components/PlanCard';
import { PlanComparison } from '../components/PlanComparison';
import { SALES_EMAIL } from '../sales-contact';
import { resolvePlanChoice } from '../resolve-plan-choice';
import { useCurrentUser } from '@/hooks/use-current-user';
import { purchaseService } from '@/services/purchase.service';
import type { PlanSelection } from '@/types/commerce';

const COPY: Record<PlanAudience, { title: string; lead: string; registerPath: string; loginPath: string; portal: 'enterprise' | 'individual' }> = {
  enterprise: {
    title: 'Chọn gói cho đội ngũ của bạn.',
    lead: 'Giá tính theo số ghế mỗi tháng. Mua theo năm tiết kiệm 20%. Có thể đổi gói khi nhu cầu thay đổi.',
    registerPath: '/business/register',
    loginPath: '/business/login',
    portal: 'enterprise',
  },
  individual: {
    title: 'Chọn gói phù hợp với mục tiêu của bạn.',
    lead: 'Chọn gói để có lộ trình học theo khoảng trống kỹ năng và hồ sơ năng lực cá nhân. Mua theo năm tiết kiệm 20%.',
    registerPath: '/individual/register',
    loginPath: '/individual/login',
    portal: 'individual',
  },
};

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
  const [cycle, setCycle] = useState<BillingCycle>('month');
  const [notice, setNotice] = useState<string>();
  const reason = searchParams.get('reason');

  const choose = async (selection: PlanSelection) => {
    rememberPortalChoice(copy.portal);
    const result = resolvePlanChoice(user, selection, audience);

    if (result.type === 'contact') {
      window.location.href = `mailto:${result.email}?subject=Tu%20van%20goi%20doanh%20nghiep`;
      return;
    }

    if (result.type === 'register') {
      navigate(result.path);
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
          navigate(`/checkout?draft=${updated.data.data?.id}`);
        } else {
          const created = await purchaseService.createDraft(selection, audience, user?.id);
          navigate(`/checkout?draft=${created.data.data?.id}`);
        }
      } catch {
        navigate('/checkout');
      }
    }
  };

  return (
    <PublicShell portal={copy.portal} width="wide">
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
        <h1 className="mt-5 text-balance text-[clamp(30px,5vw,56px)] font-normal leading-[1.05] tracking-[-0.03em]">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-pretty text-sm leading-[1.7] text-stone-400 sm:text-base">{copy.lead}</p>

        <div role="group" aria-label="Chu kỳ thanh toán" className="mt-8 inline-flex rounded-full bg-landing-card p-1 text-sm">
          {(['month', 'year'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={cycle === value}
              onClick={() => setCycle(value)}
              className={`rounded-full px-5 py-2 transition-colors ${cycle === value ? 'bg-cream-soft font-medium text-black' : 'text-cream/80 hover:text-cream'}`}
            >
              {value === 'month' ? 'Theo tháng' : 'Theo năm · -20%'}
            </button>
          ))}
        </div>
      </div>

      <ul className={`mx-auto mt-10 grid max-w-5xl gap-5 ${plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {plans.map((plan) => (
          <li key={plan.code}>
            <PlanCard plan={plan} cycle={cycle} onChoose={choose} salesEmail={SALES_EMAIL} />
          </li>
        ))}
      </ul>

      <PlanComparison audience={audience} />

      <p className="mt-10 text-center text-sm text-stone-400">
        Đã có tài khoản?{' '}
        <Link to={copy.loginPath} className="text-cream underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </PublicShell>
  );
}
