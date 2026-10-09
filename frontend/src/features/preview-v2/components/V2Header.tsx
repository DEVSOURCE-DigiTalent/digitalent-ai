import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowLeft, Layers, Compass } from 'lucide-react';

export function V2Banner() {
  const location = useLocation();
  const isIndividual = location.pathname.includes('/individual');

  return (
    <div className="sticky top-0 z-50 bg-[#2C1D18] text-[#F5EBE1] text-xs py-2 px-4 border-b border-[#4A352C] shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D96B43] text-white font-semibold text-[11px] tracking-wide uppercase">
            <Sparkles className="w-3 h-3" /> Theme v2 • Warm Human EdTech
          </span>
          <span className="hidden sm:inline text-[#D9C7B8]">
            Phiên bản thiết kế mới chuẩn hoá theo Khung Năng Lực Số TT 02/2025/TT-BGDĐT
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={isIndividual ? '/v2/landing' : '/v2/individual'}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#412E26] hover:bg-[#523B31] text-[#FDFBF7] font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#D96B43]" />
            {isIndividual ? 'Xem Landing Doanh nghiệp & Tổng quan v2' : 'Xem Trải nghiệm Cá nhân (Individual) v2'}
          </Link>
          <div className="h-3.5 w-px bg-[#523B31]" />
          <Link
            to="/business"
            className="inline-flex items-center gap-1 text-[#D9C7B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về bản v1 cổ điển
          </Link>
        </div>
      </div>
    </div>
  );
}

export function V2Navbar() {
  return (
    <nav className="sticky top-[37px] z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFE4D6] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/v2/landing" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D96B43] to-[#C25630] flex items-center justify-center text-white shadow-md shadow-[#D96B43]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1D252C] flex items-center gap-1.5">
              <span>DigiTalent</span>
              <span className="text-[#D96B43] font-black">AI</span>
            </div>
            <p className="text-[10px] text-[#788590] font-medium tracking-wide -mt-1">
              CHUẨN KHUNG NĂNG LỰC SỐ QUỐC GIA
            </p>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-[#465360]">
          <a href="#lo-trinh-ky-nang" className="hover:text-[#D96B43] transition-colors">
            6 Miền Năng Lực
          </a>
          <a href="#vi-tri-chuan" className="hover:text-[#D96B43] transition-colors">
            Vị Trí Nghề Nghiệp
          </a>
          <a href="#khoa-hoc-thuc-chien" className="hover:text-[#D96B43] transition-colors">
            Khóa Học Nổi Bật
          </a>
          <a href="#phuong-phap-danh-gia" className="hover:text-[#D96B43] transition-colors">
            Cách Hoạt Động
          </a>
          <a href="#doi-ngu-co-van" className="hover:text-[#D96B43] transition-colors">
            Cố Vấn & AI
          </a>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/v2/individual"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#1D252C] bg-[#F4EBE1] hover:bg-[#EBDDCE] border border-[#E8DCCF] transition-all"
          >
            <Layers className="w-4 h-4 text-[#D96B43]" />
            Hồ Sơ Năng Lực
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#D96B43] hover:bg-[#C25630] shadow-md shadow-[#D96B43]/25 hover:shadow-lg hover:shadow-[#D96B43]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Đánh Giá AI Ngay
          </Link>
        </div>
      </div>
    </nav>
  );
}
