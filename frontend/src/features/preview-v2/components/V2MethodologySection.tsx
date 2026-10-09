import { CheckCircle2, ArrowRight } from 'lucide-react';

export function V2MethodologySection() {
  const points = [
    'Khung chuẩn tham chiếu 6 miền, 24 năng lực, xếp theo 8 bậc chuẩn hoá.',
    'Chẩn đoán tự động chỉ ra khoảng trống kỹ năng giữa mức hiện tại và yêu cầu vị trí.',
    'Chương trình đào tạo 3 tầng: Cơ bản, Trung cấp, Nâng cao theo đúng thứ tự logic.',
    'Bảo chứng năng lực bằng sản phẩm và kết quả kiểm tra thực tế, không chỉ là lý thuyết.',
  ];

  return (
    <section id="phuong-phap-danh-gia" className="py-16 lg:py-24 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Visual */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-[#82533B]/10 border-4 border-white bg-white">
              <img
                src="/images/v2/learner-study.jpg"
                alt="Phương pháp học tập thực chiến"
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-[#F1E5D8]">
                <p className="text-[10px] text-[#D96B43] uppercase font-bold tracking-wider">Học tập thực chiến</p>
                <p className="text-xs font-bold text-[#1D252C]">Làm Được Việc Thật</p>
              </div>
            </div>

            {/* Handwritten callout quote */}
            <div className="mt-4 p-5 rounded-3xl bg-[#FAF1E8] border border-[#ECD9C7] text-[#8C4627] text-sm italic v2-handwriting">
              "Đào tạo xong chưa có nghĩa là đã có năng lực. Giá trị thực sự nằm ở minh chứng công việc tạo ra sau mỗi khóa học."
            </div>
          </div>

          {/* Right Column: Copy & Checklist */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#476757] text-xs font-bold uppercase tracking-wider">
              VÒNG PHÁT TRIỂN NĂNG LỰC KHÉP KÍN
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1D252C] leading-tight">
              Học Đúng Phần Thiếu,{' '}
              <br className="hidden sm:inline" />
              <span className="v2-handwriting font-normal text-[#D96B43] italic">
                Xác Nhận Năng Lực
              </span>{' '}
              Bằng Minh Chứng.
            </h2>

            <p className="text-base sm:text-lg text-[#556371] leading-relaxed">
              Mỗi vị trí trong doanh nghiệp cần một bộ năng lực số riêng. DigiTalent AI giúp bạn biết rõ đội ngũ 
              đang mạnh ở đâu, còn thiếu gì và cần bao nhiêu thời gian để hoàn thiện lộ trình chuẩn.
            </p>

            <div className="space-y-3.5 pt-2">
              {points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#EBF2EE] text-[#537565] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm sm:text-base text-[#38434F] font-medium leading-snug">
                    {pt}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a
                href="#lo-trinh-ky-nang"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-[#537565] hover:bg-[#436153] shadow-md shadow-[#537565]/20 hover:shadow-lg transition-all"
              >
                <span>Xem 6 Miền Năng Lực Số TT02</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
