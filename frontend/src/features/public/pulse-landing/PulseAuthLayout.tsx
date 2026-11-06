import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { usePageBackground } from '../landing/hooks/use-page-background';
import mark from '@/assets/pulse/pulse-mark.svg';
import './pulse-auth.css';

interface PulseAuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  asideTitle?: string;
  asideText?: string;
  asidePoints?: string[];
  footer?: ReactNode;
  mode?: 'login' | 'register';
}

/**
 * Centered Luxury 2026 Authentication Layout (Linear / Stripe style).
 * Replaces the dated, cluttered 50/50 split box with a breathtaking,
 * focused glassmorphic command card and ambient atmospheric aurora lighting.
 */
export function PulseAuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  mode = 'login',
}: PulseAuthLayoutProps) {
  usePageBackground('#070b16');

  return (
    <div className="pulse-auth-container" data-mode={mode} lang="vi">
      {/* Ambient Aurora Glow Lights */}
      <div className="pulse-auth-mesh" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-1" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-2" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-3" aria-hidden="true" />

      {/* Floating Header */}
      <header className="pulse-auth-topbar">
        <Link to="/business" className="pulse-auth-logo" aria-label="DigiTalent Pulse, về trang chủ">
          <img src={mark} alt="" width="38" height="38" />
          <span>
            DigiTalent <strong>Pulse</strong>
          </span>
          <span className="pulse-auth-logo-badge">Enterprise</span>
        </Link>
        <div className="pulse-auth-topbar-actions">
          <Link to="/business" className="pulse-auth-home-link">
            <ArrowLeft size={15} aria-hidden="true" /> Trang chủ
          </Link>
          <Link to={mode === 'login' ? '/business/try' : '/login'} className="pulse-auth-switch-btn">
            {mode === 'login' ? 'Dùng thử miễn phí' : 'Đăng nhập'} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Centered Glassmorphic Command Card */}
      <main id="pulse-auth-main" className="pulse-auth-centered-stage">
        <div className="pulse-auth-card">
          <div className="pulse-auth-card-top-shine" aria-hidden="true" />

          {/* Heading */}
          <div className="pulse-auth-header-block">
            <span className="pulse-auth-pill">
              <span className="pulse-auth-pill-dot" />
              {eyebrow}
            </span>
            <h1 className="pulse-auth-title">{title}</h1>
            <p className="pulse-auth-subtitle">{subtitle}</p>
          </div>

          {/* Form Content */}
          <div className="pulse-auth-body">{children}</div>

          {/* Footer Note */}
          {footer && <div className="pulse-auth-card-footer">{footer}</div>}
        </div>

        {/* Security & Compliance Trust Strip */}
        <div className="pulse-auth-trust-bar">
          <div className="pulse-auth-trust-item">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Chuẩn TT02/2022/TT-BTTTT</span>
          </div>
          <span className="pulse-auth-trust-sep">•</span>
          <div className="pulse-auth-trust-item">
            <LockKeyhole size={13} aria-hidden="true" />
            <span>ISO 27001 Ready</span>
          </div>
          <span className="pulse-auth-trust-sep">•</span>
          <div className="pulse-auth-trust-item">
            <Sparkles size={13} aria-hidden="true" />
            <span>Mã hóa AES-256</span>
          </div>
        </div>
      </main>

      {/* Bottom Subtext */}
      <footer className="pulse-auth-bottom-footer">
        <span>© {new Date().getFullYear()} DigiTalent Pulse Enterprise · Nền tảng phát triển năng lực số</span>
      </footer>
    </div>
  );
}
