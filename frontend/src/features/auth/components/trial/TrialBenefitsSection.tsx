import { CalendarDays, BookOpen, ShieldCheck, Cpu, Check, Compass } from 'lucide-react';
import { INDIVIDUAL_TRIAL } from '@/lib/plans';

interface TrialBenefitsSectionProps {
  positionName?: string;
  fromTry?: boolean;
}

export function TrialBenefitsSection({ positionName, fromTry = false }: TrialBenefitsSectionProps) {
  return (
    <section
      id="benefits"
      aria-label="Quyền lợi dùng thử"
      className="relative py-20 border-t border-cream/10 bg-[#07171e]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5CA65]">
            ĐẶC QUYỀN TRẢI NGHIỆM
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-cream">
            Quyền lợi dùng thử gói <span className="font-landing-serif italic text-cream-soft">Individual Plus</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Trải nghiệm toàn diện nền tảng mà không phải chi trả bất kỳ khoản phí nào trong 7 ngày đầu tiên.
          </p>

          {positionName && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-medium text-amber-300">
                <Compass className="size-3.5" />
                Vị trí: {positionName}
                {fromTry ? ' · từ bài thử' : ''}
              </span>
            </div>
          )}
        </div>

        {/* 3 Core Guarantee Cards (satisfies exact test text requirements) */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.04] space-y-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-400/15 text-[#F5CA65] ring-1 ring-amber-400/25">
              <CalendarDays className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-cream">
              {INDIVIDUAL_TRIAL.days} ngày quyền gói Plus
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Mở khóa toàn bộ trải nghiệm học tập, giao diện cá nhân hóa và các tính năng hỗ trợ học tập cao cấp của DigiTalent.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Không giới hạn thời lượng học mỗi ngày</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Hỗ trợ đa nền tảng máy tính và di động</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.04] space-y-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25">
              <BookOpen className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-cream">
              Học trọn {INDIVIDUAL_TRIAL.courseLimit} khóa đầu trong lộ trình
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tiếp cận trọn vẹn toàn bộ bài giảng video, slide tóm tắt, bộ code mẫu và bài tập thực hành của 3 khóa học cốt lõi.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Kho bài tập tương tác có chấm điểm tức thì</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Tài liệu tham khảo và prompt templates</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.04] space-y-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/25">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-cream">
              Hết hạn: giữ hồ sơ và kết quả, chuyển về gói Miễn phí
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Không rủi ro: toàn bộ lịch sử học tập, bài thi đánh giá và chứng chỉ đạt được sẽ được lưu trữ vĩnh viễn trong tài khoản.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Không phát sinh phí gia hạn tự động</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-400" />
                <span>Dễ dàng nâng cấp khi bạn đã sẵn sàng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Extra Value Banner */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.015] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <Cpu className="size-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-cream">
                Kèm trợ lý AI Mentor đồng hành trực tiếp
              </p>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Hỗ trợ giải đáp thắc mắc chuyên môn, phân tích bài tập và hướng dẫn kỹ năng theo thời gian thực.
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
            Tích hợp sẵn trong bản dùng thử
          </span>
        </div>
      </div>
    </section>
  );
}
