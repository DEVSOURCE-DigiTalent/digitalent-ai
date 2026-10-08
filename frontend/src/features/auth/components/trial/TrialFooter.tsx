import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';

export function TrialFooter() {
  return (
    <footer className="border-t border-cream/10 bg-[#040e12] py-10 text-xs text-stone-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          <Link to="/" aria-label="DigiTalent AI, về trang chủ" className="flex items-center gap-2">
            <Wordmark className="text-cream" />
          </Link>

          <nav aria-label="Liên kết chân trang" className="flex flex-wrap items-center gap-6 text-stone-300">
            <Link to="/individual/pricing" className="hover:text-amber-300 transition-colors">
              Bảng giá gói
            </Link>
            <Link to="/privacy" className="hover:text-amber-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-amber-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/login" className="hover:text-amber-300 transition-colors">
              Đăng nhập
            </Link>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <p>© {new Date().getFullYear()} DigiTalent AI · Nền tảng phát triển và kiểm định năng lực số thời AI.</p>
          <p>Bảo lưu toàn bộ quyền.</p>
        </div>
      </div>
    </footer>
  );
}
