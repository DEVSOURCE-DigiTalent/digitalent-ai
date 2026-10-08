import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Compass, Sparkles } from 'lucide-react';
import { PurchaseStepper } from '../../commerce/components/PurchaseStepper';
import { TrialTermsCard } from '../../auth/components/TrialTermsCard';
import { PublicShell } from '../../public/components/PublicShell';
import {
  REFERENCE_POSITIONS,
  getReferencePosition,
} from '@/lib/reference-positions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { usePersonalAccess, usePersonalOverview, useSetPersonalTarget } from '@/hooks/use-personal-learning';
import { formatDmy } from '@/lib/personal-access';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { LoadingBlock, PT_BUTTON, PT_BUTTON_GOLD, PT_BUTTON_SECONDARY } from '../components/ui';

export function PersonalOnboardingPage() {
  const user = useCurrentUser((s) => s.user);
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();
  const setTarget = useSetPersonalTarget();

  const overview = usePersonalOverview();
  const { data: access } = usePersonalAccess();

  const [selectedCode, setSelectedCode] = useState<string>('MARKETING');
  const [chosenStep, setStep] = useState<'choose-target' | 'choose-action' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [targetSaved, setTargetSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  if (user.workspace !== 'personal') {
    return <Navigate to="/portal" replace />;
  }

  // If user hasn't paid yet, redirect to checkout
  if (user.onboardingStatus === 'payment') {
    return <Navigate to="/checkout" replace />;
  }

  // A learner who arrives with a position (carried over from the quick try) skips the choice.
  const knownCode = overview.data?.target?.code;
  const step = chosenStep ?? (knownCode ? 'choose-action' : 'choose-target');
  // The session already says "trial" at the first render, so the page does not flash the purchase steps first.
  const trialSession = user.subscription?.status === 'trialing';
  const isTrial = trialSession || access?.mode === 'trial';
  const trialEndsAt = access?.trialEndsAt ?? user.subscription?.trialEndsAt;
  const selectedPosition = getReferencePosition(selectedCode) || REFERENCE_POSITIONS[0];

  const handleSaveTarget = async () => {
    setErrorMsg(undefined);
    try {
      await setTarget.mutateAsync(selectedCode);
      await refreshSession();
      setTargetSaved(true);
      setStep('choose-action');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu vị trí mục tiêu.');
    }
  };

  /**
   * Leaves onboarding for `to`. A position that came with the account was never saved by this page, and saving it
   * is what ends the onboarding step on the server, so it is confirmed here (the same position: not a change).
   */
  const finish = async (to: string) => {
    setErrorMsg(undefined);
    try {
      if (!targetSaved && knownCode) {
        await setTarget.mutateAsync(knownCode);
        await refreshSession();
      }
      navigate(to, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu vị trí mục tiêu.');
    }
  };

  return (
    <PublicShell portal="individual" width="wide">
      <div className="mb-8 space-y-6">
        {!isTrial && <PurchaseStepper audience="individual" currentStep={4} />}
        {isTrial && (
          <TrialTermsCard
            variant="themed"
            heading={`Kỳ dùng thử của bạn: đến ${trialEndsAt ? formatDmy(trialEndsAt) : ''} (${INDIVIDUAL_TRIAL.days} ngày)`}
          />
        )}
        <div>
          <h1 className="text-[clamp(28px,4vw,36px)] font-normal leading-[1.15] tracking-[-0.03em] text-pt-fg">
            {step === 'choose-target' ? 'Chọn vị trí mục tiêu nghề nghiệp' : 'Sẵn sàng bắt đầu lộ trình học'}
          </h1>
          <p className="mt-2 text-sm text-pt-fg-2">
            {step === 'choose-target'
              ? isTrial
                ? `Lộ trình và các bài đánh giá của bạn sẽ được thiết kế riêng theo vị trí đã chọn. Trong kỳ dùng thử, bạn đổi được vị trí thêm ${INDIVIDUAL_TRIAL.targetChanges} lần.`
                : 'Lộ trình và các bài đánh giá của bạn sẽ được thiết kế riêng theo vị trí đã chọn. Bạn có thể đổi vị trí bất kỳ lúc nào.'
              : 'Bạn đã chọn vị trí mục tiêu thành công. Hãy chọn bước tiếp theo.'}
          </p>
        </div>
      </div>

      {/* Only a trial account can arrive with a position, so only it waits for the answer; a buyer sees the choice at once. */}
      {trialSession && overview.isLoading ? (
        <LoadingBlock />
      ) : step === 'choose-target' ? (
        <div className="space-y-8">
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-pt-bad/30 bg-pt-bad/10 p-4 text-sm text-pt-bad">
              {errorMsg}
            </div>
          )}

          {/* Danh mục vị trí tham chiếu */}
          <div
            role="radiogroup"
            aria-label="Chọn vị trí mục tiêu"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {REFERENCE_POSITIONS.map((pos) => {
              const isSelected = pos.code === selectedCode;
              return (
                <article
                  key={pos.code}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setSelectedCode(pos.code)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') setSelectedCode(pos.code);
                  }}
                  className={`flex flex-col justify-between rounded-3xl p-6 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400/60 bg-amber-400/10 ring-2 ring-amber-400/50 text-pt-fg shadow-lg shadow-amber-500/10'
                      : 'border-pt-line bg-pt-panel text-pt-fg-2 hover:text-pt-fg hover:border-amber-400/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-pt-fg-3 uppercase tracking-wider">{pos.code}</span>
                      {isSelected && (
                        <span className="grid size-6 place-items-center rounded-full bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] shadow-sm shadow-amber-500/20">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-pt-fg">{pos.name}</h2>
                    <p className="text-xs leading-relaxed text-pt-fg-2">{pos.description}</p>
                  </div>

                  <div className="mt-5 border-t border-pt-line pt-3 text-xs text-pt-fg-3 flex items-center justify-between">
                    <span>{pos.levels.filter((l) => l > 0).length} năng lực TT02</span>
                    <span className="text-[#F5CA65] font-medium underline">Chọn vị trí</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Nút xác nhận lưu vị trí */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-pt-panel p-6 border border-amber-400/20">
            <div>
              <p className="text-sm font-medium text-pt-fg">
                Vị trí đã chọn: <span className="text-[#F5CA65] font-semibold">{selectedPosition.name}</span>
              </p>
              <p className="text-xs text-pt-fg-3">
                {selectedPosition.levels.filter((l) => l > 0).length} năng lực yêu cầu theo Khung chuẩn năng lực số.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveTarget}
              disabled={setTarget.isPending}
              className={PT_BUTTON}
            >
              {setTarget.isPending ? 'Đang lưu…' : 'Xác nhận và tiếp tục'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Bước 2: Chọn làm đánh giá đầu vào hoặc vào dashboard */
        isTrial ? (
          <TrialStartActions errorMsg={errorMsg} busy={setTarget.isPending} onFinish={finish} />
        ) : (
        <div className="mx-auto max-w-2xl rounded-3xl bg-pt-panel p-8 border border-amber-400/20 text-center space-y-8">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-400/15 text-[#F5CA65] ring-1 ring-amber-400/30">
            <Sparkles className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-normal text-pt-fg">Bạn muốn bắt đầu như thế nào?</h2>
            <p className="text-sm text-pt-fg-2 max-w-[44ch] mx-auto leading-relaxed">
              Bài đánh giá đầu vào (18 câu hỏi trắc nghiệm ngắn) giúp hệ thống nhận diện chính xác các năng lực bạn đã có,
              tránh học lại những gì bạn đã thành thạo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div
              onClick={() => navigate('/personal/diagnostic', { replace: true })}
              className="rounded-2xl border border-amber-400/50 bg-pt-card p-6 cursor-pointer hover:shadow-xl shadow-amber-500/10 transition-all space-y-3 flex flex-col justify-between ring-1 ring-amber-400/30"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-pt-fg font-medium">
                  <Compass className="size-5 text-[#F5CA65]" />
                  <span>Đánh giá đầu vào ngay</span>
                </div>
                <p className="text-xs text-pt-fg-2 leading-relaxed">
                  Mất khoảng 10 phút. Nhận ngay radar khoảng trống năng lực số và lộ trình học tối ưu hóa.
                </p>
              </div>
              <button type="button" className={PT_BUTTON}>
                Bắt đầu đánh giá
              </button>
            </div>

            <div
              onClick={() => navigate('/personal/dashboard', { replace: true })}
              className="rounded-2xl border border-pt-line bg-pt-card p-6 cursor-pointer hover:border-pt-line-strong transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-pt-fg-2 font-medium">
                  <span>Để sau, vào trang chính</span>
                </div>
                <p className="text-xs text-pt-fg-3 leading-relaxed">
                  Xem tổng quan các khóa học và giao diện cá nhân. Bạn có thể làm bài đánh giá bất cứ lúc nào.
                </p>
              </div>
              <button type="button" className={PT_BUTTON_SECONDARY}>
                Vào khu cá nhân
              </button>
            </div>
          </div>
        </div>
        )
      )}
    </PublicShell>
  );
}

/** Second onboarding step of a trial account: take the entry assessment now or look around first (spec §8.4). */
function TrialStartActions({ errorMsg, busy, onFinish }: { errorMsg?: string; busy: boolean; onFinish: (to: string) => void }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-6 rounded-3xl border border-pt-line bg-pt-panel p-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-normal text-pt-fg">Bạn muốn bắt đầu như thế nào?</h2>
        <p className="mx-auto max-w-[46ch] text-sm leading-relaxed text-pt-fg-2">
          Bài đánh giá đầu vào (18 câu trắc nghiệm ngắn) cho biết mức của bạn ở 6 miền, để lộ trình bỏ qua những gì bạn đã nắm.
        </p>
      </div>
      {errorMsg && <p role="alert" className="text-sm text-pt-bad">{errorMsg}</p>}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" disabled={busy} onClick={() => onFinish('/personal/diagnostic')} className={PT_BUTTON_GOLD}>
          <span className="text-center">Làm bài đánh giá đầu vào <span className="whitespace-nowrap font-normal opacity-80">(~10 phút)</span></span>
        </button>
        <button type="button" disabled={busy} onClick={() => onFinish('/personal/dashboard')} className={PT_BUTTON_SECONDARY}>
          Vào tổng quan
        </button>
      </div>
    </div>
  );
}
