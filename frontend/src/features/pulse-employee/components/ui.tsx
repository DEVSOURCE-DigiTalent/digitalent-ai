import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { btn, type ButtonKind } from '../lib/button';

/** Liên kết trông như nút (điều hướng trong ứng dụng). */
export function PuLink({ kind = 'primary', small, className, ...props }: LinkProps & { kind?: ButtonKind; small?: boolean }) {
  return <Link {...props} className={`${btn(kind, small)}${className ? ` ${className}` : ''}`} />;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="pu-eyebrow">{children}</span>;
}

export function Mini({ children }: { children: ReactNode }) {
  return <span className="pu-mini">{children}</span>;
}

export function Pill({ children, tone = '' }: { children: ReactNode; tone?: '' | 'green' | 'coral' | 'gray' }) {
  return <span className={`pu-pill${tone ? ` ${tone}` : ''}`}>{children}</span>;
}

export function Notice({ children, tone }: { children: ReactNode; tone?: 'warning' | 'success' }) {
  return (
    <div className={`pu-notice${tone ? ` ${tone}` : ''}`} role={tone === 'warning' ? 'status' : undefined}>
      {children}
    </div>
  );
}

export function Bar({ value, label }: { value: number; label?: string }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className="pu-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label={label}>
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}

/** Vạch mức hiện tại → mục tiêu (0..3). */
export function LevelTrack({ current, target, label }: { current: number; target: number; label: string }) {
  return (
    <div className="pu-track" role="img" aria-label={label}>
      <i style={{ width: `${(Math.max(0, current) / 3) * 100}%` }} />
      {target > 0 && <b style={{ left: `${(target / 3) * 100}%` }} />}
    </div>
  );
}

export function PageHead({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="pu-page-head">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="pu-row">{actions}</div>}
    </div>
  );
}

export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="pu-empty">
      {icon && <div className="pu-empty-icon" aria-hidden>{icon}</div>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/** Khung chờ tải: vài khối nhấp nháy theo bố cục trang. */
export function PageSkeleton({ blocks = [320, 180, 260] }: { blocks?: number[] }) {
  return (
    <div className="pu-stack" aria-busy="true" aria-label="Đang tải">
      {blocks.map((height, index) => (
        <div key={index} className="pu-skeleton" style={{ height }} />
      ))}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Empty
      icon={<AlertTriangle size={24} />}
      title="Chưa tải được dữ liệu"
      action={onRetry && (
        <button type="button" className={btn('outline')} onClick={onRetry}>
          <RotateCcw size={16} /> Thử lại
        </button>
      )}
    >
      {message}
    </Empty>
  );
}
