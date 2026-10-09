import { Sparkles, Award, BookOpen, ShieldCheck, Zap, Compass } from 'lucide-react';

interface PositionInfo {
  code: string;
  name: string;
}

interface TrialHeroVisualProps {
  position?: PositionInfo;
  fromTry?: boolean;
}

export function TrialHeroVisual({ position, fromTry = false }: TrialHeroVisualProps) {
  const displayPosition = position?.name || 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)';

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-[32px] border border-white/10 bg-[#071920]/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/70 text-cream select-none min-h-[580px] lg:min-h-[640px] group transition-all duration-300 hover:border-amber-400/30">
      {/* 1. Background Cinematic Visual & Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/trial/trial-learner.jpg"
          alt="Trải nghiệm học tập thực chiến DigiTalent AI"
          className="h-full w-full object-cover object-[center_35%] transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Soft progressive darkened vignette from bottom & edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07151b] via-[#07151b]/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07151b]/40 via-transparent to-black/20" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-amber-500/20 blur-3xl"
        />
      </div>

      {/* 2. Top Bar: Floating AI Mentor & Status Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        {/* Live AI Copilot Status */}
        <div className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-black/45 px-3.5 py-2 backdrop-blur-md shadow-lg shadow-black/40 text-xs">
          <div className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-semibold text-amber-300">AI Mentor 24/7</span>
          <span className="text-stone-300 text-[11px] hidden sm:inline">· Đồng hành &amp; Chấm bài</span>
        </div>

        {/* 7-Day Free Pass Pill */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-[#F5CA65] backdrop-blur-md shadow-xs">
          <Zap className="size-3.5" />
          Trải nghiệm dùng thử 7 ngày
        </span>
      </div>

      {/* 3. Center Atmospheric Brand Quote & Orientation */}
      <div className="relative z-10 my-auto py-8 space-y-3 max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-medium text-stone-200 backdrop-blur-md">
          <Compass className="size-3.5 text-amber-300" />
          <span>Vị trí mục tiêu:</span>
          <strong className="text-cream font-semibold">{displayPosition}</strong>
          {fromTry && <span className="text-amber-300 text-[10px]">· từ bài thử</span>}
        </div>

        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-cream leading-[1.2] drop-shadow-md">
          Học đúng phần thiếu, làm chủ kỹ năng số với{' '}
          <span className="font-landing-serif italic text-[#F5CA65]">
            lộ trình thực chiến
          </span>
          .
        </h2>

        <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed drop-shadow-sm">
          Đo khoảng cách năng lực tự động, thực hành trực tiếp trên bài toán doanh nghiệp và nhận bảo chứng giá trị thật.
        </p>
      </div>

      {/* 4. Bottom Grid: 2 High-Value Floating Glass Cards & Trust Micro-strip */}
      <div className="relative z-10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card A: 3 Khóa học cốt lõi */}
          <div className="group/card rounded-2xl border border-white/15 bg-black/50 p-3.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-amber-400/40 hover:bg-black/60 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <div className="grid size-6 place-items-center rounded-lg bg-amber-400/20 text-[#F5CA65]">
                <BookOpen className="size-3.5" />
              </div>
              <span>3 Khóa học mở sẵn</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-snug">
              Trọn vẹn bài giảng, video, tài liệu và case study chuyên sâu theo chuẩn vị trí.
            </p>
          </div>

          {/* Card B: Chứng chỉ số xác thực */}
          <div className="group/card rounded-2xl border border-white/15 bg-black/50 p-3.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-teal-400/40 hover:bg-black/60 space-y-1">
            <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs">
              <div className="grid size-6 place-items-center rounded-lg bg-teal-400/20 text-teal-300">
                <Award className="size-3.5" />
              </div>
              <span>Chứng chỉ số có QR</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-snug">
              Xác thực vĩnh viễn trên hệ thống, dễ dàng đính kèm CV và hồ sơ năng lực số.
            </p>
          </div>
        </div>

        {/* 5. Minimalist Trust Strip */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/35 px-3.5 py-2 backdrop-blur-md text-[11px] text-stone-300">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            100% Không cần thẻ · Không tự gia hạn
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-300/90 hidden sm:flex">
            <Sparkles className="size-3.5 text-amber-300" />
            Bảo lưu toàn bộ tiến độ học tập
          </span>
        </div>
      </div>
    </div>
  );
}
