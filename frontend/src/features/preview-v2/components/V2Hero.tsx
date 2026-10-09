import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Award } from 'lucide-react';

export function V2Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Organic background decorative blobs */}
      <div className="absolute top-10 right-5 w-96 h-96 rounded-full v2-blob-peach pointer-events-none -z-10 blur-2xl" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full v2-blob-sage pointer-events-none -z-10 blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E5D8] border border-[#E8D4C3] text-[#A64B29] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
              <span>Khung Chuẩn Năng Lực Số TT 02/2025/TT-BGDĐT</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1D252C] leading-[1.12]">
              Làm Chủ Kỹ Năng Số,{' '}
              <br className="hidden sm:inline" />
              <span className="v2-handwriting font-normal text-[#D96B43] italic pr-1">
                Bứt Phá Tương Lai
              </span>{' '}
              Cùng AI.
            </h1>

            {/* Subline */}
            <p className="text-lg sm:text-xl text-[#53616F] font-normal leading-relaxed max-w-2xl">
              Nền tảng đo lường năng lực số đa chiều, chỉ ra chính xác khoảng trống kỹ năng của từng vị trí, 
              xếp lộ trình đào tạo tiên quyết và cấp chứng chỉ số có thể xác thực công khai.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/v2/individual"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#D96B43] hover:bg-[#C25630] shadow-lg shadow-[#D96B43]/30 hover:shadow-xl hover:shadow-[#D96B43]/40 hover:-translate-y-0.5 transition-all group"
              >
                <span>Bắt Đầu Đánh Giá AI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#vi-tri-chuan"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-semibold text-[#1D252C] bg-[#F4EBE1] hover:bg-[#EBDDCE] border border-[#E8DCCF] transition-colors"
              >
                Khám Phá 5 Vị Trí Chuẩn
              </a>
            </div>

            {/* Social proof & Highlights */}
            <div className="pt-6 border-t border-[#EFE4D6] flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF7F2] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Learner"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF7F2] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Learner"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#FAF7F2] object-cover"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                    alt="Learner"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1D252C]">3,200+ Nhân tài</div>
                  <div className="text-xs text-[#6B7987]">Đã hoàn thành đánh giá</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#465360]">
                <ShieldCheck className="w-4 h-4 text-[#537565]" />
                <span>100% Xác thực chứng chỉ số</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#465360]">
                <Award className="w-4 h-4 text-[#D96B43]" />
                <span>Chuẩn 6 Miền TT02</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual with Organic Framing */}
          <div className="lg:col-span-5 relative">
            
            {/* Organic rounded backdrop shape */}
            <div className="absolute inset-0 -m-3 sm:-m-5 rounded-[40px] bg-gradient-to-tr from-[#F1DEC9] via-[#F8EDE2] to-[#FAF7F2] -rotate-1 border border-[#E9DAC8] -z-10 shadow-sm" />
            
            {/* Main Image Frame */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-[#82533B]/10 border-4 border-white bg-white">
              <img
                src="/images/v2/hero-talent.jpg"
                alt="Nhân tài số DigiTalent AI"
                className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[4/3] hover:scale-102 transition-transform duration-500"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-[#F1E5D8] flex items-center gap-2.5 animate-bounce-subtle">
                <div className="w-7 h-7 rounded-full bg-[#EBF2EE] text-[#537565] flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-[10px] text-[#7A8793] uppercase font-bold tracking-wider">Tiêu chuẩn</p>
                  <p className="text-xs font-bold text-[#1D252C]">Khung 6 Miền Số</p>
                </div>
              </div>

              {/* Bottom Floating Telemetry Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#F1E5D8]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96B43] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D96B43]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#1D252C]">AI Career Copilot</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#537565] bg-[#EBF2EE] px-2 py-0.5 rounded-full">
                    Sẵn sàng hỗ trợ
                  </span>
                </div>
                <p className="text-[11px] text-[#556371] leading-relaxed">
                  "Dựa trên hồ sơ của bạn, vị trí <strong>Marketing Số</strong> đang cần nâng bậc năng lực <strong>6.1 (Ứng dụng AI)</strong>."
                </p>
              </div>
            </div>

            {/* Handwritten aesthetic accent note */}
            <div className="hidden sm:block absolute -top-7 left-6 -rotate-6 text-[#A64B29] font-serif italic text-base pointer-events-none select-none">
              ~ Từng bước nhỏ, tương lai lớn ~
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}
