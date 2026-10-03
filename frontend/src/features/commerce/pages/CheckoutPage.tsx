import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PublicShell } from '../../public/components/PublicShell';
import { FormError, DARK_INPUT_CLASS, DARK_PRIMARY_BUTTON, DARK_SECONDARY_BUTTON } from '../../public/components/FormControls';
import { PlanSummary } from '../components/PlanSummary';
import { QrPaymentPanel } from '../components/QrPaymentPanel';
import { PurchaseStepper } from '../components/PurchaseStepper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { getHomePath } from '@/lib/navigation';
import { WORKSPACES, resolveWorkspace } from '@/lib/roles';
import { USE_MOCK } from '@/services/mock/mock-config';
import { checkoutService } from '@/services/checkout.service';
import { purchaseService } from '@/services/purchase.service';
import type { Order, PaymentOutcome, PlanSelection, PurchaseDraft } from '@/types/commerce';

function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}

/**
 * ENT-ONB-02: order summary and QR payment (simulated).
 * The plan comes from the PurchaseDraft (id in URL ?draft= or active draft on account).
 * URL is never the source of price.
 */
export function CheckoutPage() {
  const user = useCurrentUser((s) => s.user);
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get('draft');

  const draftQuery = useQuery({
    queryKey: ['checkout', 'draft', draftIdParam, user?.id],
    queryFn: async () => {
      if (draftIdParam) {
        try {
          return (await purchaseService.getDraft(draftIdParam)).data.data;
        } catch {
          // If draft not found by id, fallback to my draft
        }
      }
      return (await purchaseService.getMyDraft()).data.data;
    },
    enabled: Boolean(user && user.onboardingStatus === 'payment'),
  });

  const pendingPlanQuery = useQuery({
    queryKey: ['checkout', 'pending-plan', user?.id],
    queryFn: async () => (await checkoutService.getPendingPlan()).data.data,
    enabled: Boolean(user && user.onboardingStatus === 'payment' && !draftQuery.data && !draftQuery.isLoading),
  });

  // If visitor is not signed in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  const audience = resolveWorkspace(user) === WORKSPACES.PERSONAL ? 'individual' : 'enterprise';
  const pricingPath = audience === 'individual' ? '/individual/pricing' : '/business/pricing';

  // Only an account that still has to pay belongs here; everyone else moves forward
  if (user.onboardingStatus !== 'payment') {
    return <Navigate to={getHomePath(user)} replace />;
  }

  const draft = draftQuery.data;
  const pendingPlan = pendingPlanQuery.data;

  // Build canonical plan selection from the verified draft or pending plan
  const selection: PlanSelection | undefined = draft
    ? { planCode: draft.planCode, seats: draft.seats, cycle: draft.cycle }
    : pendingPlan ?? undefined;

  const isLoading = draftQuery.isLoading || (Boolean(!draft) && pendingPlanQuery.isLoading);

  if (!isLoading && !selection) {
    return <Navigate to={pricingPath} replace />;
  }

  return (
    <PublicShell portal={audience}>
      <div className="mb-6 space-y-6">
        <PurchaseStepper audience={audience} currentStep={3} changePlanPath={pricingPath} />
        <h1 className="text-[clamp(28px,4vw,40px)] font-normal leading-[1.1] tracking-[-0.03em]">Thanh toán</h1>
      </div>

      {selection ? (
        <CheckoutBody
          selection={selection}
          pricingPath={pricingPath}
          draft={draft ?? undefined}
          audience={audience}
        />
      ) : (
        <p className="mt-6 text-sm text-stone-400">Đang tải đơn hàng…</p>
      )}
    </PublicShell>
  );
}

interface CheckoutBodyProps {
  selection: PlanSelection;
  pricingPath: string;
  draft?: PurchaseDraft;
  audience: 'enterprise' | 'individual';
}

