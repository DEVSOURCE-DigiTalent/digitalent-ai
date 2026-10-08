import { Sparkles, ArrowUp } from 'lucide-react';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';

interface TrialCtaBannerProps {
  onScrollToForm: () => void;
}

export function TrialCtaBanner({ onScrollToForm }: TrialCtaBannerProps) {
  return (
    <section className="relative py-16 border-t border-cream/10 bg-[#06141a] overflow-hidden">
      {/* Background ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,202,101,0.12)_0%,rgba(121,224,194,0.05)_45%,transparent_75%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-semibold text-[#F5CA65]">
          <Sparkles className="size-3.5" />
          <span>Trải nghiệm không rủi ro · {INDIVIDUAL_TRIAL.days} ngày trọn vẹn</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-cream">
          Sẵn sàng khám phá tiềm năng kỹ năng số của bạn?
        </h2>

        <p className="mx-auto max-w-xl text-xs sm:text-sm text-stone-300 leading-relaxed">
          Đăng ký trong 30 giây mà không cần thẻ tín dụng. Trải nghiệm 3 khóa học thực chiến và nhận chứng chỉ số ngay trong tuần đầu tiên.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onScrollToForm}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F5CA65] to-[#D4982F] px-7 py-3 text-sm font-semibold text-[#0C0E12] shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:brightness-110 cursor-pointer"
          >
            <span>Tạo tài khoản dùng thử ngay</span>
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
