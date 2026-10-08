import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { LOGIN_PATH } from '../../login-copy';

interface TrialNavbarProps {
  onScrollToForm?: () => void;
}

export function TrialNavbar({ onScrollToForm }: TrialNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream/10 bg-[#07151b]/85 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" aria-label="DigiTalent AI, về trang chủ" className="flex items-center gap-2">
          <Wordmark className="text-cream" />
        </Link>

        {/* Desktop Anchor Navigation */}
        <nav aria-label="Điều hướng trang dùng thử" className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide">
          <button
            type="button"
            onClick={onScrollToForm}
            className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            Đăng ký 7 ngày
          </button>
          <a href="#journey" className="text-stone-300 hover:text-cream transition-colors">
            Lộ trình 7 ngày
          </a>
          <a href="#benefits" className="text-stone-300 hover:text-cream transition-colors">
            Quyền lợi dùng thử
          </a>
          <a href="#certificate" className="text-stone-300 hover:text-cream transition-colors">
            Chứng chỉ số
          </a>
          <a href="#faq" className="text-stone-300 hover:text-cream transition-colors">
            Câu hỏi thường gặp
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/individual/pricing"
            className="hidden text-xs font-medium text-stone-300 transition-colors hover:text-cream sm:inline-block"
          >
            Bảng giá
          </Link>

          <ThemeToggle />

          <Link
            to={LOGIN_PATH}
            className="rounded-full border border-amber-400/40 px-3.5 py-1.5 text-xs font-medium text-[#F5CA65] transition-all hover:border-amber-400 hover:bg-amber-400/10 sm:px-4 sm:py-2"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}
