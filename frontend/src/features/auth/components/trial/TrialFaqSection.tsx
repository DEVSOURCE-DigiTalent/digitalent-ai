import { Plus } from 'lucide-react';

export function TrialFaqSection() {
  const faqs = [
    {
      question: 'Tôi có cần nhập thông tin thẻ ngân hàng hoặc phương thức thanh toán không?',
      answer:
        'Hoàn toàn KHÔNG. Bạn chỉ cần điền họ tên và email để bắt đầu trải nghiệm ngay tức thì. DigiTalent AI cam kết 100% không yêu cầu thẻ tín dụng và không bao giờ phát sinh bất kỳ khoản phí ngoài ý muốn nào trong kỳ dùng thử.',
    },
    {
      question: 'Sau khi hết 7 ngày dùng thử, tài khoản của tôi sẽ như thế nào?',
      answer:
        'Khi hết 7 ngày, tài khoản của bạn sẽ tự động chuyển về chế độ Miễn phí (Free Learner). Toàn bộ lịch sử học tập, bài làm thực hành, kết quả đánh giá năng lực và chứng chỉ số đã nhận được lưu trữ vĩnh viễn trên hệ thống và bạn có thể tra cứu bất cứ lúc nào.',
    },
    {
      question: 'Tôi có thể đổi vị trí năng lực mục tiêu trong thời gian dùng thử không?',
      answer:
        'Có. Bạn hoàn toàn có thể chuyển đổi vị trí mục tiêu ngay trong Workspace cá nhân để khám phá khung năng lực và các lộ trình học tập thuộc các lĩnh vực khác nhau.',
    },
    {
      question: 'Chứng chỉ số nhận được trong tuần dùng thử có giá trị vĩnh viễn không?',
      answer:
        'Có giá trị vĩnh viễn. Khi đạt từ 75% trở lên trong bài đánh giá cuối khóa, chứng chỉ số sẽ được cấp với mã định danh duy nhất (QR code và đường link tra cứu công khai). Chứng chỉ này thuộc sở hữu vĩnh viễn của bạn và không bị thu hồi khi hết hạn dùng thử.',
    },
    {
      question: 'Khi nào tôi nên nâng cấp lên gói Plus hoặc Pro?',
      answer:
        'Bản dùng thử mở sẵn 3 khóa học cốt lõi nền tảng. Khi bạn muốn mở khóa toàn bộ hơn 100+ khóa học chuyên sâu, kho bài tập nâng cao và các tính năng AI mở rộng, bạn có thể chủ động nâng cấp gói bất kỳ lúc nào trong hoặc sau kỳ dùng thử.',
    },
  ];

  return (
    <section id="faq" className="relative py-20 border-t border-cream/10 bg-[#07171e]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5CA65]">
            GIẢI ĐÁP THẮC MẮC
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-cream">
            Câu hỏi thường gặp về <span className="font-landing-serif italic text-cream-soft">7 ngày dùng thử</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-300">
            Mọi thông tin minh bạch, rõ ràng giúp bạn an tâm trải nghiệm lộ trình phát triển kỹ năng.
          </p>
        </div>

        {/* FAQs Accordion using native details/summary */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-cream/10 bg-white/[0.015] px-6 transition-all duration-300 hover:border-amber-400/30 hover:bg-white/[0.03] open:border-amber-400/40 open:bg-white/[0.04] open:shadow-xl open:shadow-black/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base sm:text-lg font-medium leading-[1.4] text-cream transition-colors group-hover:text-amber-200 marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <Plus
                  className="size-5 shrink-0 text-cream/60 transition-transform duration-300 group-hover:text-amber-300 group-open:rotate-45 group-open:text-amber-400"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-[70ch] pb-6 text-xs sm:text-sm leading-relaxed text-stone-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