function CheckoutBody({ selection, pricingPath, draft, audience }: CheckoutBodyProps) {
  const user = useCurrentUser((s) => s.user)!;
  const refreshSession = useRefreshSession();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order>();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email);
  const [emailError, setEmailError] = useState<string>();
  const [emailSuccess, setEmailSuccess] = useState<string>();
  const started = useRef(false);

  const createOrder = useMutation({
    mutationFn: async () => (await checkoutService.createOrder(selection, draft?.id)).data.data!,
    onSuccess: setOrder,
  });

  const confirm = useMutation({
    mutationFn: async (outcome: PaymentOutcome) =>
      (await checkoutService.confirmPayment(order!.id, outcome)).data.data!,
    onSuccess: (updated) => navigate(`/checkout/result?order=${updated.id}`, { replace: true }),
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => (await checkoutService.updateEmail(email)).data.data!,
    onSuccess: async () => {
      await refreshSession();
      setEmailSuccess('Đã cập nhật email thành công.');
      setShowEmailDialog(false);
    },
    onError: (err) => {
      setEmailError(errorMessage(err));
    },
  });

  // Start order once
  const { mutate: startOrder } = createOrder;
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startOrder();
  }, [startOrder]);

  // Polling for non-mock bank updates
  const poll = useQuery({
    queryKey: ['checkout', 'order', order?.id, 'poll'],
    queryFn: async () => (await checkoutService.getOrder(order!.id)).data.data!,
    enabled: Boolean(order) && !USE_MOCK,
    refetchInterval: 4000,
  });
  const polledStatus = poll.data?.status;
  useEffect(() => {
    if (order && polledStatus && polledStatus !== 'pending') {
      navigate(`/checkout/result?order=${order.id}`, { replace: true });
    }
  }, [order, polledStatus, navigate]);

  const error = createOrder.error ?? confirm.error;

  return (
    <div className="mt-6 grid gap-5">
      <PlanSummary selection={selection} changeTo={pricingPath} />

      {/* P17: Seat billing note for enterprise */}
      {audience === 'enterprise' && (
        <p className="text-xs leading-[1.6] text-stone-400">
          Ghế được tính cho thành viên đang hoạt động và thành viên đã mời nhưng chưa kích hoạt.
        </p>
      )}

      {/* Account email & change email action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-landing-panel px-5 py-3.5 ring-1 ring-cream/10 text-sm">
        <div className="min-w-0">
          <span className="text-stone-400 text-xs block">Tài khoản nhận hóa đơn & quản trị:</span>
          <span className="font-medium text-cream truncate">{user.email}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewEmail(user.email);
            setEmailError(undefined);
            setShowEmailDialog(true);
          }}
          className="text-xs text-cream underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
        >
          Thay đổi
        </button>
      </div>

      {emailSuccess && (
        <p className="text-xs text-emerald-400">{emailSuccess}</p>
      )}

      {/* Change email dialog */}
      {showEmailDialog && (
        <div className="rounded-2xl border border-cream/20 bg-landing-panel p-5 ring-1 ring-cream/10 space-y-3">
          <h3 className="text-sm font-medium text-cream">Thay đổi email tài khoản</h3>
          <p className="text-xs text-stone-400">
            Email mới sẽ nhận thông tin thanh toán và liên kết xác minh tài khoản.
          </p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className={DARK_INPUT_CLASS}
            placeholder="email@congty.vn"
          />
          {emailError && <p className="text-xs text-red-300">{emailError}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowEmailDialog(false)}
              className={DARK_SECONDARY_BUTTON}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => updateEmailMutation.mutate(newEmail)}
              disabled={updateEmailMutation.isPending || !newEmail.trim()}
              className={DARK_PRIMARY_BUTTON}
            >
              {updateEmailMutation.isPending ? 'Đang lưu…' : 'Cập nhật email'}
            </button>
          </div>
        </div>
      )}

      <FormError message={error ? errorMessage(error) : undefined} />

      {order ? (
        <QrPaymentPanel
          order={order}
          busy={confirm.isPending}
          regenerating={createOrder.isPending}
          onSimulate={(outcome) => confirm.mutate(outcome)}
          onRegenerate={() => createOrder.mutate()}
        />
      ) : (
        !error && <p className="text-sm text-stone-400">Đang tạo mã thanh toán…</p>
      )}
    </div>
  );
}
