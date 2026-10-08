import { Compass, BookOpen, Cpu, Award } from 'lucide-react';

export function TrialJourneySection() {
  const steps = [
    {
      day: 'Ngày 1',
      title: 'Đánh giá đầu vào & Đo khoảng cách năng lực',
      desc: 'Hoàn thành bài khảo sát 15 phút để xác định chính xác năng lực số hiện tại và các kỹ năng cần bồi dưỡng theo vai trò mục tiêu.',
      icon: Compass,
      color: 'from-teal-400 to-emerald-500',
      badge: 'Bắt đầu ngay',
    },
    {
      day: 'Ngày 2 – 4',
      title: 'Chinh phục 3 Khóa học cốt lõi mở sẵn',
      desc: 'Truy cập đầy đủ video bài giảng chuẩn quốc tế, tài liệu chuyên sâu, bài tập tương tác và câu hỏi trắc nghiệm ôn tập.',
      icon: BookOpen,
      color: 'from-amber-400 to-amber-600',
      badge: 'Thực chiến 100%',
    },
    {
      day: 'Ngày 5 – 6',
      title: 'Làm Mini-Project & Hỏi đáp với AI Mentor',
      desc: 'Áp dụng công cụ AI và phương pháp mới vào bài toán thực tế của bạn, nhận phản hồi và gợi ý tối ưu từ trợ lý AI 24/7.',
      icon: Cpu,
      color: 'from-blue-400 to-indigo-500',
      badge: 'Cố vấn thông minh',
    },
    {
      day: 'Ngày 7',
      title: 'Đánh giá đầu ra & Nhận Chứng chỉ số',
      desc: 'Tham gia bài kiểm tra năng lực cuối khóa. Đạt từ 75% trở lên để mở khóa chứng chỉ số có mã xác thực công khai vĩnh viễn.',
      icon: Award,
      color: 'from-purple-400 to-pink-500',
      badge: 'Bảo lưu vĩnh viễn',
    },
  ];

  return (
    <section id="journey" className="relative py-20 border-t border-cream/10 bg-[#06141a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5CA65]">
            HÀNH TRÌNH 7 NGÀY
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-cream">
            Lộ trình phát triển kỹ năng số <span className="font-landing-serif italic text-cream-soft">thời AI</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Thiết kế khoa học, tối ưu thời gian học tập cho người bận rộn. Từng bước làm chủ công cụ và phương pháp mới.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.day}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/40"
              >
                {/* Step Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {step.day}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-stone-300 ring-1 ring-white/10">
                      Bước {idx + 1}
                    </span>
                  </div>

                  <div className="grid size-12 place-items-center rounded-2xl bg-white/5 text-amber-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:bg-amber-400/20 group-hover:text-amber-200 transition-all duration-300">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="text-base font-semibold text-cream leading-snug group-hover:text-amber-200 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-stone-300">
                    {step.desc}
                  </p>
                </div>

                {/* Step Footer Badge */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-400 group-hover:text-cream transition-colors">
                    {step.badge}
                  </span>
                  <div className="size-2 rounded-full bg-amber-400/50 group-hover:bg-amber-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
