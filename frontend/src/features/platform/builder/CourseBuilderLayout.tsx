import type { ReactNode } from 'react';
import { Layers } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { LEVEL_NAMES } from '../components/pulse-format';

const levelStyles: Record<number, { background: string; color: string; borderColor: string }> = {
  1: { background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' },
  2: { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' },
  3: { background: '#fefce8', color: '#ca8a04', borderColor: '#fef08a' },
};

export function CourseLevelBadge({ level, fallback }: { level: number; fallback?: string }) {
  useUiLanguage();
  const colors = levelStyles[level] ?? { background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
  return (
    <span className="pa-ver-level-badge" style={{
      border: '1px solid', ...colors,
      padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
    }}>
      {translateUi(LEVEL_NAMES[level] ?? fallback ?? '')}
    </span>
  );
}

export function CourseCodeBadge({ code }: { code: string }) {
  return <span className="pa-rp-version-badge" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{code}</span>;
}

export function CourseBuilderHeader({ title, code, level, levelName, status, subtitle, actions }: {
  title: string;
  code: string;
  level: number;
  levelName?: string;
  status: ReactNode;
  subtitle: ReactNode;
  actions: ReactNode;
}) {
  useUiLanguage();
  return (
    <header className="pa-ov-header">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 aria-label={title}>{translateUi(title) || translateUi('Khóa học mới')}</h1>
          <CourseLevelBadge level={level} fallback={levelName} />
          <CourseCodeBadge code={code} />
          {status}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
          {subtitle}
        </div>
      </div>
      <div className="pa-ov-actions flex-wrap">{actions}</div>
    </header>
  );
}

export function CourseBuilderLayout({ moduleCount, outline, children }: {
  moduleCount: number;
  outline: ReactNode;
  children: ReactNode;
}) {
  useUiLanguage();
  return (
    <div className="pa-builder">
      <nav className="pa-outline" aria-label={translateUi('Cấu trúc khóa học')}>
        <div className="pa-ol-header">
          <div className="pa-ol-header-title"><Layers size={13} aria-hidden="true" />{translateUi('Nội dung khóa học')}</div>
          <span className="pa-ol-header-count">{moduleCount} {translateUi('mô đun')}</span>
        </div>
        {outline}
      </nav>
      <div className="pa-canvas">{children}</div>
    </div>
  );
}

export function CourseOutlineItem({ icon, number, title, detail, active, onClick }: {
  icon?: ReactNode;
  number?: string;
  title: ReactNode;
  detail?: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pa-ol-item" aria-current={active ? 'step' : undefined} onClick={onClick}>
      <b className={number === undefined ? 'pa-ol-icon-box' : 'pa-ol-number-box'}>{number ?? icon}</b>
      <span className="pa-ol-text"><strong>{title}</strong>{detail && <small>{detail}</small>}</span>
    </button>
  );
}

export function CourseBuilderPanel({ icon, title, description, children }: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="pa-cb-panel">
      <div className="pa-cb-panel-head">
        <div>
          <div className="pa-cb-panel-title">
            {icon}
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
          </div>
          {description && <div className="pa-cb-panel-desc">{description}</div>}
        </div>
      </div>
      <div className="pa-cb-panel-body">{children}</div>
    </div>
  );
}
