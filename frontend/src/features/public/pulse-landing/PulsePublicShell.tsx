import { usePageBackground } from '../landing/hooks/use-page-background';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu } from 'lucide-react';
import mark from '@/assets/pulse/pulse-mark.svg';
import './pulse-landing.css';

export function PulseBrand() {
  return (
    <Link className="pulse-public-brand" to="/business" aria-label="DigiTalent Pulse, về trang chủ doanh nghiệp">
      <img src={mark} alt="" width="42" height="42" />
      <span>DigiTalent <strong>Pulse</strong></span>
    </Link>
  );
}

export function PulsePublicShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  usePageBackground('#f6f8fd');

  return (
    <div className="pulse-public" lang="vi">
      <div className="pulse-public-ambient-glow pulse-public-ambient-1" aria-hidden="true" />
      <div className="pulse-public-ambient-glow pulse-public-ambient-2" aria-hidden="true" />
      <div className="pulse-public-ambient-glow pulse-public-ambient-3" aria-hidden="true" />
      <a className="pulse-public-skip" href="#pulse-main">Bỏ qua điều hướng</a>
      <header className="pulse-public-header">
        <div className={'pulse-public-wrap pulse-public-header-inner' + (compact ? ' pulse-public-header-inner-compact' : '')}>
          <PulseBrand />
          {!compact && <nav className="pulse-public-nav" aria-label="Điều hướng chính">
              <Link to="/business/solution">Giải pháp</Link>
              <a href="/business#hanh-trinh">Cách hoạt động</a>
              <a href="/business#khung-nang-luc">Khung năng lực</a>
              <a href="/business#vai-tro">Vai trò</a>
          </nav>}
          <div className="pulse-public-header-actions">
            <Link className="pulse-public-login" to="/login">Đăng nhập</Link>
            <Link className="pulse-public-button pulse-public-button-small" to="/business/try">
              Dùng thử <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <details className="pulse-public-mobile-menu">
            <summary aria-label="Mở điều hướng"><Menu size={23} aria-hidden="true" /></summary>
            <nav aria-label="Điều hướng di động">
              {!compact && <>
                <Link to="/business/solution">Giải pháp</Link>
                <a href="/business#hanh-trinh">Cách hoạt động</a>
                <a href="/business#khung-nang-luc">Khung năng lực</a>
                <a href="/business#vai-tro">Vai trò</a>
              </>}
              <Link to="/login">Đăng nhập</Link>
              <Link to="/business/try">Dùng thử miễn phí</Link>
            </nav>
          </details>
        </div>
      </header>
      <main id="pulse-main">{children}</main>
      <footer className="pulse-public-footer">
        <div className="pulse-public-wrap pulse-public-footer-inner">
          <PulseBrand />
          <p>Năng lực rõ ràng. Học tập có định hướng. Kết quả có minh chứng.</p>
          <nav aria-label="Liên kết cuối trang">
            <Link to="/business/solution">Giải pháp doanh nghiệp</Link>
            <Link to="/business/try">Dùng thử</Link>
            <Link to="/login">Đăng nhập</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
