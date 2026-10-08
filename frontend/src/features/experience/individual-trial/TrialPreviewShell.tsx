import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/features/learner/components/ThemeToggle';
import { usePersonalTheme } from '@/features/learner/theme/use-personal-theme';
import '@/features/learner/theme/personal-theme.css';

export type PreviewTab = 'path' | 'lesson' | 'complete';

interface TrialPreviewShellProps {
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  positionCode: string;
  positionName: string;
  onReset: () => void;
  children: ReactNode;
}

const TABS: { key: PreviewTab; label: string }[] = [
  { key: 'path', label: 'Lộ trình' },
  { key: 'lesson', label: 'Bài học thử' },
  { key: 'complete', label: 'Kết quả' },
];

export function TrialPreviewShell({
  activeTab,
  onTabChange,
  positionCode,
  positionName,
  onReset,
  children,
}: TrialPreviewShellProps) {
  const theme = usePersonalTheme((state) => state.theme);

  return (
    <div
      data-testid="trial-preview-workspace"
      data-theme={theme}
      data-individual-theme={theme}
      lang="vi"
      className="personal-theme pt-soft relative flex min-h-screen flex-col bg-pt-bg font-landing text-pt-fg antialiased transition-colors duration-300"
    >
      <div aria-hidden="true" className="pt-grain pointer-events-none fixed inset-0 z-0" />

      <a
        href="#trial-preview-main"
        className="fixed -top-16 left-4 z-[100] rounded-full bg-pt-accent px-4 py-2.5 text-sm text-pt-on-accent transition-[top] focus:top-3"
      >
        Bỏ qua đến nội dung
      </a>

      {/* Header band like the other public pages; the active tab is gold, like the main actions of the flow. */}
      <header className="sticky top-0 z-40 border-b border-pt-line bg-pt-panel/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/individual" aria-label="DigiTalent AI, về trang cá nhân" className="flex items-center gap-2">
              <Wordmark markOnly className="text-lg [--wordmark-on:var(--pt-bg)] sm:hidden" />
              <Wordmark className="hidden text-lg [--wordmark-on:var(--pt-bg)] sm:inline-flex" />
            </Link>
            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-pt-accent/40 bg-pt-accent/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-pt-accent max-[380px]:hidden">
              Bản trải nghiệm
            </span>
            <span className="hidden text-xs text-pt-fg-3 sm:inline">
              · {positionName}
            </span>
          </div>

          <nav aria-label="Điều hướng bản trải nghiệm" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full border border-pt-line bg-pt-raised/50 p-1">
              {TABS.map((tab) => {
                const active = tab.key === activeTab;
                return (
                  <li key={tab.key}>
                    <button
                      type="button"
                      onClick={() => onTabChange(tab.key)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'inline-flex cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12] shadow-sm'
                          : 'text-pt-fg-2 hover:bg-pt-fg/8 hover:text-pt-fg',
                      )}
                    >
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden items-center whitespace-nowrap rounded-full border border-pt-accent/50 px-3.5 py-1.5 text-xs font-medium text-pt-accent transition-colors hover:border-pt-accent hover:bg-pt-accent/10 sm:inline-flex"
            >
              Đăng nhập
            </Link>
            <Link
              to={`/individual/pricing?source=trial&position=${positionCode}`}
              className="text-xs text-pt-fg-2 transition-colors hover:text-pt-fg hidden lg:inline"
            >
              Xem gói
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-pt-fg-3 transition-colors hover:text-pt-fg"
              title="Đổi vị trí mục tiêu"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Đổi vị trí</span>
            </button>
          </div>
        </div>

        {/* Mobile tabs row */}
        <div className="pt-scroll-x mx-auto max-w-6xl overflow-x-auto px-4 pb-2.5 md:hidden">
          <ul className="flex min-w-max items-center gap-1.5">
            {TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <li key={tab.key}>
                  <button
                    type="button"
                    onClick={() => onTabChange(tab.key)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      active ? 'bg-gradient-to-r from-[#F5CA65] to-[#D4982F] text-[#0C0E12]' : 'border border-pt-line bg-pt-card text-pt-fg-2',
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </header>

      <main
        id="trial-preview-main"
        tabIndex={-1}
        className="relative mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-8 outline-none md:px-8 md:pt-10"
      >
        {children}
      </main>

      <footer className="relative border-t border-pt-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6 text-xs text-pt-fg-3 sm:flex-row sm:justify-between md:px-8">
          <span>© {new Date().getFullYear()} DigiTalent AI</span>
          <span>Khung chuẩn năng lực số · Bản trải nghiệm</span>
        </div>
      </footer>
    </div>
  );
}
