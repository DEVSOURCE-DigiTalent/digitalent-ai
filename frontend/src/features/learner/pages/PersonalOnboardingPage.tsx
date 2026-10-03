import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Compass, Sparkles } from 'lucide-react';
import { PurchaseStepper } from '../../commerce/components/PurchaseStepper';
import { PublicShell } from '../../public/components/PublicShell';
import {
  REFERENCE_POSITIONS,
  getReferencePosition,
} from '@/lib/reference-positions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { useSetPersonalTarget } from '@/hooks/use-personal-learning';
import { DARK_PRIMARY_BUTTON, DARK_SECONDARY_BUTTON } from '../../public/components/FormControls';

export function PersonalOnboardingPage() {
  const user = useCurrentUser((s) => s.user);
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();
  const setTarget = useSetPersonalTarget();

  const [selectedCode, setSelectedCode] = useState<string>('MARKETING');
  const [step, setStep] = useState<'choose-target' | 'choose-action'>('choose-target');
  const [errorMsg, setErrorMsg] = useState<string>();

  if (!user) return <Navigate to="/login" replace />;

  if (user.workspace !== 'personal') {
    return <Navigate to="/portal" replace />;
  }

  // If user hasn't paid yet, redirect to checkout
  if (user.onboardingStatus === 'payment') {
    return <Navigate to="/checkout" replace />;
  }

  const selectedPosition = getReferencePosition(selectedCode) || REFERENCE_POSITIONS[0];

  const handleSaveTarget = async () => {
    setErrorMsg(undefined);
    try {
      await setTarget.mutateAsync(selectedCode);
      await refreshSession();
      setStep('choose-action');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu vị trí mục tiêu.');
    }
  };

  return (
    <PublicShell portal="individual" width="wide">
      <div className="mb-8 space-y-6">
        <PurchaseStepper audience="individual" currentStep={4} />
        <div>
          <h1 className="text-[clamp(28px,4vw,36px)] font-normal leading-[1.15] tracking-[-0.03em] text-cream">
            {step === 'choose-target' ? 'Chọn vị trí mục tiêu nghề nghiệp' : 'Sẵn sàng bắt đầu lộ trình học'}
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            {step === 'choose-target'
              ? 'Lộ trình và các bài đánh giá của bạn sẽ được thiết kế riêng theo vị trí đã chọn. Bạn có thể đổi vị trí bất kỳ lúc nào.'
              : 'Bạn đã chọn vị trí mục tiêu thành công. Hãy chọn bước tiếp theo.'}
          </p>
        </div>
      </div>

      {step === 'choose-target' ? (
        <div className="space-y-8">
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
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
                  className={`flex flex-col justify-between rounded-3xl p-6 transition-all cursor-pointer ring-1 ${
                    isSelected
                      ? 'bg-landing-card ring-cream text-cream shadow-lg'
                      : 'bg-landing-panel ring-cream/10 text-stone-400 hover:text-cream hover:ring-cream/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">{pos.code}</span>
                      {isSelected && (
                        <span className="grid size-6 place-items-center rounded-full bg-cream text-black">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-cream">{pos.name}</h2>
                    <p className="text-xs leading-relaxed text-stone-400">{pos.description}</p>
                  </div>

                  <div className="mt-5 border-t border-cream/10 pt-3 text-xs text-stone-400 flex items-center justify-between">
                    <span>{pos.levels.filter((l) => l > 0).length} năng lực TT02</span>
                    <span className="text-cream underline">Chọn vị trí</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Nút xác nhận lưu vị trí */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-landing-panel p-6 ring-1 ring-cream/10">
            <div>
              <p className="text-sm font-medium text-cream">
                Vị trí đã chọn: <span className="text-cream-soft">{selectedPosition.name}</span>
              </p>
              <p className="text-xs text-stone-400">
                {selectedPosition.levels.filter((l) => l > 0).length} năng lực yêu cầu theo chuẩn TT02/2025.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveTarget}
              disabled={setTarget.isPending}
              className={DARK_PRIMARY_BUTTON}
            >
              {setTarget.isPending ? 'Đang lưu…' : 'Xác nhận và tiếp tục'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Bước 2: Chọn làm đánh giá đầu vào hoặc vào dashboard */
        <div className="mx-auto max-w-2xl rounded-3xl bg-landing-panel p-8 ring-1 ring-cream/15 text-center space-y-8">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-cream-soft/10 text-cream ring-1 ring-cream/20">
            <Sparkles className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-normal text-cream">Bạn muốn bắt đầu như thế nào?</h2>
            <p className="text-sm text-stone-400 max-w-[44ch] mx-auto leading-relaxed">
              Bài đánh giá đầu vào (18 câu hỏi trắc nghiệm ngắn) giúp hệ thống nhận diện chính xác các năng lực bạn đã có,
              tránh học lại những gì bạn đã thành thạo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div
              onClick={() => navigate('/personal/diagnostic', { replace: true })}
              className="rounded-2xl border border-cream/30 bg-landing-card p-6 cursor-pointer hover:border-cream transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cream font-medium">
                  <Compass className="size-5 text-cream-soft" />
                  <span>Đánh giá đầu vào ngay</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Mất khoảng 10 phút. Nhận ngay radar khoảng trống năng lực số và lộ trình học tối ưu hóa.
                </p>
              </div>
              <button type="button" className={DARK_PRIMARY_BUTTON}>
                Bắt đầu đánh giá
              </button>
            </div>

            <div
              onClick={() => navigate('/personal/dashboard', { replace: true })}
              className="rounded-2xl border border-cream/15 bg-landing-card p-6 cursor-pointer hover:border-cream/40 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-300 font-medium">
                  <span>Để sau, vào trang chính</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Xem tổng quan các khóa học và giao diện cá nhân. Bạn có thể làm bài đánh giá bất cứ lúc nào.
                </p>
              </div>
              <button type="button" className={DARK_SECONDARY_BUTTON}>
                Vào khu cá nhân
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicShell>
  );
}
