import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { usePageBackground } from '../landing/hooks/use-page-background';
import mark from '@/assets/pulse/pulse-mark.svg';
import journeyArt from '@/assets/pulse/learning-journey-abstract.webp';
import './pulse-auth.css';

interface PulseAuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  asideTitle: string;
  asideText: string;
  asidePoints?: string[];
  footer?: ReactNode;
  mode?: 'login' | 'register';
}

export function PulseAuthLayout({ eyebrow, title, subtitle, children, asideTitle, asideText, asidePoints = [], footer, mode = 'register' }: PulseAuthLayoutProps) {
  usePageBackground('#f6f8fd');

  return <div className="pulse-auth" data-mode={mode} lang="vi">
    <div className="pulse-auth-ambient-glow pulse-auth-ambient-1" aria-hidden="true" />
    <div className="pulse-auth-ambient-glow pulse-auth-ambient-2" aria-hidden="true" />
    <div className="pulse-auth-ambient-glow pulse-auth-ambient-3" aria-hidden="true" />
    <a className="pulse-auth-skip" href="#pulse-auth-main">Bỏ qua điều hướng</a>
    <header className="pulse-auth-header">
      <div className="pulse-auth-wrap pulse-auth-header-inner">
        <Link to="/business" className="pulse-auth-brand" aria-label="DigiTalent Pulse, về trang chủ doanh nghiệp">
          <img src={mark} alt="" width="42" height="42" />
          <span>DigiTalent <strong>Pulse</strong></span>
        </Link>
        <nav aria-label="Điều hướng tài khoản">
          <Link to="/business" className="pulse-auth-back"><ArrowLeft size={16} aria-hidden="true" /> Trang chủ</Link>
          <Link to={mode === 'login' ? '/business/try' : '/login'} className="pulse-auth-header-cta">
            {mode === 'login' ? 'Đăng ký doanh nghiệp' : 'Đã có tài khoản? Đăng nhập'} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
    <main id="pulse-auth-main" className="pulse-auth-wrap pulse-auth-layout">
      <section className="pulse-auth-form-panel" aria-labelledby="pulse-auth-title">
        <div className="pulse-auth-heading">
          <p className="pulse-auth-eyebrow"><span />{eyebrow}</p>
          <h1 id="pulse-auth-title">{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="pulse-auth-form-content">{children}</div>
        {footer && <div className="pulse-auth-form-footer">{footer}</div>}
      </section>
      <aside className="pulse-auth-story" aria-label="Giới thiệu DigiTalent Pulse">
        <img src={journeyArt} alt="" aria-hidden="true" />
        <div className="pulse-auth-story-scrim" />
        <div className="pulse-auth-story-glow" aria-hidden="true" />
        <div className="pulse-auth-story-copy">
          <span className="pulse-auth-story-chip"><LockKeyhole size={13} aria-hidden="true" /> KHÔNG GIAN DOANH NGHIỆP</span>
          <h2>{asideTitle}</h2>
          <p>{asideText}</p>
          {asidePoints.length > 0 && (
            <ul>
              {asidePoints.map((point) => (
                <li key={point}>
                  <span className="pulse-auth-check-bullet"><Check size={14} aria-hidden="true" /></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </main>
    <footer className="pulse-auth-footer pulse-auth-wrap"><span>© {new Date().getFullYear()} DigiTalent Pulse</span><span>Năng lực rõ ràng · Học tập đúng hướng</span></footer>
  </div>;
}
