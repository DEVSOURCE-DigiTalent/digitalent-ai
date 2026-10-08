import { type ReactNode } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnterpriseTheme } from '@/hooks/use-enterprise-theme';
import { Wordmark } from '@/components/brand/Wordmark';

interface FocusLayoutProps {
  /** Path to navigate to when the user clicks "Exit" */
  exitPath?: string;
  /** Label for the exit button (e.g. "Lưu và thoát") */
  exitLabel?: string;
  /** Optional callback when user clicks "Exit" */
  onExit?: () => void;
  /** Optional progress value 0–100 shown in topbar */
  progress?: number;
  /** Label next to the logo */
  title?: string;
  children?: ReactNode;
}

/**
 * Focused layout for immersive experiences (assessment, lesson viewer, setup wizard).
 * No sidebar; topbar is minimal with only the logo, title, progress, and an Exit button.
 */
export function FocusLayout({
  exitPath = '/enterprise',
  exitLabel = 'Thoát',
  onExit,
  progress,
  title,
  children,
}: FocusLayoutProps) {
  useEnterpriseTheme();

  return (
    <div className="min-h-screen bg-ent-bg text-ent-fg flex flex-col">
      {/* Minimal topbar */}
      <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-ent-line bg-[var(--ent-topbar)] backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link to={exitPath} className="hover:opacity-90 transition-opacity inline-flex items-center">
            <Wordmark withMark={true} className="text-sm [--wordmark-on:var(--ent-bg,#0C0E12)]" />
          </Link>
          {title && (
            <>
              <span className="text-ent-line">/</span>
              <span className="text-sm font-medium text-ent-fg">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {progress !== undefined && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-32 h-1.5 bg-ent-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F5CA65] to-[#D4982F] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-xs text-[#F5CA65] font-mono">{Math.round(progress)}%</span>
            </div>
          )}

          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors',
              )}
            >
              <X className="w-4 h-4" />
              <span>{exitLabel}</span>
            </button>
          ) : (
            <Link
              to={exitPath}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors',
              )}
            >
              <X className="w-4 h-4" />
              <span>{exitLabel}</span>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
