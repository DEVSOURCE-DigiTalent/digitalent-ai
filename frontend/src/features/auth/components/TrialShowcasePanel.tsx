import { Sparkles, Compass, BookOpen, Award, CheckCircle2, ShieldCheck, Zap, CreditCard } from 'lucide-react';

interface TrialShowcasePanelProps {
  positionName?: string;
  fromTry?: boolean;
}

export function TrialShowcasePanel({ positionName, fromTry = false }: TrialShowcasePanelProps) {
  const displayPosition = positionName || 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)';

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 z-10 overflow-hidden text-cream select-none">
      {/* Dynamic ambient lights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-amber-500/15 blur-3xl animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 size-96 rounded-full bg-teal-500/10 blur-3xl"
      />

      {/* Top Header */}
      <div className="space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 ring-1 ring-amber-400/25">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-amber-400" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F5CA65]">
            7 ngày trải nghiệm không rủi ro
          </span>
        </div>

        <h2 className="text-[clamp(24px,2.2vw,32px)] font-normal tracking-[-0.025em] text-cream leading-tight">
          Lộ trình phát triển kỹ năng số <span className="font-landing-serif italic text-cream-soft">thời AI</span>
        </h2>
        <p className="text-xs xl:text-sm text-stone-300 leading-relaxed max-w-[46ch]">
          Đánh giá khoảng cách năng lực, mở khóa 3 khóa học thực chiến và nhận chứng chỉ số ngay trong tuần đầu tiên.
        </p>
      </div>

      {/* Middle Interactive Simulation Card */}
      <div className="my-6 relative z-10 rounded-3xl bg-[#091D24]/85 backdrop-blur-md border border-amber-400/20 p-5 xl:p-6 shadow-2xl shadow-black/50 space-y-4 transition-all duration-300 hover:border-amber-400/35 hover:shadow-amber-500/5 group">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-cream/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-amber-400/15 text-[#F5CA65]">
              <Compass className="size-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#F5CA65] font-semibold">
                Lộ trình mục tiêu
              </p>
              <p className="text-xs xl:text-sm font-medium text-cream truncate max-w-[210px] xl:max-w-[260px]">
                {displayPosition}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="size-3" />
            3 khóa mở sẵn
          </span>
        </div>

        {/* 3 Step Visual Preview */}
        <div className="grid gap-2.5 text-xs">
          <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/5 transition-colors group-hover:bg-white/[0.05]">
            <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-teal-500/20 text-teal-300 font-bold text-[11px]">
              1
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-medium text-cream flex items-center gap-1.5">
                Đánh giá đầu vào &amp; Đo khoảng cách năng lực
                <Sparkles className="size-3 text-amber-300" />
              </p>
              <p className="text-[11px] text-stone-400 leading-snug">
                {fromTry ? 'Gắn kết quả thử nhanh và chuẩn hóa lộ trình' : 'Xác định điểm mạnh và kỹ năng cần bồi dưỡng'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/5 transition-colors group-hover:bg-white/[0.05]">
            <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-[#F5CA65] font-bold text-[11px]">
              2
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-medium text-cream flex items-center gap-1.5">
                3 Khóa học cốt lõi không giới hạn bài giảng
                <BookOpen className="size-3 text-[#F5CA65]" />
              </p>
              <p className="text-[11px] text-stone-400 leading-snug">
                Học lý thuyết, làm bài tập thực tế và ghi chú trực tiếp
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-2.5 ring-1 ring-white/5 transition-colors group-hover:bg-white/[0.05]">
            <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-[11px]">
              3
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-medium text-cream flex items-center gap-1.5">
                Đánh giá cuối khóa &amp; Chứng chỉ số
                <Award className="size-3 text-indigo-300" />
              </p>
              <p className="text-[11px] text-stone-400 leading-snug">
                Đạt $\ge 75\%$ để mở khóa chứng chỉ và bảo lưu vĩnh viễn
              </p>
            </div>
          </div>
        </div>

        {/* Progress teaser bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-stone-400">
            <span>Tiến độ mẫu sau 7 ngày</span>
            <span className="text-[#F5CA65] font-medium">35% hoàn thành</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[#F5CA65] to-amber-500 transition-all duration-1000 shadow-sm shadow-amber-400" />
          </div>
        </div>
      </div>

      {/* TalentLMS 4 Guarantees */}
      <div className="space-y-3 relative z-10">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
            <Zap className="size-4 shrink-0 text-amber-300" />
            <span className="text-stone-300 text-[11px] leading-tight">
              Kích hoạt tức thì sau 30 giây
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
            <CreditCard className="size-4 shrink-0 text-emerald-400" />
            <span className="text-stone-300 text-[11px] leading-tight">
              100% Không cần thẻ tín dụng
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
            <ShieldCheck className="size-4 shrink-0 text-teal-300" />
            <span className="text-stone-300 text-[11px] leading-tight">
              Không tự động gia hạn / trừ tiền
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
            <Award className="size-4 shrink-0 text-indigo-300" />
            <span className="text-stone-300 text-[11px] leading-tight">
              Bảo lưu tiến độ khi nâng cấp
            </span>
          </div>
        </div>

        {/* Social Proof Quote */}
        <p className="text-[11px] text-stone-400 italic text-center pt-1">
          &ldquo;Lộ trình học theo năng lực rõ ràng, bài đánh giá đầu vào rất sát với công việc thực tế.&rdquo;
        </p>
      </div>
    </div>
  );
}
