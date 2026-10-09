import { V2_MENTORS } from '../data/v2-data';
import { Sparkles, Users, BookOpen } from 'lucide-react';

export function V2MentorsSection() {
  return (
    <section id="doi-ngu-co-van" className="py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#476757] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            ĐỒNG HÀNH CHUYÊN MÔN
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D252C]">
            Đội Ngũ Cố Vấn & Trợ Lý AI
          </h2>
          <p className="text-base text-[#5E6A77] mt-3">
            Sự kết hợp giữa chuyên gia đào tạo thực chiến và trợ lý AI thông minh sẵn sàng giải đáp 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {V2_MENTORS.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-3xl p-6 border border-[#EFE4D6] v2-card-shadow v2-card-hover flex flex-col items-center text-center group"
            >
              <div className="relative mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#FAF1E8] group-hover:scale-105 transition-transform duration-300 shadow-md"
                />
                {mentor.id === 'm4' && (
                  <span className="absolute bottom-0 right-0 bg-[#D96B43] text-white p-1 rounded-full shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#1D252C] mb-1">
                {mentor.name}
              </h3>

              <p className="text-xs text-[#D96B43] font-semibold mb-2">
                {mentor.domain}
              </p>

              <p className="text-xs text-[#6B7987] leading-relaxed mb-4 flex-1">
                {mentor.title}
              </p>

              <div className="w-full pt-3 border-t border-[#F5EFE6] flex justify-around text-[11px] text-[#788694] font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#537565]" />
                  {mentor.studentsCount.toLocaleString()}+ học viên
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#D96B43]" />
                  {mentor.coursesCount} học phần
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function V2CtaFinale() {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-[#D96B43] to-[#B84E27] text-white p-8 sm:p-14 lg:p-16 shadow-2xl shadow-[#D96B43]/25">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-black/10 blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-white">
              BƯỚC ĐẦU TIÊN CỦA BẠN
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Sẵn Sàng Khám Phá Năng Lực Số Của Bạn?
            </h2>

            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
              Chỉ mất 15 phút làm bài chẩn đoán trực tuyến để nhận báo cáo phân tích năng lực chi tiết 
              theo 6 miền TT02 và lộ trình học tập cá nhân hóa do AI gợi ý.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="/v2/individual"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-[#D96B43] bg-white hover:bg-[#FAF4EE] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Bắt Đầu Đánh Giá Miễn Phí
              </a>
              <a
                href="#vi-tri-chuan"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
              >
                Tìm Hiểu Vị Trí Tham Chiếu
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function V2Footer() {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#EFE4D6] pt-14 pb-12 text-[#5E6A77]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#EFE4D6]">
          
          <div className="md:col-span-1 space-y-3">
            <div className="text-xl font-bold tracking-tight text-[#1D252C] flex items-center gap-1.5">
              <span>DigiTalent</span>
              <span className="text-[#D96B43] font-black">AI</span>
            </div>
            <p className="text-xs leading-relaxed text-[#75828F]">
              Nền tảng đo lường và phát triển năng lực số theo Khung chuẩn Thông tư 02/2025/TT-BGDĐT.
            </p>
            <div className="text-[11px] text-[#A2AFBC]">
              © 2026 DigiTalent AI. Bảo lưu mọi quyền.
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-[#1D252C] tracking-wider mb-3">
              KHUNG CHUẨN NĂNG LỰC
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#lo-trinh-ky-nang" className="hover:text-[#D96B43] transition-colors">6 Miền Năng Lực Số</a></li>
              <li><a href="#lo-trinh-ky-nang" className="hover:text-[#D96B43] transition-colors">24 Năng Lực Thành Phần</a></li>
              <li><a href="#vi-tri-chuan" className="hover:text-[#D96B43] transition-colors">5 Vị Trí Nghề Nghiệp</a></li>
              <li><a href="#khoa-hoc-thuc-chien" className="hover:text-[#D96B43] transition-colors">3 Tầng Đào Tạo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-[#1D252C] tracking-wider mb-3">
              SẢN PHẨM & CỔNG VÀO
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/v2/landing" className="hover:text-[#D96B43] transition-colors">Dành cho Doanh Nghiệp (v2)</a></li>
              <li><a href="/v2/individual" className="hover:text-[#D96B43] transition-colors">Dành cho Cá Nhân (v2)</a></li>
              <li><a href="/verify" className="hover:text-[#D96B43] transition-colors">Tra Cứu Chứng Chỉ Số</a></li>
              <li><a href="/business/pricing" className="hover:text-[#D96B43] transition-colors">Bảng Giá Gói Dịch Vụ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-[#1D252C] tracking-wider mb-3">
              PHIÊN BẢN THEME
            </h4>
            <p className="text-xs leading-relaxed mb-3">
              Bạn đang xem bản mẫu <strong>v2 Warm Human EdTech</strong>. Bạn có thể quay lại giao diện v1 bất cứ lúc nào.
            </p>
            <a
              href="/business"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4EBE1] hover:bg-[#EBDDCE] text-[#1D252C] border border-[#E8DCCF] transition-colors"
            >
              ← Về Giao Diện Classic v1
            </a>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A97A4] gap-4">
          <div>
            Phát triển theo tiêu chuẩn hệ sinh thái năng lực số quốc gia & AI Copilot
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#D96B43]">Chính sách bảo mật</a>
            <a href="#" className="hover:text-[#D96B43]">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-[#D96B43]">Hỗ trợ kỹ thuật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
