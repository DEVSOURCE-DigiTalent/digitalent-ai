import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ENTERPRISE_SCREENS } from '@/lib/screens/enterprise';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { ScreenDef } from '@/lib/screens/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

function useFilteredScreens(query: string): ScreenDef[] {
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const user = useCurrentUser((s) => s.user);

  return ENTERPRISE_SCREENS.filter((screen) => {
    if (screen.path.includes(':')) return false; // skip detail pages
    if (screen.permission && !hasPermission(screen.permission)) return false;
    if (!screen.roles.includes('*') && !screen.roles.some((r) => user?.roles.includes(r))) return false;
    if (!query) return true;
    return screen.title.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 8);
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const screens = useFilteredScreens(query);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleSelect = useCallback((screen: ScreenDef) => {
    navigate(screen.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, screens.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && screens[activeIndex]) handleSelect(screens[activeIndex]);
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => { setActiveIndex(0); }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Tìm kiếm"
    >
      <div
        className="bg-ent-card border border-ent-line rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ent-line">
          <Search className="w-4 h-4 text-ent-fg-3 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm màn hình…"
            className="flex-1 bg-transparent text-ent-fg placeholder:text-ent-fg-3 text-sm outline-none"
            aria-autocomplete="list"
          />
          <button onClick={onClose} aria-label="Đóng" className="text-ent-fg-3 hover:text-ent-fg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <ul role="listbox" className="py-1 max-h-64 overflow-y-auto">
          {screens.length === 0 && (
            <li className="px-4 py-3 text-sm text-ent-fg-3 text-center">Không tìm thấy màn hình</li>
          )}
          {screens.map((screen, i) => (
            <li
              key={screen.id}
              role="option"
              aria-selected={i === activeIndex}
              className={cn(
                'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-3 transition-colors',
                i === activeIndex ? 'bg-ent-raised text-ent-fg' : 'text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg',
              )}
              onClick={() => handleSelect(screen)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="flex-1">{screen.title}</span>
              <span className="text-[10px] text-ent-fg-3 font-mono">{screen.id}</span>
            </li>
          ))}
        </ul>

        <div className="px-4 py-2 border-t border-ent-line flex gap-3 text-[10px] text-ent-fg-3">
          <span><kbd className="font-mono">↑↓</kbd> điều hướng</span>
          <span><kbd className="font-mono">↵</kbd> chọn</span>
          <span><kbd className="font-mono">Esc</kbd> đóng</span>
        </div>
      </div>
    </div>
  );
}
