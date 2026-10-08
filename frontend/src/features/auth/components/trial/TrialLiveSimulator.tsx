import { useState } from 'react';
import { Sparkles, Compass, BookOpen, Award, CheckCircle2, ShieldCheck, Zap, CreditCard, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrialLiveSimulatorProps {
  positionName?: string;
  fromTry?: boolean;
}

export function TrialLiveSimulator({ positionName, fromTry = false }: TrialLiveSimulatorProps) {
  const displayPosition = positionName || 'Kỹ sư Trí tuệ nhân tạo (AI Engineer)';
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);

  const courses = [
    {
      code: 'AI-101',
      title: 'Nhập môn Generative AI & Kỹ nghệ Prompt trong công việc',
      modules: 4,
      lessons: 18,
      duration: '4.5 giờ',
      level: 'Cơ bản',
      tags: ['Prompt Engineering', 'ChatGPT / Claude', 'Tư duy AI'],
    },
    {
      code: 'AI-102',
      title: 'Xây dựng AI Agent tự động hóa quy trình nghiệp vụ',
      modules: 5,
      lessons: 22,
      duration: '6.0 giờ',
      level: 'Thực chiến',
      tags: ['AI Workflows', 'No-code Automation', 'Tích hợp API'],
    },
    {
      code: 'AI-103',
      title: 'Phân tích dữ liệu & Ra quyết định hỗ trợ bởi AI',
      modules: 4,
      lessons: 16,
      duration: '5.0 giờ',
      level: 'Nâng cao',
      tags: ['Data Analysis', 'Trực quan hóa', 'Decision Making'],
    },
  ];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#071920]/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 text-cream select-none transition-all duration-300 hover:border-amber-400/30">
      {/* Dynamic ambient lights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-amber-500/15 blur-3xl animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 size-96 rounded-full bg-teal-500/10 blur-3xl"
      />

      {/* Workspace Header Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-cream/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-500/10 text-[#F5CA65] ring-1 ring-amber-400/30 shadow-inner">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                Workspace cá nhân
              </span>
              <span className="size-1 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Đang kích hoạt</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-cream truncate max-w-[280px]">
              {displayPosition}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30 shadow-xs">
          <CheckCircle2 className="size-3.5" />
          3 Khóa mở sẵn toàn diện
        </span>
      </div>

      {/* 3 Steps Roadmap Visual Strip */}
      <div className="relative z-10 my-5 grid gap-2.5 text-xs">
        <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5 transition-all hover:bg-white/[0.06]">
          <div className="grid size-7 shrink-0 place-items-center rounded-xl bg-teal-500/20 text-teal-300 font-bold text-xs">
            1
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-cream flex items-center gap-1.5">
              Đánh giá đầu vào &amp; Đo khoảng cách năng lực
              <Sparkles className="size-3.5 text-amber-300" />
            </p>
            <p className="text-xs text-stone-300 leading-snug">
              {fromTry ? 'Gắn kết quả thử nhanh và chuẩn hóa lộ trình' : 'Xác định điểm mạnh và lỗ hổng kỹ năng cần bổ sung'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5 transition-all hover:bg-white/[0.06]">
          <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-[#F5CA65] font-bold text-xs">
            2
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-cream flex items-center gap-1.5">
              3 Khóa học cốt lõi không giới hạn bài giảng
              <BookOpen className="size-3.5 text-[#F5CA65]" />
            </p>
            <p className="text-xs text-stone-300 leading-snug">
              Truy cập không giới hạn video, tài liệu, bài tập coding và hỗ trợ từ AI Mentor
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5 transition-all hover:bg-white/[0.06]">
          <div className="grid size-7 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs">
            3
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-cream flex items-center gap-1.5">
              Đánh giá cuối khóa &amp; Cấp chứng chỉ số
              <Award className="size-3.5 text-indigo-300" />
            </p>
            <p className="text-xs text-stone-300 leading-snug">
              Đạt từ 75% trở lên để mở khóa chứng chỉ số xác thực vĩnh viễn trên hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Unlocked Courses Preview */}
      <div className="relative z-10 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Danh mục 3 khóa học mở sẵn trong tuần dùng thử:
        </p>

        <div className="grid gap-2">
          {courses.map((c, idx) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelectedCourseIdx(idx)}
              className={cn(
                'group flex items-center justify-between rounded-2xl p-3 text-left transition-all duration-200 border cursor-pointer',
                selectedCourseIdx === idx
                  ? 'bg-amber-400/10 border-amber-400/40 shadow-sm shadow-amber-500/10'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors',
                    selectedCourseIdx === idx
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-white/10 text-cream group-hover:bg-white/20'
                  )}
                >
                  <Play className="size-3.5 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-300/90">{c.code}</span>
                    <span className="text-[10px] text-stone-400">· {c.modules} module ({c.lessons} bài)</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] text-stone-300">{c.duration}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-cream truncate">
                    {c.title}
                  </p>
                </div>
              </div>

              <ChevronRight
                className={cn(
                  'size-4 shrink-0 transition-transform text-stone-400',
                  selectedCourseIdx === idx ? 'translate-x-1 text-amber-300' : 'group-hover:translate-x-0.5'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Progress Simulation Bar */}
      <div className="relative z-10 my-4 space-y-1.5 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5">
        <div className="flex justify-between text-xs text-stone-300">
          <span>Tiến độ mẫu sau 7 ngày trải nghiệm</span>
          <span className="text-[#F5CA65] font-semibold">35% hoàn thành mục tiêu</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[#F5CA65] to-amber-500 shadow-sm shadow-amber-400" />
        </div>
      </div>

      {/* 4 Trust Badges Strip */}
      <div className="relative z-10 grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
          <Zap className="size-4 shrink-0 text-amber-300" />
          <span className="text-stone-300 text-[11px] leading-tight font-medium">
            Kích hoạt tức thì sau 30 giây
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
          <CreditCard className="size-4 shrink-0 text-emerald-400" />
          <span className="text-stone-300 text-[11px] leading-tight font-medium">
            100% Không cần thẻ tín dụng
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
          <ShieldCheck className="size-4 shrink-0 text-teal-300" />
          <span className="text-stone-300 text-[11px] leading-tight font-medium">
            Không tự động gia hạn / trừ tiền
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 ring-1 ring-white/5">
          <Award className="size-4 shrink-0 text-indigo-300" />
          <span className="text-stone-300 text-[11px] leading-tight font-medium">
            Bảo lưu tiến độ &amp; chứng chỉ
          </span>
        </div>
      </div>
    </div>
  );
}
