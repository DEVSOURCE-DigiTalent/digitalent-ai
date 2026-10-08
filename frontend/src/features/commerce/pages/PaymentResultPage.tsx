import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { PublicShell } from '../../public/components/PublicShell';
import { DARK_PRIMARY_BUTTON, DARK_SECONDARY_BUTTON } from '../../public/components/FormControls';
import { PurchaseStepper } from '../components/PurchaseStepper';
import { trackTrialEvent } from '../../experience/individual-trial/individual-trial-tracker';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { PERSONAL_KEYS } from '@/hooks/use-personal-learning';
import type { PersonalAccess } from '@/services/personal-learning.service';
import { resolveNextStep } from '@/lib/navigation';
import { isIndividualUpgrader } from '@/lib/personal-access';
import { WORKSPACES, resolveWorkspace } from '@/lib/roles';
import { formatVnd, getPlan } from '@/lib/plans';
import { USE_MOCK } from '@/services/mock/mock-config';
import { checkoutService } from '@/services/checkout.service';

/** ENT-ONB-03: what happened to the payment, and where to go next. Read-only status display. */
export function PaymentResultPage() {
  const user = useCurrentUser((s) => s.user)!;
  const navigate = useNavigate();
  const refreshSessionOnly = useRefreshSession();
  const queryClient = useQueryClient();
  // A payment changes the plan, so what the personal pages cached (plan badge, trial panel, certificates) is dropped:
  // the workspace then loads it again instead of showing the old plan for a moment.
  const refreshSession = useCallback(async () => {
    const fresh = await refreshSessionOnly();
    queryClient.removeQueries({ queryKey: ['personal'] });
    return fresh;
  }, [refreshSessionOnly, queryClient]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [refreshFailed, setRefreshFailed] = useState(false);
  // Plan the learner paid from, read when the page opens (after the session reloads they are a paying learner):
  // what the server last said about the plan, else what the session says.
  const [paidFrom] = useState<'trial' | 'free' | null>(() => {
    if (!isIndividualUpgrader(user)) return null;
    const known = queryClient.getQueryData<PersonalAccess>(PERSONAL_KEYS.access)?.mode;
    if (known === 'trial' || known === 'free') return known;
    return user.subscription?.status === 'trialing' ? 'trial' : 'free';
  });
  const conversionTracked = useRef(false);
  const audience = resolveWorkspace(user) === WORKSPACES.PERSONAL ? 'individual' : 'enterprise';

  const orderQuery = useQuery({
    queryKey: ['checkout', 'order', orderId],
    queryFn: async () => (await checkoutService.getOrder(orderId!)).data.data!,
    enabled: Boolean(orderId),
    retry: false,
  });
  const order = orderQuery.data;

  // A paid order changed the account (plan, onboarding status): reload the session once.
  const status = order?.status;
  useEffect(() => {
    if (status === 'paid') refreshSession().catch(() => setRefreshFailed(true));
  }, [status, refreshSession]);

  useEffect(() => {
    if (!order || order.status !== 'paid' || !paidFrom || conversionTracked.current) return;
    conversionTracked.current = true;
    trackTrialEvent('trial_converted', { mode: paidFrom, planCode: order.planCode, cycle: order.cycle });
  }, [order, paidFrom]);

  const settle = useMutation({
    mutationFn: async () => (await checkoutService.confirmPayment(orderId!, 'paid')).data.data!,
    onSuccess: () => orderQuery.refetch(),
  });

  if (!orderId || orderQuery.isError) {
    return <Navigate to={user ? resolveNextStep(user) : '/checkout'} replace />;
  }

  const plan = getPlan(order?.planCode);
  // A trial or Free learner already has a position: before the session reloads they still look like one, after it
  // they are paying with no onboarding step left.
  const upgraded = audience === 'individual' && (isIndividualUpgrader(user) || !user.onboardingStatus);
  const nextStep =
    audience === 'enterprise'
      ? 'Tiếp theo: thiết lập tổ chức và phân quyền nhân sự.'
      : upgraded
        ? 'Hồ sơ, tiến độ học và các chứng nhận chờ cấp được giữ nguyên.'
        : 'Tiếp theo: chọn vị trí mục tiêu theo Khung chuẩn năng lực số.';

  const currentStep = audience === 'enterprise' ? 4 : 3;

  return (
    <PublicShell portal={audience}>
      <PurchaseStepper audience={audience} currentStep={currentStep} className="mb-6" />

      {!order ? (
        <p className="mt-6 text-sm text-stone-400">Đang kiểm tra thanh toán…</p>
      ) : order.status === 'paid' ? (
        <ResultCard
          icon={<CheckCircle2 className="size-8 text-emerald-300" aria-hidden="true" />}
          title="Thanh toán thành công"
          body={`Gói ${plan?.name ?? ''} đã được kích hoạt (${formatVnd(order.amount)}). ${nextStep}`}
        >
          <button
            type="button"
            className={DARK_PRIMARY_BUTTON}
            onClick={async () => {
              try {
                await refreshSession();
                setRefreshFailed(false);
              } catch {
                setRefreshFailed(true);
                return;
              }
              const fresh = useCurrentUser.getState().user;
              navigate(fresh ? resolveNextStep(fresh) : '/', { replace: true });
            }}
          >
            {audience === 'enterprise' ? 'Tiến hành thiết lập tổ chức' : upgraded ? 'Vào không gian học tập' : 'Bắt đầu thiết lập lộ trình'}
          </button>
          {refreshFailed && (
            <p role="alert" className="text-sm text-red-300">
              Thanh toán đã được ghi nhận nhưng chưa tải lại được tài khoản. Hãy bấm "Tiếp tục" để thử lại.
            </p>
          )}
        </ResultCard>
      ) : order.status === 'failed' ? (
        <ResultCard
          icon={<XCircle className="size-8 text-red-300" aria-hidden="true" />}
          title="Thanh toán không thành công"
          body="Giao dịch chưa được ghi nhận và bạn chưa bị trừ tiền. Hãy thử lại với một mã QR mới."
        >
          <Link to="/checkout" replace className={DARK_PRIMARY_BUTTON}>
            Thử thanh toán lại
          </Link>
        </ResultCard>
      ) : order.status === 'expired' ? (
        <ResultCard
          icon={<XCircle className="size-8 text-amber-300" aria-hidden="true" />}
          title="Mã thanh toán đã hết hạn"
          body="Mã QR thanh toán này đã hết hạn hiệu lực 15 phút. Bạn có thể tạo mã mới để tiếp tục thanh toán."
        >
          <Link to="/checkout" replace className={DARK_PRIMARY_BUTTON}>
            Tạo mã thanh toán mới
          </Link>
        </ResultCard>
      ) : (
        <ResultCard
          icon={<Clock className="size-8 text-amber-200" aria-hidden="true" />}
          title="Đang chờ ngân hàng xác nhận"
          body="Chúng tôi chưa nhận được thông báo thanh toán. Thường mất vài phút; bạn có thể kiểm tra lại bất cứ lúc nào."
        >
          <button
            type="button"
            className={DARK_PRIMARY_BUTTON}
            onClick={() => orderQuery.refetch()}
            disabled={orderQuery.isFetching}
          >
            {orderQuery.isFetching ? 'Đang kiểm tra…' : 'Kiểm tra lại'}
          </button>
          {USE_MOCK && (
            <button
              type="button"
              className={DARK_SECONDARY_BUTTON}
              onClick={() => settle.mutate()}
              disabled={settle.isPending}
            >
              Giả lập: ngân hàng đã xác nhận
            </button>
          )}
        </ResultCard>
      )}
    </PublicShell>
  );
}

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}

function ResultCard({ icon, title, body, children }: ResultCardProps) {
  return (
    <section className="relative overflow-hidden mt-6 rounded-3xl bg-landing-panel p-8 text-center ring-1 ring-amber-400/20 shadow-2xl shadow-black/40" aria-live="polite">
      {/* Ambient amber glow */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 size-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-landing-card ring-1 ring-amber-400/25 shadow-lg shadow-black/30">{icon}</div>
      <h1 className="mt-5 text-2xl font-normal tracking-[-0.02em] text-cream">{title}</h1>
      <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-[1.65] text-stone-300">{body}</p>
      <div className="mt-7 grid gap-3">{children}</div>
    </section>
  );
}
