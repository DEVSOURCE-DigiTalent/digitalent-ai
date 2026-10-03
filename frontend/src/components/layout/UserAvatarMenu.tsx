import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Shield, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { useEnterpriseThemeStore } from '@/hooks/use-enterprise-theme';


interface UserAvatarMenuProps {
  accountPath: string;
  settingsPath?: string;
  canManageSettings?: boolean;
}

export function UserAvatarMenu({
  accountPath,
  settingsPath,
  canManageSettings = false,
}: UserAvatarMenuProps) {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggle: toggleTheme } = useEnterpriseThemeStore();


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout.mutateAsync();
    navigate('/login');
  };

  const initial = user.fullName?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user.roles.map((r) => ROLE_LABELS[r as Role] ?? r).join(', ');

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ent-raised transition-colors"
        aria-label="Menu tài khoản"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--ent-accent-soft)] text-ent-accent flex items-center justify-center text-xs font-bold border border-ent-line">
          {initial}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-ent-fg leading-none truncate max-w-[120px]">
            {user.fullName}
          </p>
          <p className="text-[10px] text-ent-fg-3 leading-none mt-1 truncate max-w-[120px]">
            {roleLabel}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-ent-fg-3 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-ent-card rounded-xl shadow-xl border border-ent-line z-50 py-1.5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-ent-line">
            <p className="text-sm font-semibold text-ent-fg truncate">{user.fullName}</p>
            <p className="text-xs text-ent-fg-3 truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-ent-raised text-ent-fg-2 rounded-md">
              {roleLabel}
            </span>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => { navigate(accountPath); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <UserCircle className="w-4 h-4 text-ent-fg-3" />
              Hồ sơ của tôi
            </button>

            <button
              type="button"
              onClick={() => { navigate(`${accountPath}/security`); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <Shield className="w-4 h-4 text-ent-fg-3" />
              Bảo mật tài khoản
            </button>

            {canManageSettings && settingsPath && (
              <button
                type="button"
                onClick={() => { navigate(settingsPath); setIsOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
              >
                <Settings className="w-4 h-4 text-ent-fg-3" />
                Cài đặt tổ chức
              </button>
            )}

            <button
              type="button"
              onClick={() => toggleTheme()}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-ent-fg-3" />
                : <Moon className="w-4 h-4 text-ent-fg-3" />}
              {theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
            </button>
          </div>

          <div className="border-t border-ent-line pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-bad hover:bg-[var(--ent-bad-soft)] transition-colors font-medium"
            >
              <LogOut className="w-4 h-4 text-ent-bad" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
