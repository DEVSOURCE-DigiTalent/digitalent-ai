import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SECTION_IDS, type LandingSectionConfig } from '../landing-content';
import { useLandingContent } from '../landing-content-context';
import { BackgroundStage } from './BackgroundStage';
import { SectionHeader } from './SectionHeader';

type LearningPreviewSection = Extract<LandingSectionConfig, { kind: 'learning-preview' }>;

const MODULE_LESSONS: Record<number, {
  objective: string;
  example: string;
  practice: string;
  quiz: { question: string; options: string[] };
  progress: string;
}> = {
  0: {
    objective: 'Nhận diện các rủi ro bảo mật thông tin thường gặp và thiết lập các biện pháp phòng vệ cơ bản cho tài khoản công việc.',
    example: 'Nhận được email giả mạo bộ phận IT yêu cầu đổi mật khẩu khẩn cấp. Quy trình xác minh trước khi hành động là gì?',
    practice: 'Kích hoạt xác thực 2 lớp (2FA) trên các dịch vụ nội bộ và kiểm tra phân quyền truy cập tập tin.',
    quiz: {
      question: 'Hành vi nào tiềm ẩn nguy cơ bảo mật cao nhất trong công việc hàng ngày?',
      options: [
        'Sử dụng chung một mật khẩu cho cả email cá nhân và hệ thống nội bộ',
        'Khóa màn hình máy tính mỗi khi rời khỏi bàn làm việc',
        'Kiểm tra địa chỉ người gửi trước khi bấm vào đường link lạ',
      ],
    },
    progress: 'Đã hoàn thành module này. Sẵn sàng cho Module 2.',
  },
  2: {
    objective: 'Xây dựng thói quen làm việc số lành mạnh, quản lý thông báo và ngăn ngừa tình trạng kiệt sức kỹ thuật số.',
    example: 'Tin nhắn công việc liên tục ngoài giờ hành chính làm giảm khả năng tập trung vào nhiệm vụ chiến lược.',
    practice: 'Thiết lập khung giờ tập trung (Focus time) và phân loại độ ưu tiên cho các kênh thông tin.',
    quiz: {
      question: 'Cách nào hiệu quả nhất để duy trì cân bằng số trong môi trường làm việc?',
      options: [
        'Tắt thông báo ứng dụng không khẩn cấp sau giờ làm việc quy định',
        'Trả lời mọi tin nhắn ngay lập tức bất kể thời gian',
        'Để chuông điện thoại 24/7 để không bỏ lỡ thông tin',
      ],
    },
    progress: 'Đã hoàn thành 2 trên 4 module. Bài đánh giá sau khóa sẽ mở khi bạn học xong cả 4.',
  },
  3: {
    objective: 'Áp dụng các nguyên tắc tối ưu hóa lưu trữ đám mây và sử dụng tài nguyên số có trách nhiệm với môi trường.',
    example: 'Dung lượng lưu trữ dùng chung bị đầy bởi hàng trăm phiên bản sao lưu không được dọn dẹp.',
    practice: 'Phân loại dữ liệu lưu trữ nóng/lạnh và thiết lập chính sách tự động lưu trữ định kỳ.',
    quiz: {
      question: 'Hành động nào đóng góp trực tiếp vào vận hành số bền vững?',
      options: [
        'Xóa bỏ dữ liệu rác, dọn dẹp email cũ và tối ưu lưu trữ đám mây',
        'Gửi email đính kèm tệp tin lớn thay vì chia sẻ liên kết',
        'In tất cả tài liệu số ra giấy để lưu trữ thêm một bản',
      ],
    },
    progress: 'Module cuối cùng trước bài đánh giá tổng hợp sau khóa học.',
  },
};

/** A mock lesson viewer: the course on the left, one module on the right. Content is illustrative. */
export function LearningPreviewSection({ section }: { section: LearningPreviewSection }) {
  const { sample } = section;
  const [activeModule, setActiveModule] = useState(sample.currentModule);
  const { media } = useLandingContent();
  const currentLesson = MODULE_LESSONS[activeModule] ?? sample.lesson;

  return (
    <section id={SECTION_IDS.learning} tabIndex={-1} aria-labelledby="lp-learning-title" className="scroll-mt-24 py-14 outline-none md:py-20">
      <SectionHeader id="lp-learning-title" intro={section.intro} />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <aside className="relative isolate overflow-hidden rounded-[20px] bg-landing-panel p-6 md:p-8">
          <BackgroundStage scene="dusk" seed={17} video={media.learning} />
          {/* Keeps the text readable over the footage. */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/30" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.04em] text-cream/60">{sample.courseCode}</span>
              <span className="inline-flex whitespace-nowrap rounded-full border border-cream/12 px-2.5 py-1 text-[11px] text-cream/80">Ví dụ minh họa</span>
            </div>
            <p className="mt-3 text-xl leading-[1.25] tracking-[-0.015em] text-cream">{sample.courseTitle}</p>

            <ol aria-label="Các module của khóa" className="mt-8 grid gap-1.5">
              {sample.modules.map((title, index) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => setActiveModule(index)}
                    aria-current={index === activeModule ? 'step' : undefined}
                    className={cn(
                      'grid w-full grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-x-3 rounded-xl px-3 py-2.5 text-left text-sm leading-[1.4] transition-colors',
                      index === activeModule
                        ? 'bg-cream/15 font-medium text-cream shadow-xs'
                        : 'text-cream/70 hover:bg-cream/10 hover:text-cream',
                    )}
                  >
                    <span className="tabular-nums text-cream/50">{index + 1}</span>
                    <span>{title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div key={activeModule} className="grid gap-6 rounded-[20px] bg-landing-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Module {activeModule + 1} · {sample.modules[activeModule]}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Block title="Mục tiêu học tập">{currentLesson.objective}</Block>
            <Block title="Kiến thức và ví dụ">{currentLesson.example}</Block>
            <Block title="Bài thực hành">{currentLesson.practice}</Block>
            <Block title="Bài đánh giá">
              <span className="block text-cream/90">{currentLesson.quiz.question}</span>
              <ul className="mt-3 grid gap-2">
                {currentLesson.quiz.options.map((option) => (
                  <li key={option} className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-2.5 text-sm leading-[1.4]">
                    <i aria-hidden="true" className="mt-1 block size-3 rounded-full border border-cream/40" />
                    {option}
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <div className="border-t border-cream/12 pt-5">
            <Block title="Tiến độ">{currentLesson.progress}</Block>
            <div className="mt-4 flex gap-1" aria-hidden="true">
              {sample.modules.map((title, index) => (
                <i key={title} className={cn('block h-1.5 flex-1 rounded-full', index <= activeModule ? 'bg-cream' : 'bg-cream/12')} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-cream-soft">{title}</h3>
      <div className="mt-2 text-sm leading-[1.6] text-stone-400">{children}</div>
    </div>
  );
}
