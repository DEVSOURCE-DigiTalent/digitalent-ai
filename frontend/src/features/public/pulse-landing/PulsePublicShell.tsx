import { usePageBackground } from '../landing/hooks/use-page-background';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu } from 'lucide-react';
import mark from '@/assets/pulse/pulse-mark.svg';
import './pulse-landing.css';
import './pulse-bright-landing.css';

export function PulseBrand() {
  return (
    <Link className="pulse-public-brand" to="/business" aria-label="DigiTalent AI, về trang chủ doanh nghiệp">
      <img src={mark} alt="" width="38" height="38" />
      <span>DigiTalent <strong>AI</strong></span>
    </Link>
  );
}

interface PulsePublicShellProps {
  children: React.ReactNode;
  compact?: boolean;
  theme?: 'light' | 'dark';
  hideFooter?: boolean;
  hideHeader?: boolean;
  transparentHeader?: boolean;
}

export function PulsePublicShell({
  children,
  compact = false,
  theme = 'light',
  hideFooter = false,
  hideHeader = false,
  transparentHeader = false,
}: PulsePublicShellProps) {
  const isLight = theme === 'light';
  usePageBackground(isLight ? '#f8fafc' : '#070b16');

  return (
    <div className={`pulse-public ${isLight ? 'pulse-public-light' : ''}`} lang="vi">
      {!isLight && (
        <>
          <div className="pulse-public-ambient-glow pulse-public-ambient-1" aria-hidden="true" />
          <div className="pulse-public-ambient-glow pulse-public-ambient-2" aria-hidden="true" />
          <div className="pulse-public-ambient-glow pulse-public-ambient-3" aria-hidden="true" />
        </>
      )}
      <a className="pulse-public-skip sr-only focus:not-sr-only" href="#pulse-main">Bỏ qua điều hướng</a>
      {!hideHeader && (
        <header className={`pulse-public-header ${transparentHeader ? 'pulse-public-header-transparent' : ''}`}>
          <div className={'pulse-public-wrap pulse-public-header-inner' + (compact ? ' pulse-public-header-inner-compact' : '')}>
            <PulseBrand />
            {!compact && (
              <nav className="pulse-public-nav" aria-label="Điều hướng chính">
                <Link to="/business/solution">Giải pháp</Link>
                <a href="/business#hanh-trinh">Cách hoạt động</a>
                <a href="/business#phong-ban">Phòng ban</a>
                <Link to="/business/pricing">Bảng giá</Link>
              </nav>
            )}
            <div className="pulse-public-header-actions">
              <Link className="pulse-public-login" to="/login">Đăng nhập</Link>
              <Link className="pulse-public-button pulse-public-button-small" to="/business/try">
                Dùng thử <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <details className="pulse-public-mobile-menu">
              <summary aria-label="Mở điều hướng"><Menu size={23} aria-hidden="true" /></summary>
              <nav aria-label="Điều hướng di động">
                {!compact && (
                  <>
                    <Link to="/business/solution">Giải pháp</Link>
                    <a href="/business#hanh-trinh">Cách hoạt động</a>
                    <a href="/business#phong-ban">Phòng ban</a>
                    <Link to="/business/pricing">Bảng giá</Link>
                  </>
                )}
                <Link to="/login">Đăng nhập</Link>
                <Link to="/business/try">Dùng thử miễn phí</Link>
              </nav>
            </details>
          </div>
        </header>
      )}
      <main id="pulse-main">{children}</main>
      {!hideFooter && (
        <footer className="pulse-public-footer">
          <div className="pulse-public-wrap pulse-public-footer-inner">
            <PulseBrand />
            <p>Năng lực rõ ràng. Học tập có định hướng. Kết quả có minh chứng thực tế.</p>
            <nav aria-label="Liên kết cuối trang">
              <Link to="/business/solution">Giải pháp doanh nghiệp</Link>
              <Link to="/business/pricing">Bảng giá</Link>
              <Link to="/business/try">Dùng thử miễn phí</Link>
              <Link to="/login">Đăng nhập</Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}
