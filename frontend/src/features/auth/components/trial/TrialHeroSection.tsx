import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass } from 'lucide-react';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';
import { TrialLiveSimulator } from './TrialLiveSimulator';

interface PositionInfo {
  code: string;
  name: string;
}

interface TrialHeroSectionProps {
  position?: PositionInfo;
  fromTry?: boolean;
  formNode: ReactNode;
  formRef?: React.RefObject<HTMLDivElement | null>;
}

export function TrialHeroSection({
  position,
  fromTry = false,
  formNode,
  formRef,
}: TrialHeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Dynamic ambient background glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(245,202,101,0.12)_0%,rgba(121,224,194,0.06)_45%,transparent_75%)] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Registration Card & Copy */}
          <div ref={formRef} className="lg:col-span-6 xl:col-span-6 space-y-6">
            {/* Header copy */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-[#F5CA65] shadow-xs">
                <Sparkles className="size-3.5" />
                <span>Dùng thử {INDIVIDUAL_TRIAL.days} ngày</span>
                <span className="size-1 rounded-full bg-amber-400" />
                <span className="text-cream-soft font-normal">Không cần thẻ tín dụng</span>
              </div>

              <h1 className="text-3xl font-medium tracking-tight text-cream sm:text-4xl lg:text-[44px] leading-[1.15]">
                Tạo tài khoản dùng thử
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
                Học theo lộ trình của riêng bạn. Không cần thẻ, không tự gia hạn.
              </p>
            </div>

            {/* Target Position Pill (if selected) */}
            {position && (
              <div className="flex items-center justify-between rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-amber-400/20 text-[#F5CA65]">
                    <Compass className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      Vị trí mục tiêu
                    </span>
                    <span className="font-semibold text-cream text-xs sm:text-sm">
                      {position.name}
                      {fromTry && <span className="font-normal text-amber-200/90 ml-1.5">· từ bài thử</span>}
                    </span>
                  </div>
                </div>

                <Link
                  to="/individual/pricing"
                  className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 transition-colors"
                >
                  Đổi vị trí
                </Link>
              </div>
            )}

            {/* Main Form Box */}
            <div className="rounded-3xl border border-white/10 bg-[#091D24]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 space-y-5">
              {formNode}

              <div className="pt-2 text-center text-xs text-stone-400">
                Muốn mua ngay?{' '}
                <Link
                  to="/individual/pricing"
                  className="text-amber-300 font-medium underline underline-offset-4 hover:text-amber-200"
                >
                  Xem bảng giá
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Workspace Simulator */}
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24">
            <TrialLiveSimulator positionName={position?.name} fromTry={fromTry} />
          </div>
        </div>
      </div>
    </section>
  );
}
