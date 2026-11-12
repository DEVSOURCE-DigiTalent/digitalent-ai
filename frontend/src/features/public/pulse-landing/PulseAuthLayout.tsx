import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';
import { usePageBackground } from '../landing/hooks/use-page-background';
import mark from '@/assets/pulse/pulse-mark.svg';
import './pulse-auth.css';

interface PulseAuthLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  asideTitle?: string;
  asideText?: string;
  asidePoints?: string[];
  asideImage?: string;
  asideVariant?: 'roadmap' | 'visual-light';
  footer?: ReactNode;
  headerSlot?: ReactNode;
  mode?: 'login' | 'register';
  visualImage?: string;
  complianceText?: string;
}

interface ParsedStepPoint {
  stepNumber: string | null;
  text: string;
}

function parseAsidePoint(point: string): ParsedStepPoint {
  const match = point.match(/^(\d+)\s*[·.]\s*(.+)$/);
  if (!match) {
    return { stepNumber: null, text: point };
  }
  return { stepNumber: match[1], text: match[2] };
}

/**
 * Modern B2B Enterprise Authentication & Onboarding Layout.
 * Uses a light enterprise split frame across both login (isometric artwork)
 * and onboarding/trial/registration flows (structured roadmap aside panel).
 */
export function PulseAuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  asideTitle,
  asideText,
  asidePoints,
  asideImage,
  asideVariant = 'roadmap',
  footer,
  headerSlot,
  mode = 'login',
  visualImage = '/images/landing-scenes/login-isometric-enterprise.webp',
  complianceText,
}: PulseAuthLayoutProps) {
  usePageBackground('#f4f6f9');

  const isAsideSplitMode = mode === 'register' || Boolean(asideTitle);
  const isLightVisualAside = asideVariant === 'visual-light' || Boolean(asideImage);

  if (isAsideSplitMode) {
    const parsedPoints = (asidePoints ?? []).map(parseAsidePoint);
    const hasNumberedSteps = parsedPoints.length > 0 && parsedPoints.every((item) => item.stepNumber !== null);

    return (
      <div
        className="pulse-auth-container pulse-auth-container--unified pulse-auth-container--light pulse-auth-container--aside-flow"
        data-mode={mode}
        lang="vi"
      >
        {/* Subtle Ambient Atmosphere */}
        <div className="pulse-auth-mesh" aria-hidden="true" />
        <div className="pulse-auth-glow-orb pulse-auth-glow-1" aria-hidden="true" />
        <div className="pulse-auth-glow-orb pulse-auth-glow-2" aria-hidden="true" />

        {/* Master Center Stage */}
        <main id="pulse-auth-main" className="pulse-auth-master-stage">
          <div className="pulse-auth-master-frame pulse-auth-master-frame--register">
            {/* Left Column: Light Visual Backdrop OR Structured Enterprise Onboarding Aside */}
            {isLightVisualAside ? (
              <aside
                className="pulse-auth-aside-col pulse-auth-aside-col--visual"
                aria-label={eyebrow || 'Thông tin dùng thử'}
              >
                {asideImage && (
                  <img
                    src={asideImage}
                    alt=""
                    className="pulse-auth-aside-bg-img"
                  />
                )}
                <div className="pulse-auth-aside-bg-scrim" aria-hidden="true" />

                <div className="pulse-auth-aside-content pulse-auth-aside-content--visual">
                  {eyebrow && (
                    <span className="pulse-auth-aside-pill pulse-auth-aside-pill--light">
                      <span className="pulse-auth-aside-pill-dot" aria-hidden="true" />
                      {eyebrow}
                    </span>
                  )}

                  {asideTitle && (
                    <h2 className="pulse-auth-aside-title pulse-auth-aside-title--light">
                      {asideTitle}
                    </h2>
                  )}
                  {asideText && (
                    <p className="pulse-auth-aside-text pulse-auth-aside-text--light">
                      {asideText}
                    </p>
                  )}
                </div>
              </aside>
            ) : (
              <aside className="pulse-auth-aside-col" aria-label={eyebrow || 'Thông tin quy trình'}>
                <div className="pulse-auth-aside-grid" aria-hidden="true" />
                <div className="pulse-auth-aside-glow" aria-hidden="true" />

                <div className="pulse-auth-aside-content">
                  {eyebrow && (
                    <span className="pulse-auth-aside-pill">
                      <span className="pulse-auth-aside-pill-dot" aria-hidden="true" />
                      {eyebrow}
                    </span>
                  )}

                  {asideTitle && <h2 className="pulse-auth-aside-title">{asideTitle}</h2>}
                  {asideText && <p className="pulse-auth-aside-text">{asideText}</p>}

                  {parsedPoints.length > 0 && (
                    hasNumberedSteps ? (
                      <ol className="pulse-auth-roadmap">
                        {parsedPoints.map((item, idx) => {
                          const isActive = idx === 0;
                          return (
                            <li
                              key={item.text}
                              className={`pulse-auth-roadmap-item${isActive ? ' pulse-auth-roadmap-item--active' : ''}`}
                            >
                              <span className="pulse-auth-roadmap-marker" aria-hidden="true">
                                {item.stepNumber}
                              </span>
                              <span className="pulse-auth-roadmap-label">{item.text}</span>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <ul className="pulse-auth-aside-highlights">
                        {parsedPoints.map((item) => (
                          <li key={item.text} className="pulse-auth-aside-highlight-item">
                            <span className="pulse-auth-aside-check" aria-hidden="true">
                              <Check size={13} strokeWidth={2.6} />
                            </span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>

                <div className="pulse-auth-aside-trust">
                  <div className="pulse-auth-aside-trust-item">
                    <LockKeyhole size={13} aria-hidden="true" />
                    <span>Dữ liệu riêng theo doanh nghiệp</span>
                  </div>
                </div>
              </aside>
            )}

            {/* Right Column: Compact Brand Header, Stepper, Heading, Form & Footer */}
            <div className="pulse-auth-form-col pulse-auth-form-col--register">
              <div className="pulse-auth-form-topbar">
                <Link
                  to="/business"
                  className="pulse-auth-brand-inline"
                  aria-label="DigiTalent AI, về trang chủ"
                  title="Về trang chủ DigiTalent AI"
                >
                  <img src={mark} alt="DigiTalent AI" width="34" height="34" className="pulse-auth-brand-inline-mark" />
                  <span className="pulse-auth-brand-inline-title">
                    DigiTalent <strong className="pulse-auth-brand-accent">AI</strong>
                  </span>
                </Link>

                <Link
                  to="/business"
                  className="pulse-auth-back-btn pulse-auth-back-btn--static"
                  aria-label="Quay lại trang chủ"
                  title="Quay lại trang chủ"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="pulse-auth-form-inner pulse-auth-form-inner--register">
                {headerSlot}

                <div className="pulse-auth-heading-area pulse-auth-heading-area--register">
                  <h1 className="pulse-auth-main-title">{title}</h1>
                  {subtitle && <p className="pulse-auth-lead-subtitle">{subtitle}</p>}
                </div>

                <div className="pulse-auth-form-slot">{children}</div>

                {footer && <div className="pulse-auth-card-footer pulse-auth-card-footer--inline">{footer}</div>}
              </div>

              <div className="pulse-auth-compliance-footer">
                <span>{complianceText || 'DigiTalent AI · Đào tạo năng lực số theo vị trí công việc'}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Unified Master Frame for Enterprise Login (Left Isometric Illustration, Right Centered Form)
  return (
    <div className="pulse-auth-container pulse-auth-container--unified pulse-auth-container--light" data-mode={mode} lang="vi">
      {/* Subtle Ambient Atmosphere */}
      <div className="pulse-auth-mesh" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-1" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-2" aria-hidden="true" />

      {/* Master Center Stage */}
      <main id="pulse-auth-main" className="pulse-auth-master-stage">
        <div className="pulse-auth-master-frame">
          {/* Left Column: Isometric Digital Transformation Visual */}
          <div className="pulse-auth-visual-col" aria-hidden="true">
            <img
              src={visualImage}
              alt="Minh họa chuyển đổi số, đào tạo và lộ trình công việc trên DigiTalent AI"
              className="pulse-auth-visual-image"
            />
            <div className="pulse-auth-visual-overlay" />
          </div>

          {/* Right Column: Back Button, Brand Lockup, Heading, Form & Compliance Strip */}
          <div className="pulse-auth-form-col">
            <Link
              to="/business"
              className="pulse-auth-back-btn"
              aria-label="Quay lại trang chủ"
              title="Quay lại trang chủ"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>

            <div className="pulse-auth-form-inner">
              {/* Brand Logo & Name */}
              <Link
                to="/business"
                className="pulse-auth-brand-lockup pulse-auth-brand-lockup--centered"
                aria-label="DigiTalent AI, về trang chủ"
                title="Về trang chủ DigiTalent AI"
              >
                <div className="pulse-auth-brand-mark-wrap">
                  <img src={mark} alt="DigiTalent AI" width="42" height="42" className="pulse-auth-brand-mark" />
                </div>
                <div className="pulse-auth-brand-meta">
                  <span className="pulse-auth-brand-title">
                    DigiTalent <strong className="pulse-auth-brand-accent">AI</strong>
                  </span>
                </div>
              </Link>

              {/* Section Title & Subtitle */}
              <div className="pulse-auth-heading-area pulse-auth-heading-area--centered">
                <h1 className="pulse-auth-main-title">{title}</h1>
                {subtitle && <p className="pulse-auth-lead-subtitle">{subtitle}</p>}
              </div>

              {/* Main Form Fields */}
              <div className="pulse-auth-form-slot">
                {children}
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="pulse-auth-compliance-footer">
              <span>{complianceText || 'DigiTalent AI · Đào tạo năng lực số theo vị trí công việc'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
